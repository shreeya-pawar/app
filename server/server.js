const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ['GET', 'POST'],
  },
});

// Global state
let currentQuestion = null;
let responses = [];
let students = {}; // { socket.id: { name } }
let chatMessages = [];
let pollTimer = null;

io.on('connection', (socket) => {
  console.log('New socket connected:', socket.id);

  // Student joins
  socket.on('student_join', (name) => {
    students[socket.id] = { name };
    console.log(`Student joined: ${name} (${socket.id})`);

    // Send current question if exists
    if (currentQuestion) {
      socket.emit('question', currentQuestion);
    }

    // Notify all about updated participants
    io.emit('update_students', Object.entries(students).map(([id, data]) => ({
      id,
      name: data.name,
    })));
  });

  // Teacher asks a new question
  socket.on('ask_question', (questionData) => {
    console.log('Teacher asked:', questionData.question);

    // Clear any previous timer
    if (pollTimer) clearInterval(pollTimer);

    currentQuestion = {
      ...questionData,
      timestamp: Date.now(),
    };
    responses = [];

    io.emit('question', currentQuestion);

    let remaining = currentQuestion.duration;
    console.log(`Poll timer started for ${remaining} seconds`);

    // Emit timer tick every second
    pollTimer = setInterval(() => {
      remaining--;
      io.emit('timer_tick', remaining);

      if (remaining <= 0) {
        clearInterval(pollTimer);
        pollTimer = null;

        console.log('Timer ended. Sending poll_results...');

        const counts = new Array(currentQuestion.options.length).fill(0);
        responses.forEach(r => {
          if (typeof r.option === 'number' && r.option >= 0 && r.option < counts.length) {
            counts[r.option]++;
          }
        });

        const resultPayload = {
          counts,
          total: responses.length,
          correctIndex: currentQuestion.correctIndex,
        };

        io.emit('poll_results', resultPayload);

        currentQuestion = null;
        responses = [];
      }
    }, 1000);
  });

  // Student submits an answer
  socket.on('student_answer', (data) => {
    console.log(`Answer from ${data.name}: option ${data.option}`);
    responses.push({
      name: data.name || 'Anonymous',
      option: typeof data.option === 'number' ? data.option : -1,
    });
  });

  // Chat message
  socket.on('send_message', (msg) => {
    chatMessages.push(msg);
    io.emit('receive_message', msg);
  });

  // Manual result fetch (optional)
  socket.on('get_results', () => {
    if (!currentQuestion) return;

    const counts = new Array(currentQuestion.options.length).fill(0);
    responses.forEach(r => {
      if (typeof r.option === 'number' && r.option >= 0 && r.option < counts.length) {
        counts[r.option]++;
      }
    });

    const resultPayload = {
      counts,
      total: responses.length,
      correctIndex: currentQuestion.correctIndex,
    };

    socket.emit('poll_results', resultPayload);
  });

  // Kick a student by name
  socket.on('kick_student', ({ name }) => {
    const idToKick = Object.keys(students).find(
      (id) => students[id].name === name
    );

    if (idToKick) {
      io.to(idToKick).emit('kicked');
      delete students[idToKick];

      io.emit('update_students', Object.entries(students).map(([id, data]) => ({
        id,
        name: data.name,
      })));

      console.log(`Kicked student: ${name} (${idToKick})`);
    } else {
      console.log(`Could not find student: ${name}`);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
    delete students[socket.id];

    io.emit('update_students', Object.entries(students).map(([id, data]) => ({
      id,
      name: data.name,
    })));
  });
});

server.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
