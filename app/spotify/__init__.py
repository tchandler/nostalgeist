import spotipy
import spotipy.util as util

from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta, SU
from random import choice, randint, shuffle

from app.api_keys import SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET

SPOTIPY_SCOPE = 'playlist-modify-public'

redirect_uri = "http://localhost:8000/"

def get_connection(username, redirect_uri):
    token = util.prompt_for_user_token(username,
        SPOTIPY_SCOPE, client_id=SPOTIFY_CLIENT_ID,
        client_secret=SPOTIFY_CLIENT_SECRET, 
        redirect_uri=redirect_uri)
    if token:
        return spotipy.Spotify(auth=token)
    else:
        return spotipy.Spotify()

def create_playlist(sp, name, track_ids):
    user = sp.me()
    new_playlist = sp.user_playlist_create(user['id'], name)
    sp.user_playlist_add_tracks(user['id'], new_playlist['id'], track_ids)

def get_track_ids(results):
    for result in results:
        items = result['tracks']['items']
        if items and items[0] and items[0]['id']:
            yield items[0]['id']
        else:
            yield None

def search_for_tracks(sp, track_names):
    return [sp.search(q=name, limit=1) for name in track_names]

def find_track_ids(sp, track_names):
    found_tracks = search_for_tracks(sp, track_names)
    return [track_id for track_id in get_track_ids(found_tracks)]

def create_playlist_from_tracks(sp, playlist_name, track_names):
    track_ids = find_track_ids(sp, track_names)
    missing_id_idxs = [i for i, x in enumerate(track_ids) if x is None]
    valid_track_ids = [track_id for track_id in track_ids if track_id is not None]
    create_playlist(sp, playlist_name, valid_track_ids)
    return missing_id_idxs

def create_spotify_playlist(username, playlist_name, track_names):
    sp = get_connection(username, redirect_uri)
    create_playlist_from_tracks(sp, playlist_name, track_names)
    print 'created playlist {}'.format(playlist_name)

def create_spotify_playlist_with_token(token, playlist_name, track_names):
    sp = spotipy.Spotify(auth=token)
    missing_track_idxs = create_playlist_from_tracks(sp, playlist_name, track_names)
    return missing_track_idxs
