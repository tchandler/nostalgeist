(function nostalgeist() {
    var lastImport;

    var testData = {
        "Week of 20, Jul 2014": [
            {
            "album": "By the Lamplight", 
            "artist": "Larry and His Flask", 
            "track": "Barleywine Bump"
            }, 
            {
            "album": "Return to Paradise", 
            "artist": "Monster Rally", 
            "track": "Dizzy"
            }, 
            {
            "album": "All That We Know", 
            "artist": "Larry and His Flask", 
            "track": "Ebb and Flow"
            }, 
            {
            "album": "It's You", 
            "artist": "Duck Sauce", 
            "track": "It's You"
            }, 
            {
            "album": "Hobo's Lament", 
            "artist": "Larry and His Flask", 
            "track": "Hobo's Lament"
            }, 
            {
            "album": "The Rip Tide", 
            "artist": "Beirut", 
            "track": "Santa Fe"
            }, 
            {
            "album": "By the Lamplight", 
            "artist": "Larry and His Flask", 
            "track": "The Battle for Clear Sight"
            }, 
            {
            "album": "Drown Out", 
            "artist": "Daedelus", 
            "track": "Frisson"
            }, 
            {
            "album": "All That We Know", 
            "artist": "Larry and His Flask", 
            "track": "Beggars Will Ride"
            }, 
            {
            "album": "Coral", 
            "artist": "Monster Rally", 
            "track": "Color Sky"
            }
        ]
    };

    var LAST_FM_STORAGE_KEY = 'last-fm-list';

    var lastFmList = document.getElementById('weekly-list');
    var lastFmInput = document.getElementById('last-fm-username');
    var lastFmSubmit = document.getElementById('import');

    var lastFmListElem = document.getElementById('last-fm-list');
    var lastFmListLoaderElem = document.getElementById('last-fm-list-loader');
    
    var lastFmTableElem = document.getElementById('last-fm-table');
    var weekNameElem = document.getElementById('week-name')
    var weekListElem = document.getElementById('weekly-list')

    function createTrackTr(track) {
        var trackName = track.track;
        var albumName = track.album;
        var artistName = track.artist;

        $('#last-fm-table tbody').append(`<tr>
            <td>${artistName}</td>
            <td>${trackName}</td>
            <td>${albumName}</td>
        </tr>`);
    }

    function handleLastFmResponse(weekDict) {
        window.localStorage.setItem(LAST_FM_STORAGE_KEY, JSON.stringify(weekDict));
        lastImport = weekDict;

        var weekName = Object.keys(weekDict)[0];
        var tracks = weekDict[weekName];

        tracks.forEach(createTrackTr);

        weekNameElem.innerHTML = weekName;

        lastFmListLoaderElem.style.display = 'none';
        lastFmListElem.style.display = 'block';
    }

    lastFmSubmit.addEventListener('click', function() {        
        var lastFmUsername = lastFmInput.value;

        lastFmListLoaderElem.style.display = 'block';
        lastFmListElem.style.display = 'none';
        $('#last-fm-table tbody tr').remove();

        fetch('/import/' + lastFmUsername)
            .then((result) => result.json())
            .then(handleLastFmResponse);
        
        // window.setTimeout(()=>handleLastFmResponse(testData), 1000);
    });

    var spotifyInput = document.getElementById('spotify-username');

    var authButton = document.getElementById('auth');
    authButton.addEventListener('click', function() {
        var params = {
            'client_id': window.CLIENT_ID,
            'response_type': 'token',
            'redirect_uri': location.protocol + '//' + location.host + location.pathname,
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

    var spotifyLoaderElem = document.getElementById('spotify-list-loader');
    var spotifyResultElem = document.getElementById('spotify-result');

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

            spotifyLoaderElem.style.display = 'block';
            spotifyResultElem.innerHTML = '';

            fetch('/export', {
                'method': 'POST',
                'body': JSON.stringify(params),
                'headers': {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(function(responseObj) {
                spotifyLoaderElem.style.display = 'block';
                
                if ('success' in responseObj) {
                    spotifyResultElem.innerHTML = responseObj['success'];
                }

                if ('failure' in responseObj) {
                    spotifyResultElem.innerHTML = responseObj['failure'];
                }

                if ('missing' in responseObj) {
                    spotifyLoaderElem.style.display = 'none';
                    console.log(responseObj['missing']);
                }

                console.log('Export successful!');
            });
        }
    });

    var auth_token = getHashValue('access_token');
    if (auth_token) {
        authButton.style.display = 'none';
        exportButton.style.display = '';
    }

    var existingLastFmData = window.localStorage.getItem(LAST_FM_STORAGE_KEY);
    if(existingLastFmData) {
        handleLastFmResponse(JSON.parse(existingLastFmData));
    }

})();