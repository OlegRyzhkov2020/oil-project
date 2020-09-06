function perform_request () {
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
      console.log(data);
      container = document.getElementById("container");
      for (let i = 0; i < number_of_elements; i++) {
        var new_element = document.createElement("li");
        new_element.appendChild(document.createTextNode(data[i]));
        container.appendChild(new_element);
      }
      // {}.dataset.data is the data matrix in Quandl
      // for most datasets as far as I know ...
      // then process your own way
  }
  xhr.send();
}
function quandl_request (number_of_elements) {
  var baseurl = "https://www.quandl.com/api/v3/datasets/EIA/";
  var endurl = `rows=${number_of_elements}&api_key=${QUANDL_API_KEY}`;
  var quandlcode = "PET_RWTC_D"; // if is it's your choice?
  var url = baseurl + quandlcode + ".json?" + endurl; // dont forget the "?"
  var xhr = new XMLHttpRequest();
  var data = 0;
  xhr.timeout = 2000;
  xhr.onreadystatechange = function(e) {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
       //the server answer was successful
       //resolve(xhr.response);
      } else {
       // The server answer was not successful
       //reject(xhr.status);
      }
    }
  }
  xhr.ontimeout = function () {
    // Well, it took to long do some code here to handle that
    //reject('timeout');
  }
  xhr.open("GET", url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onload = function() {
      data = JSON.parse(this.responseText).dataset.data;
      //console.log(data);
      }
      // {}.dataset.data is the data matrix in Quandl
      // for most datasets as far as I know ...
      // then process your own way
  xhr.send();
  console.log(xhr.responseText);
  return data;
}

function float2dollar(value){
    return "U$ "+(value).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function renderChart(data, labels) {
  var ctx = document.getElementById('myChart').getContext('2d');
  var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'WTI price',
        data: data,
        backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)'
        ],
        borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
        ],
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

$("#renderBtn").click(
    function () {
        //var chart_values = quandl_request(6);
        //var data_labels = [],
            //chart_data = [];
        //for (let i = 0; i < 6; i++) {
          //console.log(chart_values[i]);
          //data_labels.push(chart_values[i][0]);
          //chart_data.push(chart_values[i][1]);
        //}
        //console.log(chart_values);
        labels = ['2020-08-24', '2020-08-25', '2020-08-26', '2020-08-27', '2020-08-28', '2020-08-31'];
        data = [42.44, 43.17, 43.21, 42.88, 42.96, 42.61];
        renderChart(data, labels);
    }
);
