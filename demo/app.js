/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var client_id = '084e247c66d841619920ef214acd0e12'; // Your client id
var client_secret = '9f0b4404246740d596be7e4e8ae2589e'; // Your secret
var redirect_uri = 'http://localhost:8888/callback';

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

var stateKey = 'spotify_auth_state';

var app = express();

app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'))
   .use(cookieParser());
  app.engine('html', require('ejs').renderFile)
  app.set('view engine', 'ejs');


app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});


app.get('/', function(req, res) {
    //token expires in an hour?
    //got this accesstoken from https://developer.spotify.com/web-api/console/get-current-user-saved-tracks/#complete
    var accessToken = 'BQBgGeI3KCZbW88g__T6l3P3XYpyFRuuFzXz6p2PufaqZKN_56qltKGliidyKYCAlVmeSVhU7eHLdxiLZsYY8SWLstSi_wqiSAgclD6yCEngXrM-SptB9wPdEPPBxGhJoE_ieGN8kzDVw2ql-wGz1_9Ekk-ZEXV96djvQUnJ6Aq6A4z1EEgc5pYGfdU6RFJle0sOxuqOB2fqxaw6K4KePCFns_hngbsuNQX5PHYCN3xq-S3UMUZvmlHau9fiXQvqWrxJETyR4N4PQT1TUay731mS2Sfypv8rxat265B2TPtJcMFhb_1X0I0';


    var fetchTracks = {
        url: 'https://api.spotify.com/v1/me/tracks?limit=10',
        headers: {'Authorization' : 'Bearer ' + accessToken},
        json: true
    };

    request.get(fetchTracks, function(error, response, body) {
        res.render('index.html', { data: response.body });
        //console.log(response.body);
    });


    /////////////
    // Spotify API playground for song recommendations based on seeds https://developer.spotify.com/web-api/console/get-recommendations/?seed_artists=4NHQUGzhtTLFvgF5SZesLK&seed_tracks=0c6xIDDpzE81m2q797ordA&min_energy=0.4&min_popularity=50&market=US#complete
    ////////////

    //sleep recommendations
    var sleepRec = {
        url: 'https://api.spotify.com/v1/recommendations?market=US&max_liveness=0.5&max_tempo=100.0seed_genres=acoustic,blues,chill,sleep,rainy-day&limit=10',
        headers: {'Authorization' : 'Bearer ' + accessToken, 'Accept' : 'application/json'},
        json: true
    };

    request.get(sleepRec, function(error, response, body) {
        //res.render('index.html', { data: response.body });
        //console.log(response.body);
    });

    //gym recommendations
    var gymRec = {
        url: 'https://api.spotify.com/v1/recommendations?market=US&seed_genres=dance,edm,hip-hop,work-out,club&limit=10',
        headers: {'Authorization' : 'Bearer ' + accessToken, 'Accept' : 'application/json'},
        json: true
    };

    request.get(gymRec, function(error, response, body) {
        //res.render('index.html', { data: response.body });
        //console.log(response.body);
    });

    var loungeRec = {
        url: 'https://api.spotify.com/v1/recommendations?market=US&max_tempo=120.0&seed_genres=acoustic,indie-pop,world-music,romance,r-n-b&limit=10',
        headers: {'Authorization' : 'Bearer ' + accessToken, 'Accept' : 'application/json'},
        json: true
    };

    request.get(loungeRec, function(error, response, body) {
        //res.render('index.html', { data: response.body });
        //console.log(response.body);
    });

    var workRec = {
        url: 'https://api.spotify.com/v1/recommendations?market=US&seed_genres=ambient,acoustic,piano,classical,soul&limit=10',
        headers: {'Authorization' : 'Bearer ' + accessToken, 'Accept' : 'application/json'},
        json: true
    };

    request.get(workRec, function(error, response, body) {
        //res.render('index.html', { data: response.body });
        //console.log(response.body);
    });

    var partyRec = {
        url: 'https://api.spotify.com/v1/recommendations?market=US&seed_genres=party,club,trip-hop,electronic,dancelimit=10',
        headers: {'Authorization' : 'Bearer ' + accessToken, 'Accept' : 'application/json'},
        json: true
    };

    request.get(partyRec, function(error, response, body) {
        //res.render('index.html', { data: response.body });
        //console.log(response.body);
    });

    /*
      "genres" : [ "acoustic", "afrobeat", "alt-rock", "alternative", "ambient", "anime", "black-metal", "bluegrass", "blues", "bossanova", "brazil", "breakbeat", "british", "cantopop", "chicago-house", "children", "chill", "classical", "club", "comedy", "country", "dance", "dancehall", "death-metal", "deep-house", "detroit-techno", "disco", "disney", "drum-and-bass", "dub", "dubstep", "edm", "electro", "electronic", "emo", "folk", "forro", "french", "funk", "garage", "german", "gospel", "goth", "grindcore", "groove", "grunge", "guitar", "happy", "hard-rock", "hardcore", "hardstyle", "heavy-metal", "hip-hop", "holidays", "honky-tonk", "house", "idm", "indian", "indie", "indie-pop", "industrial", "iranian", "j-dance", "j-idol", "j-pop", "j-rock", "jazz", "k-pop", "kids", "latin", "latino", "malay", "mandopop", "metal", "metal-misc", "metalcore", "minimal-techno", "movies", "mpb", "new-age", "new-release", "opera", "pagode", "party", "philippines-opm", "piano", "pop", "pop-film", "post-dubstep", "power-pop", "progressive-house", "psych-rock", "punk", "punk-rock", "r-n-b", "rainy-day", "reggae", "reggaeton", "road-trip", "rock", "rock-n-roll", "rockabilly", "romance", "sad", "salsa", "samba", "sertanejo", "show-tunes", "singer-songwriter", "ska", "sleep", "songwriter", "soul", "soundtracks", "spanish", "study", "summer", "swedish", "synth-pop", "tango", "techno", "trance", "trip-hop", "turkish", "work-out", "world-music" ]
    */

});


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

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {

            var getUserSongs_AccessToken = 'BQB42WOlTc2ej_wQ6FBp_KpfvqFZCSPXPQlURKdH4RZDirO0VzU72KEe4VmLAN6tfBjSqkvBYAFT-YVWDSDjzlTJAww6tBKmLaUjlO0yE_6QYjyho7rE37UlfetFqX7mGr6SXvAiJRKwsVBIvB5WyEpg';
            var fetchTracks = {
                url: 'https://api.spotify.com/v1/me/tracks',
                headers: {'Authorization' : 'Bearer ' + getUserSongs_AccessToken},
                json: true
            };

            //res.send({ data: body });
        });

        res.redirect('/#' +
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

console.log('Listening on 8888');
app.listen(8888);
