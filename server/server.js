const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const path = require('path'); // ✅ Required to serve frontend

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://app-gamma-pearl.vercel.app", 
    methods: ['GET', 'POST'],
  },
});

// Global state
let currentQuestion = null;
let responses = [];
let students = {}; // { socket.id: { name } }
let chatMessages = [];
let pollTimer = null;

// ✅ Serve static files from React build
app.use(express.static(path.join(__dirname, 'client', 'build')));

// ✅ For any other route, serve index.html (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

io.on('connection', (socket) => {
  console.log('New socket connected:', socket.id);

  socket.on('student_join', (name) => {
    students[socket.id] = { name };
    console.log(`Student joined: ${name} (${socket.id})`);

    if (currentQuestion) {
      socket.emit('question', currentQuestion);
    }

    io.emit('update_students', Object.entries(students).map(([id, data]) => ({
      id,
      name: data.name,
    })));
  });

  socket.on('ask_question', (questionData) => {
    console.log('Teacher asked:', questionData.question);

    if (pollTimer) clearInterval(pollTimer);

    currentQuestion = {
      ...questionData,
      timestamp: Date.now(),
    };
    responses = [];

    io.emit('question', currentQuestion);

    let remaining = currentQuestion.duration;
    console.log(`Poll timer started for ${remaining} seconds`);

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

  socket.on('student_answer', (data) => {
    console.log(`Answer from ${data.name}: option ${data.option}`);
    responses.push({
      name: data.name || 'Anonymous',
      option: typeof data.option === 'number' ? data.option : -1,
    });
  });

  socket.on('send_message', (msg) => {
    chatMessages.push(msg);
    io.emit('receive_message', msg);
  });

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

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
    delete students[socket.id];

    io.emit('update_students', Object.entries(students).map(([id, data]) => ({
      id,
      name: data.name,
    })));
  });
});

// ✅ Start server
server.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
