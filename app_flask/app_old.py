#######################################################
# Configuration
#######################################################

from flask import Flask, jsonify, render_template
from flask import redirect, request, url_for, send_file, make_response
from datetime import datetime
from wtforms import Form, DateField, SelectField, validators
from flask_pymongo import PyMongo

import regression_model, ml_model

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

class InputFormML(Form):
    Target_class = SelectField('dependent (Y)',
                    choices=["Baker Hughes", "Chevron", "Conoco Philis",
                    "Exxon Mobile", "EOG resources", "Valero energy" ])
    Training_start = DateField(label=' ',
        format='%m/%d/%Y', default= datetime(1990, 1, 1),
        validators=[validators.InputRequired()])
    Training_end = DateField(label=' ',
        format='%m/%d/%Y', default= datetime(2019, 1, 1),
        validators=[validators.InputRequired()])
    Test_end = DateField(label=' ',
        format='%m/%d/%Y', default= datetime(2020, 11, 1),
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
    latest_news = latest_news[21:]
    prices_data = mongo.db.oil_prices_new
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

@app.route("/data_journey")
def about_3():

    # Return template and data
    return render_template("about_3.html")

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
    formML = InputFormML(request.form)

    if request.method == 'POST' and formML.validate():
        ml_target = formML.Target_class.data
        ml_start = formML.Training_start.data
        ml_end = formML.Training_end.data
        ml_test = formML.Test_end.data

        target_set = {
                    "Baker Hughes": mongo.db.baker_intro_new, "Chevron": mongo.db.chevron_intro_new,
                    "Conoco Philis": mongo.db.conoco_intro, "Exxon Mobile": mongo.db.exxon_intro,
                    "EOG resources": mongo.db.eog_intro, "Valero energy": mongo.db.valero_intro
                    }

        target_collection = target_set[ml_target]

        target_intro = []
        id = 1
        for s in target_collection.find():
            target_intro.append({'ID':id, 'News_Title' : s['News_Title'],
                                'News_Paragraph': s['News_Paragraph'],
                                'Image_URL':s['Image_URL']})
        # print(target_intro)

    if "submit-randomforest" in request.form:

        print("submit-randomforest")
        if request.method == 'POST' and formML.validate():
            print('POST TRUE: processing for classification plot request with form data')
            print('Target:', ml_target)
            print('Period:', ml_start, ml_end, ml_test)
            print('Requesting the function random forest plot')
            prediction, image = ml_model.randomForest_plot(ml_target, ml_start, ml_end, ml_test)
            print(prediction)
            return render_template("analysis_4.html", form=formML, image=image, result= prediction, data=target_intro)
        else:
            print('POST FALSE: processing for classification plot request with default data')
            image = ml_model.cluster_plot()
            model_output = {}
            prediction = {}
            return render_template("analysis_4.html", form=formML, image=image, output = model_output, result= prediction, data=target_intro)


    elif "submit-classification" in request.form:


        print("submit-classification")
        if request.method == 'POST' and formML.validate():
            print('POST TRUE: processing for classification plot request with form data')
            image = ml_model.cluster_plot(ml_target, ml_start, ml_end)
            model_output = {}
            prediction = {}
        else:
            print('POST FALSE: processing for classification plot request with default data')
            image = ml_model.cluster_plot()
            model_output = {}
            prediction = {}
        return render_template("analysis_4.html", form=formML, image=image, output = model_output, result= prediction, data=target_intro)

    print("Server received request for regression model")
    form = InputForm(request.form)

    model_start = form.Train_start.data
    model_end = form.Train_end.data
    model_target = form.Target.data
    model_predictor_1 = form.Predictor_1.data
    model_predictor_2 = form.Predictor_2.data
    model_predictor_3 = form.Predictor_3.data

    print('Reg Target selection:', model_target)
    print('Reg Period:', model_start, model_end)
    print('Reg Request method:', request.method)

    if request.method == 'POST' and form.validate():
        print('POST TRUE: processing for regreesion plot request with form data')
        image = regression_model.reg_plot(model_target, model_predictor_1, model_predictor_2, model_predictor_3, model_start, model_end)
        model_output = regression_model.reg_output(model_target, model_predictor_1, model_predictor_2, model_predictor_3)
        prediction = regression_model.reg_prediction(model_target, model_predictor_1, model_predictor_2, model_predictor_3, model_start, model_end)
    else:
        print('POST FALSE: processing for regreesion plot request with daefault data')
        image = regression_model.reg_plot()
        model_output = {}
        prediction = {}

    # image_time = datetime.now()
    # Return template and data
    return render_template("analysis_3.html", form=form, image=image, output = model_output, result= prediction)

@app.route("/an_4", methods=['GET','POST'])
def an_4():

    print("Server received request for classification model")
    # Find records of data from the mongo database
    baker_data = mongo.db.baker_news
    baker_news = []
    id = 1
    for s in baker_data.find():
        baker_news.append({'ID':id, 'News_Title' : s['News_Title'],
                            'News_Paragraph': s['News_Paragraph'],
                            'Image_URL':s['Image_URL']})

    baker_news = baker_news[5:]
    print(baker_news)
    formML = InputFormML(request.form)

    ml_target = formML.Target_class.data
    ml_start = formML.Training_start.data
    ml_end = formML.Training_end.data
    ml_test = formML.Test_end.data

    if "submit-randomforest" in request.form:

        print("submit-randomforest")
        if request.method == 'POST' and formML.validate():
            print('POST TRUE: processing for classification plot request with form data')
            print('Target:', ml_target)
            print('Period:', ml_start, ml_end, ml_test)
            print('Requesting the function random forest plot')
            prediction, image = ml_model.randomForest_plot(ml_target, ml_start, ml_end, ml_test)
            print(prediction)
            return render_template("analysis_4.html", form=formML, image=image, result= prediction, data=target_intro)
        else:
            print('POST FALSE: processing for classification plot request with default data')
            image = ml_model.cluster_plot()
            model_output = {}
            prediction = {}
            return render_template("analysis_4.html", form=formML, image=image, output = model_output, result= prediction, data=target_intro)


    elif "submit-classification" in request.form:


        print("submit-classification")
        if request.method == 'POST' and formML.validate():
            print('POST TRUE: processing for classification plot request with form data')
            image = ml_model.cluster_plot(ml_target, ml_start, ml_end)
            model_output = {}
            prediction = {}
        else:
            print('POST FALSE: processing for classification plot request with default data')
            image = ml_model.cluster_plot()
            model_output = {}
            prediction = {}
        return render_template("analysis_4.html", form=formML, image=image, output = model_output, result= prediction, data=target_intro)

    if request.method == 'POST' and formML.validate():
        print('POST TRUE: processing for classification plot request with form data')
        image = ml_model.cluster_plot(ml_target, ml_start, ml_end)
        # prediction = regression_model.reg_prediction(model_target, model_predictor_1, model_predictor_2, model_predictor_3, model_start, model_end)
    else:
        print('POST FALSE: processing for classification plot request with default data')
        image = ml_model.cluster_plot()
        model_output = {}
        prediction = {}
    # Return template and data
    return render_template("analysis_4.html", form=formML, image=image, output = model_output, result= prediction, data=baker_news)

# Route that will trigger the hemisphere html page
@app.route("/an_5")
def an_5():

    # Return template and data
    return render_template("analysis_5.html")

# Route that will trigger the hemisphere html page
@app.route("/an_6")
def an_6():

    # Return template and data
    return render_template("analysis_6.html")

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
