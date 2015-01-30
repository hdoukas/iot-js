
    var SO_ID = "1422529731114c42b75793ac24c93925c3e65a599775d";
    var API = "MDgwOTMxMDQtMTM3NS00ZWQ1LTk5Y2UtZjJhYjFlZjE0YjcwNmQyZjA2MGYtMzhiZS00MjAzLWEzYzItZjRiNzdhYjg0MGIx";
    var stream_name = "temperature_sensor";

    //mqtt for actuation
    var mqtt = require('mqtt')
      , host = 'api.servioticy.com'
      , port = 1883
      , client = mqtt.createClient(port, host, {username:"compose" , password: "shines" })

    //subscribe to actuation topic
    client.subscribe(SO_ID+'/actions');


    //callback function when actuation message is received
    client.on('message', function (topic, message) {
   
      var obj = JSON.parse(message);
    
      //print the parameter
      console.log(obj.parameters);

      //turn on the relay (pin 5) for as long as defined in the parameter (in seconds)
      relayOn(obj.parameters);
    
    });

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

    function relayOn(time) {
      console.log("turning on the relay..");

      gpio.digital[5].write(1);


      var dur = parseInt(time);

      dur = dur * 1000;

      var stop = new Date().getTime();
        while(new Date().getTime() < stop + dur) {
          ;
      }

      gpio.digital[5].write(0);

      console.log("turning off the relay..");
    }

    
