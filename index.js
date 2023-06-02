const UNIX_SOCKET = "http.socket";
const fs = require("fs");
const net = require("net");

try {
  fs.unlinkSync(UNIX_SOCKET);
} catch {}

// make healthcheck endpoint
function handleHealthConnection(conn) {
  conn.on('data', onConnData);

  function onConnData(d) {
    conn.write('OK');
  }
}
var server = net.createServer();
// server.on('connection', handleHealthConnection);
server.listen(8080);

// make webserver
const http = require("http");
http
  .createServer(function (req, res) {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write("Congrats, you have a created an ngrok web server within App Runner");
    res.end();
  })
  .listen(UNIX_SOCKET); // Server object listens on unix socket
console.log("Node.js web server at", UNIX_SOCKET, "is running..");

// setup ngrok
const ngrok = require("@ngrok/ngrok");
// ngrok.consoleLog("INFO"); // turn on info logging

builder = new ngrok.NgrokSessionBuilder();
builder
  // .authtoken("<authtoken>")
  .authtokenFromEnv()
  .metadata("Online in One Line")
  // .caCert(fs.readFileSync('ca.crt'))
  // .serverAddr('192.168.1.1:443')
  .handleStopCommand(() => {
    console.log("stop command");
  })
  .handleRestartCommand(() => {
    console.log("restart command");
  })
  .handleUpdateCommand((update) => {
    console.log(
      "update command, version:", update.version,
      "permitMajorVersion:", update.permitMajorVersion
    );
  })
  // .handleHeartbeat((latency) => {
  //   console.log("heartbeat, latency:", latency, "milliseconds");
  // })
  .handleDisconnection((addr, error) => {
    console.log("disconnected, addr:", addr, "error:", error);
  });

builder.connect().then((session) => {
  session
    .httpEndpoint()
    // .allowCidr("0.0.0.0/0")
    // .basicAuth("ngrok", "online1line")
    // .circuitBreaker(0.5)
    // .compression()
    // .denyCidr("10.1.1.1/32")
    // .domain("<somedomain>.ngrok.io")
    // .mutualTlsca(fs.readFileSync('ca.crt'))
    // .oauth("google", ["<user>@<domain>"], ["<domain>"], ["<scope>"])
    // .oidc("<url>", "<id>", "<secret>", ["<user>@<domain>"], ["<domain>"], ["<scope>"])
    // .proxyProto("") // One of: "", "1", "2"
    // .removeRequestHeader("X-Req-Nope")
    // .removeResponseHeader("X-Res-Nope")
    // .requestHeader("X-Req-Yup", "true")
    // .responseHeader("X-Res-Yup", "true")
    // .scheme("HTTPS")
    // .websocketTcpConversion()
    // .webhookVerification("twilio", "asdf")
    .metadata("example tunnel metadata from nodejs on AWS App Runner")
    .listen()
    .then((tunnel) => {
      console.log("ngrok ingress established at:", tunnel.url());
      tunnel.forwardPipe(UNIX_SOCKET);
    });
});
