var express = require("express");
var app = express();
var serv = require("http").Server(app);

//create a server:
app.get("/", function(req, res) {
  res.sendFile(__dirname + "/client/index.html");
});
app.use("/client", express.static(__dirname + "/client"));

serv.listen(8080);

var SOCKET_LIST = {};
var numbers = Array.from({ length: 100 }, (v, k) => k);

var io = require("socket.io")(serv, {});
io.sockets.on("connection", function(socket) {
  console.log("socket connection established");

  socket.on("PLAYER_ID", function(data) {
    socket.id = data.ID;

    SOCKET_LIST[socket.id] = socket;

    console.log("Player connected: " + socket.id);
  });

  socket.on("disconnect", function() {
    delete SOCKET_LIST[socket.id];
  });
});

setInterval(function() {
  genNums();

  console.log("New list generated");

  setTimeout(function() {
    var result = Math.floor(Math.random() * 100);

    console.log("Result: " + result);

    for (var i in SOCKET_LIST) {
      var socket = SOCKET_LIST[i];
      socket.emit("GetResult", {
        resultNum: result,
        offset: Math.floor(Math.random() * 33) - 16
      });
    }
  }, 5000);
  console.log("end wait");
}, 20000);

function genNums() {
  shuffleArray(numbers);

  var listNumbers = [];

  for (let i = 0; i < numbers.length; i++) {
    listNumbers[i] = {};
    listNumbers[i]["value"] = numbers[i];
    listNumbers[i]["pos"] = i * 48;
  }
  //console.log("Generated List" +listNumbers[0]);
  for (let i in SOCKET_LIST) {
    let socket = SOCKET_LIST[i];
    socket.emit("newNumbers", {
      list: listNumbers
    });
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
