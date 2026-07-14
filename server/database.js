const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'university_rooms.db');

let db = null;

async function getDb() {
  if (db) return db;
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }
  return db;
}

function saveDb() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

// Auto-save every 30 seconds
setInterval(saveDb, 30000);

// ─── Schema Creation ────────────────────────────────────────────────────────────

async function createTables() {
  const conn = await getDb();
  conn.run(`
    CREATE TABLE IF NOT EXISTS professors (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, department TEXT NOT NULL,
      course TEXT NOT NULL, initials TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL,
      capacity INTEGER NOT NULL, floor TEXT NOT NULL, cam_id TEXT,
      status TEXT NOT NULL DEFAULT 'vacant', occupant_id TEXT
    );
    CREATE TABLE IF NOT EXISTS attendance_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp TEXT NOT NULL,
      room_id TEXT NOT NULL, room_name TEXT NOT NULL,
      professor_id TEXT NOT NULL, professor_name TEXT NOT NULL,
      course TEXT, status TEXT NOT NULL, method TEXT
    );
    CREATE TABLE IF NOT EXISTS schedule (
      id INTEGER PRIMARY KEY AUTOINCREMENT, professor_id TEXT NOT NULL,
      room_id TEXT NOT NULL, day_of_week TEXT NOT NULL,
      start_time TEXT NOT NULL, end_time TEXT NOT NULL, course TEXT
    );
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp TEXT NOT NULL,
      type TEXT NOT NULL, title TEXT NOT NULL, message TEXT NOT NULL,
      read INTEGER NOT NULL DEFAULT 0
    );
  `);
  console.log('[DB] Tables created / verified.');
}

// ─── Seed Data ──────────────────────────────────────────────────────────────────



async function seedProfessors() {
  const conn = await getDb();
  const result = conn.exec('SELECT COUNT(*) as cnt FROM professors');
  if (result.length > 0 && result[0].values[0][0] > 0) return;

  const professors = [
    { id:'P-001', name:'Dr. Sarah Jenkins',   department:'Computer Science',     course:'Advanced Algorithms',           initials:'SJ' },
    { id:'P-002', name:'Prof. Alan Mitchell',  department:'Mathematics',          course:'Linear Algebra II',             initials:'AM' },
    { id:'P-003', name:'Dr. Ada Sterling',     department:'Software Engineering', course:'Systems Architecture',          initials:'AS' },
    { id:'P-004', name:'Prof. Charles Okafor', department:'Physics',              course:'Quantum Mechanics',             initials:'CO' },
    { id:'P-005', name:'Dr. Marie Laurent',    department:'Chemistry',            course:'Organic Chemistry Lab',         initials:'ML' },
    { id:'P-006', name:'Prof. James Watson',   department:'Biology',              course:'Molecular Biology',             initials:'JW' },
    { id:'P-007', name:'Dr. Elena Rodriguez',  department:'Data Science',         course:'Machine Learning Fundamentals', initials:'ER' },
    { id:'P-008', name:'Prof. David Chen',     department:'Electrical Eng.',      course:'Digital Signal Processing',     initials:'DC' }
  ];

  const stmt = conn.prepare('INSERT INTO professors (id,name,department,course,initials) VALUES (?,?,?,?,?)');
  professors.forEach(p => { stmt.run([p.id, p.name, p.department, p.course, p.initials]); });
  stmt.free();
  console.log('[DB] Seeded 8 professors.');
}

async function seedRooms() {
  const conn = await getDb();
  const result = conn.exec('SELECT COUNT(*) as cnt FROM rooms');
  if (result.length > 0 && result[0].values[0][0] > 0) return;

  const rooms = [
    { id:'reception',      name:'Reception Hall',     type:'Lobby',            capacity:60,  floor:'GF', cam_id:'CAM-001' },
    { id:'lecture-a',      name:'Lecture Hall A',      type:'Auditorium',       capacity:250, floor:'GF', cam_id:'CAM-002' },
    { id:'lecture-b',      name:'Lecture Hall B',      type:'Auditorium',       capacity:200, floor:'GF', cam_id:'CAM-003' },
    { id:'staff-lounge',   name:'Staff Lounge',        type:'Faculty Area',     capacity:30,  floor:'GF', cam_id:'CAM-004' },
    { id:'turing-101',     name:'Turing Lab 101',      type:'Computer Lab',     capacity:60,  floor:'1F', cam_id:'CAM-101' },
    { id:'newton-102',     name:'Newton Lab 102',      type:'Physics Lab',      capacity:45,  floor:'1F', cam_id:'CAM-102' },
    { id:'seminar-103',    name:'Seminar Room 103',    type:'Seminar Hall',     capacity:35,  floor:'1F', cam_id:'CAM-103' },
    { id:'darwin-104',     name:'Darwin Room 104',     type:'Tutorial Room',    capacity:25,  floor:'1F', cam_id:'CAM-104' },
    { id:'hawking-201',    name:'Hawking Room 201',    type:'Research Lab',     capacity:30,  floor:'2F', cam_id:'CAM-201' },
    { id:'einstein-202',   name:'Einstein Lab 202',    type:'Advanced Physics', capacity:40,  floor:'2F', cam_id:'CAM-202' },
    { id:'curie-203',      name:'Curie Lab 203',       type:'Chemistry Lab',    capacity:35,  floor:'2F', cam_id:'CAM-203' },
    { id:'conference-204', name:'Conference Room 204', type:'Board Room',       capacity:20,  floor:'2F', cam_id:'CAM-204' },
    { id:'biz-lobby',      name:'Business Lobby',      type:'Lobby',            capacity:60,  floor:'GF', cam_id:'CAM-301' },
    { id:'auditorium-c',   name:'Auditorium C',        type:'Auditorium',       capacity:150, floor:'GF', cam_id:'CAM-302' },
    { id:'seminar-301',    name:'Seminar 301',         type:'Classroom',        capacity:35,  floor:'1F', cam_id:'CAM-303' },
    { id:'finance-lab',    name:'Finance Trading Lab', type:'Trading Lab',      capacity:45,  floor:'1F', cam_id:'CAM-304' },
    { id:'courtroom',      name:'Practice Courtroom',  type:'Moot Court',       capacity:40,  floor:'2F', cam_id:'CAM-305' },
    { id:'history-room',   name:'History Study Hall',  type:'Study Room',       capacity:25,  floor:'2F', cam_id:'CAM-306' }
  ];

  const stmt = conn.prepare('INSERT INTO rooms (id,name,type,capacity,floor,cam_id) VALUES (?,?,?,?,?,?)');
  rooms.forEach(r => { stmt.run([r.id, r.name, r.type, r.capacity, r.floor, r.cam_id]); });
  stmt.free();
  console.log('[DB] Seeded 18 rooms.');
}

async function seedSchedule() {
  const conn = await getDb();
  const result = conn.exec('SELECT COUNT(*) as cnt FROM schedule');
  if (result.length > 0 && result[0].values[0][0] > 0) return;

  const schedule = [
    { pid:'P-001', rid:'turing-101',  day:'Saturday',  st:'8.0',  et:'9.5',  c:'Advanced Algorithms' },
    { pid:'P-001', rid:'turing-101',  day:'Monday',    st:'8.0',  et:'9.5',  c:'Advanced Algorithms' },
    { pid:'P-001', rid:'seminar-103', day:'Wednesday', st:'14.0', et:'15.5', c:'Data Structures Workshop' },
    { pid:'P-002', rid:'lecture-a',   day:'Sunday',    st:'8.0',  et:'9.5',  c:'Linear Algebra II' },
    { pid:'P-002', rid:'lecture-a',   day:'Tuesday',   st:'8.0',  et:'9.5',  c:'Linear Algebra II' },
    { pid:'P-003', rid:'turing-101',  day:'Sunday',    st:'11.0', et:'12.5', c:'Systems Architecture' },
    { pid:'P-003', rid:'darwin-104',  day:'Tuesday',   st:'14.0', et:'15.5', c:'Software Design Patterns' },
    { pid:'P-004', rid:'einstein-202',day:'Saturday',  st:'12.5', et:'14.0', c:'Quantum Mechanics' },
    { pid:'P-004', rid:'einstein-202',day:'Monday',    st:'12.5', et:'14.0', c:'Quantum Mechanics' },
    { pid:'P-004', rid:'newton-102',  day:'Thursday',  st:'9.5',  et:'11.0', c:'Classical Mechanics' },
    { pid:'P-005', rid:'curie-203',   day:'Saturday',  st:'9.5',  et:'11.0', c:'Organic Chemistry Lab' },
    { pid:'P-005', rid:'curie-203',   day:'Tuesday',   st:'9.5',  et:'11.0', c:'Organic Chemistry Lab' },
    { pid:'P-006', rid:'hawking-201', day:'Sunday',    st:'14.0', et:'15.5', c:'Molecular Biology' },
    { pid:'P-006', rid:'hawking-201', day:'Thursday',  st:'11.0', et:'12.5', c:'Genetics Seminar' },
    { pid:'P-007', rid:'turing-101',  day:'Saturday',  st:'14.0', et:'15.5', c:'Machine Learning Fundamentals' },
    { pid:'P-007', rid:'lecture-b',   day:'Monday',    st:'11.0', et:'12.5', c:'Statistical Learning' },
    { pid:'P-008', rid:'newton-102',  day:'Sunday',    st:'9.5',  et:'11.0', c:'Digital Signal Processing' },
    { pid:'P-008', rid:'seminar-103', day:'Tuesday',   st:'11.0', et:'12.5', c:'Embedded Systems' }
  ];

  const stmt = conn.prepare('INSERT INTO schedule (professor_id,room_id,day_of_week,start_time,end_time,course) VALUES (?,?,?,?,?,?)');
  schedule.forEach(s => { stmt.run([s.pid, s.rid, s.day, s.st, s.et, s.c]); });
  stmt.free();
  console.log(`[DB] Seeded ${schedule.length} schedule entries.`);
}

async function seedAttendanceLogs() {
  const conn = await getDb();
  const result = conn.exec('SELECT COUNT(*) as cnt FROM attendance_logs');
  if (result.length > 0 && result[0].values[0][0] > 0) return;

  const profs = conn.exec('SELECT * FROM professors');
  const rooms = conn.exec('SELECT * FROM rooms');
  if (!profs.length || !rooms.length) return;

  const profRows = profs[0].values;
  const roomRows = rooms[0].values;
  const methods = ['face_recognition','manual','card_scan','qr_code'];
  const now = new Date();

  const stmt = conn.prepare('INSERT INTO attendance_logs (timestamp,room_id,room_name,professor_id,professor_name,course,status,method) VALUES (?,?,?,?,?,?,?,?)');

  for (let dayOff = 6; dayOff >= 0; dayOff--) {
    const date = new Date(now); date.setDate(date.getDate() - dayOff);
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    for (const prof of profRows) {
      const sessions = 1 + Math.floor(Math.random() * 2);
      for (let s = 0; s < sessions; s++) {
        const room = roomRows[Math.floor(Math.random() * roomRows.length)];
        const method = methods[Math.floor(Math.random() * methods.length)];
        const hr = 8 + Math.floor(Math.random() * 8);
        const mn = Math.floor(Math.random() * 60);
        const entry = new Date(date); entry.setHours(hr, mn, 0, 0);
        const exit = new Date(entry); exit.setHours(hr + 1 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60));
        stmt.run([entry.toISOString(), room[0], room[1], prof[0], prof[1], prof[3], 'entry', method]);
        stmt.run([exit.toISOString(), room[0], room[1], prof[0], prof[1], prof[3], 'exit', method]);
      }
    }
  }
  stmt.free();
  saveDb();
  console.log('[DB] Seeded attendance log entries.');
}

async function seedNotifications() {
  const conn = await getDb();
  const result = conn.exec('SELECT COUNT(*) as cnt FROM notifications');
  if (result.length > 0 && result[0].values[0][0] > 0) return;

  const now = new Date();
  const notifs = [
    { ts: new Date(now.getTime()-30*60000).toISOString(), type:'alert',   title:'Unauthorized Access Attempt', msg:'Unknown individual detected near Computer Lab 1.' },
    { ts: new Date(now.getTime()-2*3600000).toISOString(), type:'info',   title:'System Update',               msg:'Face recognition model updated to v2.4.' },
    { ts: new Date(now.getTime()-5*3600000).toISOString(), type:'warning', title:'Camera Offline',              msg:'Camera CAM-08 (Physics Lab) offline for 15 minutes.' },
    { ts: new Date(now.getTime()-24*3600000).toISOString(), type:'success', title:'Daily Report Generated',     msg:'Yesterday\'s attendance report is available.' },
  ];

  const stmt = conn.prepare('INSERT INTO notifications (timestamp,type,title,message) VALUES (?,?,?,?)');
  notifs.forEach(n => { stmt.run([n.ts, n.type, n.title, n.msg]); });
  stmt.free();
  console.log('[DB] Seeded notifications.');
}

// ─── Initialize ─────────────────────────────────────────────────────────────────

async function initialize() {
  await createTables();
  await seedProfessors();
  await seedRooms();
  await seedSchedule();
  await seedAttendanceLogs();
  await seedNotifications();
  saveDb();
  console.log('[DB] Database initialization complete.');
}

module.exports = { getDb, initialize, saveDb };
