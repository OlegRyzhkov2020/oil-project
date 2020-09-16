// Single Highcharts Example

// Highcharts.getJSON('https://www.quandl.com/api/v3/datasets/CHRIS/CME_TY2.json?api_key=jGucPTayi9Dn2y7Z_-Vj&order=asc', function(dat) {

//     var data = dat.dataset.data;
//     // split the data set into ohlc and volume
//     var ohlc = [],
//         dataLength = data.length,
//         // set the allowed units for data grouping

//         i = 0;

//     for (i; i < dataLength; i += 1) {
//         ohlc.push([
//             Date.parse(data[i][0] + ' UTC'), // the date
//             data[i][6] // close
//         ]);
//     }

//     // Create the chart
//     Highcharts.stockChart('container', {


//         rangeSelector: {
//             selected: 1
//         },

//         title: {
//             text: 'AAPL Stock Price'
//         },

//         series: [{
//             name: 'AAPL',
//             data: ohlc,
//             tooltip: {
//                 valueDecimals: 2
//             }
//         }]
//     });
// });

var seriesOptions = [],
    seriesCounter = 0,
    names = ['CME_TY1', 'CME_TY2', "CME_FV1"];
console.log('Begin creating chart');

function createChart() {

    Highcharts.stockChart('container', {

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
    var name = this.url.match(/(CME_TY1|CME_TY2|CME_FV1)/)[0].toUpperCase();
    var i = names.indexOf(name);
    seriesOptions[i] = {
        name: name,
        data: ohlc
    };

    // As we're loading the data asynchronously, we don't know what order it
    // will arrive. So we keep a counter and create the chart when all the data is loaded.
    seriesCounter += 1;

    if (seriesCounter === names.length) {
        createChart();
    }
}

Highcharts.getJSON(
    'https://www.quandl.com/api/v3/datasets/CHRIS/CME_TY1.json?api_key=jGucPTayi9Dn2y7Z_-Vj&order=asc',
    success
);
Highcharts.getJSON(
    'https://www.quandl.com/api/v3/datasets/CHRIS/CME_TY2.json?api_key=jGucPTayi9Dn2y7Z_-Vj&order=asc',
    success
);

Highcharts.getJSON(
    'https://www.quandl.com/api/v3/datasets/CHRIS/CME_FV1.json?api_key=jGucPTayi9Dn2y7Z_-Vj&order=asc',
    success
);
