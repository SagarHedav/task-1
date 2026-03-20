const express = require('express');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// In-memory task store
let tasks = [
  {
    id: uuidv4(),
    title: 'Welcome to Task Manager!',
    description: 'You can create, update, delete and mark tasks as completed.',
    status: 'pending',
    created_at: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Explore the API',
    description: 'Check the README.md for full API documentation and endpoints.',
    status: 'completed',
    created_at: new Date().toISOString(),
  },
];

// GET /api/tasks — get all tasks
router.get('/', (req, res) => {
  res.json({ success: true, count: tasks.length, data: tasks });
});

// GET /api/tasks/:id — get a single task
router.get('/:id', (req, res) => {
  const task = tasks.find((t) => t.id === req.params.id);
  if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
  res.json({ success: true, data: task });
});

// POST /api/tasks — create a new task
router.post('/', (req, res) => {
  const { title, description, status } = req.body;

  // Validation: title must not be empty
  if (!title || title.trim() === '') {
    return res.status(400).json({ success: false, error: 'Title is required and cannot be empty.' });
  }

  const validStatuses = ['pending', 'completed'];
  const taskStatus = validStatuses.includes(status) ? status : 'pending';

  const newTask = {
    id: uuidv4(),
    title: title.trim(),
    description: description ? description.trim() : '',
    status: taskStatus,
    created_at: new Date().toISOString(),
  };

  tasks.push(newTask);
  res.status(201).json({ success: true, data: newTask });
});

// PUT /api/tasks/:id — update a task fully
router.put('/:id', (req, res) => {
  const index = tasks.findIndex((t) => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, error: 'Task not found' });

  const { title, description, status } = req.body;

  if (title !== undefined && title.trim() === '') {
    return res.status(400).json({ success: false, error: 'Title cannot be empty.' });
  }

  const validStatuses = ['pending', 'completed'];

  tasks[index] = {
    ...tasks[index],
    title: title !== undefined ? title.trim() : tasks[index].title,
    description: description !== undefined ? description.trim() : tasks[index].description,
    status: status && validStatuses.includes(status) ? status : tasks[index].status,
  };

  res.json({ success: true, data: tasks[index] });
});

// PATCH /api/tasks/:id/toggle — toggle task status
router.patch('/:id/toggle', (req, res) => {
  const index = tasks.findIndex((t) => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, error: 'Task not found' });

  tasks[index].status = tasks[index].status === 'pending' ? 'completed' : 'pending';
  res.json({ success: true, data: tasks[index] });
});

// DELETE /api/tasks/:id — delete a task
router.delete('/:id', (req, res) => {
  const index = tasks.findIndex((t) => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, error: 'Task not found' });

  const deleted = tasks.splice(index, 1)[0];
  res.json({ success: true, message: 'Task deleted successfully', data: deleted });
});

module.exports = router;
