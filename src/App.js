// src/App.js
import React, { useState } from 'react';
import './App.css';
import HomePage from './components/HomePage';
import Login from './Login';
import Register from './Register';
import UserAnalytics from './components/UserAnalytics';
import ProblemData from './components/ProblemData';
import UserComparison from './components/UserComparison';
import axios from 'axios';

function App() {
  const [handle, setHandle] = useState('');
  const [userData, setUserData] = useState(null);
  const [ratingHistory, setRatingHistory] = useState([]);
  const [problemStats, setProblemStats] = useState(null);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [loading, setLoading] = useState(false);

  // Navigation Function
  const navigateTo = (page) => setCurrentPage(page);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setHandle('');
    setCurrentPage('login');
  };

  const fetchUserData = async (username) => {
    setLoading(true);
    try {
      const userResponse = await axios.get(`https://codeforces.com/api/user.info?handles=${username}`);
      setUserData(userResponse.data.result[0]);

      const ratingResponse = await axios.get(`https://codeforces.com/api/user.rating?handle=${username}`);
      setRatingHistory(ratingResponse.data.result);

      const problemStatsResponse = await axios.get(`https://codeforces.com/api/user.status?handle=${username}`);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      {currentPage === 'home' && (
        <HomePage
          onLoginClick={() => navigateTo('login')}
          onRegisterClick={() => navigateTo('register')}
          onUserAnalyticsClick={() => navigateTo(isAuthenticated ? 'userAnalytics' : 'login')}
          onProblemAnalysisClick={() => navigateTo('problemData')}
          onUserComparisonClick={() => navigateTo('userComparison')}
        />
      )}

      {currentPage === 'login' && (
        <Login
          onLogin={(username) => {
            setIsAuthenticated(true);
            setHandle(username);
            fetchUserData(username); // Fetch user data after login
            navigateTo('userAnalytics');
          }}
          onSwitch={() => navigateTo('register')}
          onBackToHome={() => navigateTo('home')}
        />
      )}

      {currentPage === 'register' && (
        <Register
          onRegister={(username) => {
            setIsAuthenticated(true);
            setHandle(username);
            fetchUserData(username); // Fetch user data after registration
            navigateTo('userAnalytics');
          }}
          onSwitch={() => navigateTo('login')}
          onBackToHome={() => navigateTo('home')}
        />
      )}

      {currentPage === 'userAnalytics' && isAuthenticated && (
        <UserAnalytics
          handle={handle}
          onLogout={handleLogout}
          setHandle={setHandle}
          handleSubmit={() => {}}
          userData={userData}
          error={error}
          ratingHistory={ratingHistory}
          problemStats={problemStats}
          loading={loading}
          onBackToHome={() => navigateTo('home')}
          onProblemAnalysisClick={() => navigateTo('problemData')}
        />
      )}

      {currentPage === 'problemData' && (
        <ProblemData
          handle={handle}
          problemStats={problemStats}
          onBackToHome={() => navigateTo('home')}
        />
      )}

      {currentPage === 'userComparison' && (
        <UserComparison onBackToHome={() => navigateTo('home')} />
      )}
    </div>
  );
}

export default App;
