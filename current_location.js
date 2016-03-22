jQuery(document).ready(function($){


var frenchCurrentLocation, temp= document.createElement('p');
    temp.innerHTML= "O&#217; &#202;TES&ndash;VOUS?";
    frenchCurrentLocation= temp.textContent || temp.innerText;
    temp=null;
        
    var CURRENT_LOCATION_TEXT = LANG_FR ? frenchCurrentLocation /*"O&#217; &#202;TES&ndash;VOUS?"/*"OÙ ÊTES-VOUS?" */ : "CURRENT LOCATION";
    
    if (LANG_FR) {
	jQuery("#state_map_input_address").prop("placeholder", "Ville ou code postale");
    }
            
    if (slplus && slplus.options && slplus.options.use_sensor) {
        sensor = new slp_LocationServices();
        if (sensor.LocationSupport) {
	        
            jQuery("#state_map_input_address").val(CURRENT_LOCATION_TEXT);
				jQuery("#state_map_input_address").focus(function(){
					if(jQuery("#state_map_input_address").val() == CURRENT_LOCATION_TEXT) {
						jQuery("#state_map_input_address").val("");
					}
                                });
        }
        
    }
    
    
    /*
    if (navigator.geolocation) {
	    navigator.geolocation.getCurrentPosition(function(position){
		clientLat = position.coords.latitude;
		clientLon = position.coords.longitude;
    
		 jQuery("#state_map_input_address").val(CURRENT_LOCATION_TEXT);
				jQuery("#state_map_input_address").focus(function(){
					if(jQuery("#state_map_input_address").val() == CURRENT_LOCATION_TEXT) {
						jQuery("#state_map_input_address").val("");
					}

				});
	    }
	    , function(){
		//no geolocation   
	    });
	}else{
		//no geo
	}
    */
    

});