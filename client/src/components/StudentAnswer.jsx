import React, { useEffect, useState } from 'react';
import socket from '../socket';
import ChatWindow from './ChatWindow';
import './StudentAnswer.css';

function StudentAnswer() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timer, setTimer] = useState(0);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [pollResults, setPollResults] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [kicked, setKicked] = useState(false);

  const studentName = localStorage.getItem('studentName') || 'Anonymous';

  useEffect(() => {
    socket.emit('student_join', studentName);

    socket.on('question', ({ question, options, duration }) => {
      setQuestion(question);
      setOptions(options);
      setTimer(duration);
      setSelectedOption(null);
      setShowSubmit(true);
      setPollResults(null);
    });

    socket.on('timer_tick', (remaining) => {
      setTimer(remaining);
    });

    socket.on('poll_results', (results) => {
      console.log('Poll results:', results);
      setPollResults(results);
    });

    socket.on('kicked', () => {
      setKicked(true);
      socket.disconnect();
    });

    socket.on('update_students', (names) => {
      setParticipants(names.map((p) => p.name));
    });

    return () => {
      socket.off('question');
      socket.off('timer_tick');
      socket.off('poll_results');
      socket.off('update_students');
      socket.off('kicked');
    };
  }, [studentName]);

  const handleSubmit = () => {
    if (selectedOption !== null) {
      socket.emit('student_answer', {
        name: studentName,
        option: selectedOption,
      });
      setShowSubmit(false);
    }
  };

  if (kicked) {
    return (
      <div className="kicked-screen">
        <div className="logo-tag">✨ Intervue Poll</div>
        <h2 className="kicked-title">You’ve been Kicked out!</h2>
        <p className="kicked-message">
          Looks like the teacher had removed you from the poll system. Please try again sometime.
        </p>
      </div>
    );
  }

  return (
    <div className="student-answer-container">
      <div className="question-card">
        <div className="question-header">
          <h3>Question</h3>
          <span className="timer">⏱️ {timer < 10 ? `00:0${timer}` : `00:${timer}`}</span>
        </div>

        <div className="question-text">{question}</div>

        <div className="options-list">
          {options.map((option, index) => {
            const isSelected = selectedOption === index;
            const total = pollResults?.total || 1;
            const votes = pollResults?.counts?.[index] || 0;
            const percentage = Math.round((votes / total) * 100);

            return (
              <div
                key={index}
                className={`option ${isSelected ? 'selected' : ''} ${pollResults ? 'result-showing' : ''}`}
                onClick={() => !pollResults && setSelectedOption(index)}
              >
                <div
                  className="option-filled-bar"
                  style={
                    pollResults
                      ? {
                          background: `linear-gradient(to right, #7765DA ${percentage}%, #f3f3f3 ${percentage}%)`,
                        }
                      : {}
                  }
                >
                  <div className="option-content-combined">
                    <span className="option-number">{index + 1}</span>
                    <span className="option-text">{option}</span>
                    {pollResults && <span className="result-percentage">{percentage}%</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {showSubmit ? (
          <button className="submit-btn" onClick={handleSubmit}>
            Submit
          </button>
        ) : (
          !pollResults && (
            <p className="wait-message">Wait for the teacher to ask a new question</p>
          )
        )}
      </div>

      {showChat && (
        <div className="chat-participant-section">
          <ChatWindow username={studentName} participants={participants} />
        </div>
      )}

      <div className="chat-icon-toggle" onClick={() => setShowChat((prev) => !prev)}>
        💬
      </div>
    </div>
  );
}

export default StudentAnswer;
