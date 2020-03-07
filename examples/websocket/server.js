const express = require("express");
const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const fs = require("fs");
app.use("/node_modules", express.static("node_modules"));
http.listen(3000, function() {
  console.log("listening on *:3000");
});
io.on("connect", function(socket) {
  socket.on("event_from_client", function(data) {
    socket.emit("event_from_server", { data: "Hello Client" });
  });
  socket.on("disconnect", function() {
    console.log("[disconnect]");
  });
});

app.get("/", function(req, res) {
  res.setHeader("Content-Type", "text/html");
  res.send(fs.readFileSync("./static/index.html"));
});
app.get("/index.mjs", function(req, res) {
  res.setHeader("Content-Type", "text/javascript");
  res.send(fs.readFileSync("./static/index.mjs"));
});
