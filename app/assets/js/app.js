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
            btn.html("ADDED!"); 
         } else {
             
         }
    });
    
});

$('.add-to-spotify-collaborative').click(function(){
    var btn = $(this);
    
    var playlistID = 'collaborative';
    var playlistTitle = $('#collab-name').val();
    
    var numbers = $('#collab-share').val();   
    
    var uris = [];    
    $('.modal-component#collaborative #tracks li').each(function(){
        uris.push($(this).data('uri'));
    });
    
    if (playlistTitle) {
        $.ajax({
            type: "POST",
            url: "/createPlaylist",
            dataType: 'json',
            contentType: "application/json",
            data: JSON.stringify({ 
                title: playlistTitle,
                collaborative: true,
                trackListings: uris,
                numbers: numbers.split(','),
                accessToken: $('#accessToken').text(),
                userID: $('#uid').text() 
            })
        }).done(function(data) {
             console.log(data);
             if (data.success) {
                btn.html("CREATED AND SHARED!"); 
             }
        });
    }
});

var searchTimer;
$('#collab-search').keyup(function(){
    
    var query = $('#collab-search').val();
    
    if (query) {
     clearTimeout(searchTimer);
        searchTimer = setTimeout(function(){
            $.ajax({
                type: "POST",
                url: "/searchTracks",
                dataType: 'json',
                contentType: "application/json",
                data: JSON.stringify({ 
                    query: query,
                    accessToken: $('#accessToken').text(),
                    userID: $('#uid').text() 
                })
            }).done(function(data) {
                 if (data.success && data.tracks.length > 0) {
                     $('#collab-tracks').html('').removeClass("hide");
                    for (var t in data.tracks) {
                        var track = data.tracks[t];
                        if (t % 2 == 0) {
                            var type = "even";
                        } else {
                            var type = "odd";
                        }
                        
                        $('#collab-tracks').append('<li class="'+type+'" data-uri="' + track.uri + '" data-track="' + track.title + '" data-artist="' + track.artist + '" data-album="' + track.albumName + '" data-image="' + track.albumArt + '">'
                        + '<div class="album-art " style="background-image: url(' + track.albumArt + ');"></div>'
                        + '<h3>' + track.title + '</h3>'
                        + '<p>' + track.artist + ' &bull; ' + track.albumName + '</p>'
                        + '</li><div class="clear"></div>');     
                    }
                }
                $('#collab-tracks li').on('click',function(){
                    // remove listener
                    $(this).off();
                    
                    // clear search field
                    $('#collab-search').val('');
                    // empty and hide search results
                    $("#collab-tracks").html('').addClass("hide");
                    
                    // grab all data
                    var uri = $(this).data('uri');
                    var track = $(this).data('track');
                    var album = $(this).data('album');
                    var artist = $(this).data('artist');                    
                    var image = $(this).data('image');
                    
                    // append
                    $('#tracks').append('<li data-uri=' + uri + ' data-track=' + track + ' data-artist=' + artist + ' data-album=' + album + ' data-image=' + image + '>'
                        + '<div class="album-art " style="background-image: url(' + image + ');"></div>'
                        + '<h3>' + track + '</h3>'
                        + '<p>' + artist + ' &bull; ' + album + '</p>'
                        + '</li><div class="clear"></div>');   
                });
            });
        }, 250);
    } else {
        // clear search field
        $('#collab-search').val('');
        // empty and hide search results
        $("#collab-tracks").html('').addClass("hide"); 
    }
});

$('#collab-tracks li').on('click',function(){
    console.log('click');
   $('#collab-search').text('');
   var uri = $(this).data('uri');
   var track = $('#collab-tracks li[data-uri=' + uri + '] h3').text();
   var album = $('#collab-tracks li[data-uri=' + uri + '] p').text();
   console.log(album);
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

// Used only for creating a collaborative playlist
$('.collab').click(function(){
   $('.modal-component#collaborative').removeClass("hide").removeClass("fadeOut").addClass("fadeIn");  
});

// Click an Option, open a Modal
$('section').click(function(){
    
    var id = $(this).attr("id");

    //audio.pause();
   $('.modal-component#modal-' + id).removeClass("hide").removeClass("fadeOut").addClass("fadeIn"); 
});

function closeModal() {
    $('.modal-component').removeClass("fadeIn").addClass("fadeOut");
    setTimeout(function(){
        $('#collab-name, #collab-share').val('');
        $('#tracks').html('');
        $('.add-to-spotify-collaborative').html('CREATE AND SEND')
    }, 250);
}