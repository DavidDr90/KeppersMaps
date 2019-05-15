from flask import Flask, make_response, abort, jsonify, Response
from flask_cors import CORS
from flask import request
import pandas as pd
import numpy as np
from math import cos, asin, sqrt
import time
import requests
import datetime
from datetime import date
import pprint
from prettytable import PrettyTable

# Keepers Server Consts
end_point = "https://graph-db-vod.keeperschildsafety.net"
subdir = "/graph"
headers = {"auth": "ailudAfKsubkGsubVvkuerybvkserXvSBndbYvsuyQdvkurYbvjrbeMmjhsdbpv",
           "Content-type": "application/json"}
base_request_string = "https://graph-db-vod.keeperschildsafety.net/graph/conversationsAtPointVicinityAndTimeRange?"
"""
Http request example:
https://graph-db-vod.keeperschildsafety.net/graph/conversationsAtPointVicinityAndTimeRange?
latitude=31.758731&longitude=35.1552423&range=5000&startDateEpoch=1550049989000&endDateEpoch=1550649989000  
"""

# const for processing children
markers_header = 'childWithLocationsAndSeverities'
management_header = 'messagesPageableData'
birthday_date = 'birthdayDate'
longitude = 'initialLocationLongitude'
latitude = 'initialLocationLatitude'
severities = 'severities'
total_pages = 'totalPages'
page_number_string = 'page'

range = 100000  # 100 Kilometer
limit = 1000
# center_location = {'lat': 41.9028, 'lng': 12.4964}  # Rome Italy


# global parameters
center_location = {}
start_date = 0
end_date = 0
filter_by = []
child_age_range = []

json_data = {"Markers": []}


# base running function for Flask
app = Flask(__name__, static_folder='static')
# allows CORS for all domains on all routes
CORS(app)


# to use this just use: 'abort(404)'
@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'error': 'Not found'}), 404)


@app.route('/filter', methods=['POST'])
def save_filter_data():
    """
    save all the filters variable from the client to local variables
    :return:
    """
    try:
        global start_date, end_date, center_location, filter_by, child_age_range
        data = request.get_json(force=True)
        print("data:")
        pprint.pprint(data)
        # save the filter data to global variables
        # save the date and convert it to milliseconds
        start_date = (datetime.datetime.strptime(data['startDate'], "%d/%m/%Y")).timestamp() * 1000
        end_date = (datetime.datetime.strptime(data['endDate'], "%d/%m/%Y")).timestamp() * 1000
        center_location = data['centerLocaion']
        filter_by = get_filter_by(data['filterBy'])
        child_age_range = [data['age']['start'], data['age']['end']]
        return jsonify("success")
    except Exception as e:
        print(e)
        abort(404)


@app.route('/map', methods=['GET'])
def main():
    try:
        generate_map(create_http_request())
        # parse the markers' json back to array on the client side and use ngFor to create the markers
        global json_data
        local_json_data = json_data
        # clear the json_data global for next use
        json_data = json_data.fromkeys(json_data, [])
        return jsonify(local_json_data)
    except Exception as e:
        print("There was an error in the '/map' function\nDescription = ", e)
        abort(500, Response("Server Internal Error"))


# if __name__ == '__main__':
#     # regular way for running the flask app
#     # app.run()
#


def proto_type():
    start_time = time.time()
    return "in pro!"
    """
    with open("", 'r') as f:
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
    """


ex_one_person = "https://graph-db-vod.keeperschildsafety.net/graph/conversationsAtPointVicinityAndTimeRange?" \
                "latitude=31.758731&longitude=35.1552423&range=5000&startDateEpoch=1550049989000&endDateEpoch=1550649989000"

"""= '<table class="table table-hover">'+
'  <thead class="table-primary">'+
'    <tr >'+
     '<th scope="col">Type</th>'+
     '<th scope="col">Column heading</th>'+
     '<th scope="col">Column heading</th>'+
     '<th scope="col">Column heading</th>'+
   '</tr>'+
 '</thead>'+
 '<tbody>'+
   '<tr>'+
     '<th scope="row">Active</th>'+
     '<td>Column content</td>'+
     '<td>Column content</td>'+
     '<td>Column content</td>'+
   '</tr>' + 
   '<tr>'+
     '<th scope="row">Active</th>'+
     '<td>Column content</td>'+
     '<td>Column content</td>'+
     '<td>Column content</td>'+
   '</tr>' + 
   '</table>'
   """

# ##########    Working Private Functions   ##############


def string_to_icon_color(x):
    return {
        'heavy': 'red',
        'medium': 'orange',
        'easy': 'green',
    }.get(x, "blue")  # 'blue' is default value


def check_for_age_range(child_age, age_range):
    """
    check if input child age is in the query's age range
    :param child_age: the age to check (int)
    :param age_range: the age range (list)
    :return: True if the age is in the range, else False
    """
    return True if min(age_range) <= child_age <= max(age_range) else False


def calculate_age(born):
    """
    Calculate the age of a given child birth date
    :param born: child birth date
    :return: the child age
    """
    today = date.today()
    return today.year - born.year - ((today.month, today.day) < (born.month, born.day))


def milliseconds_to_date(milli):
    """
    convert milliseconds to date
    :param milli:
    :return: the corresponding date
    """
    return datetime.datetime.fromtimestamp(milli / 1000.0)


def distance(lat1, lon1, lat2, lon2):
    """
    calculate the distance between two points specified by latitude and longitude
    using the Haverine Formula:
    https://en.wikipedia.org/wiki/Haversine_formula
    https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
    :param lat1:
    :param lon1:
    :param lat2:
    :param lon2:
    :return: the distance between the two locations
    """
    p = 0.017453292519943295  # Pi/180
    a = 0.5 - cos((lat2 - lat1) * p) / 2 + cos(lat1 * p) * cos(lat2 * p) * (1 - cos((lon2 - lon1) * p)) / 2
    return 12742 * asin(sqrt(a))  # 2 * R; R = 6371 km


def round_by_four(x):
    return round(x, 4)


def groupby_count(df):
    """
    count same longitude and latitude
    :param df: the input data from the json file
    :return: data with new count column and remove the duplicates
    """
    # convert all the milliseconds date to only the date part
    df['date'] = pd.to_datetime(df['date'], unit='ms')
    # save only the date part of the object
    df['date'] = df['date'].apply(lambda x: x.strftime("%d-%m-%Y"))
    # get the number of uniqe rows
    unq, date = np.unique(df.date, return_inverse=True)
    # get the data from the right column
    date_values = df.date.values
    rows = np.lexsort([date, date_values])

    ts = date[rows]
    idss = date_values[rows]

    # remove the duplicates and count
    m0 = (idss[1:] != idss[:-1]) | (ts[1:] != ts[:-1])
    m = np.concatenate(([True], m0, [True]))
    rows_out = rows[m[:-1]]
    count = np.diff(np.flatnonzero(m) + 1)

    # create new column with the count for each row
    df.loc[rows_out, 'count'] = count
    # delete the nan rows
    df = df.dropna()
    # convert the DataFrame back to numpy matrix
    return df.values


def param_to_matrix(data, list_data):
    """
    convert input data to html table
    use the group by function to reduce the number of row for each date
    :param data: input data, list of dictionaries
    :return: new numpy array with all the data
    """
    # group by and count same date rows
    new_data = groupby_count(pd.DataFrame(data))
    # if this is the first run return the new_data, else concat the new data to the old oen
    return new_data if not list_data.size else np.concatenate((list_data, new_data), axis=0)


def data_to_html_table(data, headers):
    """
    Convert data in numpy matrix to html table
    :param data: numpy matrix
    :param headers: the headers for the PrettyTable object
    :return: html table in string
    """
    # sort the headers by alphabetic order
    headers_list = sorted(headers)
    # add the count column
    headers_list.append('count')
    # create a new PrettyTable object
    output_table = PrettyTable(headers_list)
    for row in data:
        output_table.add_row(row)
    return output_table.get_html_string()


def process_one_child(child):
    """
    Handle one child. extract the child age, the requested severities
    and the child location
    :param child: input child to process
    :return: add new marker to the global 'json_data' object
    """
    global birthday_date, severities, longitude, latitude
    # check if the child is in the requested age range
    birthday = milliseconds_to_date(child[birthday_date])
    age = calculate_age(birthday)
    # if the given child is not in the age range continue
    if len(child_age_range) > 0 and not check_for_age_range(age, child_age_range):
        return

    if len(filter_by) == 1:
        icon_color = string_to_icon_color(filter_by[0])
    else:
        icon_color = 'pink'  # TODO: pick color for mixed values

    # create a list of the headers from the original data
    headers = [key for key in child[severities][0].keys()]
    # create an empty numpy array for the messages data
    output_list = np.array([])

    for param in filter_by:
        # save only the relevant data, the one that equals to 'param'
        only_param = [d for d in child[severities] if d.get('severity') == param]
        if len(only_param) > 0:
            # then remove the 'only_param' from the original data
            child[severities][:] = [item for item in child[severities] if item not in only_param]
            # group by and create html table from the data
            output_list = param_to_matrix(only_param, output_list)
        else:
            continue

    # if there is no messages with the input parameters in the child move to the next one
    if not output_list.size:
        return

    # add new marker to the json object with array of all the markers
    total_sum = str(int(output_list[:, -1].sum()))
    output_data = {"lat": child[latitude], "lng": child[longitude],
                   "data": "<h1>data_to_html_table(output_list, headers)</h1>",
                   "color": icon_color,
                   "label": {
                       "color": 'black',
                       "fontFamily": '',
                       "fontSize": '14px',
                       "fontWeight": 'bold',
                       "text": total_sum
                   }
                   }
    global json_data
    # save the new child to the markers array
    json_data["Markers"].append(output_data)


def generate_map(http_request):
    """
    process all the data from Keepers API and save the relevant children as markers on map
    in the end save the map to local file
    :param http_request: the base http request to the Keepers API
    :return: save the map object to local html file
    """
    global ex_one_person
    print("http request:")
    pprint.pprint(http_request)
    # first_response = requests.get(http_request, headers=headers)
    first_response = requests.get(http_request, headers=headers)
    print("first response")
    pprint.pprint(first_response)
    if first_response.status_code is not 200:
        abort(500)
    g = first_response.headers.get('content-type')
    print("content type")
    pprint.pprint(g)
    first_response = first_response.json()
    print("after parsing to json")
    pprint.pprint(first_response)

    try:
        # save the data part from the json
        data = first_response[markers_header]
        # save the management pare from the json
        management = first_response[management_header]
        # save the current page number to local variable
        page_number = int(management['pageable'][page_number_string])

        # read all the pages from Keepers server
        while management['pageable'][page_number_string] < management[total_pages]:

            # process the children in this page
            for child in data:
                process_one_child(child)

            # change the http request to the next page
            next_page_request = ''.join([http_request, "&page=", str(page_number + 1)])
            # send new API request to the Keepers server
            new_response = requests.get(next_page_request, headers=headers).json()

            # save the new data and management info
            data = new_response[markers_header]
            management = new_response[management_header]
            # get the new page number
            page_number = int(management['pageable'][page_number_string])

    except Exception as e:
        print("Error.", e)
        if first_response['status'] == 400:
            print("There was an error in generate_map().\nDescription = Bad Request (400)", first_response['message'])
            return
        else:
            raise Exception("There was an general error in generate_map()\nDescription = ", e)


def create_http_request():
    """
    use all the global parameters to form a http request to the Keepers API
    :return: the full http request as string
    """
    return ''.join([base_request_string, "latitude=", str(center_location['lat']), "&longitude=",
                    str(center_location['lng']), "&range=", str(range), "&startDateEpoch=",
                    str(int(start_date)), "&endDateEpoch=", str(int(end_date))])  # , "&limit=", str(limit)])


def get_filter_by(by):
    """
    convert the filter parameters from the client to list of string with the Keepers API format
    :param by: input dictionary from the client
    :return: filter by list to match the Keepers API
    """
    filter_parameters = ["easy", "heavy", "medium"]
    output = []
    for key, value in by.items():
        for param in filter_parameters:
            if param in str(key).lower() and value:
                output.append(param)
    return output
