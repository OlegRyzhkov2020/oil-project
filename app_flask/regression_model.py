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

from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error


# Load clean data for analysis
oil_data = pd.read_csv('data/model_data.csv')

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
            ).set(title='LINEAR REGRESSION')
        )

    return regplots

def reg_plot(model_target='WTI price', predictor_1 = "RIG_count", predictor_2 = "None", predictor_3 = "None",
            startdate = datetime.strptime('01011990', "%d%m%Y").date(),
            enddate = datetime.strptime('01012019', "%d%m%Y").date()):
    oil_dates = pd.date_range('1990-01-01','2020-06-01',
              freq='MS').strftime("%Y-%b").tolist()

    oil_data = pd.read_csv('data/model_data.csv')
    oil_data['Unnamed: 0'] = oil_dates
    oil_data.rename(columns={'Unnamed: 0':'Date'}, inplace=True)
    oil_data = oil_data.set_index('Date')
    oil_data.index = pd.to_datetime(oil_data.index).date
    conditions = [
                (oil_data.index<=enddate),
                (oil_data.index>enddate)
    ]
    values = ['train', 'test']
    oil_data['SPLIT'] = np.select(conditions, values)

    model_set = {
                "WTI price": "WTI", "Brent price": "BRENT", "Arab Light": "ARAB_LIGHT",
                "Oil_production": "USA_OIL", "RIG_count": "RIGS", "Fuel_consump": "FUEL_CONS"
                }

    corr_data = oil_data[[model_set[model_target], model_set[predictor_1]]]
    if predictor_2 != 'None':
        corr_data = oil_data[[model_set[model_target], model_set[predictor_1], model_set[predictor_2]]]
    if predictor_3 != 'None':
        corr_data = oil_data[[model_set[model_target], model_set[predictor_1], model_set[predictor_2], model_set[predictor_3]]]

    X1 = oil_data[model_set[predictor_1]]
    X2 = oil_data['FUEL_CONS']
    X3 = oil_data['USA_OIL']
    y1 = oil_data[model_set[model_target]]
    f, axes = plt.subplots(2,2, figsize=(25, 10))
    sns.set_style("whitegrid")

    hue_regplot(data=oil_data, x=X1, y=y1, hue='SPLIT', ax=axes[0][0])
    # sns.regplot(x=X1, y=y1, data=oil_data, scatter_kws={"color": "darkcyan"}, line_kws={"color": "red"}, ax=axes[0][0]).set(title='LINEAR REGRESSION')
    sns.residplot(x=X1, y=y1, data=oil_data, scatter_kws={"color": "darkcyan"}, line_kws={"color": "red"}, ax=axes[0][1]).set(title='RESIDUALS')
    sns.lineplot(data=y1, ax=axes[1][0]).set(title='Time Series,'+ model_set[model_target])
    sns.heatmap(corr_data.corr(), annot=True, cmap="summer", ax=axes[1][1]).set(title='CORRELATION MATRIX')

    # save your figure into a bytes object to expose it via flask
    bytes_image = io.BytesIO()
    FigureCanvas(f).print_png(bytes_image)

    # Encode PNG image to base64 string
    pngImageB64String = "data:image/png;base64,"
    pngImageB64String += base64.b64encode(bytes_image.getvalue()).decode('utf8')


    # plt.savefig(bytes_image, format='png')
    # bytes_image.seek(0)
    return pngImageB64String

def reg_output(model_target='WTI price', predictor_1 = "RIG_count", predictor_2 = "None", predictor_3 = "None"):
    oil_dates = pd.date_range('1990-01-01','2020-06-01',
              freq='MS').strftime("%Y-%b").tolist()

    oil_data = pd.read_csv('data/model_data.csv')
    oil_data['Unnamed: 0'] = oil_dates
    oil_data.rename(columns={'Unnamed: 0':'Date'}, inplace=True)
    oil_data = oil_data.set_index('Date')
    oil_data.index = pd.to_datetime(oil_data.index).date

    model_set = {
                "WTI price": "WTI", "Brent price": "BRENT", "Arab Light": "ARAB_LIGHT",
                "Oil_production": "USA_OIL", "RIG_count": "RIGS", "Fuel_consump": "FUEL_CONS"
                }
    pred_list = [model_set[predictor_1]]
    if predictor_2 != 'None':
        pred_list.append(model_set[predictor_2])
    if predictor_3 != 'None':
        pred_list.append(model_set[predictor_3])

    X = oil_data[pred_list]
    y = oil_data[model_set[model_target]]
    b0 = sm.add_constant(X) ## adding intercept to model
    model = sm.OLS(y, b0).fit()
    params = model.params.to_dict()
    par_se = model.bse.to_list()
    tvalues = model.tvalues.to_list()
    pvalues = model.pvalues.to_list()
    i=0
    for key,val in params.items():
        params[key] = [params[key],par_se[i], tvalues[i], pvalues[i]]
        i=i+1
    return params

def reg_prediction(model_target='WTI price', predictor_1 = "RIG_count", predictor_2 = "None", predictor_3 = "None",
            startdate = datetime.strptime('01011990', "%d%m%Y").date(),
            enddate = datetime.strptime('01012019', "%d%m%Y").date()):
    model_set = {
                "WTI price": "WTI", "Brent price": "BRENT", "Arab Light": "ARAB_LIGHT",
                "Oil_production": "USA_OIL", "RIG_count": "RIGS", "Fuel_consump": "FUEL_CONS"
                }
    oil_dates = pd.date_range('1990-01-01','2020-06-01',
              freq='MS').strftime("%Y-%b").tolist()

    oil_data = pd.read_csv('data/model_data.csv')
    oil_data['Unnamed: 0'] = oil_dates
    oil_data.rename(columns={'Unnamed: 0':'Date'}, inplace=True)
    oil_data = oil_data.set_index('Date')
    oil_data.index = pd.to_datetime(oil_data.index).date

    conditions = [
    (oil_data.index<=enddate),
    (oil_data.index>enddate)
    ]
    values = ['train', 'test']
    oil_data['SPLIT'] = np.select(conditions, values)
    oil_train = oil_data[oil_data['SPLIT'] == 'train']
    oil_test = oil_data[oil_data['SPLIT'] == 'test']
    y_train = oil_train[model_set[model_target]].values.reshape(-1, 1)
    y_test = oil_test[model_set[model_target]].values.reshape(-1, 1)

    X_train = oil_train[[model_set[predictor_1]]]
    X_test = oil_test[[model_set[predictor_1]]]

    if predictor_2 != 'None':
        X_train = oil_train[[model_set[predictor_1], model_set[predictor_2]]]
        X_test = oil_test[[model_set[predictor_1], model_set[predictor_2]]]
    if predictor_3 != 'None':
        X_train = oil_train[[model_set[predictor_1], model_set[predictor_2], model_set[predictor_3]]]
        X_test = oil_test[[model_set[predictor_1], model_set[predictor_2], model_set[predictor_3]]]

    # Create a StandardScaler model and fit it to the training data


    X_scaler = StandardScaler().fit(X_train)
    y_scaler = StandardScaler().fit(y_train)

    # Transform the training and testing data using the X_scaler and y_scaler models
    X_train_scaled = X_scaler.transform(X_train)
    X_test_scaled = X_scaler.transform(X_test)
    y_train_scaled = y_scaler.transform(y_train)
    y_test_scaled = y_scaler.transform(y_test)

    # Fit the model to the training data and calculate the scores for the training and testing data

    model = LinearRegression()

    model.fit(X_train_scaled, y_train_scaled)
    predictions = model.predict(X_test_scaled)


    training_score = model.score(X_train_scaled, y_train_scaled)
    testing_score = model.score(X_test_scaled, y_test_scaled)
    MSE = mean_squared_error(y_test_scaled, predictions)

    output_dict = {
        "Training score":training_score, "Test score": testing_score, "Mean Square Error": MSE
    }

    return output_dict
