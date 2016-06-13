import pylast
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta, SU
from random import choice, shuffle

from app.api_keys import LAST_FM_KEY, LAST_FM_SECRET

def get_random_weekly_chart_for_user(username):
    network = pylast.LastFMNetwork(api_key=LAST_FM_KEY, api_secret=LAST_FM_SECRET)
    user = network.get_user(username)
    weekly_charts = user.get_weekly_chart_dates()
    random_week_start, random_week_end = choice(weekly_charts)
    week_of = datetime.fromtimestamp(int(random_week_start))
    week_of_name = week_of.strftime('Week of %d, %b %Y')
    return week_of_name, user.get_weekly_track_charts(random_week_start, random_week_end)

def searchify_track(track):
    track_name = track.get_name()
    
    artist = track.get_artist()
    artist_name = artist.get_name() if artist else ''
    
    album = track.get_album()
    album_name = album.get_name() if album else ''

    return " ".join([track_name, artist_name, album_name])

def make_track_dict(track):
    track_name = track.get_name()
    
    artist = track.get_artist()
    artist_name = artist.get_name() if artist else ''
    
    album = track.get_album()
    album_name = album.get_name() if album else ''

    return {
        'track': track_name,
        'artist': artist_name,
        'album': album_name
    }

def get_some_tracks(weekly_chart):
    bottom = weekly_chart[20:]
    shuffle(bottom)

    deep_cuts = bottom[:5]
    top_tracks = weekly_chart[:20]
    tracks = [track for tracks in zip(top_tracks, deep_cuts) for track in tracks]
    for track in tracks:
        yield track.item

def get_week_of_tracks_as_dict(lastfm_username):
    week_name, weekly_chart = get_random_weekly_chart_for_user(lastfm_username)
    tracks = [make_track_dict(track) for track in get_some_tracks(weekly_chart)]
    print len(tracks)
    return week_name, tracks

def get_week_of_tracks(lastfm_username):
    week_name, weekly_chart = get_random_weekly_chart_for_user(lastfm_username)
    tracks = [searchify_track(track) for track in get_some_tracks(weekly_chart)]
    return week_name, tracks

