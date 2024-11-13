import React, { useState } from 'react';
import axios from 'axios';
import Login from './Login';
import HomePage from './components/HomePage';
import Register from './components/Register';
import UserAnalytics from './components/UserAnalytics';
import './App.css';

function App() {
  const [handle, setHandle] = useState('');
  const [userData, setUserData] = useState(null);
  const [ratingHistory, setRatingHistory] = useState([]);
  const [problemStats, setProblemStats] = useState(null);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');

  // Function to fetch user data from Codeforces API
  const fetchUserData = async () => {
    try {
      // Fetch basic user info
      const userResponse = await axios.get(`https://codeforces.com/api/user.info?handles=${handle}`);
      setUserData(userResponse.data.result[0]);

      // Fetch user's rating history
      const ratingResponse = await axios.get(`https://codeforces.com/api/user.rating?handle=${handle}`);
      setRatingHistory(ratingResponse.data.result);

      // Fetch user's problem stats and process data
      const problemStatsResponse = await axios.get(`https://codeforces.com/api/user.status?handle=${handle}`);
      const problems = problemStatsResponse.data.result;

      const problemDifficulties = {};
      const verdicts = {};
      const languages = {};

      problems.forEach((problem) => {
        if (problem.verdict === 'OK') {
          const difficulty = problem.problem.rating || 'Unrated';
          problemDifficulties[difficulty] = (problemDifficulties[difficulty] || 0) + 1;
        }

        verdicts[problem.verdict] = (verdicts[problem.verdict] || 0) + 1;
        languages[problem.programmingLanguage] = (languages[problem.programmingLanguage] || 0) + 1;
      });

      setProblemStats({
        totalSolved: Object.values(problemDifficulties).reduce((a, b) => a + b, 0),
        difficulties: problemDifficulties,
        verdicts,
        languages,
      });

      setError(null);
    } catch (err) {
      setError('User not found or API error');
      setUserData(null);
      setRatingHistory([]);
      setProblemStats(null);
    }
  };

  // Handle form submission to fetch user data
  const handleSubmit = (e) => {
    e.preventDefault();
    if (handle) fetchUserData();
  };

  // Navigation function to change the current page
  const navigateTo = (page) => setCurrentPage(page);

  return (
    <div className="App">
      {/* Render HomePage component */}
      {currentPage === 'home' && (
        <HomePage
          onLoginClick={() => navigateTo('login')}
          onRegisterClick={() => navigateTo('register')}
          onUserAnalyticsClick={() => navigateTo(isAuthenticated ? 'userAnalytics' : 'login')}
        />
      )}

      {/* Render Login component */}
      {currentPage === 'login' && (
        <Login
          onLogin={() => {
            setIsAuthenticated(true);
            navigateTo('userAnalytics');
          }}
          onRegisterClick={() => navigateTo('register')}
        />
      )}

      {/* Render Register component */}
      {currentPage === 'register' && <Register onLoginClick={() => navigateTo('login')} />}

      {/* Render UserAnalytics component for authenticated users */}
      {currentPage === 'userAnalytics' && isAuthenticated && (
        <UserAnalytics
          handle={handle}
          setHandle={setHandle}
          handleSubmit={handleSubmit}
          userData={userData}
          error={error}
          ratingHistory={ratingHistory}
          problemStats={problemStats}
        />
      )}
    </div>
  );
}

export default App;
