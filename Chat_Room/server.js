const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path'); // Add this line

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public'))); // Use path.join to resolve the public directory

// Handle socket connections
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Handle joining a chat room
    socket.on('joinRoom', (room) => {
        socket.join(room);
        console.log(`Client ${socket.id} joined room: ${room}`);
    });

    // Handle incoming messages
    socket.on('chatMessage', (msg) => {
        const { room, message, sender } = msg;
        // Broadcast message to the room
        io.to(room).emit('chatMessage', { message, sender });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
