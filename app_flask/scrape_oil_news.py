from splinter import Browser
from bs4 import BeautifulSoup as bs
import time


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

def soup_class (soup, class_name):

    # Soup data list
    soup_class = soup.find(class_= class_name)

    return soup_class

def soup_class_list (soup, class_name):

    # Soup data list
    soup_class_list = soup.find_all(class_= class_name)

    return soup_class_list

def text_list (soup_class_list):
    text_list = []
    [text_list.append(record.text.replace("\n", "")) for record in soup_class_list]
    return text_list

def latest_news():
    # Visit mars.nasa.gov
    mars_url = "https://mars.nasa.gov"
    url_news = "https://mars.nasa.gov/news/?page=0&per_page=40&order=publish_date+desc%2Ccreated_at+desc&search=&category=19%2C165%2C184%2C204&blank_scope=Latest"
    soup = soup_url(url_news)
    # Collect the latest News Dates
    date_news = text_list(soup_class_list(soup, "list_date"))
    # Collect the latest News Titles
    title_news = text_list(soup_class_list(soup, "content_title"))
    title_news.pop(0)
    # Collect the latest News Paragraphs
    par_news = text_list(soup_class_list(soup, "article_teaser_body"))
    # Create news images list
    image_news = soup_class_list(soup, "list_image")
    image_name_list = []
    image_url_list = []
    for image in image_news:
        image_name_list.append(image("img")[0].get('alt'))
        image_url_list.append(mars_url + image("img")[0].get('src'))
    # Create final list of dictionaries
    news = []
    for i in range(len(date_news)):
        row = {}
        row['Date'] = date_news[i]
        row["News_Title"] = title_news[i]
        row["News_Paragraph"] = par_news[i]
        row["Image_Name"] = image_name_list[i]
        row["Image_URL"] = image_url_list[i]
        news.append(row)

    return news
