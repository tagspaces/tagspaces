window.location.href = "chrome-extension://ldalmgifdlgpiiadeccbcjojljeanhjk/index.html";
/*
var extUrl = "chrome-extension://ldalmgifdlgpiiadeccbcjojljeanhjk/index.html";

// TODO Use the chrome api for determinating of the extension id

function returnStatus(req, status) {
  //console.log(req);
  if(status == 200) {
    console.log("The url is available");
    window.location.href = extUrl;
    // send an event
  }
  else {
    console.log("The url returned status code " + status);
    // send a different event
  }
}

function fetchStatus(address) {
 var client = new XMLHttpRequest();
 client.onreadystatechange = function() {
  // in case of network errors this might not give reliable results
  if(this.readyState == 4)
   returnStatus(this, this.status);
 }
 client.open("HEAD", address);
 client.send();
}

fetchStatus(extUrl); */