const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

app.use(cors());

const PORT = 3000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST'],
  },
});

// io.on('connection', (socket) => {
//   console.log(`User Connected: ${socket.id}`);

//   socket.on('send_message', (data) => {
//     console.log('Received message from client:', data.message);
//     if (data.message) { // Validate if message exists
//       io.emit('receive_message', { message: data.message });
//     } else {
//       console.error('Invalid message received');
//     }
//   });

//   socket.on('disconnect', () => {
//     console.log(`User Disconnected: ${socket.id}`);
//   });
// });

// ... (Previous code)
const onlineUsers = {};

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on('login', (username) => {
    onlineUsers[socket.id] = username;
    console.log(`User ${username} logged in`);
    io.emit('update_users', Object.values(onlineUsers));
  });

  socket.on('send_message', (data) => {
    console.log('Received message from client:', data.message);
    const { message, to } = data;
    const senderUsername = onlineUsers[socket.id];

    
    const toSocketId = Object.keys(onlineUsers).find(
      (key) => onlineUsers[key] === to
    );
    if (toSocketId) {
      io.to(toSocketId).emit('receive_message', {
        message,
        from: senderUsername,
        // from: senderUsername,
      });
    }
  });

  socket.on('disconnect', () => {
    const username = onlineUsers[socket.id];
    console.log(`User Disconnected: ${username}`);
    delete onlineUsers[socket.id];
    io.emit('update_users', Object.values(onlineUsers));
  });
});

// ... (Remaining code)


server.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
