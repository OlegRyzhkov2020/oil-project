#######################################################
# Configuration
#######################################################

from flask import Flask, jsonify, render_template
from flask import redirect, request, url_for, send_file, make_response
from datetime import datetime
from wtforms import Form, DateField, validators
from flask_pymongo import PyMongo

import io
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from sklearn.datasets import load_breast_cancer

# import scrape_oil_news
def do_plot():
    # Loading
    data = load_breast_cancer()
    breast_cancer_df = pd.DataFrame(data['data'])
    breast_cancer_df.columns = data['feature_names']
    breast_cancer_df['target'] = data['target']
    breast_cancer_df['diagnosis'] = [data['target_names'][x] for x in data['target']]
    feature_names= data['feature_names']

    corr = breast_cancer_df[list(feature_names)].corr(method='pearson')

    f, ax = plt.subplots(figsize=(11, 9))
    cmap = sns.diverging_palette(220, 10, as_cmap=True)
    mask = np.zeros_like(corr, dtype=np.bool)
    mask[np.triu_indices_from(mask)] = True

    sns.heatmap(corr, mask=mask, cmap=cmap, vmax=.3, center=0,
                square=True, linewidths=.5, cbar_kws={"shrink": .5})

    # here is the trick save your figure into a bytes object and you can afterwards expose it via flas
    bytes_image = io.BytesIO()
    plt.savefig(bytes_image, format='png')
    bytes_image.seek(0)
    return bytes_image

#######################################################
# Flask Setup
#######################################################
# Init app
app = Flask(__name__)
#######################################################
# Database Setup
#######################################################
# Use PyMongo to establish Mongo connection
mongo = PyMongo(app, uri="mongodb://localhost:27017/oil_db")

#######################################################
# Input Data Class Object
#######################################################
class InputForm(Form):
    start = DateField(label='date (YYYY)',
        format='%m/%d/%Y', default= datetime(2006, 1, 1),
        validators=[validators.InputRequired()])
    end = DateField(label='date (YYYY)',
        format='%m/%d/%Y', default= datetime(2016, 8, 23),
        validators=[validators.InputRequired()])

#######################################################
# Flask Routes
#######################################################

# Route to render index.html template using data from Mongo
@app.route("/")
def home():

    # Find records of data from the mongo database
    news_data = mongo.db.oil_news
    latest_news = []
    id = 1
    for s in news_data.find():
        latest_news.append({'ID':id, 'Date' : s['Date'], 'News_Title' : s['News_Title'],
                            'News_Paragraph': s['News_Paragraph'], 'Author':s['Author'],
                            'Image_URL':s['Image_URL']})
        if id == 1: head_news = [s['News_Title'], s['News_Paragraph']]
        id +=1
    prices_data = mongo.db.oil_prices
    latest_prices = []
    for p in prices_data.find():
        latest_prices.append({'ID':id, 'Oil' : p['Oil_Symbol'], 'Price' : p['Oil_Price'],
                            'Price_Change':p['Oil_Change_Value']})
    # Return template and data
    return render_template("home.html", data=latest_news, head_news = head_news, prices = latest_prices)

# Route that will trigger building a correlation_matrix
@app.route('/plots/correlation_matrix', methods=['GET'])
def correlation_matrix():
    bytes_obj = do_plot()
    print('Request for correlation matrix')

    return send_file(bytes_obj,
                     attachment_filename='plot.png',
                     mimetype='image/png')

# Route that will trigger the scrape function
@app.route("/scrape")
def scrape():

    # Run the scrape function
    oil_news = scrape_oil_news.latest_news()
    oil_prices = scrape_oil_news.latest_prices()

    # Update the Mongo database using update and upsert=True
    for news in oil_news:
        mongo.db.oil_news.update({}, news, upsert=True)

    # Update the Mongo database using update and upsert=True
    for prices in oil_prices:
        mongo.db.oil_prices.update({}, prices, upsert=True)

    # Redirect back to home page
    return redirect("/")

# Route that will trigger the facts html page
@app.route("/project_overview")
def about_1():


    # Return template and data
    return render_template("about_1.html")

# Route that will trigger the facts html page
@app.route("/database_structure")
def about_2():


    # Return template and data
    return render_template("about_2.html")

# Route that will trigger the facts html page
@app.route("/dashboard_1")
def dash_1():


    # Return template and data
    return render_template("dashboard_1.html")

# Route that will trigger the facts html page
@app.route("/dashboard_2")
def dash_2():
    # Find records of data from the mongo database mars_facts

    # Return template and data
    return render_template("dashboard_2.html")

# Route that will trigger the facts html page
@app.route("/dashboard_3")
def dash_3():
    # Find records of data from the mongo database mars_facts

    # Return template and data
    return render_template("dashboard_3.html")

# Route that will trigger the hemisphere html page
@app.route("/an_1")
def an_1():

    # Return template and data
    return render_template("analysis_1.html")

@app.route("/an_2")
def an_2():

    # Return template and data
    return render_template("analysis_2.html")

@app.route("/an_3", methods=['GET','POST'])
def an_3():
    print("Server received request for plot...")
    form = InputForm(request.form)
    print(request.form)
    print(form.validate())

    if request.method == 'POST':
        print('Building a plot')
        correlation_matrix()
    # Return template and data
    return render_template("analysis_3.html")

# Route that will trigger the facts html page
@app.route("/findings")
def findings():
    # Find records of data from the mongo database mars_facts

    # Return template and data
    return render_template("findings.html")

# Route that will trigger the contacts html page
@app.route("/contacts")
def contacts():
    # Return template and data
    return render_template("contacts.html")

if __name__ == "__main__":
    # scrape()
    app.run(debug=True)
