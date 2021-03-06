/**
 * Set via wp_localize_script in the SLPLus.UI class.
 * @type {*}
 */
var slplus = slplus;

/**
 * @type slp_Map
 */
var cslmap;



/**
 * jQuery Observer (pub/sub) class.
 * @param id
 * @returns {*}
 * @constructor
 */
var slp_Filter = function( id ) {
    var callbacks, method,
        topic = id && slp.topics[ id ];

    if ( !topic ) {

        // Valid jQuery 1.7+
        //
        if ( typeof( jQuery.Callbacks ) !== 'undefined' ) {
            callbacks = jQuery.Callbacks();
            topic = {
                publish: callbacks.fire,
                subscribe: callbacks.add,
                unsubscribe: callbacks.remove
            };

        // No jQuery Callbacks?  Why are you NOT using jQuery 1.7+??
        //
        } else {
            if ( window.console ) {
                console.log('jQuery 1.7.0+ required, ' + jQuery.fn.version + ' used instead.  FAIL.');
            }
            topic = {
                publish: function( data ) { return data; }
            }
        }

        if ( id ) {
            slp.topics[ id ] = topic;
        }
    }
    return topic;
};

/**
 *
 * Class slp_LocationServices
 *
 * Handle the location sensor (or not)
 */
var slp_LocationServices = function () {

    // Properties
    this.theService = null;
    this.LocationSupport = true;
    this.Initialized = false;
    this.location_timeout = null;
    this.lat = 0.00;
    this.lng = 0.00;
    this.errorCalled = false;

    /**
     * Constructor
     *
     * @private
     */
    this.__init = function () {
        this.Initialized = true;
        try {
            if (typeof navigator.geolocation === 'undefined') {
                if (google.gears) {
                    this.theService = google.gears.factory.create('beta.geolocation');
                } else {
                    this.LocationSupport = false;
                }
            }
            else {
                this.theService = navigator.geolocation;
            }
        } catch (e) {
        }
    };

    /**
     * Set the current location.
     *
     * When setting currentLocation the callback and errorCallback functions must be defined.
     * See the sensor.currentLocation call down below for the return-to place for
     * these two functions passed as variables (down around line 1350).
     *
     * @param callback
     * @param errorCallback
     */
    this.currentLocation = function (callback, errorCallback) {

        // If location services are not setup, do it
        //
        if (!this.Initialized) {
            this.__init();
        }

        // If this browser supports location services, use them
        //
        if (this.LocationSupport) {
            if (this.theService) {

                // In 5 seconds run errorCallback
                //
                this.location_timeout = setTimeout(errorCallback, 5000);

                // Run the browser location service to get the current position
                //
                // on success run callback
                // on failure run errorCallback
                //
                this.theService.getCurrentPosition(callback, errorCallback, {
                    maximumAge: 60000,
                    timeout: 5000,
                    enableHighAccuracy: true
                });
            }

            // Otherwise throw an exception
            //
        } else {
            errorCallback(null);
        }

    };
};

/**
 * Class slp_Marker
 *
 * Creates a Google Maps marker.
 *
 * parameters (properties):
 *
 *    map: the slp_Map type to put it on
 *    title: the title of the marker for mouse over
 *    markerImage: todo: load a custom icon, null for default
 *    position: the lat/long to put the marker at
 *
 */
var slp_Marker = function (map, title, position, markerImage) {

    // Properties
    this.__map = map;
    this.__title = title;
    this.__position = position;
    this.__gmarker = null;
    this.__markerImage = markerImage;
    this.__shadowImage = null;


    /**
     * Constructor.
     *
     * @private
     */
    this.__init = function () {

        // No icon image
        //
        if (this.__markerImage === null) {
            this.__gmarker = new google.maps.Marker(
                {
                    position: this.__position,
                    map: this.__map.gmap,
                    title: this.__title
                });

            // Use specified icon
            //
        } else {
            var shadowKey = this.__markerImage;
            if (typeof cslmap.shadows[shadowKey] === 'undefined') {
                var shadow = this.__markerImage.replace('/_(.*?)\.png/', '_shadow.png');
                jQuery.ajax(
                    {
                        url: shadow,
                        type: 'HEAD',
                        async: false,
                        error: function () {
                            cslmap.shadows[shadowKey] = slplus.plugin_url + '/images/icons/blank.png';
                        },
                        success: function () {
                            cslmap.shadows[shadowKey] = shadow;
                        }
                    }
                );
            }
            this.__shadowImage = cslmap.shadows[shadowKey];
            this.buildMarker();
        }
    };

    /*------------------------
     * MARKERS buildMarker
     */
    this.buildMarker = function () {
        this.__gmarker = new google.maps.Marker(
            {
                position: this.__position,
                map: this.__map.gmap,
                shadow: this.__shadowImage,
                icon: this.__markerImage,
                zIndex: 0,
                title: this.__title
            });
    };

    this.__init();
};

/**
 * Class slp_Map
 *
 * Create a google maps object linked to a map/canvas id
 *
 * parameters (properties):
 *    aMapNumber: the id/canvas of the map object to load from php side
 */
var slp_Map = function (aMapCanvas) {

    /**
     * @type {google.maps.InfoWindow}
     */
    this.infowindow = new google.maps.InfoWindow();

    /**
     *
     * @type {google.maps.Map}
     */
    this.gmap = null;


    //private: map number to look up at init
    this.__mapCanvas = aMapCanvas;

    // other variables
    //
    this.shadows = new Object;   // map marker shadows
    this.map_hidden = true;      // map div may be hidden at first, assume it was
    this.default_radius = 40000; // default radius if not set

    //function callbacks
    this.tilesLoaded = null;

    //php passed vars set in init
    this.address = null;
    this.draggable = true;
    this.markers = null;

    //slplus options
    this.usingSensor = false;
    this.mapHomeIconUrl = null;
    this.mapEndIconUrl = null;
    this.mapType = null;

    //gmap set variables
    this.options = null;
    this.centerMarker = null;
    this.marker = null;
    this.bounds = null;
    this.homePoint = null;
    this.lastCenter = null;
    this.lastRadius = null;



    // AJAX communication
    //
    this.latest_response = null;

    /**
     * @type {google.maps.Geocoder}
     */
    this.geocoder = new google.maps.Geocoder();

    /***************************
     * function: __init()
     * usage:
     * Called at the end of the 'class' due to some browser's quirks
     * parameters: none
     * returns: none
     */
    this.__init = function () {

        if (typeof slplus !== 'undefined') {
            this.mapType = slplus.options.map_type;
            this.mapHomeIconUrl = slplus.options.map_home_icon;
            this.mapEndIconUrl = slplus.options.map_end_icon;

            // Setup address
            // Use the entry form value if set, otherwise use the country
            //
            var addressInput = this.getSearchAddress();
            if (typeof addressInput === 'undefined') {
                this.address = slplus.options.map_center;
            } else {
                this.address = addressInput;
            }

        } else {
            alert('Store Locator Plus script not loaded properly.');
        }
    };

    /***************************
     * function: __buildMap
     * usage:
     *        Builds the map with the specified center
     * parameters:
     *        center:
     *            the specified center or homepoint
     * returns: none
     */
    this.__buildMap = function (center) {
        var _this = this;
        
        if (this.gmap === null) {
            this.options = {
                center: center,
                mapTypeId: this.mapType,
                minZoom: 1,
                zoom: parseInt(slplus.options.zoom_level),
            };

            // TODO: Remove this when legacy Enhanced Maps support is no longer needed/desired.
            //
            if ( typeof slplus.options.map_options_scrollwheel    !== 'undefined' ) { this.options['scrollwheel']    = slplus.options.map_options_scrollwheel;    }
            if ( typeof slplus.options.map_options_mapTypeControl !== 'undefined' ) { this.options['mapTypeControl'] = slplus.options.map_options_mapTypeControl; }
            if ( typeof slplus.options.map_options_scaleControl   !== 'undefined' ) {
                this.options['scaleControl']   = slplus.options.map_options_scaleControl;
            } else {
                this.options['scaleControl']   = true;
            }

            if ( slplus.options.google_map_style ) {
                jQuery.extend( this.options , { styles: JSON.parse( slplus.options.google_map_style) } );
            }

            // FILTER: map_options
            // Manipulate the Google map options.
            //
            slp_Filter( 'map_options' ).publish( this.options );

            this.gmap = new google.maps.Map( document.getElementById('map') , this.options );

            google.maps.event.addListener(this.gmap, 'bounds_changed', function () {
                _this.__waitForTileLoad.call(_this);
            });


            // Location Sensor Is Enabled
            // Or immediate mode and home marker is enabled
            //
            if ( this.show_home_marker() ) {
                this.homePoint = center;    // Set the home marker location to center lat/long sent in to __buildMap
                this.addMarkerAtCenter();
            }

            // If immediately show locations is enabled.
            //
            if (slplus.options.immediately_show_locations !== '0') {
                var tag_to_search_for = this.saneValue('tag_to_search_for', '');

                // Default radius for immediately show locations
                // uses setting from admin panel first,
                // then the default from the drop down menu,
                // then 10000 if neither are working.
                //
                var radius = this.default_radius;
                slplus.options.initial_radius = slplus.options.initial_radius.replace(/\D/g, '');
                if (/^[0-9]+$/.test(slplus.options.initial_radius)) {
                    radius = slplus.options.initial_radius;
                } else {
                    radius = this.saneValue('radiusSelect' , this.default_radius );
                }

                this.loadMarkers(center, radius, tag_to_search_for);
            }
        }
    };

    /**
     * Should I show the home marker on the map or not?
     *
     * @returns {boolean|*}
     */
    this.show_home_marker = function () {
        return (
        this.usingSensor ||
        ( (slplus.options.immediately_show_locations !== '0') && (slplus.options.no_homeicon_at_start !== '1') )
        );
    };

    /***************************
     * function: __waitForTileLoad
     * usage:
     * Notifies as the map changes that we'd like to be nofified when the tiles are completely loaded
     * parameters:
     *    none
     * returns: none
     */
    this.__waitForTileLoad = function () {
        var _this = this;
        if (this.__tilesLoaded === null) {
            this.__tilesLoaded = google.maps.event.addListener(this.gmap, 'tilesloaded', function () {
                _this.__tilesAreLoaded.call(_this);
            });
        }
    };

    /***************************
     * function: __tilesAreLoaded
     * usage:
     * All the tiles are loaded, so fix their css
     * parameters:
     *    none
     * returns: none
     */
    this.__tilesAreLoaded = function () {
        jQuery('#map').find('img').css({'max-width': 'none'});
        google.maps.event.removeListener(this.__tilesLoaded);
        this.__tilesLoaded = null;
    };

    /***************************
     * function: addMarkerAtCenter
     * usage:
     * Puts a pretty marker right smack in the middle
     * parameters:
     *    none
     * returns: none
     */
    this.addMarkerAtCenter = function () {
        if (this.centerMarker) {
            this.centerMarker.__gmarker.setMap(null);
        }
        if (this.homePoint) {
            this.centerMarker = new slp_Marker(this, '', this.homePoint, this.mapHomeIconUrl);
        }
    };

    /***************************
     * function: clearMarkers
     * usage:
     *        Clears all the markers from the map and releases it for GC
     * parameters:
     *    none
     * returns: none
     */
    this.clearMarkers = function () {
        if (this.markers) {
            for (markerNumber in this.markers) {
                if (typeof this.markers[markerNumber] !== 'undefined') {
                    if (typeof this.markers[markerNumber].__gmarker !== 'undefined') {
                        this.markers[markerNumber].__gmarker.setMap(null);
                    }
                }
            }
            this.markers.length = 0;

            // Clear the home marker if the address is blank
            // only if we are not on the first map drawing
            //
            if ( ! this.saneValue( 'addressInput' , '' ) ) {
                this.centerMarker = null;
                this.homePoint = null;
            }

        }
    };

    /***************************
     * function: putMarkers
     * usage:
     *        Puts an array of markers on the map
     * parameters:
     *        markerList:
     *            a list of slp_Markers
     * returns: none
     */
    this.putMarkers = function (markerListNatural) {

        // Reset map marker list and the results output HTML
        //
        this.markers = [];
        var sidebar = document.getElementById('map_sidebar');
        sidebar.innerHTML = '';

        // No Results
        //
        var markerCount = (markerListNatural) ? markerListNatural.length : 0;
        if (markerCount === 0) {
            if ( this.homePoint ) { this.gmap.panTo(this.homePoint); }
            document.getElementById('map_sidebar').innerHTML = '<div class="no_results_found"><h2>' + slplus.options.message_no_results + '</h2></div>';

            // Results Processing
            //
        } else {
            // FILTER: location_results_header
            // Add a header to the location results.
            //
            var results_html = {
                content: '' ,
                insert_rows_at: '#map_sidebar'
            };
            slp_Filter( 'location_results_header' ).publish( results_html );
            if ( results_html.content.trim() ) {
                jQuery( '#map_sidebar').append( results_html.content );
            }

            // Set the initial bounds to default (1,180)/(-1,180), include home marker if shown.
            //
            var bounds = new google.maps.LatLngBounds();
            if ( this.homePoint ) { bounds.extend(this.homePoint); }

            var locationIcon;

            for (var markerNumber = 0; markerNumber < markerCount; ++markerNumber) {
                var position = new google.maps.LatLng(markerListNatural[markerNumber].lat, markerListNatural[markerNumber].lng);
                bounds.extend(position);

                locationIcon =
                    (
                        (markerListNatural[markerNumber].icon !== null) &&
                        (typeof markerListNatural[markerNumber].icon !== 'undefined') &&
                        (markerListNatural[markerNumber].icon.length > 4) ?
                            markerListNatural[markerNumber].icon :
                            this.mapEndIconUrl
                    );
                this.markers.push(new slp_Marker(this, markerListNatural[markerNumber].name, position, locationIcon));
                _this = this;

                // Marker Click Action - Show Info Window
                //
                google.maps.event.addListener(
                    this.markers[markerNumber].__gmarker,
                    'click',
                    (function (infoData, marker) {
                        return function () {
                            _this.show_map_bubble.call(_this, infoData, marker);
                        }
                        })(markerListNatural[markerNumber], this.markers[markerNumber])
                    );

                //create a sidebar entry
                //
                if (sidebar) {
                    jQuery( results_html.insert_rows_at ).append( this.createSidebar(markerListNatural[markerNumber]) );

                    // Hide empty spans
                    //
                    jQuery( results_html.insert_rows_at + ' span:empty').hide();

                    // Whenever the location result entry is <clicked> do this...
                    //
                    jQuery( '#slp_results_wrapper_' + markerListNatural[markerNumber].id ).on(
                        'click' ,
                        null,
                        { 'info' :markerListNatural[markerNumber], 'marker' :this.markers[markerNumber] } ,
                        _this.handle_location_result_click
                    );
                }
            }

            // Get AlL Markers
            //
            this.bounds = bounds;
            this.gmap.fitBounds( this.bounds );

            // Do not auto-zoom, use the setting in WP Ux for EM
            //
            if ( slplus.options.no_autozoom === '1' ) {
                this.gmap.setZoom( parseInt(slplus.options.zoom_level) );

                // Default : Zoom back 1 level, or if user has EM Zoom Tweak set do that.
            } else {
                var current_zoom = this.gmap.getZoom();
                var zoom_tweak = (parseInt(slplus.options.zoom_tweak) != 0) ? slplus.options.zoom_tweak : (current_zoom < 3) ? 0 : 1;
                var new_zoom = current_zoom - zoom_tweak;
                if ( markerCount < 2 ) { new_zoom = Math.min( new_zoom , 15 ); }
                this.gmap.setZoom( new_zoom );
            }

        }

        // Fire results output changed trigger
        //
        jQuery('#map_sidebar').trigger('contentchanged');
    };

    /**
     * Handle location results clicks.
     */
    this.handle_location_result_click = function ( event ) {
        _this.show_map_bubble( event.data.info , event.data.marker );
    };

    /**
     * Show the map info bubble for the marker.
     *
     * @param infoData  the information to build the info window from (ajax result)
     * @param marker    the marker on the map where the bubble will be anchored
     */
    this.show_map_bubble = function (infoData, marker) {
        this.options = {
            show_bubble: slplus.options.hide_bubble !== '1'
        };

        // FILTER: map_options
        // Manipulate the Google map options and SLP info bubble option.
        //
        slp_Filter( 'map_options' ).publish( this.options );

        if ( this.options.show_bubble ) {
            this.infowindow.setContent(this.createMarkerContent(infoData));
            this.infowindow.open(this.gmap, marker.__gmarker);
        }
    };

    /**
     * Geocode an address on the search input field and display on map.
     *
     * @return {undefined}
     */
    this.doGeocode = function () {
        var _this = this;

        /**
         * @type {google.maps.GeocoderRequest}
         */
        var geocoder_request = new Object();
        geocoder_request['address'] = _this.address;
        geocoder_request['region']  = ( typeof slplus.options.map_region !== 'undefined' ) ? slplus.options.map_region : 'us';

        // TODO: (ES) move this into the observer pattern
        //
        if (slplus.options.searchnear === 'currentmap') {
            if (_this.gmap) {
                geocoder_request['bounds'] = _this.gmap.getBounds();
            }
        }

        // FILTER: geocoder_request
        // Modifies the geocoder_request object via jQuery pub/sub model.
        //
        slp_Filter( 'geocoder_request' ).publish( geocoder_request );

        // Original Geocoding
        //
        _this.geocoder.geocode(
            geocoder_request,
            function (results, status) {

                // Geocoder Results OK
                //
                if (status === google.maps.GeocoderStatus.OK && results.length > 0) {


                    var geocode_results = {
                        all: results,
                        request: geocoder_request,
                        best: results[0]
                    };

                    // FILTER: geocode_results
                    // Manipulate the returned Google address guesses and best result.
                    //
                    slp_Filter( 'geocode_results' ).publish( geocode_results );

                    // if the map hasn't been created, then create one
                    //
                    if (_this.gmap === null) {
                        _this.__buildMap(geocode_results.best.geometry.location);
                    }

                    // the map has been created so shift the center of the map
                    //
                    else {

                        //move the center of the map
                        _this.homePoint = geocode_results.best.geometry.location;
                        _this.addMarkerAtCenter();

                        //do a search based on settings
                        var tag_to_search_for = _this.saneValue('tag_to_search_for', '');
                        var radius = _this.saneValue('radiusSelect' , this.default_radius );
                        _this.loadMarkers(geocode_results.best.geometry.location, radius, tag_to_search_for);
                    }

                // Geocoder Results Failed
                // If no map, create one centered at the Fallback lat/long noted in the admin settings.
                //
                } else {
                    if ( window.console ) {
                        console.log( 'Google JavaScript API geocoder failed with status ' + status );
                        console.log( 'Address sent to Google: ' + geocoder_request['address'] );
                    }
                    if (_this.gmap === null) {
                        if ( window.console ) {
                            console.log( 'Map set to fallback lat/lng: ' + this.slplus.options.map_center_lat + ' , ' + this.slplus.options.map_center_lng  );
                        }
                        _this.homePoint = new google.maps.LatLng( this.slplus.options.map_center_lat ,  this.slplus.options.map_center_lng );
                        _this.__buildMap( _this.homePoint );
                        _this.addMarkerAtCenter();
                    }
                }

            }
        );
    };

    /***************************
     * function: __createAddress
     * usage:
     *        Build a formatted address string
     * parameters:
     *        aMarker:
     *            the ajax result to build the information from
     * returns: a formatted address string
     */
    this.__createAddress = function (aMarker) {

        var address = '';
        if (aMarker.address !== '') {
            address += aMarker.address;
        }

        if (aMarker.address2 !== '') {
            address += ", " + aMarker.address2;
        }

        if (aMarker.city !== '') {
            address += ", " + aMarker.city;
        }

        if (aMarker.state !== '') {
            address += ", " + aMarker.state;
        }

        if (aMarker.zip !== '') {
            address += ", " + aMarker.zip;
        }

        if (aMarker.country !== '') {
            address += ", " + aMarker.country;
        }

        return address;
    };

    /**
     * Create the info bubble for a map location.
     *
     * @param {object} aMarker a map marker object.
     */
    this.createMarkerContent = function (thisMarker) {
        thisMarker['fullAddress'] = this.__createAddress(thisMarker);
        return slplus.options.bubblelayout.replace_shortcodes(thisMarker);
    };

    /**
     * Return a proper search address for directions.
     * Use the address entered if provided.
     * Use the GPS coordinates if not and use location is on and coords available.
     * Otherwise use the center of the country.
     */
    this.getSearchAddress = function (defaultAddress) {
        var searchAddress = jQuery('#addressInput').val();
        if (!searchAddress) {
            if ((slplus.options.use_sensor) && (sensor.lat !== 0.00) && (sensor.lng !== 0.00)) {
                searchAddress = sensor.lat + ',' + sensor.lng;
            } else {
                searchAddress = defaultAddress;
            }
        }
        return searchAddress;
    };

    /**
     * Get a sane value from the HTML document.
     *
     * @param {string} id of control to look at
     * @param {string} default value to return
     * @return {undef}
     */
    this.saneValue = function (id, defaultValue) {
        var name = document.getElementById(id);
        if (name === null) {
            name = defaultValue;
        }
        else {
            name = name.value;
        }
        return name;
    };

    /***************************
     * function: loadMarkers
     * usage:
     *        Sends an ajax request and drops the markers on the map
     * parameters:
     *        center:
     *            the center of the map (where to center to)
     * returns: none
     */
    this.loadMarkers = function (center, radius, tags) {

        //determines if we need to invent real variables (usually only done at the beginning)
        //
        if (center === null) {
            center = this.gmap.getCenter();
        }
        if (radius === null) {
            radius = this.default_radius;
        }
        this.lastCenter = center;
        this.lastRadius = radius;
        if (tags === null) {
            tags = '';
        }

        var _this = this;

        // Setup our variables sent to the AJAX listener.
        //
        var action = {
            address: this.saneValue('addressInput', 'no address entered'),
            formdata: jQuery('#searchForm').serialize(),
            lat: center.lat(),
            lng: center.lng(),
            name: this.saneValue('nameSearch', ''),
            options: slplus.options,
            radius: radius,
            tags: tags
        };

        // On Load
        if (slplus.options.immediately_show_locations !== '0') {
            action.action = 'csl_ajax_onload';
            slplus.options.immediately_show_locations = '0';

            // Search
        } else {
            action.action = 'csl_ajax_search';
        }

        // Send AJAX call
        //
        slp.send_ajax( action, _this.process_ajax_response );
    };

    /**
     * Process the AJAX responses for locations.
     */
    this.process_ajax_response = function ( response ) {
        valid_response = (typeof response.response !== 'undefined');
        if ( valid_response ) { valid_response = response.success; }

        if ( valid_response ) {
            cslmap.latest_response = response;
            cslmap.clearMarkers();
            
            /**
             * FILTER: locations_found
             * 
             * Manipulate the marker list returned from the backend.
             * 
             * @param   object   response.response   a list of map markers in an ordinal array (pass by reference)
             * @return  object                       the modified array
             */
            slp_Filter( 'locations_found' ).publish( response.response );
        
            cslmap.putMarkers( response.response );

            /**
             * Fire JavaScript action 'markers_dropped' after markers are dropped.
             */
            jQuery('#map').trigger('markers_dropped');

        } else {
            if (window.console) {
                console.log('SLP server did not send back a valid JSONP response.');
                if ( typeof response.response !== 'undefined' ) {
                    console.log( 'Response: ' + response.response );
                }
                if ( typeof response.message !== 'undefined' ) {
                    var sidebar = document.getElementById('map_sidebar');
                    sidebar.innerHTML = response.message;
                }
            }
        }
    };

    /***************************
     * function: tagFilter
     * usage:
     *        Sends an ajax request to only get the tags in the current search results
     * parameters:
     *        none
     * returns: none
     * 
     * TODO: This appears to be defunct, no longer called/used.
     */
    this.tagFilter = function () {

        //repeat last search passing tags
        var tag_to_search_for = this.saneValue('tag_to_search_for', '');
        this.loadMarkers(this.lastCenter, this.lastRadius, tag_to_search_for);
        jQuery('#map_box_image').hide();
        jQuery('#map_box_map').show();
    };

    /***************************
     * function: searchLocations
     * usage:
     *        begins the process of returning search results
     * parameters:
     *        none
     * returns: none
     */
    this.searchLocations = function () {
        var append_this =
            typeof slplus.options.append_to_search !== 'undefined' ?
                slplus.options.append_to_search :
                '';

        var address = this.saneValue('addressInput', '') + append_this;

        this.unhide_map();

        google.maps.event.trigger(this.gmap, 'resize');

        // Address was given, use it...
        //
        if (address !== '') {
            this.address = address;
            this.doGeocode();

            // Otherwise use the current map center as the center location
            //
        } else {
            var tag_to_search_for = this.saneValue('tag_to_search_for', '');
            var radius = this.saneValue('radiusSelect', this.default_radius );
            this.loadMarkers( null , radius, tag_to_search_for);
        }
    };

    /**
     * Render a marker in the results section
     *
     * @param {object} aMarker marker data for a single location
     * @returns {string} a html div with the data properly displayed
     */
    this.createSidebar = function (aMarker) {

        //if we are showing tags in the table
        //
        aMarker.pro_tags = '';
        if (jQuery.trim(aMarker.tags) !== '') {
            var tagclass = aMarker.tags.replace(/\W/g, '_');
            aMarker.pro_tags = '<br/><div class="' + tagclass + ' slp_result_table_tags"><span class="tagtext">' + aMarker.tags + '</span></div>';
        }

        // City, State, Zip
        // Formatted US-style
        //
        aMarker.city_state_zip = '';
        if (jQuery.trim(aMarker.city) !== '') {
            aMarker.city_state_zip += aMarker.city;
            if (jQuery.trim(aMarker.state) !== '' || jQuery.trim(aMarker.zip) !== '') {
                aMarker.city_state_zip += ', ';
            }
        }
        if (jQuery.trim(aMarker.state) !== '') {
            aMarker.city_state_zip += aMarker.state;
            if (jQuery.trim(aMarker.zip) !== '') {
                aMarker.city_state_zip += ' ';
            }
        }
        if (jQuery.trim(aMarker.zip) !== '') {
            aMarker.city_state_zip += aMarker.zip;
        }

        // Phone and Fax with Labels
        //
        aMarker.phone_with_label = (jQuery.trim(aMarker.phone) !== '') ? slplus.options['label_phone'] + aMarker.phone : '';
        aMarker.fax_with_label = (jQuery.trim(aMarker.fax) !== '') ? slplus.options['label_fax'] + aMarker.fax : '';

        // Search address and formatted location address
        //
        var address = this.__createAddress(aMarker);
        aMarker.location_address = encodeURIComponent(address);
        aMarker.search_address = encodeURIComponent(this.getSearchAddress(this.address));
        aMarker.hours_sanitized = jQuery("<div/>").html(aMarker.hours).text();

        /**
         * Create and entry in the results table for this location.
         */
        var inner_html = {
            'content': slplus.options.results_layout.replace_shortcodes(aMarker),

            'finished': false
        };

        // FILTER: wrap_location_results
        // Wrap the location results string.
        //
        slp_Filter( 'wrap_location_results' ).publish( inner_html );

        if ( ! inner_html.finished ) {
            inner_html.content =
                '<div class="results_wrapper" id="slp_results_wrapper_' + aMarker.id + '">' +
                inner_html.content +
                '</div>'
            ;
        }

        return inner_html.content;
    };

    /**
     * Unhide the map div.
     */
    this.unhide_map = function() {
        if ( this.map_hidden ) {
            jQuery('#map_box_image').hide();
            jQuery('#map_box_map').show();
            this.map_hidden = false;
        }
    }

    //dumb browser quirk trick ... wasted two hours on that one
    this.__init();
};


/**
 * Setup an SLP namespace to prevent JS conflicts.
 */
var slp = slp || {};

/**
 * The jQuery Callback Observer (pub/sub) Stack
 *
 * @type {{}}
 */
slp.topics = {};

/**
 * Set various functions and methods to help manage the map.
 *
 * @returns {undefined}
 */
slp.setup_helpers=  function() {

        /**
         * Replace shortcodes in a string with current marker data as appropriate.
         *
         * The "new form" shortcode placeholders.
         *
         * Shortcode format:
         *    [<shortcode> <attribute> <modifier> <modifier argument>]
         *
         *    [slp_location <field_slug> <modifier>]
         *
         * Marker data is expected to be passed in the first argument as an object.
         *
         * @returns {string}
         */
        String.prototype.replace_shortcodes = function () {
            var args = arguments;
            var thisMarker = args[0];
            var shortcode_complex_regex = /\[(\w+)\s+([\w\.]+)\s*(\w*)(?:[\s="]*)(\w*)(?:[\s"]*)\s*(\w*)(?:[\s="]*)(\w*)(?:[\s"]*)\]/g;

            return this.replace(
                shortcode_complex_regex,
                function (match, shortcode, attribute, modifier, modarg, modifier2, modarg2) {

                    switch (shortcode) {
                        // SHORTCODE: slp_location
                        // processes the location data
                        //
                        case 'slp_location':
                            if (attribute === 'latitude') {
                                attribute = 'lat';
                            }
                            if (attribute === 'longitude') {
                                attribute = 'lng';
                            }

                            var value = '';
                            var field_name = '';

                            // Normal Marker data
                            if ( thisMarker[attribute] ) {
                                value = thisMarker[attribute];
                                field_name = attribute;

                            // Dot notation (array) attribute (marker data)
                            //
                            } else if (attribute.indexOf('.') > 1)  {
                                var dot_notation_regex = /(\w+)/gi;
                                var data_parts = attribute.match( dot_notation_regex );
                                var marker_array_name = data_parts[0];
                                if ( ! thisMarker[marker_array_name] ) { return ''; }
                                var marker_array_field = data_parts[1];
                                value = thisMarker[marker_array_name][marker_array_field];
                                if ( ! value ) { return ''; }
                                field_name = marker_array_name + '_' + marker_array_field;                                

                            // Output NOTHING if attribute is empty
                            //
                            } else {
                                return '';
                            }
                            
                            var output = value.shortcode_modifier( { 'modifier': modifier, 'modarg': modarg , 'field_name': field_name , 'marker': thisMarker } );
                            if ( modifier2 ) {
                                output = output.shortcode_modifier( { 'modifier': modifier2, 'modarg': modarg2 , 'field_name': field_name, 'marker': thisMarker  } );
                            }
                            return output;

                        // SHORTCODE: slp_option
                        // processes the option settings
                        //
                        case 'slp_option' :

                            // FILTER: replace_shortcodes_options
                            // Change the option set for shortcodes.
                            //
                            var options = slplus.options;
                            slp_Filter( 'replace_shortcodes_options' ).publish( options );
                            if ( attribute === 'name' ) {
                                attribute = modarg;
                                modarg = '';
                            }

                            if (!options[attribute]) { return ''; }
                            var output = options[attribute].shortcode_modifier( { 'modifier': modifier, 'modarg': modarg , 'field_name': attribute, 'marker': thisMarker  } )
                            if ( modifier2 ) {
                                output = output.shortcode_modifier( { 'modifier': modifier2, 'modarg': modarg2 , 'field_name': attribute, 'marker': thisMarker } );
                            }
                            return output;

                        // SHORTCODE: HTML
                        //
                        case 'html':
                            var output = '';
                            switch (attribute) {
                                case 'br':
                                    output = '<br/>';
                                    break;
                                case 'closing_anchor':
                                    output = '</a>';
                                    break;
                                default:
                                    break;
                            }
                            output = output.shortcode_modifier( { 'modifier': modifier, 'modarg': modarg , 'field_name': 'raw_html', 'marker': thisMarker  });
                            if ( modifier2 ) {
                                output = output.shortcode_modifier( { 'modifier': modifier2, 'modarg': modarg2 , 'field_name': 'raw_html', 'marker': thisMarker } );
                            }
                            return output;

                        // SLP_ADDON gets stripped out
                        case 'slp_addon':
                            return '';

                        // Unknown Shortcode
                        //
                        default:
                            return match + ' not supported';
                    }
                }
            );
        }

        /**
         * Modify shortcodes.
         *
         * @param full_mod { modifier, modarg, field_name }
         *
         * @returns string
         */
        String.prototype.shortcode_modifier = function () {
            var args        = arguments;
            var full_mod    = args[0];

            var modifier    = full_mod.modifier;
            var modarg      = full_mod.modarg;
            var field_name  = full_mod.field_name;

            var raw_output = true;
            if ( field_name === 'hours' ) {
                raw_output = false;
            }

            var value    = this;

            var prefix = '';
            var suffix = '';

            // Modifier Processing
            //
            if ( modifier ) {
                switch (modifier) {

                // MODIFIER: ifset
                // if the marker attribute specified by modarg is empty, don't output anything.
                //
                case 'ifset':
                    if ( ! full_mod.marker[full_mod.modarg] ) {
                        return '';
                    }
                    break;

                // MODIFIER: suffix
                //
                case 'suffix':
                    switch (modarg) {
                        case 'br':
                            suffix = '<br/>';
                            break;
                        case 'comma':
                            suffix = ',';
                            break;
                        case 'comma_space':
                            suffix = ', ';
                            break;
                        case 'space':
                            suffix = ' ';
                            break;
                        default:
                            break;
                    }
                    break;

                // MODIFIER: wrap
                //
                case 'wrap':
                    switch (modarg) {
                        case 'directions':
                            prefix = '<a href="http://' + slplus.options.map_domain +
                                '/maps?saddr=' + encodeURIComponent(cslmap.getSearchAddress(cslmap.address)) +
                                '&daddr=' + encodeURIComponent(full_mod.marker['fullAddress']) +
                                '" target="_blank" class="storelocatorlink">';
                            suffix = '</a> ';
                            break;

                        case 'img':
                            prefix = '<img src="';
                            suffix = '" class="sl_info_bubble_main_image">';
                            break;

                        case 'mailto':
                            prefix = '<a href="mailto:';
                            suffix = '" target="_blank" id="slp_marker_email" class="storelocatorlink">';
                            break;

                        case 'website':
                            prefix = '<a href="';
                            suffix = '" ' +
                                'target="' + ((slplus.options.use_same_window !== '0' ) ? '_self' : '_blank') + '" ' +
                                'id="slp_marker_website" ' +
                                'class="storelocatorlink" ' +
                                '>';
                            break;

                        case 'fullspan':
                            prefix = '<span class="results_line location_' + field_name + '">';
                            suffix = '</span>';
                            break;

                        default:
                            break;
                    }
                    break;

                // MODIFIER: format
                //
                case 'format':
                    switch (modarg) {
                        case 'decimal1':
                            value = parseFloat(value).toFixed(1);
                            break;
                        case 'decimal2':
                            value = parseFloat(value).toFixed(2);
                            break;
                        case 'sanitize':
                            value = value.replace(/\W/g, '_');
                            break;
                        case 'text':
                            value = jQuery("<div/>").html(value).text();
                            break;
                        default:
                            break;
                    }
                    break;

                // MODIFIER: raw
                //
                case 'raw':
                    raw_output = true;
                    break;

                // MODIFIER: Unknown, do nothing
                //
                default:
                    break;
            }
            }

            var newOutput =
                (raw_output) ?
                    value :
                    jQuery("<div/>").html(value).text();

            return prefix + newOutput + suffix;
        }
    };

/**
 * Setup the map settings and get it rendered.
 *
 * @returns {undefined}
 */
slp.setup_map = function () {

    // Initialize the map based on sensor activity
    //
    // There are 4 possibilities, and we set the cslmap object as
    // late as possible for each...
    //
    // 1) Sensor Active, Location Service OK
    // 2) Sensor Active, Location Service FAIL
    // 3) Sensor Active, But No Location Support
    // 4) Sensor Inactive
    //
    if (slplus.options.use_sensor) {
        sensor = new slp_LocationServices();
        if (sensor.LocationSupport) {
            sensor.currentLocation(
                // 1) Success on Location
                //
                function (loc) {
                    clearTimeout(sensor.location_timeout);
                    cslmap = new slp_Map();
                    cslmap.usingSensor = true;
                    sensor.lat = loc.coords.latitude;
                    sensor.lng = loc.coords.longitude;
                    cslmap.__buildMap(new google.maps.LatLng(loc.coords.latitude, loc.coords.longitude));
                },
                // 2) Failed on location
                //
                function (error) {
                    clearTimeout(sensor.location_timeout);
                    if (!sensor.errorCalled) {
                        sensor.errorCalled = true;
                        slplus.options.use_sensor = false;
                        cslmap = new slp_Map();
                        cslmap.usingSensor = false;
                        cslmap.doGeocode();
                    }
                }
            );

            // 3) GPS Sensor Not Working (like IE8)
            //
        } else {
            slplus.options.use_sensor = false;
            cslmap = new slp_Map();
            cslmap.usingSensor = false;
            cslmap.doGeocode();
        }

        // 4) No Sensor
        //
    } else {
        slplus.options.use_sensor = false;
        cslmap = new slp_Map();
        cslmap.usingSensor = false;


        // If the page uses [slplus id="<location_id>"]
        // use that location ID lat/long as the center of the map.
        //
        // TODO: since this is already a lat/long, this should call LoadMarkers() directly and bypass the GeoCoder.
        //
        if (slplus.options.id_addr != null) {
            cslmap.address = slplus.options.id_addr;
        }

        // If the address is blank, use the center map at address.
        //
        if ( ( ! cslmap.address ) && ( slplus.options.center_map_at ) ) {
            cslmap.address = slplus.options.center_map_at;
        }

        cslmap.doGeocode();
    }
};

/**
 * Send and AJAX request and process the response.
 *
 * @param action
 * @param callback
 */
slp.send_ajax = function (action, callback) {
    jQuery.post(
        slplus.ajaxurl,
        action,
        function (response) {
            try {
                response = JSON.parse(response);
            }
            catch (ex) {
            }
            callback(response);
        }
    );
};

/***************************************************************************
 *
 * CSL Main Execution
 *
 */

/*
 * When the document has been loaded...
 *
 */
jQuery(document).ready(
    function () {
        if ( typeof slplus !== 'undefined' ) {
            if (window.location.protocol !== slplus.ajaxurl.substring(0, slplus.ajaxurl.indexOf(':') + 1)) {
                slplus.ajaxurl = slplus.ajaxurl.replace(slplus.ajaxurl.substring(0, slplus.ajaxurl.indexOf(':') + 1), window.location.protocol);
            }
        }

        // Regular Expression Test Patterns
        //
        var radioCheck = /radio|checkbox/i,
            keyBreaker = /[^\[\]]+/g,
            numberMatcher = /^[\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?$/;

        // isNumber Test
        //
        var isNumber = function (value) {
            if (typeof value === 'number') {
                return true;
            }

            if (typeof value !== 'string') {
                return false;
            }

            return value.match(numberMatcher);
        };

        // Form Parameters Processor
        //
        jQuery.fn.extend({
            // Get the form parameters
            //
            formParams: function (convert) {
                if (this[0].nodeName.toLowerCase() == 'form' && this[0].elements) {

                    return jQuery(jQuery.makeArray(this[0].elements)).getParams(convert);
                }
                return jQuery("input[name], textarea[name], select[name]", this[0]).getParams(convert);
            },
            // Get a specific form element
            //
            getParams: function (convert) {
                var data = {},
                    current;

                convert = convert === undefined ? true : convert;

                this.each(function () {
                    var el = this,
                        type = el.type && el.type.toLowerCase();
                    //if we are submit, ignore
                    if ((type == 'submit') || !el.name) {
                        return;
                    }

                    var key = el.name,
                        value = jQuery.data(el, "value") || jQuery.fn.val.call([el]),
                        isRadioCheck = radioCheck.test(el.type),
                        parts = key.match(keyBreaker),
                        write = !isRadioCheck || !!el.checked,
                    //make an array of values
                        lastPart;

                    if (convert) {
                        if (isNumber(value)) {
                            value = parseFloat(value);
                        } else if (value === 'true' || value === 'false') {
                            value = Boolean(value);
                        }

                    }

                    // go through and create nested objects
                    current = data;
                    for (var i = 0; i < parts.length - 1; i++) {
                        if (!current[parts[i]]) {
                            current[parts[i]] = {};
                        }
                        current = current[parts[i]];
                    }
                    lastPart = parts[parts.length - 1];

                    //now we are on the last part, set the value
                    if (lastPart in current && type === "checkbox") {
                        if (!jQuery.isArray(current[lastPart])) {
                            current[lastPart] = current[lastPart] === undefined ? [] : [current[lastPart]];
                        }
                        if (write) {
                            current[lastPart].push(value);
                        }
                    } else if (write || !current[lastPart]) {
                        current[lastPart] = write ? value : undefined;
                    }

                });
                return data;
            }
        });

        // Our map initialization
        //
        if ( jQuery('div#sl_div').length ) {
            if (typeof slplus !== 'undefined') {
                if (typeof google !== 'undefined') {
                    slp.setup_helpers();
                    slp.setup_map();
                } else {
                    jQuery('#sl_div').html('Looks like you turned off SLP Maps under General Settings but need them here.');
                }
            } else {
                jQuery('#sl_div').html('Store Locator Plus did not initialize properly.');
            }
        }
    }
);
