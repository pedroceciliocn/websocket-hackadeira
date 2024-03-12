var http = require("http");
var url = require('url');

http.createServer(function (req, res) {

    if (req.headers['accept'] === 'text/event-stream') {
        res.writeHeader(200, {
            "Content-Type": "text/event-stream"
            , "Cache-Control": "no-cache"
            , "Connection": "keep-alive"
            , "Access-Control-Allow-Origin": "*"
        });
        
        var interval = setInterval(function () {

            http.get('http://devices.webofthings.io/pi/sensors/temperature/', {headers: { 'Accept': 'application/json' }}, (response) => {
                let data = '';

                response.on('data', (chunk) => {
                    data += chunk;
                });

                response.on('end', () => {
                    const temperatureData = JSON.parse(data)
                    const queryUrl = url.parse(req.url, true);

                    const getUrl = () => {
                        switch (queryUrl.pathname) { //#B
                            case '/temperature':
                                return temperatureData.value;
                            case '/light':
                                return randomInt(1, 100);
                            default:
                                return 'hello worlod';
                        }
                    }

                    const response = getUrl()
                    res.write("data: " + response + "\n\n");

                });

            }).on("error", (err) => {
                console.log("Error: " + err.message);
            });

        }, 2000);
    } else {


        http.get('http://devices.webofthings.io/pi/sensors/temperature/', {headers: { 'Accept': 'application/json' }}, (response) => {
            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                const temperatureData = JSON.parse(data)

                const queryUrl = url.parse(req.url, true);
                const unit = temperatureData.unit;
                const contentType = req.headers["content-type"] ?? 'application/json';

                res.writeHead(200, { 'Content-Type': contentType }); //#A

                const getUrl = () => {
                    switch (queryUrl.pathname) { //#B
                        case '/temperature':
                            return { "temperature": temperatureData.value, "unit": unit };
                        case '/light':
                            return { "light": randomInt(1, 100) };
                        default:
                            return ('{"hello" : "world"}');
                    }
                }

                const response = getUrl()

                if (contentType === 'application/xml') {
                    const xmlResponse = `
                <?xml version="1.0" encoding="UTF-8" ?>
    
                <temperature>Temperature</temperature>
                    ${Object.entries(response).map(([key, value]) => `
                    <${key}>
                        ${value}
                    </${key}>
                    `).join('')}
                <temperature>Temperature</temperature>

            
            `;
                    return res.end(xmlResponse);
                }
                res.end(JSON.stringify(response))


            });

        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
    }
}).listen(9090);
console.log('SSE-Server started!');
function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}