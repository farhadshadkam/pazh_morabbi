const express = require('express');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let db;
try {
  // ذخیره دیتابیس در مسیر دائمی هاست
  db = new Database('/tmp/tvto.db');
  db.pragma('journal_mode = WAL');

  // ایجاد جدول اصلی برای ذخیره تمام اطلاعات سامانه
  db.exec(`
    CREATE TABLE IF NOT EXISTS app_state (
      id INTEGER PRIMARY KEY,
      data TEXT
    );
  `);

  console.log('Database initialized successfully!');
} catch (error) {
  console.error('DATABASE ERROR:', error.message);
}

// API برای دریافت داده‌ها از دیتابیس هاست
app.get('/api/state', (req, res) => {
  try {
    const row = db.prepare('SELECT data FROM app_state WHERE id = 1').get();
    if (row) {
      res.json(JSON.parse(row.data));
    } else {
      res.json({}); // اگر دیتابیس خالی بود
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// API برای ذخیره داده‌ها در دیتابیس هاست (دائمی)
app.post('/api/state', (req, res) => {
  try {
    const data = JSON.stringify(req.body);
    db.prepare('INSERT OR REPLACE INTO app_state (id, data) VALUES (1, ?)').run(data);
    res.json({ status: 'success' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
