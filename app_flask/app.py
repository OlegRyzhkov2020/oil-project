#######################################################
# Configuration
#######################################################

from flask import Flask, jsonify, render_template
from flask import redirect, request, url_for, send_file, make_response
from datetime import datetime
from wtforms import Form, DateField, SelectField, validators
from flask_pymongo import PyMongo

import regression_model

#######################################################
# Flask Setup
#######################################################
# Init app
app = Flask(__name__)
# app.config["CACHE_TYPE"] = "null"
#######################################################
# Database Setup
#######################################################
# Use PyMongo to establish Mongo connection
mongo = PyMongo(app, uri="mongodb://localhost:27017/oil_db")

#######################################################
# Input Data Class Object
#######################################################
class InputForm(Form):
    Target = SelectField('dependent (Y)',
                    choices=['WTI price', 'Brent price' ])
    Start = DateField(label=' ',
        format='%m/%d/%Y', default= datetime(1990, 1, 1),
        validators=[validators.InputRequired()])
    End = DateField(label=' ',
        format='%m/%d/%Y', default= datetime(2020, 8, 1),
        validators=[validators.InputRequired()])
    Predictor_1 = SelectField('independent (X1)',
                    choices=['Oil_production', 'RIG_count' ])
    Predictor_2 = SelectField('independent (X2)',
                    choices=['RIG_count', 'Oil_production'])
    Predictor_3 = SelectField('independent (X3)',
                    choices=['Fuel Consumpt', 'Oil_production', 'RIG_count' ])

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
@app.route('/plots/regression_analysis', methods=['GET'])
def regression_analysis(model_target='WTI price'):
    print(model_target)

    reg_obj = regression_model.reg_plot()
    print('Request for correlation matrix')

    return send_file(reg_obj,
                     attachment_filename='plot_matrix.png',
                     mimetype='image/png')

# Route that will trigger the scrape function
# @app.route('/plots/regression', methods=['GET'])
# def regression_plot():
#
#     corr = regression_model.cancer_data()
#     bytes_obj = regression_model.corr_plot(corr)
#     print('Request for regression plot')
#
#     return send_file(bytes_obj,
#                      attachment_filename='reg_plot.png',
#                      mimetype='image/png')

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

    if request.method == 'POST' and form.validate():
        model_start = form.Start.data
        model_end = form.End.data
        model_target = form.Target.data
        print('Building a plot')
        print('Period:', model_start, model_end)
        print('Target selection:', model_target)
        regression_analysis(model_target)
    image_time = datetime.now()
    # Return template and data
    return render_template("analysis_3.html", form=form, time = image_time)

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
