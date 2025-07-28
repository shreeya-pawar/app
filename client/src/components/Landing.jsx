import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setRole } from '../redux/userSlice';
import './Landing.css';

function Landing() {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      dispatch(setRole(selectedRole));

      if (selectedRole === 'student') {
        
        navigate('/student');
      } else {
        navigate('/teacher');
      }
    }
  };

  return (
    <div className="landing-page">
      <div className="main-content-wrapper">
        <div className="logo-badge">
          <svg viewBox="0 0 24 24" className="logo-icon">
            <path d="M13 2L3 14h9l-1 8L21 10h-9l1-8z" />
          </svg>
          Intervue Poll
        </div>

        <h1 className="main-heading">Welcome to the Live Polling System</h1>
        <p className="description-text">
          Please select the role you want to enter the platform as.
        </p>

        <div className="role-cards-container">
          <div
            className={`role-card ${selectedRole === 'student' ? 'selected' : ''}`}
            onClick={() => handleRoleSelect('student')}
          >
            <h3>I’m a Student</h3>
            <p>Participate in real-time polls and discussions.</p>
          </div>

          <div
            className={`role-card ${selectedRole === 'teacher' ? 'selected' : ''}`}
            onClick={() => handleRoleSelect('teacher')}
          >
            <h3>I’m a Teacher</h3>
            <p>Host engaging polls and interact with students live.</p>
          </div>
        </div>



        {selectedRole && (
          <button className="continue-button" onClick={handleContinue}>
            Continue
          </button>
        )}
      </div>
    </div>
  );
}

export default Landing;
