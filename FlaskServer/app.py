import random
from flask import Flask, make_response, abort, jsonify, send_file
from flask_cors import CORS
import json
import pandas as pd
import folium
from folium.plugins import MarkerCluster, FastMarkerCluster, HeatMap
import functools
import time


app = Flask(__name__, static_folder='static')
# allows CORS for all domains on all routes
CORS(app)


def benchmark(func):
    """
    a decorator that print the time of function tack to execute
    """
    @functools.wraps(func)
    def new_func(*args, **kwargs):
        start_time = time.time()
        func(*args, **kwargs)
        elapsed_time = time.time() - start_time
        print('function [{}] finished in {} ms'.format(
            func.__name__, int(elapsed_time * 1000)))

    return new_func


# to use this just use: 'abort(404)'
@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'error': 'Not found'}), 404)


@app.route('/map')
def hello_world():
    proto_type()
    return 'Hello World!'


@app.route('/')
def init_map():
    # create empty map to display when the app is first up
    my_map = folium.Map(location=[rome_lat, rome_lng], zoom_start=0, width="100%", height="100%")
    my_map.save(path)
    return "init finish!"

# if __name__ == '__main__':
#     # regular way for running the flask app
#     # app.run()
#

jsonPath = r"C:\Users\david\Desktop\Projects\KeepersMaps-Private\src\assets\MockJSON\ChildLocation.json"


def round_by_four(x):
    return round(x, 4)


# @app.route('/pro', methods=['GET'])
@app.route('/pro', methods=['GET'])
def show_map():
    proto_type()
    return send_file(path)


# path = r'C:\Users\david\OneDrive\Python\FlaskProject\static\map.html'
path = r'C:\Users\david\Desktop\Projects\KeepersMaps\src\assets'
rome_lat, rome_lng = 41.9028, 12.4964


def proto_type():
    start_time = time.time()
    print("in pro!")
    with open(jsonPath, 'r') as f:
        # create a new DataFrame
        d = pd.DataFrame(json.loads(f.read()))
    # make the lat and lng short
    d.latitude, d.longitude = round_by_four(d.latitude), round_by_four(d.longitude)
    # extract the date and time to two different columns and delete the original column
    d['Date'], d['Time'] = d['date_created'].str.split(' ', 1).str
    d['Time'] = d['Time'].str[:2]
    # remove duplicates values
    d.drop_duplicates(inplace=True)
    # combine the lat and lng to one column tuple
    # d['Location'] = list(zip(d.latitude, d.longitude))
    # delete unnecessary columns
    del d['date_created'], d['Time']

    number_of_markers = random.randint(1, 10000)
    samples = d.sample(number_of_markers)
    locations_list = samples[['latitude', 'longitude']].values.tolist()

    # regular map
    my_map = folium.Map(location=[rome_lat, rome_lng], zoom_start=5, width="100%", height="100%")
    my_map.add_child(FastMarkerCluster(locations_list))

    # heat map
    my_heat_map = folium.Map(location=[rome_lat, rome_lng], zoom_start=5, width="100%", height="100%")
    my_heat_map.add_child(HeatMap(locations_list))

    # save both maps
    my_map.save(path + r"\map.html")
    my_heat_map.save(path + r"\heat_map.html")
    elapsed_time = time.time() - start_time
    print("elapsed time:", int(elapsed_time * 1000), "ms")


def create_marker(row, popup=None):
    """Returns a L.marker object"""
    # icon = L.AwesomeMarkers.icon({markerColor: row.color})
    # marker = L.marker(L.LatLng(row.lat, row.lng))
    # marker.setIcon(icon)
    # if popup:
    #     marker.bindPopup(row[popup])
    return "hello world"