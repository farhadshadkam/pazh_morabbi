const express = require('express');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;

// تنظیمات Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let db;

try {
  // ذخیره دیتابیس در پوشه tmp برای جلوگیری از خطای دسترسی در هاست
  db = new Database('/tmp/tvto.db');
  db.pragma('journal_mode = WAL');

  // ایجاد جداول در صورت عدم وجود
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT
    );
    
    CREATE TABLE IF NOT EXISTS centers (
      id TEXT PRIMARY KEY,
      province TEXT,
      city TEXT,
      centerName TEXT,
      headName TEXT,
      headPhone TEXT,
      headUsername TEXT,
      headPassword TEXT
    );

    CREATE TABLE IF NOT EXISTS instructors (
      id TEXT PRIMARY KEY,
      centerId TEXT,
      firstName TEXT,
      lastName TEXT,
      nationalId TEXT,
      phone TEXT,
      empType TEXT,
      username TEXT,
      password TEXT
    );
  `);

  // ایجاد کاربر ادمین پیش‌فرض اگر وجود نداشت
  const adminExists = db.prepare("SELECT * FROM users WHERE username = 'admin'").get();
  if (!adminExists) {
    db.prepare("INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)").run('u1', 'admin', '123', 'admin');
    console.log('Admin user created!');
  }
  
  console.log('Database initialized successfully!');
} catch (error) {
  console.error('DATABASE ERROR:', error.message);
}

// API تست برای اتصال فرانت‌اند
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running!' });
});

// راه‌اندازی سرور
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
