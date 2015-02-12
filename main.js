/*jslint node:true,vars:true,bitwise:true,unparam:true */

/*jshint unused:true */

/*
The Local Temperature Node.js sample application distributed within Intel® XDK IoT Edition under the IoT with Node.js Projects project creation option showcases how to read analog data from a Grover Starter Kit Plus – IoT Intel® Edition Temperature Sensor, start a web server and communicate wirelessly using WebSockets.

MRAA - Low Level Skeleton Library for Communication on GNU/Linux platforms
Library in C/C++ to interface with Galileo & other Intel platforms, in a structured and sane API with port nanmes/numbering that match boards & with bindings to javascript & python.

Steps for installing MRAA & UPM Library on Intel IoT Platform with IoTDevKit Linux* image
Using a ssh client: 
1. echo "src maa-upm http://iotdk.intel.com/repos/1.1/intelgalactic" > /etc/opkg/intel-iotdk.conf
2. opkg update
3. opkg upgrade

Article: https://software.intel.com/en-us/html5/articles/iot-local-temperature-nodejs-and-html5-samples
*/

var mraa = require('mraa'); //require mraa
console.log('MRAA Version: ' + mraa.getVersion()); //write the mraa version to the Intel XDK console

var myOnboardLed = new mraa.Gpio(13); //LED hooked up to digital pin 13 (or built in pin on Galileo Gen1 & Gen2)
myOnboardLed.dir(mraa.DIR_OUT); //set the gpio direction to output
var ledState = false; //Boolean to hold the state of Led

/*
Function: startLEDBlinking(socket)
Parameters: socket - client communication channel
Description: Toggle LED State and send it to client every 4 seconds. 
*/
function startLEDBlinking(socket) {
    'use strict';
    setInterval(function () {
		//myOnboardLed.write(0);
		myOnboardLed.write(ledState?1:0); //if ledState is true then write a '1' (high) otherwise write a '0' (low)
		ledState = !ledState; //invert the ledState
        console.log("LED State: ",ledState);
        socket.emit("message", ledState);
    }, 4000);
}

function setLED(socket, stateVal){
    myOnboardLed.write(stateVal?1:0); //if ledState is true then write a '1' (high) otherwise write a '0' (low)
    ledState = stateVal; //invert the ledState
    console.log("LED State: ",ledState);
    socket.emit("ledDone", ledState);
}

console.log("LED On Off Via Web Application");

//Create Socket.io server
var http = require('http');
var fs = require('fs');
var app = http.createServer(function (req, res) {
    'use strict';
    fs.readFile(__dirname + '/index.html',
      function (err, data) {
        if (err) {
          res.writeHead(500);
          return res.end('Error loading index.html');
        }

    res.writeHead(200);
    res.end(data);
  });
}).listen(1337);
var io = require('socket.io')(app);

//Attach a 'connection' event handler to the server
io.on('connection', function (socket) {
    'use strict';
    console.log('a user connected');
    socket.emit('ledDone', ledState);
  socket.on('ledChange', function (data) {
    console.log("ledChange", data);
      setLED(socket, data);
      
  });
    //Emits an event along with a message
    socket.emit('connected', 'Welcome');

    //Start watching Sensors connected to Galileo board
    //startLEDBlinking(socket);

    //Attach a 'disconnect' event handler to the socket
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
});

