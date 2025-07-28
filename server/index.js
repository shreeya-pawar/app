// const express = require('express');
// const http = require('http');
// const cors = require('cors');
// const { Server } = require('socket.io');

// const app = express();
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: '*',
//     methods: ['GET', 'POST']
//   },
// });

// // Global state
// let currentQuestion = null;
// let responses = [];
// let students = {}; // key: socket.id → { name }
// let chatMessages = []; // optional in-memory chat history

// io.on('connection', (socket) => {
//   console.log('New socket connected:', socket.id);

//   // Student joins with name
//   socket.on('student_join', (name) => {
//     students[socket.id] = { name };
//     console.log(`${name} joined as ${socket.id}`);
//     io.emit(
//       'update_students',
//       Object.entries(students).map(([id, data]) => ({
//         id,
//         name: data.name,
//       }))
//     );
//   });

//   // Teacher asks question
//   socket.on('ask_question', (questionData) => {
//     currentQuestion = {
//       ...questionData,
//       timestamp: Date.now(),
//     };
//     responses = [];
//     io.emit('question', currentQuestion);
//   });

//   // Student submits answer
//   socket.on('student_answer', (data) => {
//     responses.push({ name: data.name, option: data.option });
//   });

//   // Teacher requests poll results
//   socket.on('get_results', () => {
//     if (!currentQuestion) return;
//     io.emit('poll_results', {
//       question: currentQuestion.question,
//       options: currentQuestion.options,
//       correctIndex: currentQuestion.correctIndex,
//       responses,
//     });
//   });

//   // Chat: Student or Teacher sends message
//   socket.on('send_message', (msg) => {
//     chatMessages.push(msg); // In-memory only
//     io.emit('receive_message', msg);
//   });

//   // Teacher kicks student
//   socket.on('kick_student', (idToKick) => {
//     io.to(idToKick).emit('kicked');
//     delete students[idToKick];
//     io.emit(
//       'update_students',
//       Object.entries(students).map(([id, data]) => ({
//         id,
//         name: data.name,
//       }))
//     );
//   });

//   // Handle disconnection
//   socket.on('disconnect', () => {
//     console.log('User disconnected:', socket.id);
//     delete students[socket.id];
//     io.emit(
//       'update_students',
//       Object.entries(students).map(([id, data]) => ({
//         id,
//         name: data.name,
//       }))
//     );
//   });
// });

// server.listen(5000, () => {
//   console.log('Server running on http://localhost:5000');
// });
