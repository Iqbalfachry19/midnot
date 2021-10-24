const express = require("express");
const app = express();
// const cors = require("cors");
// app.use(cors());
const server = require("http").Server(app);
const io = require("socket.io")(server);
const bodyParser = require("body-parser");

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});
const { v4: uuidV4 } = require("uuid");
app.use(bodyParser.json()).use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use("/peerjs", peerServer);

app.set("view engine", "ejs");
app.use(express.static("public"));
app.get("/create", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});
app.get("/", (req, res) => {
  res.render("join");
});
app.get("/close", (req, res) => {
  res.redirect(`/`);
});
app.post("/join", (req, res) => {
  const { meeting } = req.body;
  res.redirect(`/${meeting}`);
});
app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);
    // messages
    socket.on("message", (message) => {
      //send message to the same room
      io.to(roomId).emit("createMessage", message);
    });

    socket.on("disconnect", () => {
      socket.to(roomId).broadcast.emit("user-disconnected", userId);
    });
  });
});

server.listen(process.env.PORT || 3030);