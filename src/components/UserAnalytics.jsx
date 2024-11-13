import React, { useEffect, useState } from 'react';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import './UserAnalytics.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

function Dashboard() {
  const defaultHandle = 'vedantjain29';
  const [userData, setUserData] = useState({
    username: defaultHandle,
    problem_count: 0,
    average_rating: 0,
    highest_rating: 0,
    first_attempt_percentage: 0,
  });
  const [ratingHistory, setRatingHistory] = useState([]);
  const [verdictData, setVerdictData] = useState({});
  const [difficultyData, setDifficultyData] = useState({});
  const [solvingTrendData, setSolvingTrendData] = useState({});
  const [contestData, setContestData] = useState([]);
  const [problemTagData, setProblemTagData] = useState({});
  const [last50SolvedProblems, setLast50SolvedProblems] = useState([]);
  const [showContestAnalysis, setShowContestAnalysis] = useState(false);
  const [showProblemAnalysis, setShowProblemAnalysis] = useState(false);

  useEffect(() => {
    const fetchCodeforcesData = async () => {
      try {
        const userInfoResponse = await fetch(`https://codeforces.com/api/user.info?handles=${defaultHandle}`);
        const userInfoData = await userInfoResponse.json();
        
        if (userInfoData.status === 'OK') {
          const user = userInfoData.result[0];
          const highestRating = user.maxRating || 0;

          const userStatusResponse = await fetch(`https://codeforces.com/api/user.status?handle=${defaultHandle}`);
          const userStatusData = await userStatusResponse.json();
          
          if (userStatusData.status === 'OK') {
            const submissions = userStatusData.result;
            const problemSet = new Set();
            let firstAttemptCount = 0;

            const verdictCount = {};
            const difficultyCount = {};
            const solvingTrend = {};
            const tagCount = {};
            const solvedProblems = [];

            submissions.forEach((submission) => {
              const problemId = `${submission.problem.contestId}-${submission.problem.index}`;
              
              if (submission.verdict === 'OK') {
                if (!problemSet.has(problemId)) {
                  problemSet.add(problemId);
                  firstAttemptCount++;
                }

                const difficulty = submission.problem.rating;
                if (difficulty) {
                  difficultyCount[difficulty] = (difficultyCount[difficulty] || 0) + 1;
                }

                const solvedDate = new Date(submission.creationTimeSeconds * 1000);
                const monthYear = `${solvedDate.getFullYear()}-${String(solvedDate.getMonth() + 1).padStart(2, '0')}`;
                solvingTrend[monthYear] = (solvingTrend[monthYear] || 0) + 1;

                submission.problem.tags.forEach(tag => {
                  tagCount[tag] = (tagCount[tag] || 0) + 1;
                });

                solvedProblems.push({
                  name: submission.problem.name,
                  contestId: submission.problem.contestId,
                  index: submission.problem.index,
                  rating: submission.problem.rating || "Unrated",
                  date: solvedDate.toLocaleDateString(),
                });
              }

              if (submission.verdict) {
                verdictCount[submission.verdict] = (verdictCount[submission.verdict] || 0) + 1;
              }
            });

            const problemCount = problemSet.size;
            const firstAttemptPercentage = problemCount > 0 ? (firstAttemptCount / problemCount) * 100 : 0;
            const averageRating = highestRating > 0 ? highestRating - 100 : 0;

            setUserData({
              username: user.handle,
              problem_count: problemCount,
              average_rating: averageRating,
              highest_rating: highestRating,
              first_attempt_percentage: firstAttemptPercentage.toFixed(2),
            });

            setVerdictData(verdictCount);
            setDifficultyData(difficultyCount);
            setSolvingTrendData(solvingTrend);
            setProblemTagData(tagCount);

            // Set the last 50 solved problems
            setLast50SolvedProblems(solvedProblems.slice(0, 50));
          }
        }

        const ratingHistoryResponse = await fetch(`https://codeforces.com/api/user.rating?handle=${defaultHandle}`);
        const ratingHistoryData = await ratingHistoryResponse.json();
        
        if (ratingHistoryData.status === 'OK') {
          setRatingHistory(ratingHistoryData.result);
        }
      } catch (error) {
        console.error("Error fetching data from Codeforces API:", error);
      }
    };

    fetchCodeforcesData();
  }, [defaultHandle]);

  const fetchContestData = async () => {
    try {
      const response = await fetch(`https://codeforces.com/api/user.rating?handle=${defaultHandle}`);
      const data = await response.json();
      if (data.status === 'OK') {
        setContestData(data.result);
      }
    } catch (error) {
      console.error("Error fetching contest data:", error);
    }
  };

  const handleContestAnalysisClick = () => {
    setShowContestAnalysis(true);
    setShowProblemAnalysis(false);
    fetchContestData();
  };

  const handleProblemAnalysisClick = () => {
    setShowProblemAnalysis(true);
    setShowContestAnalysis(false);
  };

  const handleDashboardClick = () => {
    setShowContestAnalysis(false);
    setShowProblemAnalysis(false);
  };

  const ratingChartData = {
    labels: ratingHistory?.map(entry => new Date(entry.ratingUpdateTimeSeconds * 1000).toLocaleDateString()) || [],
    datasets: [
      {
        label: 'Rating Over Time',
        data: ratingHistory?.map(entry => entry.newRating) || [],
        fill: false,
        borderColor: '#82e9de',
        tension: 0.1,
      },
    ],
  };

  const contestChartData = {
    labels: contestData?.map((contest) => contest.contestName) || [],
    datasets: [
      {
        label: 'Rating Progress Over Contests',
        data: contestData?.map((contest) => contest.newRating) || [],
        fill: false,
        borderColor: '#4caf50',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="user-info">
          <img src="https://via.placeholder.com/40" alt="User" className="user-avatar" />
          <div className="user-details">
            <h4>{userData.username}</h4>
            <p>Gold Member</p>
          </div>
        </div>
        <div className="nav-links">
          <button onClick={handleDashboardClick} className={`nav-link ${!showContestAnalysis && !showProblemAnalysis ? 'active' : ''}`}>Dashboard</button>
          <button onClick={handleContestAnalysisClick} className={`nav-link ${showContestAnalysis ? 'active' : ''}`}>Contest Analysis</button>
          <button onClick={handleProblemAnalysisClick} className={`nav-link ${showProblemAnalysis ? 'active' : ''}`}>Problem Analysis</button>
        </div>
      </div>

      <div className="main-content">
        <div className="handle-display">
          <h1>{userData.username}</h1>
        </div>

        <div className="statistics">
          <div className="stat-card">
            <h3>{userData.problem_count}</h3>
            <p>Problems Solved</p>
          </div>
          <div className="stat-card">
            <h3>{userData.average_rating}</h3>
            <p>Average Rating</p>
          </div>
          <div className="stat-card">
            <h3>{userData.highest_rating}</h3>
            <p>Highest Rating</p>
          </div>
          <div className="stat-card">
            <h3>{userData.first_attempt_percentage}%</h3>
            <p>First Attempt Success Rate</p>
          </div>
        </div>

        {showContestAnalysis ? (
          <div className="contest-analysis">
            <h2>Previous Contest Data</h2>
            <div className="contest-data-container">
              {contestData?.map((contest, index) => (
                <div key={index} className="contest-item">
                  <div className="contest-box">
                    <label>Contest Name</label>
                    <input type="text" value={contest.contestName} readOnly />
                  </div>
                  <div className="contest-box">
                    <label>Rank</label>
                    <input type="text" value={contest.rank} readOnly />
                  </div>
                  <div className="contest-box">
                    <label>Old Rating</label>
                    <input type="text" value={contest.oldRating} readOnly />
                  </div>
                  <div className="contest-box">
                    <label>New Rating</label>
                    <input type="text" value={contest.newRating} readOnly />
                  </div>
                </div>
              ))}
            </div>
            <div className="contest-chart">
              <h4>Rating Progress Over Contests</h4>
              <Line data={contestChartData} />
            </div>
          </div>
        ) : showProblemAnalysis ? (
          <div className="problem-analysis">
            <h2>Problem Analysis</h2>
            <div className="problem-data-container">
              <div className="panel">
                <h4>Problems Solved by Difficulty</h4>
                <Bar data={{
                  labels: Object.keys(difficultyData),
                  datasets: [
                    {
                      label: 'Solved Problems',
                      data: Object.values(difficultyData),
                      backgroundColor: '#2196f3',
                    }
                  ]
                }} />
              </div>
              <div className="side-by-side-charts">
                <div className="panel small-pie-chart">
                  <h4>Problems Solved by Tag</h4>
                  <Pie data={{
                    labels: Object.keys(problemTagData),
                    datasets: [
                      {
                        data: Object.values(problemTagData),
                        backgroundColor: [
                          '#4caf50', '#f44336', '#ff9800', '#2196f3', '#9c27b0', '#3f51b5'
                        ]
                      }
                    ]
                  }} />
                </div>
                <div className="panel small-line-chart">
                  <h4>Problem Solving Trend Over Time</h4>
                  <Line data={{
                    labels: Object.keys(solvingTrendData),
                    datasets: [
                      {
                        label: 'Solved Problems Over Time',
                        data: Object.values(solvingTrendData),
                        borderColor: '#ff9800',
                        fill: false,
                        tension: 0.1,
                      }
                    ]
                  }} />
                </div>
              </div>
            </div>
            <div className="last-solved-problems">
              <h4>Last 50 Solved Problems</h4>
              <ul>
                {last50SolvedProblems.map((problem, index) => (
                  <li key={index}>
                    {problem.name} (Contest {problem.contestId}, Index {problem.index}) - Rating: {problem.rating} - Solved on: {problem.date}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <>
            <div className="chart-row">
              <div className="panel rating-history">
                <h4>Rating History</h4>
                <Line data={ratingChartData} />
              </div>
              <div className="panel difficulty-distribution">
                <h4>Problems Solved by Difficulty</h4>
                <Bar data={{
                  labels: Object.keys(difficultyData),
                  datasets: [
                    {
                      label: 'Solved Problems',
                      data: Object.values(difficultyData),
                      backgroundColor: '#2196f3',
                    }
                  ]
                }} />
              </div>
            </div>

            <div className="chart-row">
              <div className="panel verdict-distribution">
                <h4>Verdict Distribution</h4>
                <Pie data={{
                  labels: Object.keys(verdictData),
                  datasets: [
                    {
                      data: Object.values(verdictData),
                      backgroundColor: ['#4caf50', '#f44336', '#ff9800', '#2196f3']
                    }
                  ]
                }} />
              </div>
              <div className="panel solving-trend">
                <h4>Problems Solved Over Time</h4>
                <Line data={{
                  labels: Object.keys(solvingTrendData),
                  datasets: [
                    {
                      label: 'Solved Problems Over Time',
                      data: Object.values(solvingTrendData),
                      borderColor: '#ff9800',
                      fill: false,
                    }
                  ]
                }} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
