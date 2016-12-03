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

$('.add-to-spotify').click(function(){
    var btn = $(this);
    
    var playlistID = $(this).attr('id');
    var playlistTitle = playlistID.charAt(0).toUpperCase() + playlistID.slice(1);
    
    var uris = [];    
    $('.modal-component#modal-' + playlistID + ' li').each(function(){
        uris.push($(this).data('uri'));
    });

    $.ajax({
        type: "POST",
        url: "/createPlaylist",
        dataType: 'json',
        contentType: "application/json",
        data: JSON.stringify({ 
            title: playlistTitle,
            collaborative: false,
            trackListings: uris,
            accessToken: $('#accessToken').text(),
            userID: $('#uid').text() 
        })
    }).done(function(data) {
         console.log(data);
         if (data.success) {
            btn.html("ADDED!").attr("disabled","disabled"); 
         } else {
             
         }
    });
    
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
    console.log('.modal-component#modal-' + id);
    //audio.pause();
   $('.modal-component#modal-' + id).removeClass("hide").removeClass("fadeOut").addClass("fadeIn"); 
});

function closeModal() {
    $('.modal-component').removeClass("fadeIn").addClass("fadeOut");
}