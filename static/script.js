(function nostalgeist() {
    var lastImport;

    var lastFmList = document.getElementById('weekly-list');
    var lastFmInput = document.getElementById('last-fm-username');
    var lastFmSubmit = document.getElementById('import');

    var weekNameElem = document.getElementById('week-name')
    var weekListElem = document.getElementById('weekly-list')

    function createTrackLi(track) {
        var trackName = track.track;
        var albumName = track.album;
        var artistName = track.artist;
        var name = [trackName, ' by ', artistName, ' from ', albumName].join('');
        return '<li>' + name + '</li>';
    }

    lastFmSubmit.addEventListener('click', function() {
        var lastFmUsername = lastFmInput.value;
        fetch('/import/' + lastFmUsername)
            .then(function(result) {
                return result.json();
            })
            .then(function(weekDict) {
                lastImport = weekDict;

                var weekName = Object.keys(weekDict)[0];
                var tracks = weekDict[weekName];

                var trackHtml = tracks.map(createTrackLi).join('');

                weekNameElem.innerHTML = weekName;
                weekListElem.innerHTML = trackHtml;
            });
    });

    var spotifyInput = document.getElementById('spotify-username');

    var authButton = document.getElementById('auth');
    authButton.addEventListener('click', function() {
        var params = {
            'client_id': window.CLIENT_ID,
            'response_type': 'token',
            'redirect_uri': 'http://localhost:5000/',
            'scope': 'playlist-modify-public'
        };

        var queryParams = Object.keys(params).map(function(paramName) {
            return encodeURIComponent(paramName) + '=' + encodeURIComponent(params[paramName]);
        }).join('&');
        
        var spotifyAuthUrl = 'https://accounts.spotify.com/authorize?' + queryParams

        window.location = spotifyAuthUrl;
    });

    function getHashValue(key) {
      var matches = location.hash.match(new RegExp(key+'=([^&]*)'));
      return matches ? matches[1] : null;
    }

    var exportButton = document.getElementById('export');
    exportButton.addEventListener('click', function() {
        if(lastImport) {
            var weekName = Object.keys(lastImport)[0];
            var tracks = lastImport[weekName];
            var auth_token = getHashValue('access_token');

            var params = {
                'token': auth_token,
                'list_name': weekName,
                'tracks': tracks            
            };

            fetch('/export', {
                'method': 'POST',
                'body': JSON.stringify(params),
                'headers': {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }).then(function(response) {
                return response.json();
            }).then(function(responseObj) {
                if ('missing' in responseObj) {
                    var missingTracks = responseObj.missing;
                    var trackHtml = missingTracks.map(createTrackLi).join('');
                    var missingTracksElem = document.getElementById('missing-tracks');
                    missingTracksElem.innerHTML = trackHtml;
                }
                //TODO: Don't use alerts
                alert('Export successful!');
            });
        }
    });

    var auth_token = getHashValue('access_token');
    if (auth_token) {
        exportButton.disabled = false;
    }

})();