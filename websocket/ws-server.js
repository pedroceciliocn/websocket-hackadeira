var http = require("http");
var url = require('url');

var WebSocketServer = require('ws').Server;
wss = new WebSocketServer({port: 8080, path: '/testing'});
wss.on('connection', function(ws) {
ws.on('message', function(message) {
console.log('Msg received in server: %s ', message);
});
console.log('new connection');
ws.send("Connected");
var interval = setInterval(function () {

    http.get('http://devices.webofthings.io/pi/sensors/temperature/', {headers: { 'Accept': 'application/json' }}, (response) => {
        let data = '';

        response.on('data', (chunk) => {
            data += chunk;
        });

        response.on('end', () => {
            const temperatureData = JSON.parse(data)
            ws.send("Temperature:"+temperatureData.value+"\n\n");

        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

}, 2000);
}); 
