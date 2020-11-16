import io
import pandas as pd
from datetime import datetime
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from scipy import stats
import statsmodels.api as sm
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
from matplotlib.figure import Figure
import base64
import quandl
from yahoo_fin.stock_info import get_data
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error

from sklearn.cluster import KMeans
from sklearn.preprocessing import MinMaxScaler

def hue_regplot(data, x, y, hue, palette=None, **kwargs):
    from matplotlib.cm import get_cmap

    regplots = []

    levels = data[hue].unique()

    if palette is None:
        default_colors = get_cmap('Dark2')
        palette = {k: default_colors(i) for i, k in enumerate(levels)}

    for key in levels:
        regplots.append(
            sns.regplot(
                x=x,
                y=y,
                data=data[data[hue] == key],
                color=palette[key],
                **kwargs
            ).set(title='CLUSTER ANALYSIS')
        )

    return regplots


def stocks_data(startdate = datetime.strptime('01011990', "%d%m%Y").date(),
                enddate = datetime.strptime('11112020', "%d%m%Y").date()):

    startdate  = startdate.strftime('%Y-%m-%d')
    enddate = enddate.strftime('%Y-%m-%d')
    ### WTI Oil Price
    WTI_daily = quandl.get("FRED/DCOILWTICO",start_date = startdate, end_date = enddate, authtoken="TYxF4cUU1kEsRwg8QEdu", collapse="daily", order="asc")
    ### Exxon Daily Stock Price
    exxon_daily= get_data("XOM", start_date = startdate, end_date = enddate, index_as_date = True, interval="1d")
    ### Chevron Daily Stock Price
    chevron_daily= get_data("CVX", start_date = startdate, end_date = enddate, index_as_date = True, interval="1d")
    ### Conoco Philips Daily Stock Price
    conoco_daily= get_data("COP", start_date = startdate, end_date = enddate, index_as_date = True, interval="1d")
    ### EOG Resources Daily Stock Price
    eog_daily= get_data("EOG", start_date = startdate, end_date = enddate, index_as_date = True, interval="1d")
    ### Valero Energy Daily Stock Price
    valero_daily= get_data("VLO", start_date = startdate, end_date = enddate, index_as_date = True, interval="1d")
    ### Baker Hughes Daily Stock Price
    baker_daily= get_data("BKR", start_date = startdate, end_date = enddate, index_as_date = True, interval="1d")
    daily_data=WTI_daily
    daily_data=daily_data.rename(columns={"Value": "WTI"})
    daily_data=daily_data.merge(exxon_daily[["close"]],how='outer', left_index=True, right_index=True)
    daily_data=daily_data.rename(columns={"close": "exxon_close"})
    daily_data=daily_data.merge(chevron_daily[["close"]],how='outer', left_index=True, right_index=True)
    daily_data=daily_data.rename(columns={"close": "chevron_close"})
    daily_data=daily_data.merge(conoco_daily[["close"]],how='outer', left_index=True, right_index=True)
    daily_data=daily_data.rename(columns={"close": "conoco_close"})
    daily_data=daily_data.merge(eog_daily[["close"]],how='outer', left_index=True, right_index=True)
    daily_data=daily_data.rename(columns={"close": "eog_close"})
    daily_data=daily_data.merge(valero_daily[["close"]],how='outer', left_index=True, right_index=True)
    daily_data=daily_data.rename(columns={"close": "valero_close"})
    daily_data=daily_data.merge(baker_daily[["close"]],how='outer', left_index=True, right_index=True)
    daily_data=daily_data.rename(columns={"close": "baker_close"})
    daily_data.dropna(inplace=True)

    return daily_data

def cluster_plot(model_target='Baker Hughes', startdate = datetime.strptime('01011990', "%d%m%Y").date(),
                enddate = datetime.strptime('11112020', "%d%m%Y").date()):
    model_set = {
                "Baker Hughes": "baker_close", "Chevron": "chevron_close", "Conoco Philis": "conoco_close",
                "Exxon Mobile": "exxon_close", "EOG resources": "eog_close", "Valero energy": "valero_close"
                }
    target_scaled = model_target+'_scaled'
    data = stocks_data(startdate, enddate)
    y1 = data[['WTI',model_set[model_target]]]
    f, axes = plt.subplots(1,1, figsize=(11, 8))
    # sns.set_style("whitegrid")
    # sns.lineplot(data=y1).set(title='Time Series, Daily Prices', ylabel='Price')
    scaler=MinMaxScaler()
    data[target_scaled]=scaler.fit_transform(data[model_set[model_target]].to_frame())
    data["WTI_scaled"]=scaler.fit_transform(data["WTI"].to_frame())
    data["cluster"] = KMeans(n_clusters=5, random_state=1).fit_predict(data[[target_scaled,"WTI_scaled"]])
    # The 954 most common RGB monitor colors https://xkcd.com/color/rgb/
    colors = ["baby blue", "amber", "scarlet", "grey","milk chocolate", "windows blue"]
    palette=sns.xkcd_palette(colors)
    # image = sns.lmplot(x="WTI", y=target_scaled,ci=None,palette=palette, hue="cluster",fit_reg=0 ,data=data).set(title='CLUSTER ANALYSIS on '+model_target)
    hue_regplot(data=data, x="WTI", y=target_scaled, hue="cluster",  fit_reg=0)
    # save your figure into a bytes object to expose it via flask
    bytes_image = io.BytesIO()
    FigureCanvas(f).print_png(bytes_image)

    # Encode PNG image to base64 string
    pngImageB64String = "data:image/png;base64,"
    pngImageB64String += base64.b64encode(bytes_image.getvalue()).decode('utf8')

    return pngImageB64String
