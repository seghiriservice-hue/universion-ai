const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { WebSocketServer } = require('ws');
const { getDb, initialize, saveDb } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// ─── WebSocket Setup ────────────────────────────────────────────────────────────

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('[WS] Client connected');
  ws.on('close', () => console.log('[WS] Client disconnected'));
});

function broadcast(type, data) {
  const message = JSON.stringify({ type, data });
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(message);
  });
}

// Helper: run sql.js query and get all results as array of objects
function queryAll(db, sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const results = [];
  while (stmt.step()) results.push(stmt.getAsObject());
  stmt.free();
  return results;
}

function queryOne(db, sql, params = []) {
  const rows = queryAll(db, sql, params);
  return rows.length > 0 ? rows[0] : null;
}

function runSql(db, sql, params = []) {
  if (params.length) {
    const stmt = db.prepare(sql);
    stmt.run(params);
    stmt.free();
  } else {
    db.run(sql);
  }
}

// ─── Initialize Database ────────────────────────────────────────────────────────

async function startServer() {
  await initialize();

  // ═════════════════════════ API ROUTES ═════════════════════════

  // GET /api/rooms
  app.get('/api/rooms', async (req, res) => {
    try {
      const db = await getDb();
      const rooms = queryAll(db, `
        SELECT r.*, p.name AS occupant_name, p.course AS occupant_course
        FROM rooms r LEFT JOIN professors p ON r.occupant_id = p.id
      `);
      res.json(rooms);
    } catch (err) {
      console.error('[ERROR] GET /api/rooms:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // PUT /api/rooms/:id
  app.put('/api/rooms/:id', async (req, res) => {
    try {
      const db = await getDb();
      const { id } = req.params;
      const { status, occupant_id, method } = req.body;
      if (!status) return res.status(400).json({ error: 'status is required' });

      const room = queryOne(db, 'SELECT * FROM rooms WHERE id = ?', [id]);
      if (!room) return res.status(404).json({ error: 'Room not found' });

      if (!['vacant','occupied','alert'].includes(status))
        return res.status(400).json({ error: 'Invalid status' });

      if (status === 'occupied' && occupant_id) {
        runSql(db, 'UPDATE rooms SET status = ?, occupant_id = ? WHERE id = ?', [status, occupant_id, id]);
        const prof = queryOne(db, 'SELECT * FROM professors WHERE id = ?', [occupant_id]);
        if (prof) {
          runSql(db, `INSERT INTO attendance_logs (timestamp,room_id,room_name,professor_id,professor_name,course,status,method) VALUES (?,?,?,?,?,?,?,?)`,
            [new Date().toISOString(), id, room.name, prof.id, prof.name, prof.course, 'entry', method||'face_recognition']);
        }
      } else if (status === 'vacant') {
        if (room.occupant_id) {
          const prof = queryOne(db, 'SELECT * FROM professors WHERE id = ?', [room.occupant_id]);
          if (prof) {
            runSql(db, `INSERT INTO attendance_logs (timestamp,room_id,room_name,professor_id,professor_name,course,status,method) VALUES (?,?,?,?,?,?,?,?)`,
              [new Date().toISOString(), id, room.name, prof.id, prof.name, prof.course, 'exit', method||'face_recognition']);
          }
        }
        runSql(db, 'UPDATE rooms SET status = ?, occupant_id = NULL WHERE id = ?', [status, id]);
      } else {
        runSql(db, 'UPDATE rooms SET status = ? WHERE id = ?', [status, id]);
      }

      const updated = queryOne(db, `
        SELECT r.*, p.name AS occupant_name, p.course AS occupant_course
        FROM rooms r LEFT JOIN professors p ON r.occupant_id = p.id WHERE r.id = ?
      `, [id]);

      if (status === 'alert') {
        const notif = { timestamp:new Date().toISOString(), type:'alert', title:`Alert: ${room.name}`, message:`Alert triggered for ${room.name}.` };
        runSql(db, 'INSERT INTO notifications (timestamp,type,title,message) VALUES (?,?,?,?)', [notif.timestamp,notif.type,notif.title,notif.message]);
        broadcast('notification', notif);
      }

      saveDb();
      broadcast('room_update', updated);
      res.json(updated);
    } catch (err) {
      console.error('[ERROR] PUT /api/rooms/:id:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/professors
  app.get('/api/professors', async (req, res) => {
    try {
      const db = await getDb();
      res.json(queryAll(db, 'SELECT * FROM professors ORDER BY name'));
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // POST /api/professors
  app.post('/api/professors', async (req, res) => {
    try {
      const db = await getDb();
      const { id, name, department, course, initials } = req.body;
      if (!id || !name || !department || !course) {
        return res.status(400).json({ error: 'id, name, department, course are required' });
      }
      const dup = queryOne(db, 'SELECT * FROM professors WHERE id = ?', [id]);
      if (dup) return res.status(400).json({ error: 'Professor with this ID already registered' });

      runSql(db, 'INSERT INTO professors (id, name, department, course, initials) VALUES (?, ?, ?, ?, ?)',
        [id, name, department, course, initials || name.split(' ').map(n => n[0]).join('').toUpperCase()]);
      
      saveDb();
      const added = queryOne(db, 'SELECT * FROM professors WHERE id = ?', [id]);
      broadcast('professor_added', added);
      res.status(201).json(added);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // DELETE /api/professors/:id
  app.delete('/api/professors/:id', async (req, res) => {
    try {
      const db = await getDb();
      const { id } = req.params;
      const exists = queryOne(db, 'SELECT * FROM professors WHERE id = ?', [id]);
      if (!exists) return res.status(404).json({ error: 'Professor not found' });

      runSql(db, 'DELETE FROM professors WHERE id = ?', [id]);
      runSql(db, 'DELETE FROM schedule WHERE professor_id = ?', [id]);
      saveDb();
      broadcast('professor_deleted', { id });
      res.json({ success: true, message: `Professor ${id} deleted successfully.` });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // GET /api/attendance
  app.get('/api/attendance', async (req, res) => {
    try {
      const db = await getDb();
      const { limit = 50, offset = 0, professor_id, room_id } = req.query;
      let where = [], params = [];
      if (professor_id) { where.push('professor_id = ?'); params.push(professor_id); }
      if (room_id) { where.push('room_id = ?'); params.push(room_id); }
      const wc = where.length ? `WHERE ${where.join(' AND ')}` : '';
      const total = queryOne(db, `SELECT COUNT(*) AS cnt FROM attendance_logs ${wc}`, params);
      params.push(parseInt(limit), parseInt(offset));
      const logs = queryAll(db, `SELECT * FROM attendance_logs ${wc} ORDER BY timestamp DESC LIMIT ? OFFSET ?`, params);
      res.json({ total: total ? total.cnt : 0, limit: parseInt(limit), offset: parseInt(offset), data: logs });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // POST /api/attendance
  app.post('/api/attendance', async (req, res) => {
    try {
      const db = await getDb();
      const { room_id, professor_id, status, method } = req.body;
      if (!room_id || !professor_id || !status) return res.status(400).json({ error: 'room_id, professor_id, and status required' });
      const room = queryOne(db, 'SELECT * FROM rooms WHERE id = ?', [room_id]);
      if (!room) return res.status(404).json({ error: 'Room not found' });
      const prof = queryOne(db, 'SELECT * FROM professors WHERE id = ?', [professor_id]);
      if (!prof) return res.status(404).json({ error: 'Professor not found' });
      const ts = new Date().toISOString();
      runSql(db, `INSERT INTO attendance_logs (timestamp,room_id,room_name,professor_id,professor_name,course,status,method) VALUES (?,?,?,?,?,?,?,?)`,
        [ts, room_id, room.name, professor_id, prof.name, prof.course, status, method||'manual']);
      saveDb();
      const log = { timestamp:ts, room_id, room_name:room.name, professor_id, professor_name:prof.name, course:prof.course, status, method:method||'manual' };
      broadcast('attendance_log', log);
      res.status(201).json(log);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // GET /api/schedule
  app.get('/api/schedule', async (req, res) => {
    try {
      const db = await getDb();
      const { day_of_week, professor_id, room_id } = req.query;
      let where = [], params = [];
      if (day_of_week) { where.push('s.day_of_week = ?'); params.push(day_of_week); }
      if (professor_id) { where.push('s.professor_id = ?'); params.push(professor_id); }
      if (room_id) { where.push('s.room_id = ?'); params.push(room_id); }
      const wc = where.length ? `WHERE ${where.join(' AND ')}` : '';
      const schedule = queryAll(db, `
        SELECT s.*, p.name AS professor_name, p.department, r.name AS room_name, r.type AS room_type
        FROM schedule s JOIN professors p ON s.professor_id = p.id JOIN rooms r ON s.room_id = r.id
        ${wc} ORDER BY CASE s.day_of_week
          WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3
          WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 END, s.start_time
      `, params);
      res.json(schedule);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // POST /api/schedule
  app.post('/api/schedule', async (req, res) => {
    try {
      const db = await getDb();
      const { professor_id, room_id, day_of_week, start_time, end_time, course } = req.body;
      if (!professor_id || !room_id || !day_of_week || !start_time || !end_time || !course) {
        return res.status(400).json({ error: 'All schedule parameters are required' });
      }

      // Check room overlap
      const roomConflict = queryOne(db, `
        SELECT * FROM schedule
        WHERE room_id = ? AND day_of_week = ?
          AND ((CAST(start_time AS REAL) >= CAST(? AS REAL) AND CAST(start_time AS REAL) < CAST(? AS REAL))
            OR (CAST(end_time AS REAL) > CAST(? AS REAL) AND CAST(end_time AS REAL) <= CAST(? AS REAL))
            OR (CAST(start_time AS REAL) <= CAST(? AS REAL) AND CAST(end_time AS REAL) >= CAST(? AS REAL)))
      `, [room_id, day_of_week, start_time, end_time, start_time, end_time, start_time, end_time]);

      if (roomConflict) {
        return res.status(409).json({ error: `Room conflict: This room is occupied by class '${roomConflict.course}' during this time.` });
      }

      // Check professor overlap
      const profConflict = queryOne(db, `
        SELECT * FROM schedule
        WHERE professor_id = ? AND day_of_week = ?
          AND ((CAST(start_time AS REAL) >= CAST(? AS REAL) AND CAST(start_time AS REAL) < CAST(? AS REAL))
            OR (CAST(end_time AS REAL) > CAST(? AS REAL) AND CAST(end_time AS REAL) <= CAST(? AS REAL))
            OR (CAST(start_time AS REAL) <= CAST(? AS REAL) AND CAST(end_time AS REAL) >= CAST(? AS REAL)))
      `, [professor_id, day_of_week, start_time, end_time, start_time, end_time, start_time, end_time]);

      if (profConflict) {
        return res.status(409).json({ error: `Professor conflict: This professor is scheduled for class '${profConflict.course}' during this time.` });
      }

      runSql(db, 'INSERT INTO schedule (professor_id, room_id, day_of_week, start_time, end_time, course) VALUES (?, ?, ?, ?, ?, ?)',
        [professor_id, room_id, day_of_week, start_time, end_time, course]);
      saveDb();

      const added = queryOne(db, 'SELECT * FROM schedule WHERE professor_id = ? AND room_id = ? AND day_of_week = ? AND start_time = ?',
        [professor_id, room_id, day_of_week, start_time]);
      broadcast('schedule_added', added);
      res.status(201).json(added);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // DELETE /api/schedule/:id
  app.delete('/api/schedule/:id', async (req, res) => {
    try {
      const db = await getDb();
      const { id } = req.params;
      const exists = queryOne(db, 'SELECT * FROM schedule WHERE id = ?', [id]);
      if (!exists) return res.status(404).json({ error: 'Schedule entry not found' });

      runSql(db, 'DELETE FROM schedule WHERE id = ?', [id]);
      saveDb();
      broadcast('schedule_deleted', { id });
      res.json({ success: true, message: `Schedule entry ${id} deleted successfully.` });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // POST /api/rooms (for saving designed custom rooms)
  app.post('/api/rooms', async (req, res) => {
    try {
      const db = await getDb();
      const { id, name, type, capacity, floor, cam_id } = req.body;
      if (!id || !name || !type || !capacity || !floor) {
        return res.status(400).json({ error: 'id, name, type, capacity, floor are required' });
      }
      const dup = queryOne(db, 'SELECT * FROM rooms WHERE id = ?', [id]);
      if (dup) {
        runSql(db, 'UPDATE rooms SET name = ?, type = ?, capacity = ?, floor = ?, cam_id = ? WHERE id = ?',
          [name, type, capacity, floor, cam_id || `CAM-${id.toUpperCase()}`, id]);
      } else {
        runSql(db, 'INSERT INTO rooms (id, name, type, capacity, floor, cam_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [id, name, type, capacity, floor, cam_id || `CAM-${id.toUpperCase()}`, 'vacant']);
      }
      saveDb();
      const added = queryOne(db, 'SELECT * FROM rooms WHERE id = ?', [id]);
      broadcast('room_updated', added);
      res.json(added);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // GET /api/analytics/summary
  app.get('/api/analytics/summary', async (req, res) => {
    try {
      const db = await getDb();
      const totalRooms = queryOne(db, 'SELECT COUNT(*) AS cnt FROM rooms').cnt;
      const occupiedRooms = queryOne(db, "SELECT COUNT(*) AS cnt FROM rooms WHERE status = 'occupied'").cnt;
      const vacantRooms = queryOne(db, "SELECT COUNT(*) AS cnt FROM rooms WHERE status = 'vacant'").cnt;
      const totalProfessors = queryOne(db, 'SELECT COUNT(*) AS cnt FROM professors').cnt;
      const today = new Date().toISOString().split('T')[0];
      const todayAttendance = queryOne(db, `SELECT COUNT(DISTINCT professor_id) AS cnt FROM attendance_logs WHERE status = 'entry' AND timestamp >= ?`, [today+'T00:00:00.000Z']).cnt;
      const unread = queryOne(db, "SELECT COUNT(*) AS cnt FROM notifications WHERE read = 0").cnt;
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate()-7);
      const weeklyEntries = queryOne(db, `SELECT COUNT(*) AS cnt FROM attendance_logs WHERE status = 'entry' AND timestamp >= ?`, [weekAgo.toISOString()]).cnt;
      res.json({ totalRooms, occupiedRooms, vacantRooms, totalProfessors, todayAttendance, unreadNotifications:unread, weeklyEntries });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // GET /api/analytics/attendance-trend
  app.get('/api/analytics/attendance-trend', async (req, res) => {
    try {
      const db = await getDb();
      const days = [], now = new Date(), dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now); d.setDate(d.getDate()-i);
        const ds = d.toISOString().split('T')[0];
        const entries = queryOne(db, `SELECT COUNT(*) AS cnt FROM attendance_logs WHERE status = 'entry' AND timestamp >= ? AND timestamp < ?`, [ds+'T00:00:00.000Z', ds+'T23:59:59.999Z']).cnt;
        days.push({ date:ds, day:dayNames[d.getDay()], entries });
      }
      res.json(days);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // GET /api/analytics/room-utilization
  app.get('/api/analytics/room-utilization', async (req, res) => {
    try {
      const db = await getDb();
      const rooms = queryAll(db, 'SELECT id, name, type, capacity FROM rooms');
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate()-7);
      const util = rooms.map(r => {
        const cnt = queryOne(db, `SELECT COUNT(*) AS cnt FROM attendance_logs WHERE room_id = ? AND status = 'entry' AND timestamp >= ?`, [r.id, weekAgo.toISOString()]).cnt;
        return { room_id:r.id, room_name:r.name, room_type:r.type, capacity:r.capacity, totalEntries:cnt, usagePercent:Math.min(Math.round((cnt/10)*100),100) };
      });
      util.sort((a,b) => b.usagePercent - a.usagePercent);
      res.json(util);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // GET /api/notifications
  app.get('/api/notifications', async (req, res) => {
    try {
      const db = await getDb();
      const { limit = 20, unread_only } = req.query;
      const wc = unread_only === 'true' ? 'WHERE read = 0' : '';
      res.json(queryAll(db, `SELECT * FROM notifications ${wc} ORDER BY timestamp DESC LIMIT ?`, [parseInt(limit)]));
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // POST /api/notifications/read
  app.post('/api/notifications/read', async (req, res) => {
    try {
      const db = await getDb();
      const { ids } = req.body;
      if (ids && Array.isArray(ids) && ids.length > 0) {
        ids.forEach(id => runSql(db, 'UPDATE notifications SET read = 1 WHERE id = ?', [id]));
      } else {
        runSql(db, 'UPDATE notifications SET read = 1');
      }
      saveDb();
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.use('/api/*', (req, res) => res.status(404).json({ error: 'API endpoint not found' }));

  // ─── Start ────────────────────────────────────────────────────────────────────

  server.listen(PORT, () => {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  UniVision AI — Room Management Backend Server');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`  🚀  Server:     http://localhost:${PORT}`);
    console.log(`  📡  WebSocket:  ws://localhost:${PORT}/ws`);
    console.log(`  📁  Frontend:   ${path.join(__dirname, '..')}`);
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('  API endpoints:');
    console.log('    GET    /api/rooms');
    console.log('    PUT    /api/rooms/:id');
    console.log('    GET    /api/professors');
    console.log('    GET    /api/attendance');
    console.log('    POST   /api/attendance');
    console.log('    GET    /api/schedule');
    console.log('    GET    /api/analytics/summary');
    console.log('    GET    /api/analytics/attendance-trend');
    console.log('    GET    /api/analytics/room-utilization');
    console.log('    GET    /api/notifications');
    console.log('    POST   /api/notifications/read');
    console.log('');
  });
}

startServer().catch(err => {
  console.error('[FATAL] Failed to start server:', err);
  process.exit(1);
});
