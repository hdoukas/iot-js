
  var SO_ID = "1422529731114c42b75793ac24c93925c3e65a599775d";
  var API = "MDgwOTMxMDQtMTM3NS00ZWQ1LTk5Y2UtZjJhYjFlZjE0YjcwNmQyZjA2MGYtMzhiZS00MjAzLWEzYzItZjRiNzdhYjg0MGIx";
  var stream_name = "temperature_sensor";

  var time_out = 10000;

  var gpio = tessel.port['GPIO'];
  var http = require('http');


  //analog pin to read temperature
  var temp = gpio.analog[0];

  readTemperatureSensor();

  function readTemperatureSensor() {
    

    //convert it to Celcius:
    var reading = temp.read();
    var voltage = reading * 3.3;
    voltage /= 1024.0; 
    var temperatureC = (voltage - 0.5) * 100 ;
    
    
    //post it to servioticy
    var message = '{"channels": {"temperature": {"current-value": "'+temperatureC+'"}},"lastUpdate": '+new Date().getTime()+'}';

    
    var options = {
      host: 'api.servioticy.com',
      port: '80',
      path: '/'+SO_ID+'/streams/'+stream_name,
      method: 'PUT',
      headers: {
          'Content-Type': 'application/json',
          'authorization' : ''+API,
          'Content-Length': message.length
      }
    };

    
    // Set up the request
  var post_req = http.request(options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          console.log('Response: ' + chunk);
      });
  });

    // post the data
    post_req.write(message);
    post_req.write('\n');
    post_req.end();


    //read again after the time out
    setTimeout(readTemperatureSensor, time_out);
  }



  
