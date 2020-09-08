from urllib.parse import urlencode, urlparse, parse_qsl
import matplotlib.pyplot as plt
import requests
import pandas as pd
import numpy as np
from scipy.stats import linregress

import gmaps.datasets
import gmaps.geojson_geometries
import matplotlib.pyplot as plt
from matplotlib.cm import viridis, plasma
# from matplotlib.colors import ListedColormap, LinearSegmentedColormap
from matplotlib import cm
from matplotlib.colors import to_hex

# Census & gmaps API Keys
from config import census_key, g_key

class GoogleMapClient(object):
    lat = None
    lng = None
    data_type ='json'
    location_query = None
    api_key=None
    
    def __init__(self, api_key=None, address_or_postal_code = None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if g_key == None:
            raise Exception('Api key is required')
        self.api_key = api_key
        self.location_query = address_or_postal_code
        if self.location_query != None:
            self.extract_lat_lng()
    
    def extract_lat_lng(self, location=None):
        loc_query = self.location_query
        if location != None:
            loc_query = location
        geocode_url = f"https://maps.googleapis.com/maps/api/geocode/{self.data_type}"
        params = {'address':self.location_query, 'key': self.api_key}
        params_url = urlencode(params)
        url = f"{geocode_url}?{params_url}"
        response = requests.get(url)
        if response.status_code not in range(200, 299):
            return {}
        latlng = {}
        try:
            latlng = response.json()['results'][0]['geometry']['location']
        except:
            pass
        lat, lng = latlng.get('lat'), latlng.get('lng')
        self.lat = lat
        self.lng = lng
        return lat, lng
    
    def search(self, keyword='Mexican food', radius = 1000, location=None):
        lat, lng = self.lat, self.lng
        if location != None:
            lat, lng = self.extract_lat_lng()
        end_point = f'https://maps.googleapis.com/maps/api/place/nearbysearch/{self.data_type}'
        params = {
                'key': self.api_key,
                'location': f"{lat},{lng}",
                'radius': radius,
                'keyword': keyword
                        }
        params_encoded = urlencode(params)
        places_endpoint = f"{end_point}?{params_encoded}"
        response = requests.get(places_endpoint)
        if response.status_code not in range(200, 299):
            return {}
        return response.json()
    
    def detail(self, place_id='ChIJv1DlfKQsDogRhm8x60TVJyo', fields=["name", "rating", "formatted_phone_number", "formatted_address"]):
        detail_end_point = f'https://maps.googleapis.com/maps/api/place/details/{self.data_type}'
        detail_params = {
                'place_id': f'{place_id}',
                'fields': ','.join(fields),
                'key': self.api_key
                }
        detail_params_encoded = urlencode(detail_params)
        detail_places_endpoint = f"{detail_end_point}?{detail_params_encoded}"
        response = requests.get(detail_places_endpoint)
        if response.status_code not in range(200, 299):
            return {}
        return response.json() 

# Create DataAnalysis Object
class DataAnalysis():
    regress_values = None
    line_eq = None
  
    # Define initialization method
    def __init__(self, x, y):
        self.x = x
        self.y = y
    
    # Define linear regression method
    def lin_regr(self):
        (slope, intercept, rvalue, pvalue, stderr) = linregress(self.x, self.y)
        self.rsq_value = round(rvalue**2, 4)
        self.regress_values = self.x * slope + intercept
        self.line_eq = "y = " + str(round(slope,4)) + "x + " + str(round(intercept,2))
        return self.regress_values, self.line_eq, self.rsq_value
    
    # Define scatter plot method
    def scat_plot(self):
        regress_values, line_eq, rsq_value = self.lin_regr()
        x_axes = np.median(self.x)
        y_axes = np.median(self.y)+6
        plt.scatter(self.x, self.y)
        plt.plot(self.x, regress_values, "r-")
        plt.annotate(line_eq, (x_axes, y_axes), fontsize=15,color="red")
        plt.title(f'{self.x.name} vs {self.y.name} R-squared is: {rsq_value}', size=14)
        plt.xlabel(self.x.name)
        plt.ylabel(self.y.name)

# Create GmapsAnalysis Object
class GmapsAnalysis():
  
    # Define initialization method
    def __init__(self, data_df, state = 'country', col = '2019', geometry='countries'):
        # Convert analyzed data values to dict and set the first geometry map layer
        data_dict = data_df.filter([state, col])
        data_dict = data_dict.set_index(state).to_dict()[col]
        self.data = data_dict
        self.min = min(self.data.values())
        self.max = max(self.data.values())
        self.range = self.max - self.min
        self.geojson = gmaps.geojson_geometries.load_geometry(geometry)
        self.fig = gmaps.figure()
        
    def calculate_color(self, state, cmap_color = plasma):
        # We will need to scale the states values to lie between 0 and 1
        # make state a number between 0 and 1
        normalized_state = (state - self.min) / self.range
        # invert state so that high value gives dark color
        inverse_state = 1.0 - normalized_state
        # transform the state value to a matplotlib color
        mpl_color = cmap_color(inverse_state)
        # transform from a matplotlib color to a valid CSS color
        gmaps_color = to_hex(mpl_color, keep_alpha=False)

        return gmaps_color

    def colors_list(self, cmap_color = plasma):
        colors = []
        for feature in self.geojson['features']:
            geo_state_name = feature['properties']['name']
            try:
                state = self.data[geo_state_name]
                color = self.calculate_color(state, cmap_color)
            except KeyError:
            # no value for that state: return default color
                color = (0, 0, 0, 0.3)
            colors.append(color)
        return colors

    def color_map(self, cmap_color = plasma, opacity = 0.8):
        states_layer = gmaps.geojson_layer(self.geojson,
                                           fill_color = self.colors_list(cmap_color), stroke_color = self.colors_list(),
                                            fill_opacity = opacity)
        self.fig.add_layer(states_layer)
        
    def symbols_map(self, symbols_data, color = 'blue', scale = 1):
        symbols_layer = gmaps.symbol_layer(symbols_data, fill_color = color, stroke_color = color, scale = scale)
        self.fig.add_layer(symbols_layer)
        
    def marker_map(self, locations = [(41.8781136, -87.6297982)], cont = 'Chicago, IL'):
        marker = gmaps.marker_layer(locations, info_box_content= cont)
        self.fig.add_layer(marker)   