const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
const server = require("http").Server(app);
const io = require("socket.io")(server);
const bodyParser = require("body-parser");
const session = require("express-session");
const flash = require("connect-flash");
const { ExpressPeerServer } = require("peer");
app.use(
  session({
    secret: "secret key",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(flash());
const peerServer = ExpressPeerServer(server, {
  debug: true,
});
const { v4: uuidV4, validate } = require("uuid");
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
  res.render("join", { message: req.flash("message") });
});

app.get("/close", (req, res) => {
  res.redirect(`/`);
});

app.post("/join", (req, res) => {
  const { meeting } = req.body;

  if (validate(meeting) === true) {
    res.redirect(`/${meeting}`);
  } else {
    req.flash("message", "ID Room Salah");
    res.redirect("/");
  }
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
