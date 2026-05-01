const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');

// Get all projects for logged in user (Admin sees all created by them, Member sees all they are part of)
router.get('/', protect, async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'Admin') {
      projects = await Project.find({ admin: req.user._id }).populate('members', 'name email');
    } else {
      projects = await Project.find({ members: req.user._id }).populate('admin', 'name email');
    }
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a project (Admin only)
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = await Project.create({
      name,
      description,
      admin: req.user._id,
      members: []
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add member to project (Admin only)
router.put('/:id/members', protect, admin, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this project' });
    }

    if (!project.members.includes(user._id)) {
      project.members.push(user._id);
      await project.save();
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('members', 'name email').populate('admin', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch(error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
