const express = require('express');
const cors = require('cors');
const path = require('path');

require('./db'); // creates tables + demo data on first run
const { authenticate } = require('./middleware/auth');
const { auth, users } = require('./routes/auth');
const entities = require('./routes/entities');
const stats = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// ---- Public routes ----
app.use('/api/auth', auth);

// ---- Staff management (admin only, own auth inside) ----
app.use('/api/users', users);

// ---- Protected routes ----
app.use('/api', authenticate);
app.use('/api/stats', stats);
app.use('/api/departments', entities.departments);
app.use('/api/doctors', entities.doctors);
app.use('/api/patients', entities.patients);
app.use('/api/appointments', entities.appointments);
app.use('/api/records', entities.records);
app.use('/api/bills', entities.bills);
app.use('/api/medicines', entities.medicines);
app.use('/api/beds', entities.beds);
app.use('/api/lab', entities.lab);

app.use('/api', (req, res) => res.status(404).json({ error: 'API route not found' }));

// ---- Frontend ----
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html')));

// ---- Error handler ----
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Server error' });
});

app.listen(PORT, () => {
  console.log(`\n  Hospital Management System running at http://localhost:${PORT}\n`);
  console.log('  Demo logins:');
  console.log('   admin@hospital.com      / admin123');
  console.log('   doctor@hospital.com     / doctor123');
  console.log('   reception@hospital.com  / reception123\n');
});
