function quandl_request () {
  number_of_elements = document.getElementById("number_of_elements").value
  var baseurl = "https://www.quandl.com/api/v3/datasets/EIA/";
  var endurl = `rows=${number_of_elements}&api_key=${QUANDL_API_KEY}`;
  var quandlcode = "PET_RWTC_D"; // if is it's your choice?
  var url = baseurl + quandlcode + ".json?" + endurl; // dont forget the "?"
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onload = function() {
      var data = JSON.parse(this.responseText).dataset.data;
      var labels = [];
      var labels_data = [];
      for (let i = 0; i < number_of_elements; i++) {
        labels.push(data[i][0]);
        labels_data.push(data[i][1]);}
      labels.reverse();
      labels_data.reverse();
      renderChart(labels_data, labels);
      }
      // {}.dataset.data is the data matrix in Quandl
      // for most datasets as far as I know ...
      // then process your own way
  xhr.send();
}

function float2dollar(value){
    return "U$ "+(value).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function renderChart(data, labels) {
  var ctx = document.getElementById('myChart').getContext('2d');
  var myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'WTI price',
        data: data,
        backgroundColor:
        'rgba(153, 102, 255, 0.2)',
        borderColor:
        'rgba(153, 102, 255, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: false,
            callback: function(value, index, values) {
                            return float2dollar(value);
                          }
          }
        }]
      }
    }
  });
}
