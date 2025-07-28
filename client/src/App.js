import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from './components/Landing';
import StudentJoin from './components/StudentJoin';
import TeacherPanel from './components/TeacherPanel';
import StudentWaiting from './components/StudentWaiting';
import StudentAnswer from './components/StudentAnswer';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/student" element={<StudentJoin />} />
      <Route path="/student/waiting" element={<StudentWaiting />} />
      <Route path="/student/answer" element={<StudentAnswer />} />
      <Route path="/teacher" element={<TeacherPanel />} />
      <Route path="*" element={<h2>404: Page Not Found</h2>} />
    </Routes>
  );
}

export default App;
