import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { ArrowLeft, UserPlus, Plus } from 'lucide-react';

const ProjectView = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  
  const [taskData, setTaskData] = useState({ title: '', description: '', assignedTo: '', status: 'Pending' });

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const [projectRes, tasksRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get(`/tasks?projectId=${id}`)
        ]);
        setProject(projectRes.data);
        setTasks(tasksRes.data);
      } catch (error) {
        console.error('Failed to fetch project data');
      }
    };
    fetchProjectData();
  }, [id]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/projects/${id}/members`, { email: newMemberEmail });
      setNewMemberEmail('');
      setShowAddMember(false);
      const { data } = await api.get(`/projects/${id}`);
      setProject(data);
    } catch (error) {
      alert('Failed to add member. Check email.');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/tasks', { ...taskData, project: id });
      setTasks([...tasks, data]);
      setShowCreateTask(false);
      setTaskData({ title: '', description: '', assignedTo: '', status: 'Pending' });
    } catch (error) {
      alert('Failed to create task');
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      const { data } = await api.put(`/tasks/${taskId}/status`, { status });
      setTasks(tasks.map(t => t._id === taskId ? data : t));
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(t => t._id !== taskId));
    } catch (error) {
      alert('Failed to delete task');
    }
  };

  if (!project) return <div className="app-container">Loading...</div>;

  const isAdmin = user._id === project.admin._id;

  const getStatusClass = (status) => {
    return `status-badge status-${status.replace(' ', '').toLowerCase()}`;
  };

  return (
    <div className="app-container">
      <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <ArrowLeft size={16} style={{ marginRight: '8px' }} /> Back to Dashboard
      </Link>

      <header className="header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700' }}>{project.name}</h1>
          <p className="text-secondary">{project.description || 'No description provided'}</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          {isAdmin && (
            <>
              <button className="btn btn-secondary" onClick={() => setShowAddMember(!showAddMember)}>
                <UserPlus size={16} /> Add Member
              </button>
              <button className="btn btn-primary" onClick={() => setShowCreateTask(!showCreateTask)}>
                <Plus size={16} /> New Task
              </button>
            </>
          )}
        </div>
      </header>

      {showAddMember && isAdmin && (
        <form onSubmit={handleAddMember} className="glass-panel mb-6" style={{ display: 'flex', gap: '16px', maxWidth: '400px' }}>
          <input type="email" placeholder="Member Email..." value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} required />
          <button type="submit" className="btn btn-primary">Invite</button>
        </form>
      )}

      {showCreateTask && isAdmin && (
        <form onSubmit={handleCreateTask} className="glass-panel mb-6" style={{ display: 'grid', gap: '16px', maxWidth: '600px' }}>
          <input type="text" placeholder="Task Title" value={taskData.title} onChange={e => setTaskData({...taskData, title: e.target.value})} required />
          <textarea placeholder="Description" value={taskData.description} onChange={e => setTaskData({...taskData, description: e.target.value})} />
          <select value={taskData.assignedTo} onChange={e => setTaskData({...taskData, assignedTo: e.target.value})}>
            <option value="">Assign to...</option>
            {project.members.map(m => (
              <option key={m._id} value={m._id}>{m.name}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary">Create Task</button>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
        {['Pending', 'In Progress', 'Completed', 'Overdue'].map(status => (
          <div key={status} className="glass-panel" style={{ padding: '16px', minHeight: '300px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <span className={getStatusClass(status)}>{status}</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {tasks.filter(t => t.status === status).map(task => (
                <div key={task._id} style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ fontSize: '15px', marginBottom: '4px' }}>{task.title}</h4>
                  <p className="text-secondary" style={{ fontSize: '12px', marginBottom: '8px' }}>{task.description}</p>
                  
                  <div className="flex justify-between items-center" style={{ marginTop: '12px' }}>
                    <select 
                      value={task.status} 
                      onChange={e => updateTaskStatus(task._id, e.target.value)}
                      style={{ padding: '4px 8px', fontSize: '12px', width: 'auto' }}
                      disabled={!isAdmin && task.assignedTo?._id !== user._id}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                    
                    {isAdmin && (
                      <button onClick={() => deleteTask(task._id)} style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectView;
