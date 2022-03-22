const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const fs = require('fs');
const dataPath = "../data/history.json"

const app = express();
const httpServer = createServer(app);
const io = new Server((httpServer, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"],
    allowedHeaders: ["chat-tunnel"],
  }
})).listen(httpServer);

const serverPort = 3000;

const connectedUsers = [];

const addUser = ({ id, name }) => {
  const userName = name.trim().toLowerCase();
  const existingUser = connectedUsers.find(user => user.name === userName);

  if (existingUser) {
    return { error: "ユーザー名は既に存在しています" };
  }

  if (connectedUsers.length === 2) {
    return { error: "満席です、少々お待ちください" };
  }

  const user = { id, name };
  connectedUsers.push(user);

  return { user };
}

const getUser = id => connectedUsers
  .find(user => user.id === id);

const getUserByName = name => connectedUsers.find(user => user.name === name);

const removeUser = (id) => {
  const index = connectedUsers.findIndex(user => user.id === id);
  if (index !== -1) {
    connectedUsers.splice(index, 1)
  }
}

let history = [];

const readHistory = () => {
  fs.readFile(dataPath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
    } else {
      history = data.length > 0 ? JSON.parse(data) : [];
    }
  })
}

const saveHistory = (history) => {
  if (Array.isArray(history) && history.length > 0) {
    const json = JSON.stringify(history);
    fs.writeFile(dataPath, json, 'utf-8', (err) => {
      if (err) {
        console.error('error: ', err)
      }
    });
  }
}

const disconnect = (id) => {
  const user = getUser(id);
  const who = user ? user.name : ''
  const timestamp = new Date();
  removeUser(id);
  if (who !== '') {
    history.push({
      user: '', text: `${who}が離れました`, timestamp: timestamp.toString()
    })
    saveHistory(history);
  }
}

io.on('connection', (socket) => {

  // read history on load
  readHistory();

  socket.on('check', (name, callback) => {
    // check socket id with connectedUsers
    const user = getUserByName(name);
    user === undefined ? callback(false) : callback(user);
  })

  socket.on('join', ({ name }, callback) => {
    const { error, user } = addUser(
      { id: socket.id, name });

    if (error) return callback({ error });
    const timestamp = new Date();
    history.push({
      user: '', text: `ようこそ ${user.name} !`, timestamp: timestamp.toString()
    })
    saveHistory(history);

    callback(user);
  });

  socket.on('chatMessage', (form, callback) => {
    const user = getUserByName(form.userName);
    if (user === undefined) {
      callback('切断されました、もう一度最初からやり直してください')
    }
    const timestamp = new Date();
    const messageObj = { user: user.name, text: form.message, timestamp: timestamp.toString() };
    history.push(messageObj);
    saveHistory(history);
  });

  socket.on('clearHistory', () => {
    fs.writeFile(dataPath, "[]", 'utf-8', (err) => {
      if (err) {
        console.error('error: ', err)
      }
    });
  })

  socket.on('manual-disconnect', name => {
    const user = getUserByName(name);
    socket.disconnect(true);
    disconnect(user.id);
  })

  socket.on('disconnect', () => {
    disconnect(socket.id)
  });
});

httpServer.listen(serverPort, () => {
  console.log(`listening on http://localhost:${serverPort}`);
});