// ✅ 1. StudentJoin.jsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setName } from '../redux/userSlice';
import { useNavigate } from 'react-router-dom';
import socket from '../socket';
import { FaBolt } from 'react-icons/fa';
import './StudentJoin.css';

function StudentJoin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [inputName, setInputName] = useState('');

  const handleJoin = () => {
    if (!inputName.trim()) return;
    dispatch(setName(inputName));
    localStorage.setItem('studentName', inputName);
    socket.emit('student_join', inputName);
    navigate('/student/waiting');
  };

  return (
    <div className="student-join-container">
      <div className="intervue-poll-badge">
        <FaBolt size={16} />
        <span>Intervue Poll</span>
      </div>
      <h2 className="main-heading">Let's Get Started</h2>
      <p className="description-text">
        Enter your name to participate in live polls and chat with classmates.
      </p>
      <input
        type="text"
        placeholder="Enter your name"
        className="name-input"
        value={inputName}
        onChange={(e) => setInputName(e.target.value)}
      />
      <button onClick={handleJoin} className="continue-button">
        Continue
      </button>
    </div>
  );
}

export default StudentJoin;
