import React, { useState } from 'react';
import './Login.css';

function Login({ onLogin, onRegisterClick }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(); // Simulate a successful login
  };

  return (
    <div className="login-container">
      <div className="circle blue-circle animated"></div>
      <div className="circle orange-circle animated"></div>
      <div className="login-form">
        <h2 className="login-title">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Username:</label>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Password:</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit">SUBMIT</button>
          <p className="register-link" onClick={onRegisterClick}>
            Don't have an account? Register here
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
