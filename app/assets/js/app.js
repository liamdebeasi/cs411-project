// Initialize FastClick.js
if ('addEventListener' in document) {
    document.addEventListener('DOMContentLoaded', function() {
        FastClick.attach(document.body);
    }, false);
}

var timer; 

// Hover over option, play preview
$('.col-xs-6').mouseenter(function(){
        
    if (audio.paused) {
        clearTimeout(timer);
        var id = $(this).children('section').attr("id");
        var song = $(".modal-component#" + id).data('song');
        
        timer = setTimeout(function(){
            console.log('execute');
            audio.pause();
            
            audio.src = song;
            audio.play();
        }, 250);
    }
});

// just pause preview
// if we try to remove the src while
// a visualizer is still attached
// safari will crash thx apple
$('.col-xs-6').mouseleave(function(){
    if (!audio.paused && !$('.modal-component').hasClass("fadeIn")) {
        audio.pause();
    }
});


/* Modal Controllers */

// Dismiss a modal
$(document).keyup(function(e) {
   if (e.keyCode == 27 && $('.modal-component').hasClass("fadeIn")) {
       closeModal();
   } 
});

$('.modal-blocker').click(function(){
   closeModal();
});

// Click an Option, open a Modal
$('section').click(function(){
    
    var id = $(this).attr("id");
    
    console.log("click", id);
    //audio.pause();
   $('.modal-component#' + id).removeClass("hide").removeClass("fadeOut").addClass("fadeIn"); 
});

function closeModal() {
    $('.modal-component').removeClass("fadeIn").addClass("fadeOut");
}