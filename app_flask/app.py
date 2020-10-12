#######################################################
# Configuration
#######################################################

from flask import Flask, jsonify, render_template
from flask import redirect, request, url_for
from wtforms import Form, DateField, validators
from flask_pymongo import PyMongo

import scrape_oil_news

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
    print(latest_prices)
    # Return template and data
    return render_template("home.html", data=latest_news, head_news = head_news, prices = latest_prices)

# Route that will trigger the scrape function
@app.route("/scrape")
def scrape():

    # Run the scrape function
    oil_news = scrape_oil_news.latest_news()

    # Update the Mongo database using update and upsert=True
    for news in oil_news:
        mongo.db.collection.update({}, news, upsert=True)

    # Redirect back to home page
    return redirect("/")

# Route that will trigger the facts html page
@app.route("/dashboard_1")
def dash_1():
    # Find records of data from the mongo database mars_facts

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
    hem_data = mongo.db.mars_hem
    hem_1 = []
    id = 1
    for s in hem_data.find():
        if id == 1 or id == 4:
            hem_1.append({'title' : s['title'], 'img' : s['img_url']})
        id +=1
    # Return template and data
    return render_template("analysis_1.html")

@app.route("/an_2")
def an_2():
    hem_data = mongo.db.mars_hem
    hem_2 = []
    id = 1
    for s in hem_data.find():
        if id == 2 or id == 3:
            hem_2.append({'title' : s['title'], 'img' : s['img_url']})
        id +=1
    # Return template and data
    return render_template("analysis_2.html", data=hem_2)

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
    app.run(debug=True)
