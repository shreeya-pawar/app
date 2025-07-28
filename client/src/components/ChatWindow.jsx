import React, { useEffect, useState, useRef } from 'react';
import socket from '../socket';
import './ChatWindow.css';

function ChatWindow({ username, participants = [], onKick }) {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const bottomRef = useRef(null);
  const isTeacher = username === 'Teacher';

  useEffect(() => {
    socket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (messageText.trim() === '') return;

    const messageData = {
      name: username,
      text: messageText.trim(),
    };

    socket.emit('send_message', messageData); // Let the server echo back
setMessageText('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="chat-window-fixed">
      <div className="chat-header">
        <div className="chat-tabs">
          <button
            className={activeTab === 'chat' ? 'active-tab' : ''}
            onClick={() => setActiveTab('chat')}
          >
            Chat
          </button>
          <button
            className={activeTab === 'participants' ? 'active-tab' : ''}
            onClick={() => setActiveTab('participants')}
          >
            Participants
          </button>
        </div>
      </div>

      {activeTab === 'chat' && (
        <>
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chat-message ${msg.name === username ? 'own' : 'other'}`}
              >
                <div className="chat-sender">{msg.name}</div>
                <div className="chat-bubble">{msg.text}</div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="chat-input-container">
            <input
              type="text"
              className="chat-input"
              placeholder="Type your message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button className="chat-send-button" onClick={sendMessage}>Send</button>
          </div>
        </>
      )}

      {activeTab === 'participants' && (
        <div className="participants-list">
          {participants.length > 0 ? (
            participants.map((name, idx) => (
              <div key={idx} className="participant-name-row">
                <span className="participant-name">👤 {name}</span>
                {isTeacher && name !== 'Teacher' && (
                  <button className="kick-btn" onClick={() => onKick(name)}>
                    Kick Out
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="participants-placeholder">No participants yet.</div>
          )}
        </div>
      )}
    </div>
  );
}

export default ChatWindow;
