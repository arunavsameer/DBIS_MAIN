// userController.js (located in the root directory)
const express = require('express');
const { spawn } = require('child_process');
const bcrypt = require('bcrypt');
const router = express.Router();
const path = require('path');
const db = require('./db');
const fs = require('fs');

// Registration Endpoint
router.post('/register', async (req, res) => {
  console.log('Registering user...');
  const { username, email, password } = req.body;

  // Input Validation
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required.' });
  }

  try {
    const checkUserQuery = 'SELECT COUNT(*) AS count FROM users WHERE username = ?';
    db.query(checkUserQuery, [username], async (err, results) => {
      if (err) {
        console.error(`Database error during user check: ${err.message}`);
        return res.status(500).json({ error: 'Database error. Please try again later.' });
      }

      if (results[0].count > 0) {
        return res.status(400).json({ error: 'Username already exists. Please choose another.' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log(`Password hashed: ${hashedPassword}`);

      // Path to jsonify/main.py
      const jsonifyScriptPath = path.join(__dirname, 'jsonify', 'main.py');
      console.log(`Path to jsonify/main.py: ${jsonifyScriptPath}`);
      console.log(`Spawning jsonify/main.py with args: ${username}, ${email}, ${hashedPassword}`);

      // Spawn jsonify/main.py
      const jsonifyProcess = spawn('python3', [jsonifyScriptPath, username, email, hashedPassword]);

      let jsonifyOutput = '';
      let jsonifyError = '';
      let responseSent = false; // Flag to ensure only one response is sent

      jsonifyProcess.stdout.on('data', (data) => {
        jsonifyOutput += data.toString();
      });

      jsonifyProcess.stderr.on('data', (data) => {
        jsonifyError += data.toString();
      });

      jsonifyProcess.on('close', (jqCode) => {
        if (responseSent) return; // Prevent duplicate response
        responseSent = true;

        if (jqCode !== 0) {
          console.error(`jsonify/main.py exited with code ${jqCode}: ${jsonifyError}`);
          return res.status(500).json({ error: 'Registration failed during JSON operations. Please try again.' });
        }
        console.log(`jsonify/main.py output: ${jsonifyOutput}`);
        return res.status(200).json({ message: `User ${username} registered successfully.` });
      });

      jsonifyProcess.on('error', (err) => {
        if (responseSent) return; // Prevent duplicate response
        responseSent = true;

        console.error(`Failed to start jsonify/main.py: ${err.message}`);
        return res.status(500).json({ error: 'Registration failed to start JSON operations. Please try again.' });
      });
    });
  } catch (hashError) {
    console.error(`Hashing error: ${hashError.message}`);
    return res.status(500).json({ error: 'Error processing registration. Please try again.' });
  }
});

// Login Endpoint (unchanged)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const getUserQuery = 'SELECT * FROM users WHERE username = ?';

  db.query(getUserQuery, [username], async (err, results) => {
    if (err) {
      console.error(`Database error: ${err.message}`);
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: 'Invalid username or password.' });
    }

    const user = results[0];

    // Compare the password using bcrypt
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: 'Invalid username or password.' });
    }

    // Successful login
    res.status(200).json({ message: `Welcome back, ${username}!` });
  });
});

// Generate Problem Analysis Endpoint
router.post('/problems/analysis', (req, res) => {
  const { problem_id } = req.body;

  if (!problem_id) {
    return res.status(400).json({ error: 'Problem ID is required.' });
  }

  const scriptPath = path.join(__dirname, "jsonify", 'author_problem_anal.py'); // Adjusted path

  const process = spawn('python3', [scriptPath, problem_id]);

  let scriptOutput = '';
  let scriptError = '';

  process.stdout.on('data', (data) => {
    scriptOutput += data.toString();
  });

  process.stderr.on('data', (data) => {
    scriptError += data.toString();
  });

  process.on('close', (code) => {
    if (code !== 0) {
      console.error(`Script exited with code ${code}: ${scriptError}`);
      return res.status(500).json({ error: 'Failed to generate problem analysis.' });
    }

    const filePath = path.join(__dirname, 'problem_analysis', `${problem_id}_analysis.json`); // Updated path

    // Check if the JSON file exists
    if (!fs.existsSync(filePath)) {
      console.error(`JSON file not found at path: ${filePath}`);
      return res.status(500).json({ error: 'Problem analysis JSON file not found.' });
    }

    // Read the generated JSON file
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(`Error reading JSON file: ${err.message}`);
        return res.status(500).json({ error: 'Failed to read problem analysis data.' });
      }

      try {
        const jsonData = JSON.parse(data);
        return res.status(200).json(jsonData);
      } catch (parseErr) {
        console.error(`JSON parse error: ${parseErr.message}`);
        return res.status(500).json({ error: 'Invalid JSON format.' });
      }
    });
  });

  process.on('error', (err) => {
    console.error(`Failed to start author_problem_anal.py: ${err.message}`);
    return res.status(500).json({ error: 'Failed to execute problem analysis script.' });
  });
});

module.exports = router;