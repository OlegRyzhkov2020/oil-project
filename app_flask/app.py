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
                    choices=['WTI price', 'Brent price', 'Arab Light' ])
    Train_start = DateField(label=' ',
        format='%m/%d/%Y', default= datetime(1990, 1, 1),
        validators=[validators.InputRequired()])
    Train_end = DateField(label=' ',
        format='%m/%d/%Y', default= datetime(2019, 1, 1),
        validators=[validators.InputRequired()])
    Predictor_1 = SelectField('independent (X1)',
                    choices=['RIG_count', 'Oil_production', 'RIG_count', 'Fuel_consump' ])
    Predictor_2 = SelectField('independent (X2)',
                    choices=['None', 'RIG_count', 'Oil_production', 'Fuel_consump'])
    Predictor_3 = SelectField('independent (X3)',
                    choices=['None', 'Fuel_consump', 'Oil_production', 'RIG_count' ])

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
# @app.route('/plots/regression_analysis', methods=['GET'])
# def regression_analysis(model_target='WTI price', predictor_1 = "Oil_production"):
#     print(model_target, predictor_1)
#
#     reg_obj = regression_model.reg_plot(model_target, predictor_1)
#     print('Request for correlation matrix')
#     return reg_obj

    # return send_file(reg_obj,
    #                  attachment_filename='plot_matrix.png',
    #                  mimetype='image/png')

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

    model_start = form.Train_start.data
    model_end = form.Train_end.data
    model_target = form.Target.data
    model_predictor_1 = form.Predictor_1.data
    model_predictor_2 = form.Predictor_2.data
    model_predictor_3 = form.Predictor_3.data
    print('Building a plot')
    print('Period:', model_start, model_end)
    print('Target selection:', model_target)
    print('Predictor 1:', model_predictor_1)

    if request.method == 'POST' and form.validate():
        print('Predictor 1:', model_predictor_1)
        image = regression_model.reg_plot(model_target, model_predictor_1, model_predictor_2, model_predictor_3, model_start, model_end)
        model_output = regression_model.reg_output(model_target, model_predictor_1, model_predictor_2, model_predictor_3)
        prediction = regression_model.reg_prediction(model_target, model_predictor_1, model_predictor_2, model_predictor_3, model_start, model_end)
    else:
        image = regression_model.reg_plot()
        model_output = {}
        prediction = {}
    # image_time = datetime.now()
    # Return template and data
    return render_template("analysis_3.html", form=form, image=image, output = model_output, result= prediction)

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
