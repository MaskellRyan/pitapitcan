jQuery(document).ready(function ($) {
/*
    $(".full-header").sticky({
        topSpacing: 0,
        wrapperClassName: 'full-header'
    });
*/
    $('.image-wrapper').hover(function(){


        $(this).find('.mouse-effect').stop().animate({'opacity':'0.6'});
        $(this).find('.extra-links').stop().animate({'top':'50%'});

    },function(){


        $(this).find('.mouse-effect').stop().animate({'opacity':'0'});
        $(this).find('.extra-links').stop().animate({'top':'-50%'});

    });

    $("#portfolio-column-change a").click(function (event) {
        event.preventDefault();
        var view = $(this).attr("id");
        if (view == "three") {
            $(".holder.quicksand li").removeClass("four columns").addClass("one-third column");
            if ($data) {
                $("ul.holder.quicksand").removeAttr("style");
                $data.find("li").removeClass("four columns").addClass("one-third column")
            }
        } else {
            $(".holder.quicksand li").removeClass("one-third column").addClass("four columns");
            if ($data) {
                $("ul.holder.quicksand").removeAttr("style");
                $data.find("li").removeClass("one-third column").addClass("four columns")
            }
        }
    });

    $("a[rel^='prettyPhoto']").prettyPhoto();

    $(".ads img").addClass("img-frame");

    $('.footer .fr a').click(function(){
        $('html,body').animate({ scrollTop: 0}, 'slow');
    });


     // Set menu height
    
    var menuHeight = $('section.topBar').height();

    if(menuHeight > 90){
        $('section.topBar').css({'min-height': menuHeight});
    }

    $('#main-menu li a').click(function(e){

        e.preventDefault();

            var content = $(this).attr('href');
            var checkURL = content.match(/^#([^\/]+)$/i);
            if(checkURL){

                var goPosition = $(content).offset().top - (menuHeight - 10);

                $('html,body').animate({ scrollTop: goPosition}, 'slow');

            }else{
                window.location = content;
            }

    });

    $("#main-menu li").click(function () {
        $("#main-menu li").removeClass("active");
        $(this).addClass("active")
    });

    $(".filter li a").click(function (event) {
        event.preventDefault();
        var test = $(this).parent().attr("class");
        $(".filter li a").removeClass("main-btn").addClass("gray");
        $(this).removeClass("gray").addClass("main-btn");
    });
    
    $("#foot a").click(function () {
        $("#menu li").removeClass("active");
        $("#menu li:first").addClass("active")
    });

    var adjustParallax = function(){

        $('section.parallax').each(function(){

            var sectionParallax = "#"+$(this).attr('id');

            jQuery(sectionParallax).parallax("50%", "0.3");


        });
    }


    var $filterType = $("#filterOptions li.active a").attr("rel");
    var $holder = $("ul.quicksand");
    var $data = $holder.clone();
    $("#filterOptions li a").click(function (e) {
        $("#filterOptions li").removeClass("active");
        var $filterType = $(this).attr("rel");
        $(this).parent().addClass("active");
        if ($filterType == "all") var $filteredData = $data.find("li");
        else var $filteredData = $data.find("li[data-type~=" + $filterType + "]");
        $holder.quicksand($filteredData, {
            duration: 800,
            easing: "easeInOutQuad"
        }, function () {
            $("a[rel^='prettyPhoto']").prettyPhoto();

            adjustParallax();

            $('ul.quicksand').removeAttr('style');
            
             $('.image-wrapper').hover(function(){

                $(this).find('.mouse-effect').stop().animate({'opacity':'0.6'});
                $(this).find('.extra-links').stop().animate({'top':'50%'});

                },function(){


                $(this).find('.mouse-effect').stop().animate({'opacity':'0'});
                $(this).find('.extra-links').stop().animate({'top':'-50%'});

                });
        });
        return false;
    });





    var lastId, topMenu = $("#main-menu"),
    topMenuHeight = topMenu.outerHeight() + 500;
    menuItems = topMenu.find('a');

        scrollItems = menuItems.map(function () {

            content = $(this).attr("href");

            if(content){
                var checkURL = content.match(/^#([^\/]+)$/i);

                if(checkURL){

                    var item = $($(this).attr("href"));
                    if (item.length) return item

                }
            }
        });

        
    $(window).scroll(function () {
        var fromTop = $(this).scrollTop() + topMenuHeight;
        var cur = scrollItems.map(function () {
            if ($(this).offset().top < fromTop) return this
        });
        cur = cur[cur.length - 1];
        var id = cur && cur.length ? cur[0].id : "";
        if (lastId !== id) {
            lastId = id;
           menuItems.parent().removeClass("active").end().filter("[href=#" + id + "]").parent().addClass("active")
        }
    });

    
    $("#iso-column-change a").click(function (event) {
        event.preventDefault();
        var view = $(this).attr("id");
        if (view == "three") {
            $("#iso-portfolio li").removeClass("four columns").addClass("one-third column");
            $('#iso-portfolio').isotope('reLayout');
        } else {
            $("#iso-portfolio li").removeClass("one-third column").addClass("four columns");
            $('#iso-portfolio').isotope('reLayout');

        }

        adjustParallax();
    });


    var $container = $('#iso-portfolio');

    $('#iso-filter a').click(function(event){

        var selector = $(this).attr('rel');

        if(selector != "all"){
            selector = '.'+selector;
        }else{
            selector = '*';
        }

        $container.isotope({ filter: selector },function(){
        
            adjustParallax();

        });
         
        return false;
    });

    var scrolled = false;

    $(window).resize(adjustParallax);

    $(window).scroll(function() {

        var scrollTop = $(window).scrollTop();

        if(scrollTop > 5){
            if(!scrolled){
                scrolled = true;
                $("#scrollingHeader").animate({top: -27}, 500);
				$("#social_buttons_nav").animate({top: 25 }, 500);
				//$("#social_buttons_nav").animate({right: 0 }, 200);
                //$("#navFooter").fadeOut(500);
            }
        }else{
            if(scrolled){
                scrolled = false;
                $("#scrollingHeader").animate({top: 0}, 500);
				$("#social_buttons_nav").animate({top: 50 }, 500);
				//$("#social_buttons_nav").animate({right: 115 }, 200);
                //$("#navFooter").fadeIn(500);
            }
        }

    });

	
	// $("#social_buttons_nav" ).mouseenter(function() {
	// 		$("#social_buttons_nav").animate({right: 115 }, 200);
	// });
	// $("#social_buttons_nav" ).mouseleave(function() {
	// 	if(scrolled){
	//   	  	$("#social_buttons_nav").animate({right: 0}, 200);
	// 	}
	// });





});

(function($) {
    jQuery.fn.goTo = function(aOffset) {
        jQuery('html, body').animate({
            scrollTop: ($(this).offset().top - aOffset) + 'px'
        }, 'fast');
        return this; // for chaining...
    }
})(jQuery);

jQuery(window).load(function () {

     jQuery(".mainSlider").flexslider({
        animation: "slide",
        animationLoop: true,
        directionNav: false,
        controlNav: true
    });


    jQuery('.nzs-isotype').isotope({
        itemSelector : '.nzs-iso-enabled'
     });

    jQuery(window).resize(function(){
        jQuery('.nzs-isotype').isotope('reLayout',function(){
           jQuery('section.parallax').each(function(){

                var sectionParallax = "#"+jQuery(this).attr('id');

                jQuery(sectionParallax).parallax("50%", "0.3");


            });

        });
    });

    jQuery("#subMenu option[value='#about']").remove();
});


// ------- from csl.js -------- //

jQuery("#state_map_input_button").click(function(){
    DoMapSearch();
});

function DoMapSearch(){
    var inputVal = jQuery("#state_map_input_address").val();

    if(inputVal != ""){
    
    jQuery("#addressInput").val(inputVal);

    jQuery("#state_map_div").hide();
    jQuery("#sl_div").show();
    
    jQuery("#addressSubmit").click();

    }else{
    alert("Please enter your location.");
    }
}