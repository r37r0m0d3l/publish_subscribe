import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { readFileSync } from "fs";
import rateLimit from "express-rate-limit";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const limiter = rateLimit({ max: 60, windowMs: 6e4 });
app.use(limiter);
app.use("/node_modules", express.static("node_modules"));

httpServer.listen(3_000, function () {
  console.log("listening on *:3000");
});

io.on("connect", function (socket) {
  socket.on("event_from_client", function (data) {
    socket.emit("event_from_server", { data: "Hello Client" });
  });
  socket.on("disconnect", function () {
    console.log("[disconnect]");
  });
});

app.get("/", function (req, res) {
  res.setHeader("Content-Type", "text/html");
  res.send(readFileSync("./static/index.html"));
});
app.get("/index.mjs", function (req, res) {
  res.setHeader("Content-Type", "text/javascript");
  res.send(readFileSync("./static/index.mjs"));
});
