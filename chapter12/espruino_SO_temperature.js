//Read temperature from TMP36 sensor
//and send it to servIoTicy
//assumes connectivity through CC3000 WiFi module


var wlan;
var SO_ID;
var stream_name;

function onInit() {
  //Setup WiFi
  setTimeout(function() {
    wlan = require("CC3000").connect();
    console.log("DHCP....");
    wlan.connect( "YOUR_WIFI_NAME", "YOUR_WIFI_KEY", function (s) { 
      if (s=="dhcp") {
        console.log("DHCP Complete.");
        setInterval(checkTemp, 10000);
      }
    });
   }, 500);
}

function getTemp() {
  digitalWrite(C0,0); // set voltage for the sensor Vcc
  var val = analogRead(C1); // read voltage
  var voltage = val * 3.3;
  voltage /= 1024.0; 
  var temperatureC = (voltage - 0.5) * 100 ; 
  return temperatureC; // and return the temperature
}


function checkTemp() {
 var temp = getTemp();
 storeServioticy(temp);
}

onInit();


function storeServioticy(temperatureC) {
    content = '{"channels": {"temperature": {"current-value": "'+temperatureC+'"}},"lastUpdate": '+new Date().getTime()+'}';
    var options = {
      host: 'api.servioticy.com',
      port: '80',
      path:'/'+SO_ID+'/streams/'+stream_name,
      method:'PUT',
      headers: { "authorization":"YOUR_API_KEY", "Content-Length":content.length, "content-type":"application/json" }
    };
    var req = require("http").request(options, function(res)  {
      res.on('data', function(data) {
        console.log("-->"+data);
      });
      res.on('close', function(data) {
        console.log("==> Closed.");
      });
     });
    req.end(content);
}