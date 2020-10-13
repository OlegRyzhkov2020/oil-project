from splinter import Browser
from bs4 import BeautifulSoup as bs
import time
import re
import pandas as pd
import requests


def init_browser():
    # @NOTE: Replace the path with your actual path to the chromedriver
    executable_path = {"executable_path": "/usr/local/bin/chromedriver"}
    return Browser("chrome", **executable_path, headless=False)

def soup_url (url):
    browser = init_browser()
    # Visit url
    browser.visit(url)
    time.sleep(1)

    # Scrape page into Soup
    html = browser.html
    soup_url = bs(html, "html.parser")

     # Close the browser after scraping
    browser.quit()

    return soup_url

def text_list (soup_class_list):
    text_list = []
    [text_list.append(record.text.replace("\n", "")) for record in soup_class_list]
    return text_list

def latest_news():
    # Visit oilprice.com
    base_url = "https://oilprice.com"
    url_news = "https://oilprice.com/Latest-Energy-News/World-News/"
    soup = soup_url(url_news)
    # Scrapping News Data
    articles = soup.find_all(class_= "categoryArticle")
    title_list = []
    date_list = []
    excerpt_list = []
    author_list = []
    link_list = []
    for article in articles:
        image_holder = article.find(class_= "categoryArticle__imageHolder")
        img =image_holder.findAll('img')
        link = img[0].get('data-src')
        link_list.append(link)
        title = article.find_all(class_= "categoryArticle__title")
        full_date = article.find_all(class_= "categoryArticle__meta")
        date = full_date[0].text.strip().split("|")[0]
        author = full_date[0].text.strip().split("|")[1]
        excerpt = article.find_all(class_= "categoryArticle__excerpt")
        title_list.append(title[0].text.strip())
        date_list.append(date)
        author_list.append(author)
        excerpt_list.append(excerpt[0].text.strip())

    news = []
    for i in range(len(title_list)):
        row = {}
        row['Date'] = date_list[i]
        row["News_Title"] = title_list[i]
        row["News_Paragraph"] = excerpt_list[i]
        row["Author"] = author_list[i]
        row["Image_URL"] = link_list[i]
        news.append(row)

    return news

def latest_prices():
    # Visit oilprice.com
    url_prices = "https://oilprice.com/oil-price-charts/#prices"
    soup_prices = soup_url(url_prices)

    r = requests.get(url_prices)
    price_list = pd.read_html(r.text) # this parses all the tables in webpages to a list
    price_df = price_list[0]

    prices = []
    for price_row in price_df.iterrows():
        row = {}
        row['Oil_Symbol'] = price_row[1][1]
        row['Oil_Price'] = price_row[1][2]
        row['Oil_Change_Value'] = price_row[1][3]
        row['Oil_Change_Interest'] = price_row[1][4].split("(")[0]
        row['Oil_Price_Delay'] = price_row[1][5]
        prices.append(row)

    return prices
