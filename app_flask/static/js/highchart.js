//
var QUANDL_API_KEY = "xq44Ss4a-fZGqgecyG1o"
var seriesOptions = [],
    seriesCounter = 0,
    names = ['CME_CL1', 'CME_TY2', "CME_FV1"];
var baseurl = "https://www.quandl.com/api/v3/datasets/";
var endurl = `&api_key=${QUANDL_API_KEY}&order=asc`;
var quandlcode1 = "CHRIS/CME_CL1"; //
var quandlcode2 = "CHRIS/CME_TY2"; //
var quandlcode3 = "CHRIS/CME_FV1"; //
var url1 = baseurl + quandlcode1 + ".json?" + endurl; //
var url2 = baseurl + quandlcode2 + ".json?" + endurl; //
var url3 = baseurl + quandlcode3 + ".json?" + endurl; //

function createChart() {

    Highcharts.stockChart('highchart', {

        rangeSelector: {
            selected: 4
        },

        yAxis: {
            labels: {
                formatter: function() {
                    return (this.value > 0 ? ' + ' : '') + this.value + '%';
                }
            },
            plotLines: [{
                value: 0,
                width: 2,
                color: 'silver'
            }]
        },

        plotOptions: {
            series: {
                compare: 'percent',
                showInNavigator: true
            }
        },

        tooltip: {
            pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
            valueDecimals: 2,
            split: true
        },

        series: seriesOptions
    });
}

function success(dat) {
    var data = dat.dataset.data;
    // split the data set into ohlc and volume
    var ohlc = [],
        dataLength = data.length,
        // set the allowed units for data grouping

        i = 0;

    for (i; i < dataLength; i += 1) {
        ohlc.push([
            Date.parse(data[i][0] + ' UTC'), // the date
            data[i][6] // close
        ]);
    }
    var name = this.url.match(/(CME_CL1|CME_TY2|CME_FV1)/)[0].toUpperCase();
    var i = names.indexOf(name);
    seriesOptions[i] = {
        name: name,
        data: ohlc
    };

    // As we're loading the data asynchronously, we don't know what order it
    // will arrive. So we keep a counter and create the chart when all the data is loaded.
    seriesCounter += 1;
    console.log(seriesCounter);
    if (seriesCounter === names.length) {
        createChart();
    }
}
Highcharts.getJSON(
    url1, success
);
Highcharts.getJSON(
    url2, success
);

Highcharts.getJSON(
    url3, success
);
