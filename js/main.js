//Quandl API
console.log("helo");
var baseurl = "https://www.quandl.com/api/v3/datasets/EIA/";
var endurl = "rows=100&api_key=xq44Ss4a-fZGqgecyG1o";
var quandlcode = "PET_RWTC_D"; // if is it's your choice?
var url = baseurl + quandlcode + ".json?" + endurl; // dont forget the "?"
var xhr = new XMLHttpRequest();
xhr.open("GET", url, true);
xhr.setRequestHeader("Content-Type", "application/json");
xhr.onload = function() {
    var data = JSON.parse(this.responseText).dataset.data;
    console.log(data);
    container = document.getElementById("container");
    for (let i = 0; i < 10; i++) {
      var new_element = document.createElement("li");
      new_element.appendChild(document.createTextNode(data[i]));
      container.appendChild(new_element);
    }
    // {}.dataset.data is the data matrix in Quandl
    // for most datasets as far as I know ...
    // then process your own way
}
setTimeout(() => {  xhr.send(); }, 1000);
console.log("helo");
