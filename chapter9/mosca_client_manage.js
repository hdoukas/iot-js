'use strict'

var mosca = require('mosca')

var redis = require("redis")
    , redisclient = redis.createClient();

var clients = [];

//helper for storing pub/sub/
//needed by mosca
//read https://github.com/mcollina/mosca/wiki/Mosca-basic-usage for more information
var ascoltatore = {
  type: 'redis',
  redis: require('redis'),
  db: 12,
  port: 6379,
  return_buffers: true, // to handle binary payloads
  host: "localhost"
};

//configuration parameters
//for mosca broker
var settings = {
  port: 1883,
  backend: ascoltatore,
  stats: false,
  persistence: {
    factory: mosca.persistence.Redis
  }
};

//setup the server 
var server = new mosca.Server(settings);
server.on('ready', setup);


//when a client connects
//add the client.id into the list
//and register the time of connection
server.on('clientConnected', function(client) {
    var id = client.id;
    redisclient.set(""+id, new Date().getTime(), function (err, reply) {
    });
    
    clients.push(client.id);
});

server.on('subscribed', function(topic, client) {
  redisclient.set("topic_"+client.id, topic, function (err, reply) {
    });
  });

// fired when a message is received
server.on('published', function(packet, client) {
  if(client!=null){
    var id = client.id;
    redisclient.set("published_"+id, new Date().getTime(), function (err, reply) {
          console.log(err);
      });

  }
});


//in case client has disconnected
//remove it from list
server.on('clientDisconnected', function(client) {
  console.log("client: "+client.id+" disconnected");
  var index = clients.indexOf(client.id);
  clients.splice(index, 1);
});


// fired when the mqtt server is ready
function setup() {
  console.log('Mosca server is up and running')
  setTimeout(print, 10000);
}


//print some informaton about the connected clients
function print() {
  clients.forEach(function(value) {
    var uptime;
    var topic;
    var last_published;
    redisclient.get(""+value, function (err, reply) {
        //console.log("Client: "+value +" connected with uptime: "+ (new Date().getTime() - reply));
        uptime = (new Date().getTime() - reply);
         redisclient.get("topic_"+value, function (err, reply) {
            topic = reply;
            console.log("Topic is: "+topic);
            redisclient.get("published_"+value, function (err, reply) {
              last_published = (new Date().getTime() - reply)/1000;
              //console.log("last published is: "+last_published);
              console.log("Client: "+value +" connected with uptime: "+ uptime + " topic: "+topic+" last published: "+last_published+" sec ago");
            });
          });
      });
   
  });

  setTimeout(print, 10000);

}
