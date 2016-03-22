/**
 * Created by Alex on 2/14/16.
 */


function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))jQuery/;
    return re.test(email);
}


jQuery(document).ready(function(){
    //find submit button and attach to it's click

console.log(jQuery("#storeContactForm"));

    jQuery("#storeContactForm #submitButton").click(function(evt){
        
        //get message

        var senderName = jQuery(".store-page-content #storeContactForm #name").val();

        var senderEmail = jQuery(".store-page-content #storeContactForm #email").val();

        var message = jQuery(".store-page-content #storeContactForm .inputText").val();

        var toEmail = "alex@notwithoutus.com";

        var store_id = jQuery(".store-page-content #store_id").val();

        var canSend = true;

        if(senderName.length < 3){
            jQuery(".store-page-content #storeContactForm #name").css("border-color", "#ff0000");
            canSend = false;
        }else{
            jQuery(".store-page-content #storeContactForm #name").css("border-color", "#ffffff");
        }

        if(validateEmail(senderEmail)){
            jQuery(".store-page-content #storeContactForm #email").css("border-color", "#ff0000");
            canSend = false;
        }else{
            jQuery(".store-page-content #storeContactForm #email").css("border-color", "#ffffff");
        }


        if(message.length < 10){
            jQuery(".store-page-content #storeContactForm .inputText").css("border-color", "#ff0000");
            canSend = false;
        }else{
            jQuery(".store-page-content #storeContactForm .inputText").css("border-color", "#ffffff");
        }

        if(canSend){

        jQuery("#storeContactForm #submitButton").hide();
        
            //disable form, hide button
            jQuery(".store-page-content #storeContactForm input, .store-page-content #storeContactForm textarea").prop("disabled", true);

            jQuery.ajax({
                type: "POST",
                url: "//devppc.coeur.io/store-contact.php",
                data: {

                    message: message,
                    email_to: toEmail,
                    email_from: senderEmail,
                    email_name: senderName,
                    store_id: store_id

                }
                ,success: function(aData){

                    var jsonData = JSON.parse(aData);


                    if (parseInt(jsonData.status) == 1) {

                        //disable form, hide button
                        jQuery(".store-page-content #storeContactForm input, .store-page-content #storeContactForm textarea").prop("disabled", true);

                    }else{
                        alert(aData.message);

                        jQuery("#storeContactForm #submitButton").hide();
                        
                        //disable form, hide button
                        jQuery(".store-page-content #storeContactForm input, .store-page-content #storeContactForm textarea").prop("disabled", false);
                    }
                }
            });

        }else{
            console.log("Don't Send Email! ");
        }

    });


});