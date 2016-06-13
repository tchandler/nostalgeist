import lastfm
import spotify

spotify_username = 'zohogorganzola@gmail.com'
lastfm_username = 'zohogorganzola'

week_name, week_tracks = lastfm.get_week_of_tracks(lastfm_username)
if week_tracks:
    spotify.create_spotify_playlist(spotify_username, week_name, week_tracks)
else:
    print "No tracks found for {}".format(week_name)