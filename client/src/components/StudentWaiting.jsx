import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../socket';
import { useDispatch } from 'react-redux';
import { setCurrentQuestion } from '../redux/questionSlice';

function StudentWaiting() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    socket.on('question', (questionData) => {
      dispatch(setCurrentQuestion(questionData));
      navigate('/student/answer');
    });

    socket.on('kicked', () => {
      alert('You were removed by the teacher.');
      navigate('/');
    });

    return () => {
      socket.off('question');
      socket.off('kicked');
    };
  }, [navigate, dispatch]);

  return (
    <div style={{ textAlign: 'center', marginTop: '20%' }}>
      <h2>Waiting for the teacher to ask a question...</h2>
      <div className="spinner" />
    </div>
  );
}

export default StudentWaiting;
