import React, { useState, useEffect } from 'react';
import socket from '../socket';
import './PollForm.css';
import ChatWindow from './ChatWindow';

function PollForm() {
  const [question, setQuestion] = useState('');
  const [pollResults, setPollResults] = useState(null);
  const [askedQuestion, setAskedQuestion] = useState('');
  const [pollHistory, setPollHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [options, setOptions] = useState([
    { id: 1, text: '', isCorrect: false },
    { id: 2, text: '', isCorrect: false }
  ]);
  const [timer, setTimer] = useState('60 seconds');
  const [chatOpen, setChatOpen] = useState(false);
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    socket.on('update_students', (studentList) => {
      const names = studentList.map((s) => s.name);
      setParticipants(names);
    });

    socket.on('poll_results', (results) => {
      setPollResults(results);
      setAskedQuestion(question);
      setPollHistory(prev => [...prev, { question, results, options }]);
    });

    return () => {
      socket.off('update_students');
      socket.off('poll_results');
    };
  }, [question, options]);

  const handleOptionChange = (id, value) => {
    setOptions(options.map(opt => opt.id === id ? { ...opt, text: value } : opt));
  };

  const addOption = () => {
    setOptions([...options, { id: options.length + 1, text: '', isCorrect: false }]);
  };

  const handleSubmit = () => {
    if (!question.trim()) {
      alert('Question is required');
      return;
    }

    if (options.some(opt => !opt.text.trim())) {
      alert('All options must be filled');
      return;
    }

    const correctOptionIndex = options.findIndex(opt => opt.isCorrect);
    if (correctOptionIndex === -1) {
      alert('Please select a correct option');
      return;
    }

    const questionData = {
      question,
      options: options.map(opt => opt.text),
      correctIndex: correctOptionIndex,
      duration: parseInt(timer.split(' ')[0]),
    };

    socket.emit('ask_question', questionData);
  };

  return (
    <div className="poll-container">
      <button
        className="view-history-btn-fixed"
        onClick={() => setShowHistory(prev => !prev)}
      >
        {showHistory ? 'Hide Poll History' : 'View Poll History'}
      </button>

      {!pollResults && !showHistory && (
        <>
          <div className="tag">✨ Intervue Poll</div>
          <h1 className="title">Let’s <strong>Get Started</strong></h1>
          <p className="subtitle">
            you’ll have the ability to create and manage polls, ask questions, and monitor
            your students' responses in real-time.
          </p>
        </>
      )}

      {showHistory && (
        <div className="poll-history">
          <h3>Poll History</h3>
          {pollHistory.map((entry, index) => (
            <div key={index} className="history-item">
              <div className="history-question">{entry.question}</div>
              {entry.options.map((opt, idx) => {
                const votes = entry.results.counts[idx] || 0;
                const total = entry.results.total || 1;
                const percentage = Math.round((votes / total) * 100);
                const isCorrect = idx === entry.results.correctIndex;

                return (
                  <div
                    key={idx}
                    className={`result-option-row ${isCorrect ? 'correct-option' : ''}`}
                    style={{ background: `linear-gradient(to right, #7765DA ${percentage}%, #f3f3f3 ${percentage}%)` }}
                  >
                    <span className="option-number">{idx + 1}</span>
                    <span className="option-text">{opt.text}</span>
                    <span className="result-percentage">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {pollResults ? (
        <div className="teacher-result-box">
          <h3>Question</h3>
          <div className="result-question">{askedQuestion}</div>
          {options.map((opt, idx) => {
            const votes = pollResults.counts[idx] || 0;
            const total = pollResults.total || 1;
            const percentage = Math.round((votes / total) * 100);
            const isCorrect = idx === pollResults.correctIndex;

            return (
              <div
                key={idx}
                className={`result-option-row ${isCorrect ? 'correct-option' : ''}`}
                style={{
                  background: `linear-gradient(to right, #7765DA ${percentage}%, #f3f3f3 ${percentage}%)`
                }}
              >
                <span className="option-number">{idx + 1}</span>
                <span className="option-text">{opt.text}</span>
                <span className="result-percentage">{percentage}%</span>
              </div>
            );
          })}
          <button
            className="ask-another-btn"
            onClick={() => {
              setPollResults(null);
              setQuestion('');
              setAskedQuestion('');
              setOptions([
                { id: 1, text: '', isCorrect: false },
                { id: 2, text: '', isCorrect: false }
              ]);
            }}
          >
            Ask Another Question
          </button>
        </div>
      ) : (
        <>
          <label className="question-label">Enter your question</label>
          <div className="question-row">
            <textarea
              className="question-input"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              maxLength={100}
              placeholder="Type your question here..."
            />
            <select
              className="timer-dropdown"
              value={timer}
              onChange={e => setTimer(e.target.value)}
            >
              <option>30 seconds</option>
              <option>60 seconds</option>
              <option>90 seconds</option>
            </select>
          </div>

          <div className="options-header">
            <span>Edit Options</span>
            <span>Is it Correct?</span>
          </div>

          {options.map((opt, index) => (
            <div className="option-row" key={opt.id}>
              <span className="option-number">{index + 1}</span>
              <input
                className="option-input"
                value={opt.text}
                onChange={e => handleOptionChange(opt.id, e.target.value)}
                placeholder="Enter option"
              />
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name={`correct-${opt.id}`}
                    checked={opt.isCorrect}
                    onChange={() =>
                      setOptions(options.map(o =>
                        o.id === opt.id ? { ...o, isCorrect: true } : o
                      ))
                    }
                  />
                  Yes
                </label>
                <label>
                  <input
                    type="radio"
                    name={`correct-${opt.id}`}
                    checked={!opt.isCorrect}
                    onChange={() =>
                      setOptions(options.map(o =>
                        o.id === opt.id ? { ...o, isCorrect: false } : o
                      ))
                    }
                  />
                  No
                </label>
              </div>
            </div>
          ))}

          <button className="add-option-btn" onClick={addOption}>+ Add More option</button>
          <button className="ask-btn" onClick={handleSubmit}>Ask Question</button>
        </>
      )}

      <div
        className="chat-toggle-icon"
        onClick={() => setChatOpen(prev => !prev)}
        title="Toggle Chat"
      >
        💬
      </div>

      {chatOpen && (
        <div className="teacher-chat-container">
          <ChatWindow
            username="Teacher"
            participants={participants}
            onKick={(name) => socket.emit('kick_student', { name })}
          />
        </div>
      )}
    </div>
  );
}

export default PollForm;
