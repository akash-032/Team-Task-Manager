const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect, admin } = require('../middleware/auth');

// Get tasks
router.get('/', protect, async (req, res) => {
  try {
    const projectId = req.query.projectId;
    let query = {};
    
    if (projectId) {
      query.project = projectId;
      const project = await Project.findById(projectId);
      if (!project) return res.status(404).json({ message: 'Project not found' });
      
      const isMember = project.members.includes(req.user._id);
      const isAdmin = project.admin.toString() === req.user._id.toString();
      
      if (!isMember && !isAdmin) {
         return res.status(403).json({ message: 'Not authorized' });
      }
    } else {
       if (req.user.role === 'Member') {
         query.assignedTo = req.user._id;
       } else {
         const myProjects = await Project.find({ admin: req.user._id });
         const projectIds = myProjects.map(p => p._id);
         query.project = { $in: projectIds };
       }
    }

    const tasks = await Task.find(query).populate('assignedTo', 'name email').populate('project', 'name');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create task (Admin only)
router.post('/', protect, admin, async (req, res) => {
  try {
    const { title, description, project, assignedTo, dueDate } = req.body;
    
    const projectDoc = await Project.findById(project);
    if (!projectDoc || projectDoc.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized for this project' });
    }

    const task = await Task.create({
      title, description, project, assignedTo, dueDate
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update task status (Admin or assigned member)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);
    
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project);
    
    const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();
    const isAdmin = project && project.admin.toString() === req.user._id.toString();

    if (!isAssigned && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    task.status = status;
    await task.save();
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete task
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project);
    if (project.admin.toString() !== req.user._id.toString()) {
       return res.status(403).json({ message: 'Not authorized' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
