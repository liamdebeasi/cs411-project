/* ------------- Application Setup ------------- */

/**
 * Declare Dependencies
 */
var express = require('express');
var request = require('request');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var jsonfile = require('jsonfile');
var mongo = require('mongodb');
var twilio = require('twilio');

// setup mongo client
var MongoClient = mongo.MongoClient;
var url = 'mongodb://localhost:27017/cs411';

var client_id;
var client_secret;
var tw;
var lookupTW;
var redirect_uri = 'http://localhost:8888/callback';

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items The array containing the items.
 */
function shuffle(a) {
    for (let i = a.length; i; i--) {
        let j = Math.floor(Math.random() * i);
        [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
}

/**
 * Get auth keys
 */
var auth = 'auth.json';
jsonfile.readFile(auth, function(err, obj) {
   client_id = obj.client;
   client_secret = obj.secret; 
   
   // setup twilio
   tw = twilio("AC8e40f70c424e498c57399d92a5bd6af6", obj.twilio);
   lookupTW = new twilio.LookupsClient("AC8e40f70c424e498c57399d92a5bd6af6", obj.twilio);
   
   // setup mongo creds
   url  = 'mongodb://' +  obj.mongoUsername + ':' + obj.mongoPassword + '@ds119788.mlab.com:19788/heroku_lcwx7zd3';
});

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items The array containing the items.
 */
function shuffle(a) {
    for (let i = a.length; i; i--) {
        let j = Math.floor(Math.random() * i);
        [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
}

/**
 * Setup Express server
 */
var stateKey = 'spotify_auth_state';
var app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname + '/assets'))
   .use(cookieParser());
  app.engine('html', require('ejs').renderFile)
  app.set('view engine', 'ejs');



/* ------------- Application Routing ------------- */

/**
 * Redirects user to Spotify to authenticate
 */
app.get('/login', function(req, res) {

    var state = generateRandomString(16);
    res.cookie(stateKey, state);

    // your application requests authorization
    var scope = 'user-read-private user-read-email user-top-read playlist-modify-public playlist-modify-private';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        })
    );
});

/**
 * Logs user out of app
 */
app.get('/logout', function(req, res) {
   res.redirect('/'); 
});

/**
 * Main page that user lands on
 */
app.get('/', function(req, res) {
    res.render('login.html');
});

/**
 * Main screen of app after being logged in
 * If user is no longer logged in, redirect them
 * to the login page
 */
app.get('/dashboard', function(req, res) {

    // User can only access dashboard
    // if an access token has been granted
    var accessToken = req.query.access_token;
    
    if (!accessToken) {
        res.redirect('/');
    } else {        
        var getTopArtistsOptions = {
            url: 'https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=5',
            headers: { 'Authorization': 'Bearer ' + accessToken },
            json: true
        };        
        // Get user's top artists to act as seeds for recommendations
        request.get(getTopArtistsOptions, function(err, artistResponse, body) {
            
            var artistsArr = [];
            
            // push to arr
            for (var artist in body.items) {
                artistsArr.push(body.items[artist].id);
            }
                        
            var artistsStr = artistsArr.join();
            
            //once done, we can get the recommendations
            var playlists = {
                "gym": {
                    url: 'https://api.spotify.com/v1/recommendations?min_energy=0.5&max_instrumentalness=0.0&market=US&seed_artists=' + artistsStr + '&min_popularity=25&limit=10',
                    headers: {'Authorization' : 'Bearer ' + accessToken, 'Accept' : 'application/json'},
                    json: true
                },
                "sleep": {
                    url: 'https://api.spotify.com/v1/recommendations?target_loudness=-30&max_instrumentalness=0.0&market=US&seed_artists=' + artistsStr + '&min_popularity=25&limit=10',
                    headers: {'Authorization' : 'Bearer ' + accessToken, 'Accept' : 'application/json'},
                    json: true
                },
                "lounge": {
                    url: 'https://api.spotify.com/v1/recommendations?target_danceability=0.5&target_energy=0.3&target_valence=0.3&market=US&seed_artists=' + artistsStr + '&min_popularity=25&limit=10',
                    headers: {'Authorization' : 'Bearer ' + accessToken, 'Accept' : 'application/json'},
                    json: true
                },
                "party": {
                    url: 'https://api.spotify.com/v1/recommendations?min_energy=0.5&min_danceability=0.5&max_instrumentalness=0.0&market=US&seed_artists=' + artistsStr + '&min_popularity=50&limit=10',
                    headers: {'Authorization' : 'Bearer ' + accessToken, 'Accept' : 'application/json'},
                    json: true
                },
                "work": {
                    url: 'https://api.spotify.com/v1/recommendations?market=US&max_energy=0.6&min_instrumentalness=0.5&min_valence=0.3&seed_artists=' + artistsStr + '&min_popularity=25&limit=10',
                    headers: {'Authorization' : 'Bearer ' + accessToken, 'Accept' : 'application/json'},
                    json: true
                },
                "random": {
                    url: 'https://api.spotify.com/v1/recommendations?market=US&target_instrumentalness=0.0&target_energy=' + Math.random() + '&target_danceability=' + Math.random() + '&seed_artists=' + artistsStr + '&limit=10',
                    headers: {'Authorization' : 'Bearer ' + accessToken, 'Accept' : 'application/json'},
                    json: true
                }
            };
            var numPlaylists = 5;
            
            var recommendations = {};
            
            // for each playlist, get some recommendations
            for (let p in playlists) {
                request.get(playlists[p], function(error, response, body) { 
                                        
                    recommendations[p] = [];
                                        
                    // process data into a format that will be displayed
                    // and push to array
                    for (var song in body.tracks) {
                        recommendations[p].push({
                            id: body.tracks[song].id,
                            uri: body.tracks[song].uri,
                            name: body.tracks[song].name,
                            album: body.tracks[song].album.name,
                            artist: body.tracks[song].artists[0].name,
                            albumArt: body.tracks[song].album.images[0].url,
                            previewUrl: body.tracks[song].preview_url
                        });                        
                    } 
                    
                    // only render index.html
                    // once all playlists have been processed
                    // ideally we would use promises, but there
                    // is support for multiple browsers is kinda
                    // sketchy... lookin at u internet explorer
                    numPlaylists--;
                    // shuffle in place
                    shuffle(recommendations[p]);
                    
                    if (numPlaylists == 0) {
                        
                        var options = {
                            url: 'https://api.spotify.com/v1/me',
                            headers: { 'Authorization': 'Bearer ' + accessToken },
                            json: true
                        };
                                                
                        request.get(options, function(error, response, body) {   
                                                  
                            res.render('index.html', { profile: body, playlists: recommendations, token: accessToken } );                       
                        }); 
                    }                   
                });    
            }
           
        });        
    }  
});

/**
 * Callback after authorizing
 * account with Spotify
 */
app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;
                
        res.redirect('/dashboard?' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
        }));
                
        // we can also pass the token to the browser to make requests from there
        } else {
            res.redirect('/#' +
              querystring.stringify({
                error: 'invalid_token'
            }));
      }
    });
  }
});

/*
 * Create a playlist, add tracks, and place in user's account
 * Parameters:
 * accessToken (string): Spotify Access Token
 * title (string): Title of the playlist
 * collaborative (boolean): Whether or not this playlist is collaborative
 * trackListings (array): Array containing track URIs of songs to be
 * added to the playlist
 * numbers (array): Array containing phone numbers to share this playlist
 * with (if collaborative)
 */
app.post('/createPlaylist', function(req, res) {
    console.log('ay');
    // first get some profile info
    var accessToken = req.body.accessToken;
    var title = req.body.title;
    var getProfile = {
        url: 'https://api.spotify.com/v1/me',
        headers: { 'Authorization': 'Bearer ' + accessToken },
        json: true
    };
    
    var collaborative = req.body.collaborative;
    var trackListings = req.body.trackListings;
    var numbers = req.body.numbers || [];
        
    request.get(getProfile, function(error, response, body) {  
        console.log(error, body);
        // get spotify userid 
        var userID = body.id;
                
        // Next, connect to mongo to see if user has an existing
        // playlist. If so, we just want to update the track
        // listing not create a new one
        MongoClient.connect(url, function (error, db) {
            if (error) {
                 res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({ success: false, message: error}));
                res.end(); 
            } else {
                var collection = db.collection('userPlaylists');
                var cursor = collection.find({ userID: userID, playlistTitle: title });
                
                cursor.limit(1);
                
                // find the users's data
                cursor.toArray(function(error, result) {
                    if (error) {
                        res.setHeader('Content-Type', 'application/json');
                        res.send(JSON.stringify({ success: false, message: error}));
                        res.end(); 
                    } else {
                        
                        // if the user already has a playlist, just update the tracks
                        // as opposed to creating a new playlist
                        
                        if (result.length > 0) {
                            var playlistID = result[0].playlistID;
                            var updateTracks = {        
                                url: 'https://api.spotify.com/v1/users/' + userID + '/playlists/' + playlistID + '/tracks',
                                headers: {'Authorization' : 'Bearer ' + accessToken, 'Accept' : 'application/json'},
                                json: true,
                                body: {
                                    uris: trackListings
                                }
                            }; 
                                                                                    
                            request.put(updateTracks, function(error, response, body) {
                                                                
                                // The user may have deleted the playlist from their account :/
                                // if so, just add it again
                                if (error || response.statusCode != 201) {
                                    createPlaylist(userID, accessToken, title, collaborative, trackListings, res);
                                } else {
                                    
                                    db.close();
                                    console.log('updated');
                                    res.setHeader('Content-Type', 'application/json');
                                    res.send(JSON.stringify({ success: true, playlistID: playlistID}));
                                    res.end();
                                    
                                }
                            });
                            
                        // otherwise, user has no existing playlist
                        // so go ahead and create a new one
                        } else {   
                            
                            createPlaylist(userID, accessToken, title, collaborative, trackListings, res, numbers);
                        }
                    }
                });
            }
        });
                                    
    }); 

    
    // get relevant data;  
/*
    */
});

/*
 * Search the Spotify catalog for a query
 * Parameters:
 * accessToken (string): Spotify Access Token
 * query (string): Track to look up
 */
app.post('/searchTracks', function(req, res) {
    var query = req.body.query;
    var accessToken = req.body.accessToken;
    var getTracks = {
        url: 'https://api.spotify.com/v1/search?q=' + encodeURIComponent(query) + '&limit=10&type=track',
        headers: { 'Authorization': 'Bearer ' + accessToken },
        json: true
    }; 
    
    request.get(getTracks, function(error, response, body) { 
        
        if (error) {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({ success: false, message: error}));
            res.end();
        } else {
            var tracks = [];
            for (var i in body.tracks.items) {
                var track = body.tracks.items[i];
                tracks.push({
                    title: track.name,
                    artist: track.artists[0].name,
                    albumName: track.album.name,
                    albumArt: track.album.images[1].url,
                    uri: track.uri
                });
            }
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({ success: true, tracks: tracks}));
            res.end();
        }
    });
});

/*
 * Given an accessToken, look up the user's spotify username. 
 * Then, look up the 5 most recent numbers the user shared a playlist
 * with.
 * Parameters:
 * accessToken (string): Spotify Access Token
 */
app.post('/getRecentNumbers', function(req, res) {
    
    // first get some profile info
    var accessToken = req.body.accessToken;
    
    var getProfile = {
        url: 'https://api.spotify.com/v1/me',
        headers: { 'Authorization': 'Bearer ' + accessToken },
        json: true
    };
        
    request.get(getProfile, function(error, response, body) {  
        // get spotify userid 
        var userID = body.id;
                
        // Next, connect to mongo to see if user has an existing
        // playlist. If so, we just want to update the track
        // listing not create a new one
        MongoClient.connect(url, function (error, db) {
            if (error) {
                
            } else {
                var collection = db.collection('userNumbers');
                var cursor = collection.find({ userID: userID }).sort({_id: -1 });
                
                cursor.limit(5);
                
                // find the users's data
                cursor.toArray(function(error, result) {
                    if (error) {
                        res.setHeader('Content-Type', 'application/json');
                        res.send(JSON.stringify({ success: false, message: error}));
                        res.end(); 
                    } else {
                        var numbers = [];
                        for (var n in result) {
                            var singleNumber = result[n].number;
                            numbers.push(singleNumber);
                        }

                        res.setHeader('Content-Type', 'application/json');
                        res.send(JSON.stringify({ success: true, numbers: numbers}));
                        res.end();
                    }
                });
            }
        });
                                    
    }); 

});


function createPlaylist(userID, accessToken, title, collaborative, trackListings = [], res, numbers = []) {
        
    // create the playlist first
    var toCreate = {        
        url: 'https://api.spotify.com/v1/users/' + userID + '/playlists',
        headers: {'Authorization' : 'Bearer ' + accessToken, 'Accept' : 'application/json'},
        json: true,
        body: {
            name: title,
            public: (collaborative) ? false : true,
            collaborative: collaborative
        }
    };  
        
    request.post(toCreate, function(error, response, body) { 
                        
        // get the ID of the newly created playlist
        var playlistID = body.id; 
        var playlistBody = body;
            
        // next add tracks to the playlist
        var addTracks = {        
            url: 'https://api.spotify.com/v1/users/' + userID + '/playlists/' + playlistID + '/tracks',
            headers: {'Authorization' : 'Bearer ' + accessToken, 'Accept' : 'application/json'},
            json: true,
            body: {
                uris: trackListings
            }
        };
        
        console.log('playlist',playlistID,'created');
        if (error) {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({ success: false, message: error}));
            res.end();
            
        } else {
            request.post(addTracks, function(error, response, body) {
                console.log('added tracks');
                if (error) {
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify({ success: false, message: error}));
                    res.end();
                } else {
                    if (collaborative) {
                        // share with friends
                        var numPhones = numbers.length;
                        var externalURL = playlistBody.external_urls.spotify;
                        for (var n in numbers) {
                            tw.messages.create({
                                body: "Hi there, you have been invited to collaborate on the " + title + " playlist on Spotify. Tap the following link to get started: " + externalURL,
                                to: numbers[n],
                                from: "7742785522"
                            }, function(err, data) {
                                numPhones--;
                                
                                if (numPhones == 0) {
                                    
                                    // get formatted number for easy access later
                                    lookupTW.phoneNumbers(numbers[n]).get({
                                       type:'carrier'
                                    }, function(err, data) {
                                        var number = data.nationalFormat;
                                        
                                        MongoClient.connect(url, function (error, db) {
                                            var collection = db.collection('userNumbers');
                                            
                                            // delete any old data if it exists
                                            collection.deleteOne( { userID: userID, number: number });
                                            
                                            // now we need to insert a row into the database
                                            // so we can update the playlist accordingly in the future
                                            collection.insert( { userID: userID, number: number } , function(error, result) {
                                                
                                                //Close connection
                                                db.close();
                                                if (error) {
                                                    res.setHeader('Content-Type', 'application/json');
                                                    res.send(JSON.stringify({ success: false, message: error}));
                                                    res.end();
                                                } else {
                                                    res.setHeader('Content-Type', 'application/json');
                                                    res.send(JSON.stringify({ success: true, playlistID: playlistID}));
                                                    res.end();
                                                }
                                            });
                                        });
                                    });   
                                }
                            });
                        }

                    } else {
                        console.log('not collab');
                        MongoClient.connect(url, function (error, db) {
                            var collection = db.collection('userPlaylists');
                            
                            // delete any old data if it exists
                            collection.deleteOne( { userID: userID, playlistTitle: title });
                            
                            // now we need to insert a row into the database
                            // so we can update the playlist accordingly in the future
                            collection.insert( { userID: userID, playlistTitle: title, playlistID: playlistID} , function(error, result) {
                            
                                //Close connection
                                db.close();
                                if (error) {
                                    res.setHeader('Content-Type', 'application/json');
                                    res.send(JSON.stringify({ success: false, message: error}));
                                    res.end();
                                } else {
                                    res.setHeader('Content-Type', 'application/json');
                                    res.send(JSON.stringify({ success: true, playlistID: playlistID}));
                                    res.end();
                                }
                            });
                        });
                    }
                }
            });
        }                                                   
    }); 
}

/*

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});
*/

console.log('Listening on 8888');
app.listen(8888);
