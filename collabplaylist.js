app.get('/collaborative_playlist', function(req, res) {

  var user_id = client_id;
  var pname = req.query.playlist_name;    //let users input a name for the shared playlist
  var scopes = 'playlist-modify-public playlist-modify-private';	//user needs to have these scopes authorized for this to work

  var makeplaylist = {
    url: 'https://api.spotify.com/v1/users/' + username + '/playlists',
    headers: {'Authorization': 'Bearer ' + accessToken, 'Content-Type' : 'application/json'},
    body: {
      name: pname,
      public: false,
      collaborative: true
    },
    json: true
  };

    request.post(makeplaylist, function(error, response, body) {
      if (!error && (response.statusCode == 200 || response.statusCode == 201)) {
        //var loc = response.Location;
        var plid = response.id;			//spotify id for the playlist
        var pluri = response.uri;		//spotify uri
        var wapiep = response.href;		//link to web api endpoint?

        //not sure where to pass the information to
        res.send({
        	'playlist_id': plid,
        	'uri': pluri,
        	'href': wapiep
        });
      } else {
        res.redirect('/#' + querystring.stringify({error: 'failed_to_create_playlist'}));
      }
    });
});