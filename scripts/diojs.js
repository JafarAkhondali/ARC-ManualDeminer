"use strict";

$(document).ready(function(){

    //Functions
    /*
     function LightenDarkenColor(col, amt) {

     var usePound = false;

     if (col[0] == "#") {
     col = col.slice(1);
     usePound = true;
     }

     var num = parseInt(col,16);

     var r = (num >> 16) + amt;

     if (r > 255) r = 255;
     else if  (r < 0) r = 0;

     var b = ((num >> 8) & 0x00FF) + amt;

     if (b > 255) b = 255;
     else if  (b < 0) b = 0;

     var g = (num & 0x0000FF) + amt;

     if (g > 255) g = 255;
     else if (g < 0) g = 0;

     return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);

     }
     */


    //[Text Inputs]
    var textInputs = $('.input-text .field-input');
    textInputs.focus(function(){
        $(this).parent().addClass('is-focused has-label');
    });
    var parent = $(this).parent();

    textInputs.on("blur",function(){
        if($(this).val() == '')
            parent.removeClass('has-label');
        else
            parent.addClass('has-label');

        parent.removeClass('is-focused');
    });

    if($(this).val() == '')
        parent.removeClass('has-label');
    else
        parent.addClass('has-label');

    parent.removeClass('is-focused');

    //[/Text Inputs]
    //----------------------------------------------------------
    //[Buttons]
    $('.ripple').on('click', function (event) {
        var $ripple = $('<div class="ripple-effect"><div/>'),
            btnOffset = $(this).offset(),
            xPos = event.pageX - btnOffset.left,
            yPos = event.pageY - btnOffset.top;
        //var $ripple = $(".ripple-effect");
        $ripple.css("height", $(this).height());
        $ripple.css("width", $(this).height());
        $ripple.css({
                top: yPos - ($ripple.height()/2),
                left: xPos - ($ripple.width()/2),
                background: $(this).data("ripple-color"),
                animationDuration: $(this).data("ripple-duration") ? $(this).data("ripple-duration"): "2s"
            })
            .appendTo($(this));
        window.setTimeout(function(){
            $ripple.remove();
        }, $(this).data("ripple-duration") ? Number.parseFloat($(this).data("ripple-duration"))*1000 : 2000 );
    });


    //[/Buttons]

    //----------------------------------------------------------

});