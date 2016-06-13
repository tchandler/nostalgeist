from flask import Flask, render_template, jsonify, request
app = Flask(__name__)

import app.lastfm as lastfm
import app.spotify as spotify

@app.route('/')
def index():
    spotify_token = request.args.get('access_token')
    return render_template('index.html', client_id=spotify.SPOTIFY_CLIENT_ID,
        spotify_token=spotify_token)

@app.route('/import/<last_fm_username>')
def import_from_last_fm(last_fm_username):
    week_name, tracks = lastfm.get_week_of_tracks_as_dict(last_fm_username)
    last_fm_info = {}
    last_fm_info[week_name] = tracks
    return jsonify(**last_fm_info)

@app.route('/export', methods=['POST'])
def spotify_auth():
    request_dict = request.get_json(force=True)
    token = request_dict.get('token')
    list_name = request_dict.get('list_name')
    tracks = request_dict.get('tracks')

    print token
    print list_name
    print tracks

    track_info = [[track['track'], track['artist'], track['album']] for track in tracks]
    track_names = [' '.join(track) for track in track_info]

    missing_track_idxs = spotify.create_spotify_playlist_with_token(token, list_name, track_names)
    missing_tracks = [tracks[idx] for idx in missing_track_idxs]
    if len(missing_tracks) < len(track_names):
        return jsonify(success='Hey, it worked!', missing=missing_tracks)
    else:
        return jsonify(failure='No matching tracks found')