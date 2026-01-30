import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [backendData, setBackendData] = useState(null);
  const [users, setUsers] = useState([]);
  const [health, setHealth] = useState(null);
  const [deployment, setDeployment] = useState(null);
  const [loading, setLoading] = useState(true);

  // This will be the VM IP in production
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [homeRes, usersRes, healthRes, deployRes] = await Promise.all([
          fetch(`${BACKEND_URL}/`),
          fetch(`${BACKEND_URL}/api/users`),
          fetch(`${BACKEND_URL}/api/health`),
          fetch(`${BACKEND_URL}/api/deployment`)
        ]);

        setBackendData(await homeRes.json());
        setUsers((await usersRes.json()).users);
        setHealth(await healthRes.json());
        setDeployment(await deployRes.json());
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [BACKEND_URL]);

  if (loading) {
    return (
      <div className="App">
        <div className="loading">
          <div className="spinner"></div>
          <h2>Loading Application...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="hero">
          <h1>🚀 DevOps CI/CD Pipeline</h1>
          <h2>Windows → GitHub → Jenkins → DockerHub → VM K8s</h2>
          <p className="author">Created by <strong>Abhishek</strong></p>
        </div>

        <div className="card status-card">
          <h3>📡 Backend Status</h3>
          <div className="status-grid">
            <div className="status-item">
              <span className="label">Message:</span>
              <span className="value success">{backendData?.message}</span>
            </div>
            <div className="status-item">
              <span className="label">Version:</span>
              <span className="value">{backendData?.version}</span>
            </div>
            <div className="status-item">
              <span className="label">Hostname:</span>
              <span className="value">{backendData?.hostname}</span>
            </div>
            <div className="status-item">
              <span className="label">Deployed From:</span>
              <span className="value">{backendData?.deployed_from}</span>
            </div>
          </div>
        </div>

        {health && (
          <div className="card health-card">
            <h3>❤️ Health Status</h3>
            <div className="health-item">
              <span className="icon">✅</span>
              <span>Status: {health.status}</span>
            </div>
            <div className="health-item">
              <span className="icon">🔧</span>
              <span>Service: {health.service}</span>
            </div>
          </div>
        )}

        {deployment && (
          <div className="card deployment-card">
            <h3>🔄 Deployment Pipeline</h3>
            <div className="pipeline">
              <div className="pipeline-step">
                <div className="step-icon">💻</div>
                <div className="step-name">Windows Development</div>
              </div>
              <div className="arrow">→</div>
              <div className="pipeline-step">
                <div className="step-icon">🔧</div>
                <div className="step-name">{deployment.ci_cd}</div>
              </div>
              <div className="arrow">→</div>
              <div className="pipeline-step">
                <div className="step-icon">🐳</div>
                <div className="step-name">{deployment.registry}</div>
              </div>
              <div className="arrow">→</div>
              <div className="pipeline-step">
                <div className="step-icon">☸️</div>
                <div className="step-name">{deployment.orchestration}</div>
              </div>
            </div>
          </div>
        )}

        <div className="card users-card">
          <h3>👥 Team Members</h3>
          <div className="users-grid">
            {users.map((user) => (
              <div key={user.id} className="user-card">
                <div className="user-avatar">{user.name.charAt(0)}</div>
                <h4>{user.name}</h4>
                <p className="role">{user.role}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="footer">
          <p>Automated CI/CD Pipeline with Jenkins</p>
          <p className="timestamp">Last Update: {backendData?.timestamp}</p>
        </div>
      </header>
    </div>
  );
}

export default App;