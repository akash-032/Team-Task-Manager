import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { Plus, Folder, CheckCircle, LogOut } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, tasksRes] = await Promise.all([
          api.get('/projects'),
          api.get('/tasks')
        ]);
        setProjects(projectsRes.data);
        setTasks(tasksRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      }
    };
    fetchData();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName) return;
    try {
      const { data } = await api.post('/projects', { name: newProjectName });
      setProjects([...projects, data]);
      setNewProjectName('');
      setShowCreate(false);
    } catch (error) {
      alert('Failed to create project');
    }
  };

  const getStatusClass = (status) => {
    return `status-badge status-${status.replace(' ', '').toLowerCase()}`;
  };

  return (
    <div className="app-container">
      <header className="header">
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700' }}>Dashboard</h1>
          <p className="text-secondary">Welcome back, {user.name} ({user.role})</p>
        </div>
        <button onClick={logout} className="btn btn-secondary">
          <LogOut size={16} /> Logout
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 style={{ fontSize: '20px' }}><Folder size={20} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '8px' }} /> Your Projects</h2>
            {user.role === 'Admin' && (
              <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
                <Plus size={16} /> New Project
              </button>
            )}
          </div>

          {showCreate && (
            <form onSubmit={handleCreateProject} className="glass-panel mb-6" style={{ display: 'flex', gap: '16px' }}>
              <input 
                type="text" 
                placeholder="Project Name..." 
                value={newProjectName} 
                onChange={(e) => setNewProjectName(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary">Create</button>
            </form>
          )}

          <div className="grid-cards">
            {projects.length === 0 ? (
              <p className="text-secondary">No projects found.</p>
            ) : (
              projects.map(project => (
                <Link to={`/project/${project._id}`} key={project._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="glass-panel" style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{project.name}</h3>
                    <p className="text-secondary" style={{ fontSize: '14px' }}>Members: {project.members.length + 1}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: '20px', marginBottom: '24px' }}><CheckCircle size={20} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '8px' }} /> Recent Tasks</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {tasks.length === 0 ? (
              <p className="text-secondary">No tasks assigned yet.</p>
            ) : (
              tasks.slice(0, 5).map(task => (
                <div key={task._id} className="glass-panel" style={{ padding: '16px' }}>
                  <div className="flex justify-between items-center mb-2">
                    <h4 style={{ fontSize: '16px', fontWeight: '600' }}>{task.title}</h4>
                    <span className={getStatusClass(task.status)}>{task.status}</span>
                  </div>
                  <p className="text-secondary" style={{ fontSize: '13px' }}>
                    Project: {task.project?.name || 'Unknown'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
