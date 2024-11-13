import React, { useState } from 'react';
import './Register.css';

function Register({ onLoginClick }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    console.log("Registration data:", { username, email, password });
    onLoginClick();
  };

  return (
    <div className="login-container">
      <div className="circle blue-circle animated"></div>
      <div className="circle orange-circle animated"></div>
      <div className="login-form">
        <h2 className="login-title">Register</h2>
        <form onSubmit={handleRegisterSubmit}>
          <div className="field">
            <label>Username:</label>
            <input
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Email:</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Password:</label>
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit">REGISTER</button>
          <p className="login-link" onClick={onLoginClick}>
            Already have an account? Login here
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
