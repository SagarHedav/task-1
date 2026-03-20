const express = require('express');
const router = express.Router();
const db = require('../db/db');
const auth = require('../middleware/auth');

// Apply auth middleware to all tasks routes
router.use(auth);

// GET /api/tasks — get all tasks
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// GET /api/tasks/:id — get a single task
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// POST /api/tasks — create a new task
router.post('/', async (req, res) => {
  const { title, description, status } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ success: false, error: 'Title is required and cannot be empty.' });
  }

  const validStatuses = ['pending', 'completed'];
  const taskStatus = validStatuses.includes(status) ? status : 'pending';

  try {
    const result = await db.query(
      'INSERT INTO tasks (user_id, title, description, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, title.trim(), description ? description.trim() : '', taskStatus]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// PUT /api/tasks/:id — update a task fully
router.put('/:id', async (req, res) => {
  const { title, description, status } = req.body;

  if (title !== undefined && title.trim() === '') {
    return res.status(400).json({ success: false, error: 'Title cannot be empty.' });
  }

  try {
    const taskRes = await db.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (taskRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    const task = taskRes.rows[0];

    const updatedTitle = title !== undefined ? title.trim() : task.title;
    const updatedDesc = description !== undefined ? description.trim() : task.description;
    const validStatuses = ['pending', 'completed'];
    const updatedStatus = status && validStatuses.includes(status) ? status : task.status;

    const result = await db.query(
      'UPDATE tasks SET title = $1, description = $2, status = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
      [updatedTitle, updatedDesc, updatedStatus, req.params.id, req.user.id]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// PATCH /api/tasks/:id/toggle — toggle task status
router.patch('/:id/toggle', async (req, res) => {
  try {
    const taskRes = await db.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (taskRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    const task = taskRes.rows[0];
    const newStatus = task.status === 'pending' ? 'completed' : 'pending';

    const result = await db.query(
      'UPDATE tasks SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [newStatus, req.params.id, req.user.id]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// DELETE /api/tasks/:id — delete a task
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    res.json({ success: true, message: 'Task deleted successfully', data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;
