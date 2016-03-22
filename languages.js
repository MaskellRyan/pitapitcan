/**
 * Created by Alex on 12/4/14.
 */

jQuery( document ).ready(function() {
    jQuery("#langSelect").change(function () {

        var currentLanguage = getUrlParameter("lang");

        if(currentLanguage == "fr"){

        }

        var lang = jQuery("#langSelect").val();

        var pageUrl = window.location.href.split('?')[0].split('#')[0];
        
        if(lang != currentLanguage) {

            if (lang == "fr") {
                //window.location = document.url.replace("www.", "").replace("://", "://fr.");

                window.location.href = pageUrl + "?lang=fr";
                
                //jQuery(".lang-eng").css("display", "none"); // script added by Ryan M
                //jQuery(".lang-fr").css("display", "block"); // script added by Ryan M

            } else {
                //english
                
                window.location.href = pageUrl + "?lang=en";
                
                //window.location = document.url.replace("://", "://fr.").replace("www.", "");
            }
            /*
            var fullUrl = pageUrl.split('/');
            var lastItem = fullUrl[fullUrl.lastIndexOf()];
            switch(lastItem) {
              case "catering":
                fullUrl.pop().push("traiteur");
                break;
              case "traiteur":
                fullUrl.pop().push("catering");
                break;
            }
            var newUrl;
            for (var i = 0; i < fullUrl.length; i++) {
              newUrl += fullUrl[i];
            }
            */
        }
    });


    var currentLanguage = getUrlParameter("lang");

    if(currentLanguage == "fr"){
        jQuery("#french-placeholder").hide();
    }





});

function getUrlParameter(sParam)
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++)
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam)
        {
            return sParameterName[1];
        }
    }
}
