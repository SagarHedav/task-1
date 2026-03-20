const express = require('express');
const router = express.Router();
const db = require('../db/db');
const auth = require('../middleware/auth');

// Apply auth middleware to all calendar routes
router.use(auth);

// GET /api/calendar — get all calendar events
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM calendar_events WHERE user_id = $1 ORDER BY event_date ASC',
      [req.user.id]
    );
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// POST /api/calendar — create a new calendar event
router.post('/', async (req, res) => {
  const { title, description, event_date } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ success: false, error: 'Title is required.' });
  }
  if (!event_date) {
    return res.status(400).json({ success: false, error: 'Event date is required.' });
  }

  try {
    const result = await db.query(
      'INSERT INTO calendar_events (user_id, title, description, event_date) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, title.trim(), description ? description.trim() : '', event_date]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// DELETE /api/calendar/:id — delete a calendar event
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM calendar_events WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }
    res.json({ success: true, message: 'Event deleted successfully', data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;
