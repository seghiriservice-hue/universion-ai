/* ===================================================================
   UniVision AI — Smart University Room Management System
   Core Application Logic v2.0
   Features: Camera Engine, Schedule, Analytics, Notifications, Sound
   =================================================================== */

// ======================= DATA MODELS =======================

const AVATAR_COLORS = ['#0ea5e9','#8b5cf6','#ef4444','#f59e0b','#10b981','#ec4899','#6366f1','#14b8a6'];

const PROFESSORS = [
  { id:'P-001', name:'Dr. Sarah Jenkins',   dept:'Computer Science',     course:'Advanced Algorithms',           initials:'SJ', color: AVATAR_COLORS[0], avatar:'assets/prof-sarah-jenkins.png' },
  { id:'P-002', name:'Prof. Alan Mitchell',  dept:'Mathematics',          course:'Linear Algebra II',             initials:'AM', color: AVATAR_COLORS[1], avatar:'assets/prof-alan-mitchell.png' },
  { id:'P-003', name:'Dr. Ada Sterling',     dept:'Software Engineering', course:'Systems Architecture',          initials:'AS', color: AVATAR_COLORS[2], avatar:'assets/prof-ada-sterling.png' },
  { id:'P-004', name:'Prof. Charles Okafor', dept:'Physics',              course:'Quantum Mechanics',             initials:'CO', color: AVATAR_COLORS[3], avatar:'assets/prof-charles-okafor.png' },
  { id:'P-005', name:'Dr. Marie Laurent',    dept:'Chemistry',            course:'Organic Chemistry Lab',         initials:'ML', color: AVATAR_COLORS[4], avatar:'assets/prof-marie-laurent.png' },
  { id:'P-006', name:'Prof. James Watson',   dept:'Biology',              course:'Molecular Biology',             initials:'JW', color: AVATAR_COLORS[5], avatar:'assets/prof-james-watson.png' },
  { id:'P-007', name:'Dr. Elena Rodriguez',  dept:'Data Science',         course:'Machine Learning Fundamentals', initials:'ER', color: AVATAR_COLORS[6], avatar:'assets/prof-elena-rodriguez.png' },
  { id:'P-008', name:'Prof. David Chen',     dept:'Electrical Eng.',      course:'Digital Signal Processing',     initials:'DC', color: AVATAR_COLORS[7], avatar:'assets/prof-david-chen.png' },
];

const ROOMS_DATA = [
  { id:'reception',      name:'Reception Hall',     type:'Lobby',            capacity:null, floor:'GF', camId:'CAM-001' },
  { id:'lecture-a',      name:'Lecture Hall A',      type:'Auditorium',       capacity:250,  floor:'GF', camId:'CAM-002' },
  { id:'lecture-b',      name:'Lecture Hall B',      type:'Auditorium',       capacity:200,  floor:'GF', camId:'CAM-003' },
  { id:'staff-lounge',   name:'Staff Lounge',        type:'Faculty Area',     capacity:30,   floor:'GF', camId:'CAM-004' },
  { id:'turing-101',     name:'Turing Lab 101',      type:'Computer Lab',     capacity:60,   floor:'1F', camId:'CAM-101' },
  { id:'newton-102',     name:'Newton Lab 102',      type:'Physics Lab',      capacity:45,   floor:'1F', camId:'CAM-102' },
  { id:'seminar-103',    name:'Seminar Room 103',    type:'Seminar Hall',     capacity:35,   floor:'1F', camId:'CAM-103' },
  { id:'darwin-104',     name:'Darwin Room 104',     type:'Tutorial Room',    capacity:25,   floor:'1F', camId:'CAM-104' },
  { id:'hawking-201',    name:'Hawking Room 201',    type:'Research Lab',     capacity:30,   floor:'2F', camId:'CAM-201' },
  { id:'einstein-202',   name:'Einstein Lab 202',    type:'Advanced Physics', capacity:40,   floor:'2F', camId:'CAM-202' },
  { id:'curie-203',      name:'Curie Lab 203',       type:'Chemistry Lab',    capacity:35,   floor:'2F', camId:'CAM-203' },
  { id:'conference-204', name:'Conference Room 204', type:'Board Room',       capacity:20,   floor:'2F', camId:'CAM-204' },
];

const BIZ_ROOMS = [
  { id: 'biz-lobby', name: 'Business Lobby', type: 'Lobby', capacity: 60, floor: 'GF', camId: 'CAM-301' },
  { id: 'auditorium-c', name: 'Auditorium C', type: 'Auditorium', capacity: 150, floor: 'GF', camId: 'CAM-302' },
  { id: 'seminar-301', name: 'Seminar 301', type: 'Classroom', capacity: 35, floor: '1F', camId: 'CAM-303' },
  { id: 'finance-lab', name: 'Finance Trading Lab', type: 'Trading Lab', capacity: 45, floor: '1F', camId: 'CAM-304' },
  { id: 'courtroom', name: 'Practice Courtroom', type: 'Moot Court', capacity: 40, floor: '2F', camId: 'CAM-305' },
  { id: 'history-room', name: 'History Study Hall', type: 'Study Room', capacity: 25, floor: '2F', camId: 'CAM-306' }
];

BIZ_ROOMS.forEach(r => {
  if (!ROOMS_DATA.some(existing => existing.id === r.id)) {
    ROOMS_DATA.push(r);
  }
});

const CAMERA_FEED_MAP = [
  { canvasId:'cam-1', feedId:'cam-feed-1', roomId:'turing-101' },
  { canvasId:'cam-2', feedId:'cam-feed-2', roomId:'newton-102' },
  { canvasId:'cam-3', feedId:'cam-feed-3', roomId:'hawking-201' },
  { canvasId:'cam-4', feedId:'cam-feed-4', roomId:'lecture-a' },
];

// Weekly schedule: day (0=Mon..4=Fri), startHour, endHour
// Weekly schedule: day (0=Sat..5=Thu), startHour, endHour
const SCHEDULE_DATA = [
  { profId:'P-001', roomId:'turing-101',   day:0, start:8.0,  end:9.5,  course:'Advanced Algorithms' },
  { profId:'P-001', roomId:'turing-101',   day:2, start:8.0,  end:9.5,  course:'Advanced Algorithms' },
  { profId:'P-001', roomId:'seminar-103',  day:4, start:14.0, end:15.5, course:'Data Structures Workshop' },
  { profId:'P-002', roomId:'lecture-a',    day:1, start:8.0,  end:9.5,  course:'Linear Algebra II' },
  { profId:'P-002', roomId:'lecture-a',    day:3, start:8.0,  end:9.5,  course:'Linear Algebra II' },
  { profId:'P-003', roomId:'turing-101',   day:1, start:11.0, end:12.5, course:'Systems Architecture' },
  { profId:'P-003', roomId:'darwin-104',   day:3, start:14.0, end:15.5, course:'Software Design Patterns' },
  { profId:'P-004', roomId:'einstein-202', day:0, start:12.5, end:14.0, course:'Quantum Mechanics' },
  { profId:'P-004', roomId:'einstein-202', day:2, start:12.5, end:14.0, course:'Quantum Mechanics' },
  { profId:'P-004', roomId:'newton-102',   day:5, start:9.5,  end:11.0, course:'Classical Mechanics' },
  { profId:'P-005', roomId:'curie-203',    day:0, start:9.5,  end:11.0, course:'Organic Chemistry Lab' },
  { profId:'P-005', roomId:'curie-203',    day:3, start:9.5,  end:11.0, course:'Organic Chemistry Lab' },
  { profId:'P-006', roomId:'hawking-201',  day:1, start:14.0, end:15.5, course:'Molecular Biology' },
  { profId:'P-006', roomId:'hawking-201',  day:5, start:11.0, end:12.5, course:'Genetics Seminar' },
  { profId:'P-007', roomId:'turing-101',   day:0, start:14.0, end:15.5, course:'Machine Learning Fundamentals' },
  { profId:'P-007', roomId:'lecture-b',    day:2, start:11.0, end:12.5, course:'Statistical Learning' },
  { profId:'P-008', roomId:'newton-102',   day:1, start:9.5,  end:11.0, course:'Digital Signal Processing' },
  { profId:'P-008', roomId:'seminar-103',  day:3, start:11.0, end:12.5, course:'Embedded Systems' },
];

const DAY_NAMES = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
const DAY_SHORT = ['SAT', 'SUN', 'MON', 'TUE', 'WED', 'THU'];
const TIME_SLOTS = [
  { start: 8.0,  end: 9.5,  label: '08:00 - 09:30' },
  { start: 9.5,  end: 11.0, label: '09:30 - 11:00' },
  { start: 11.0, end: 12.5, label: '11:00 - 12:30' },
  { start: 12.5, end: 14.0, label: '12:30 - 14:00' },
  { start: 14.0, end: 15.5, label: '14:00 - 15:30' },
  { start: 15.5, end: 17.0, label: '15:30 - 17:00' }
];

// ======================= APPLICATION STATE =======================

const TRANSLATIONS = {
  en: {
    system_online: "System Online",
    tab_kiosk: "Entrance Map",
    tab_admin: "Dashboard",
    tab_schedule: "Schedule",
    tab_analytics: "Analytics",
    notifications: "Notifications",
    mark_all_read: "Mark all read",
    no_notifications: "No notifications yet",
    stat_total_rooms: "Total Rooms",
    stat_occupied: "Occupied",
    stat_vacant: "Vacant",
    stat_active_classes: "Active Classes",
    stat_professors_detected: "Professors Detected",
    kiosk_title: "Science & Engineering Wing — Live Room Status",
    search_placeholder: "Search professor or room…",
    ground_floor: "Ground Floor — Main Wing",
    first_floor: "First Floor — Computer Science Wing",
    second_floor: "Second Floor — Research Wing",
    live_camera_feeds: "Live Camera Feeds",
    attendance_database: "Attendance Database",
    system_event_log: "System Event Log",
    weekly_class_schedule: "Weekly Class Schedule — Timetable & Attendance",
    performance_analytics: "Performance Analytics — Insights & Trends",
    sim_controls: "Simulation Controls",
    sim_target: "Select Target",
    sim_professor: "Professor",
    sim_room: "Room",
    sim_actions: "Actions",
    sim_enter: "Simulate Entry",
    sim_exit: "Simulate Exit",
    sim_security: "Security",
    sim_unknown: "Unrecognized Person",
    sim_management: "Management",
    sim_add_prof: "Add New Professor",
    sim_quick_actions: "Quick Actions",
    sim_reset: "Reset All Rooms",
    sim_demo: "Run Full Demo",
    add_prof_title: "Register New Professor",
    prof_name: "Full Name *",
    prof_dept: "Department *",
    prof_course: "Primary Course *",
    prof_photo: "Photo (optional)",
    btn_cancel: "Cancel",
    btn_register: "Register Professor",
    th_timestamp: "Timestamp",
    th_room: "Room",
    th_professor: "Professor",
    th_course: "Course",
    th_status: "Status",
    th_method: "Method",
    
    // Blueprint i18n
    show_free: "🟢 Show Free Only",
    view_grid: "Cards",
    view_blueprint: "Blueprint",
    gf_blue: "Ground Floor — Blueprint",
    "1f_blue": "First Floor — Blueprint",
    "2f_blue": "Second Floor — Blueprint",
    svg_free: "Free",
    svg_occupied: "Occupied",
    svg_alert: "Alert",

    // Schedule Class i18n
    add_class_title: "Schedule New Class",
    class_course: "Course Name *",
    class_professor: "Professor *",
    class_room: "Room *",
    class_day: "Day *",
    class_start: "Start Time *",
    class_duration: "Duration *",
    btn_submit_class: "Schedule Class"
  },
  ar: {
    system_online: "النظام متصل",
    tab_kiosk: "خريطة المدخل",
    tab_admin: "لوحة التحكم",
    tab_schedule: "الجدول الدراسي",
    tab_analytics: "التحليلات",
    notifications: "الإشعارات",
    mark_all_read: "تحديد الكل كمقروء",
    no_notifications: "لا توجد إشعارات بعد",
    stat_total_rooms: "إجمالي القاعات",
    stat_occupied: "مشغولة",
    stat_vacant: "شاغرة",
    stat_active_classes: "المحاضرات النشطة",
    stat_professors_detected: "الأساتذة المتواجدون",
    kiosk_title: "جناح العلوم والهندسة — حالة القاعات المباشرة",
    search_placeholder: "ابحث عن أستاذ أو قاعة...",
    ground_floor: "الطابق الأرضي — الجناح الرئيسي",
    first_floor: "الطابق الأول — جناح علوم الحاسب",
    second_floor: "الطابق الثاني — جناح الأبحاث",
    live_camera_feeds: "بث الكاميرات الحي",
    attendance_database: "قاعدة بيانات الحضور",
    system_event_log: "سجل أحداث النظام",
    weekly_class_schedule: "الجدول الدراسي الأسبوعي — المواعيد والحضور",
    performance_analytics: "تحليلات الأداء — الرؤى والاتجاهات",
    sim_controls: "عناصر التحكم بالمحاكاة",
    sim_target: "حدد الهدف",
    sim_professor: "الأستاذ",
    sim_room: "القاعة",
    sim_actions: "الإجراءات",
    sim_enter: "محاكاة دخول الأستاذ",
    sim_exit: "محاكاة خروج الأستاذ",
    sim_security: "الأمن",
    sim_unknown: "شخص غير معروف",
    sim_management: "الإدارة",
    sim_add_prof: "إضافة أستاذ جديد",
    sim_quick_actions: "إجراءات سريعة",
    sim_reset: "إعادة ضبط جميع القاعات",
    sim_demo: "تشغيل العرض الكامل",
    add_prof_title: "تسجيل أستاذ جديد",
    prof_name: "الاسم الكامل *",
    prof_dept: "القسم *",
    prof_course: "المادة الأساسية *",
    prof_photo: "الصورة (اختياري)",
    btn_cancel: "إلغاء",
    btn_register: "تسجيل الأستاذ",
    th_timestamp: "الوقت والتاريخ",
    th_room: "القاعة",
    th_professor: "الأستاذ",
    th_course: "المادة",
    th_status: "الحالة",
    th_method: "الطريقة",
    
    // Blueprint i18n
    show_free: "🟢 إظهار الشاغرة فقط",
    view_grid: "بطاقات",
    view_blueprint: "مخطط",
    gf_blue: "الطابق الأرضي — مخطط الكلية",
    "1f_blue": "الطابق الأول — مخطط الكلية",
    "2f_blue": "الطابق الثاني — مخطط الكلية",
    svg_free: "شاغرة",
    svg_occupied: "مشغولة",
    svg_alert: "تنبيه",

    // Schedule Class i18n
    add_class_title: "جدولة محاضرة جديدة",
    class_course: "اسم المحاضرة / المادة *",
    class_professor: "الأستاذ *",
    class_room: "القاعة *",
    class_day: "اليوم *",
    class_start: "وقت البدء *",
    class_duration: "المدة *",
    btn_submit_class: "جدولة المحاضرة"
  }
};

const state = {
  rooms: {},
  attendanceLogs: [],
  detectedProfessors: new Set(),
  notifications: [],
  unreadCount: 0,
  activeView: 'kiosk',
  simPanelOpen: false,
  analyticsData: { trend:[], roomUtil:[], punctuality:{onTime:0,late:0,absent:0} },
  currentLang: 'en',
  customRooms: [],
};

const API_URL = 'http://localhost:3000/api';

async function apiFetch(path, options = {}) {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`[API Connection Failed] ${path}:`, err.message);
    throw err;
  }
}

async function initDataFromBackend() {
  try {
    // Attempt to load from sqlite backend API
    const roomsList = await apiFetch('/rooms');
    const profsList = await apiFetch('/professors');
    const scheduleList = await apiFetch('/schedule');
    const notificationsList = await apiFetch('/notifications');
    const attendanceResult = await apiFetch('/attendance?limit=50');
    
    // Map backend rooms to state.rooms
    roomsList.forEach(r => {
      const staticRoom = ROOMS_DATA.find(sr => sr.id === r.id);
      state.rooms[r.id] = {
        id: r.id,
        name: r.name,
        type: staticRoom ? staticRoom.type : r.type,
        capacity: staticRoom ? staticRoom.capacity : r.capacity,
        floor: staticRoom ? staticRoom.floor : r.floor,
        camId: staticRoom ? staticRoom.camId : (r.cam_id || `CAM-${r.id.toUpperCase()}`),
        status: r.status || 'vacant',
        occupant: r.occupant_id ? PROFESSORS.find(p => p.id === r.occupant_id) : null,
        className: r.occupant_course || null,
        detectionActive: r.status === 'occupied' || r.status === 'alert',
        alertPerson: r.status === 'alert'
      };
    });

    // Merge backend professors list into PROFESSORS list if custom
    profsList.forEach(p => {
      if (!PROFESSORS.some(existing => existing.id === p.id)) {
        const initials = p.initials || p.name.split(' ').map(n => n[0]).join('').toUpperCase();
        PROFESSORS.push({
          id: p.id,
          name: p.name,
          dept: p.department,
          course: p.course,
          initials: initials,
          color: AVATAR_COLORS[PROFESSORS.length % AVATAR_COLORS.length],
          avatar: `assets/prof-${p.name.toLowerCase().replace(/[^a-z]/g, '-')}.png`,
          isCustom: true
        });
      }
    });

    // Merge backend schedule into SCHEDULE_DATA
    SCHEDULE_DATA.length = 0; // Clear frontend defaults to load DB entries
    scheduleList.forEach(s => {
      const dayMap = { 'Saturday': 0, 'Sunday': 1, 'Monday': 2, 'Tuesday': 3, 'Wednesday': 4, 'Thursday': 5 };
      const dayIdx = dayMap[s.day_of_week] !== undefined ? dayMap[s.day_of_week] : 0;
      SCHEDULE_DATA.push({
        id: s.id,
        profId: s.professor_id,
        roomId: s.room_id,
        day: dayIdx,
        start: parseFloat(s.start_time),
        end: parseFloat(s.end_time),
        course: s.course,
        isCustom: true
      });
    });

    // Load attendance logs
    state.attendanceLogs = attendanceResult.data.map(log => {
      return {
        timestamp: new Date(log.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        room: log.room_name,
        professor: log.professor_name,
        course: log.course || '—',
        status: log.status === 'entry' ? 'Present' : 'Departed',
        method: log.method || 'Auto-Logged'
      };
    });

    // Load notifications
    state.notifications = notificationsList.map(n => {
      return {
        type: n.type,
        title: n.title,
        message: n.message,
        time: new Date(n.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        read: n.read === 1
      };
    });
    state.unreadCount = state.notifications.filter(n => !n.read).length;

    // Refresh UI elements
    renderKioskCards();
    renderKioskBlueprint();
    populateSimulationRooms();
    renderNotifications();
    renderProfessorsList();
    renderSchedule();
    updateStats();

    // Populate selectors in UI forms
    DOM.simProfessor.innerHTML = PROFESSORS.map(p => `<option value="${p.id}">${p.name} — ${p.dept}</option>`).join('');
    const classProfSelect = document.getElementById('class-professor');
    if (classProfSelect) {
      classProfSelect.innerHTML = PROFESSORS.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    }

    addLog('system', 'Database sync completed successfully.');
  } catch (err) {
    state.isOfflineMode = true;
    addLog('system', 'Database connection failed. Running in Offline Mode (LocalStorage fallback).');
    showToast('warning', 'Database Offline', 'Connected in offline fallback mode.');
  }
}

ROOMS_DATA.forEach(r => {
  state.rooms[r.id] = { ...r, status:'vacant', occupant:null, className:null, detectionActive:false, alertPerson:false };
});

// Generate mock analytics data
(function generateMockAnalytics() {
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  state.analyticsData.trend = days.map(d => ({ day:d, count: Math.floor(Math.random()*25)+10 }));
  state.analyticsData.roomUtil = ROOMS_DATA.slice(0,8).map(r => ({ room:r.name.split(' ')[0], pct: Math.floor(Math.random()*60)+20 }));
  state.analyticsData.punctuality = { onTime:62, late:23, absent:15 };
})();

// ======================= DOM REFERENCES =======================

const DOM = {
  clock: document.getElementById('system-clock'),
  statTotal: document.getElementById('stat-total'),
  statOccupied: document.getElementById('stat-occupied'),
  statVacant: document.getElementById('stat-vacant'),
  statClasses: document.getElementById('stat-classes'),
  statProfessors: document.getElementById('stat-professors'),
  kioskView: document.getElementById('kiosk-view'),
  adminView: document.getElementById('admin-view'),
  scheduleView: document.getElementById('schedule-view'),
  analyticsView: document.getElementById('analytics-view'),
  mapSearch: document.getElementById('map-search'),
  attendanceBody: document.getElementById('attendance-body'),
  dbEmpty: document.getElementById('db-empty'),
  systemLog: document.getElementById('system-log'),
  recordsBadge: document.getElementById('records-badge'),
  simPanel: document.getElementById('sim-panel'),
  simToggle: document.getElementById('sim-toggle'),
  simProfessor: document.getElementById('sim-professor'),
  simRoom: document.getElementById('sim-room'),
  btnEnter: document.getElementById('btn-sim-enter'),
  btnExit: document.getElementById('btn-sim-exit'),
  btnUnknown: document.getElementById('btn-sim-unknown'),
  btnReset: document.getElementById('btn-sim-reset'),
  btnDemo: document.getElementById('btn-sim-demo'),
  roomModal: document.getElementById('room-modal'),
  modalRoomName: document.getElementById('modal-room-name'),
  modalBody: document.getElementById('modal-body'),
  modalClose: document.getElementById('modal-close'),
  viewTabs: document.querySelectorAll('.view-tab'),
  camClocks: document.querySelectorAll('.cam-clock'),
  toastContainer: document.getElementById('toast-container'),
  notifBell: document.getElementById('notif-bell'),
  notifCount: document.getElementById('notif-count'),
  notifDropdown: document.getElementById('notif-dropdown'),
  notifList: document.getElementById('notif-list'),
  notifEmpty: document.getElementById('notif-empty'),
  notifMarkRead: document.getElementById('notif-mark-read'),
  scheduleGrid: document.getElementById('schedule-grid'),
  scheduleDayNav: document.getElementById('schedule-day-nav'),
  analyticsSummary: document.getElementById('analytics-summary'),
  professorsView: document.getElementById('professors-view'),
  professorsListGrid: document.getElementById('professors-list-grid'),
  btnTheme: document.getElementById('btn-theme'),
  themeDropdown: document.getElementById('theme-dropdown'),
  btnLang: document.getElementById('btn-lang'),
  langDropdown: document.getElementById('lang-dropdown'),
  btnAddProf: document.getElementById('btn-add-prof'),
  btnSimAddProf: document.getElementById('btn-sim-add-prof'),
  addProfModal: document.getElementById('add-prof-modal'),
  addProfClose: document.getElementById('add-prof-close'),
  addProfCancel: document.getElementById('add-prof-cancel'),
  addProfForm: document.getElementById('add-prof-form'),
  profName: document.getElementById('prof-name'),
  profDept: document.getElementById('prof-dept'),
  profCourse: document.getElementById('prof-course'),
  profPhoto: document.getElementById('prof-photo'),
  profPhotoPreview: document.getElementById('prof-photo-preview'),
  
  // Kiosk Layout Map Toggles & Filters
  btnKioskGrid: document.getElementById('btn-kiosk-grid'),
  btnKioskMap: document.getElementById('btn-kiosk-map'),
  kioskCardsContainer: document.getElementById('floor-plan-cards-container'),
  kioskBlueprintContainer: document.getElementById('kiosk-blueprint-container'),
  checkboxFilterFree: document.getElementById('checkbox-filter-free'),
  selectKioskDept: document.getElementById('select-kiosk-dept'),
  
  // Class Scheduler Elements
  btnAddClass: document.getElementById('btn-add-class'),
  addClassModal: document.getElementById('add-class-modal'),
  addClassClose: document.getElementById('add-class-close'),
  addClassCancel: document.getElementById('add-class-cancel'),
  addClassForm: document.getElementById('add-class-form'),
  classCourse: document.getElementById('class-course'),
  classProfessor: document.getElementById('class-professor'),
  classRoom: document.getElementById('class-room'),
  classDay: document.getElementById('class-day'),
  classStart: document.getElementById('class-start'),
  classDuration: document.getElementById('class-duration'),
};

// ======================= SOUND ENGINE =======================

const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function playSound(type) {
  try {
    if (!audioCtx) audioCtx = new AudioCtx();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    gain.gain.value = 0.08;

    if (type === 'success') { osc.frequency.value = 880; osc.type = 'sine'; }
    else if (type === 'alert') { osc.frequency.value = 440; osc.type = 'square'; }
    else if (type === 'warning') { osc.frequency.value = 330; osc.type = 'triangle'; }
    else { osc.frequency.value = 660; osc.type = 'sine'; }

    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    osc.stop(audioCtx.currentTime + 0.3);
  } catch(e) { /* Audio not available */ }
}

// ======================= CLOCK =======================

function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
  const date = now.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short', year:'numeric' });
  DOM.clock.innerHTML = `<span class="clock-date">${date}</span> ${time}`;
  document.querySelectorAll('.cam-clock').forEach(el => { el.textContent = time; });
}
setInterval(updateClock, 1000);
updateClock();

// ======================= VIEW SWITCHING =======================

const VIEWS = { kiosk:'kiosk-view', admin:'admin-view', schedule:'schedule-view', analytics:'analytics-view', professors:'professors-view', designer:'designer-view' };

DOM.viewTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const view = tab.dataset.view;
    if (view === state.activeView) return;
    state.activeView = view;
    DOM.viewTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    Object.entries(VIEWS).forEach(([k,id]) => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('active', k === view);
    });
    if (view === 'admin') initCameraCanvases();
    if (view === 'schedule') renderSchedule();
    if (view === 'analytics') renderAnalytics();
    if (view === 'professors') renderProfessorsList();
    if (view === 'designer') renderDesignerWorkspace();
  });
});

// ======================= DEPARTMENTS AND DYNAMIC MAPS =======================

const DEPARTMENTS = {
  science: {
    name: "Science & Engineering Wing",
    nameAr: "جناح العلوم والهندسة",
    roomIds: ['reception', 'lecture-a', 'lecture-b', 'staff-lounge', 'turing-101', 'newton-102', 'seminar-103', 'darwin-104', 'hawking-201', 'einstein-202', 'curie-203', 'conference-204'],
    blueprint: `
          <!-- GF Blueprint -->
          <div class="floor-section">
            <div class="floor-label"><span class="floor-badge">GF</span><h3 id="label-gf-blue">Ground Floor — Blueprint</h3></div>
            <div class="blueprint-wrapper" style="position:relative; width:100%; max-width:800px; margin:0 auto;">
              <svg viewBox="0 0 500 150" class="blueprint-svg">
                <g class="blueprint-room vacant" data-svg-room-id="reception">
                  <rect x="10" y="10" width="110" height="90" rx="6" />
                  <text x="65" y="55" class="blueprint-room-name">Reception</text>
                  <text x="65" y="75" class="blueprint-room-status" id="svg-status-reception">Free</text>
                </g>
                <g class="blueprint-room vacant" data-svg-room-id="lecture-a">
                  <rect x="130" y="10" width="110" height="90" rx="6" />
                  <text x="185" y="55" class="blueprint-room-name">Lecture A</text>
                  <text x="185" y="75" class="blueprint-room-status" id="svg-status-lecture-a">Free</text>
                </g>
                <g class="blueprint-room vacant" data-svg-room-id="lecture-b">
                  <rect x="250" y="10" width="110" height="90" rx="6" />
                  <text x="305" y="55" class="blueprint-room-name">Lecture B</text>
                  <text x="305" y="75" class="blueprint-room-status" id="svg-status-lecture-b">Free</text>
                </g>
                <g class="blueprint-room vacant" data-svg-room-id="staff-lounge">
                  <rect x="370" y="10" width="110" height="90" rx="6" />
                  <text x="425" y="55" class="blueprint-room-name">Staff Lounge</text>
                  <text x="425" y="75" class="blueprint-room-status" id="svg-status-staff-lounge">Free</text>
                </g>
                <rect x="10" y="110" width="470" height="30" rx="4" fill="rgba(255,255,255,0.02)" stroke="var(--border)" stroke-dasharray="4 4" />
                <text x="245" y="128" fill="var(--text-muted)" font-size="10" font-family="var(--font-mono)" text-anchor="middle">CORRIDOR / الممر</text>
              </svg>
            </div>
          </div>
          <!-- 1F Blueprint -->
          <div class="floor-section">
            <div class="floor-label"><span class="floor-badge">1F</span><h3 id="label-1f-blue">First Floor — Blueprint</h3></div>
            <div class="blueprint-wrapper" style="position:relative; width:100%; max-width:800px; margin:0 auto;">
              <svg viewBox="0 0 500 150" class="blueprint-svg">
                <g class="blueprint-room vacant" data-svg-room-id="turing-101">
                  <rect x="10" y="10" width="110" height="90" rx="6" />
                  <text x="65" y="55" class="blueprint-room-name">Turing 101</text>
                  <text x="65" y="75" class="blueprint-room-status" id="svg-status-turing-101">Free</text>
                </g>
                <g class="blueprint-room vacant" data-svg-room-id="newton-102">
                  <rect x="130" y="10" width="110" height="90" rx="6" />
                  <text x="185" y="55" class="blueprint-room-name">Newton 102</text>
                  <text x="185" y="75" class="blueprint-room-status" id="svg-status-newton-102">Free</text>
                </g>
                <g class="blueprint-room vacant" data-svg-room-id="seminar-103">
                  <rect x="250" y="10" width="110" height="90" rx="6" />
                  <text x="305" y="55" class="blueprint-room-name">Seminar 103</text>
                  <text x="305" y="75" class="blueprint-room-status" id="svg-status-seminar-103">Free</text>
                </g>
                <g class="blueprint-room vacant" data-svg-room-id="darwin-104">
                  <rect x="370" y="10" width="110" height="90" rx="6" />
                  <text x="425" y="55" class="blueprint-room-name">Darwin 104</text>
                  <text x="425" y="75" class="blueprint-room-status" id="svg-status-darwin-104">Free</text>
                </g>
                <rect x="10" y="110" width="470" height="30" rx="4" fill="rgba(255,255,255,0.02)" stroke="var(--border)" stroke-dasharray="4 4" />
                <text x="245" y="128" fill="var(--text-muted)" font-size="10" font-family="var(--font-mono)" text-anchor="middle">CORRIDOR / الممر</text>
              </svg>
            </div>
          </div>
          <!-- 2F Blueprint -->
          <div class="floor-section">
            <div class="floor-label"><span class="floor-badge">2F</span><h3 id="label-2f-blue">Second Floor — Blueprint</h3></div>
            <div class="blueprint-wrapper" style="position:relative; width:100%; max-width:800px; margin:0 auto;">
              <svg viewBox="0 0 500 150" class="blueprint-svg">
                <g class="blueprint-room vacant" data-svg-room-id="hawking-201">
                  <rect x="10" y="10" width="110" height="90" rx="6" />
                  <text x="65" y="55" class="blueprint-room-name">Hawking 201</text>
                  <text x="65" y="75" class="blueprint-room-status" id="svg-status-hawking-201">Free</text>
                </g>
                <g class="blueprint-room vacant" data-svg-room-id="einstein-202">
                  <rect x="130" y="10" width="110" height="90" rx="6" />
                  <text x="185" y="55" class="blueprint-room-name">Einstein 202</text>
                  <text x="185" y="75" class="blueprint-room-status" id="svg-status-einstein-202">Free</text>
                </g>
                <g class="blueprint-room vacant" data-svg-room-id="curie-203">
                  <rect x="250" y="10" width="110" height="90" rx="6" />
                  <text x="305" y="55" class="blueprint-room-name">Curie 203</text>
                  <text x="305" y="75" class="blueprint-room-status" id="svg-status-curie-203">Free</text>
                </g>
                <g class="blueprint-room vacant" data-svg-room-id="conference-204">
                  <rect x="370" y="10" width="110" height="90" rx="6" />
                  <text x="425" y="55" class="blueprint-room-name">Conf 204</text>
                  <text x="425" y="75" class="blueprint-room-status" id="svg-status-conference-204">Free</text>
                </g>
                <rect x="10" y="110" width="470" height="30" rx="4" fill="rgba(255,255,255,0.02)" stroke="var(--border)" stroke-dasharray="4 4" />
                <text x="245" y="128" fill="var(--text-muted)" font-size="10" font-family="var(--font-mono)" text-anchor="middle">CORRIDOR / الممر</text>
              </svg>
            </div>
          </div>`
  },
  business: {
    name: "Business & Humanities Wing",
    nameAr: "جناح إدارة الأعمال والعلوم الإنسانية",
    roomIds: ['biz-lobby', 'auditorium-c', 'seminar-301', 'finance-lab', 'courtroom', 'history-room'],
    blueprint: `
          <!-- GF Blueprint -->
          <div class="floor-section">
            <div class="floor-label"><span class="floor-badge">GF</span><h3 id="label-gf-blue">Ground Floor — Blueprint</h3></div>
            <div class="blueprint-wrapper" style="position:relative; width:100%; max-width:800px; margin:0 auto;">
              <svg viewBox="0 0 500 150" class="blueprint-svg">
                <g class="blueprint-room vacant" data-svg-room-id="biz-lobby">
                  <rect x="10" y="10" width="230" height="90" rx="6" />
                  <text x="125" y="55" class="blueprint-room-name">Business Lobby</text>
                  <text x="125" y="75" class="blueprint-room-status" id="svg-status-biz-lobby">Free</text>
                </g>
                <g class="blueprint-room vacant" data-svg-room-id="auditorium-c">
                  <rect x="260" y="10" width="230" height="90" rx="6" />
                  <text x="375" y="55" class="blueprint-room-name">Auditorium C</text>
                  <text x="375" y="75" class="blueprint-room-status" id="svg-status-auditorium-c">Free</text>
                </g>
                <rect x="10" y="110" width="470" height="30" rx="4" fill="rgba(255,255,255,0.02)" stroke="var(--border)" stroke-dasharray="4 4" />
                <text x="245" y="128" fill="var(--text-muted)" font-size="10" font-family="var(--font-mono)" text-anchor="middle">CORRIDOR / الممر</text>
              </svg>
            </div>
          </div>
          <!-- 1F Blueprint -->
          <div class="floor-section">
            <div class="floor-label"><span class="floor-badge">1F</span><h3 id="label-1f-blue">First Floor — Blueprint</h3></div>
            <div class="blueprint-wrapper" style="position:relative; width:100%; max-width:800px; margin:0 auto;">
              <svg viewBox="0 0 500 150" class="blueprint-svg">
                <g class="blueprint-room vacant" data-svg-room-id="seminar-301">
                  <rect x="10" y="10" width="230" height="90" rx="6" />
                  <text x="125" y="55" class="blueprint-room-name">Seminar 301</text>
                  <text x="125" y="75" class="blueprint-room-status" id="svg-status-seminar-301">Free</text>
                </g>
                <g class="blueprint-room vacant" data-svg-room-id="finance-lab">
                  <rect x="260" y="10" width="230" height="90" rx="6" />
                  <text x="375" y="55" class="blueprint-room-name">Trading Lab</text>
                  <text x="375" y="75" class="blueprint-room-status" id="svg-status-finance-lab">Free</text>
                </g>
                <rect x="10" y="110" width="470" height="30" rx="4" fill="rgba(255,255,255,0.02)" stroke="var(--border)" stroke-dasharray="4 4" />
                <text x="245" y="128" fill="var(--text-muted)" font-size="10" font-family="var(--font-mono)" text-anchor="middle">CORRIDOR / الممر</text>
              </svg>
            </div>
          </div>
          <!-- 2F Blueprint -->
          <div class="floor-section">
            <div class="floor-label"><span class="floor-badge">2F</span><h3 id="label-2f-blue">Second Floor — Blueprint</h3></div>
            <div class="blueprint-wrapper" style="position:relative; width:100%; max-width:800px; margin:0 auto;">
              <svg viewBox="0 0 500 150" class="blueprint-svg">
                <g class="blueprint-room vacant" data-svg-room-id="courtroom">
                  <rect x="10" y="10" width="230" height="90" rx="6" />
                  <text x="125" y="55" class="blueprint-room-name">Practice Courtroom</text>
                  <text x="125" y="75" class="blueprint-room-status" id="svg-status-courtroom">Free</text>
                </g>
                <g class="blueprint-room vacant" data-svg-room-id="history-room">
                  <rect x="260" y="10" width="230" height="90" rx="6" />
                  <text x="375" y="55" class="blueprint-room-name">History Room</text>
                  <text x="375" y="75" class="blueprint-room-status" id="svg-status-history-room">Free</text>
                </g>
                <rect x="10" y="110" width="470" height="30" rx="4" fill="rgba(255,255,255,0.02)" stroke="var(--border)" stroke-dasharray="4 4" />
                <text x="245" y="128" fill="var(--text-muted)" font-size="10" font-family="var(--font-mono)" text-anchor="middle">CORRIDOR / الممر</text>
              </svg>
            </div>
          </div>`
  }
};

state.currentDept = 'science';

function switchKioskDept(deptId) {
  if (!DEPARTMENTS[deptId]) return;
  state.currentDept = deptId;
  
  // Render views
  renderKioskCards();
  renderKioskBlueprint();
  populateSimulationRooms();
  
  // Header title update
  const kioskH2 = document.querySelector('.kiosk-header h2');
  if (kioskH2) {
    const isAr = state.currentLang === 'ar';
    const dept = DEPARTMENTS[deptId];
    if (isAr) {
      kioskH2.innerHTML = `${dept.nameAr} — <span class="accent">حالة القاعات المباشرة</span>`;
    } else {
      kioskH2.innerHTML = `${dept.name} — <span class="accent">Live Room Status</span>`;
    }
  }

  // Refresh status of all rooms in the selected department
  DEPARTMENTS[deptId].roomIds.forEach(id => {
    updateRoomCard(id);
  });
  
  saveState();
}

function renderKioskCards() {
  const container = DOM.kioskCardsContainer;
  if (!container) return;
  const dept = DEPARTMENTS[state.currentDept];
  const isAr = state.currentLang === 'ar';
  
  // Group by floors
  const floors = { GF: [], '1F': [], '2F': [] };
  dept.roomIds.forEach(id => {
    const room = state.rooms[id];
    if (room) floors[room.floor].push(room);
  });
  
  const floorTitles = {
    GF: isAr ? 'الطابق الأرضي — الجناح الرئيسي' : 'Ground Floor — Main Wing',
    '1F': isAr ? 'الطابق الأول — الجناح الأكاديمي' : 'First Floor — Academic Wing',
    '2F': isAr ? 'الطابق الثاني — جناح الأبحاث والمؤتمرات' : 'Second Floor — Research Wing'
  };

  container.innerHTML = Object.entries(floors).map(([floor, rooms]) => {
    if (rooms.length === 0) return '';
    const cardsHtml = rooms.map(room => {
      let avatarHtml = '';
      if (room.occupant) {
        avatarHtml = `<div class="room-avatar-wrap" style="display:flex;align-items:center;gap:8px;margin-top:6px;">${profAvatarHTML(room.occupant, 40)}<div style="display:flex;flex-direction:column;"><span style="color:#e8edf5;font-weight:600;font-size:0.85rem;">${room.occupant.name}</span><span style="color:rgba(255,255,255,0.4);font-size:0.75rem;">${room.occupant.dept}</span></div></div>`;
      } else if (room.alertPerson) {
        avatarHtml = `<div class="room-avatar-wrap" style="display:flex;align-items:center;gap:8px;margin-top:6px;"><div style="width:40px;height:40px;border-radius:50%;background:rgba(255,170,0,0.2);border:2px solid var(--amber);display:flex;align-items:center;justify-content:center;font-size:18px;">⚠️</div><div style="display:flex;flex-direction:column;"><span style="color:var(--amber);font-weight:600;font-size:0.85rem;">Unknown Person</span><span style="color:rgba(255,255,255,0.4);font-size:0.75rem;">Not in database</span></div></div>`;
      }
      
      const stText = room.status === 'vacant' ? (isAr ? 'شاغرة' : 'Vacant') : room.status === 'occupied' ? (isAr ? 'مشغولة' : 'Occupied') : (isAr ? 'تنبيه' : 'Alert');
      const capText = room.capacity ? `${room.capacity} ${isAr ? 'مقاعد' : 'seats'}` : '—';
      const detailLabelCap = isAr ? 'السعة' : 'Capacity';
      const detailLabelOcc = isAr ? 'المستخدم' : 'Occupant';
      const detailLabelClass = isAr ? 'المادة' : 'Class';
      const occupantVal = room.occupant ? room.occupant.name : (room.alertPerson ? (isAr ? 'شخص غير معروف' : 'Unknown Person') : (isAr ? 'لا أحد' : 'None'));
      
      return `
        <div class="room-card ${room.status}" data-room-id="${room.id}" id="room-${room.id}">
          <div class="room-top">
            <div>
              <div class="room-name">${room.name}</div>
              <div class="room-type">${room.type} ${room.capacity ? `• ${room.capacity} ${isAr ? 'مقاعد' : 'seats'}` : ''}</div>
            </div>
            <div class="room-status-badge ${room.status}"><span class="badge-dot"></span> ${stText}</div>
          </div>
          ${avatarHtml}
          <div class="room-details">
            <div class="room-detail-row"><span class="detail-icon">👥</span><span class="detail-label">${detailLabelCap}</span><span class="detail-value">${capText}</span></div>
            <div class="room-detail-row"><span class="detail-icon">👤</span><span class="detail-label">${detailLabelOcc}</span><span class="detail-value occupant-name ${room.occupant ? 'professor-name' : ''}">${occupantVal}</span></div>
            <div class="room-detail-row"><span class="detail-icon">📖</span><span class="detail-label">${detailLabelClass}</span><span class="detail-value class-name">${room.className || '—'}</span></div>
          </div>
          <span class="room-camera-tag">${room.camId}</span>
        </div>
      `;
    }).join('');

    return `
      <div class="floor-section">
        <div class="floor-label"><span class="floor-badge">${floor}</span><h3>${floorTitles[floor]}</h3></div>
        <div class="rooms-grid">
          ${cardsHtml}
        </div>
      </div>
    `;
  }).join('');

  // Re-attach card click listeners
  document.querySelectorAll('#floor-plan-cards-container .room-card').forEach(card => {
    card.addEventListener('click', () => {
      const room = state.rooms[card.dataset.roomId];
      if (room) openRoomDetailModal(room);
    });
  });
}

function renderKioskBlueprint() {
  const container = DOM.kioskBlueprintContainer;
  if (!container) return;
  const dept = DEPARTMENTS[state.currentDept];
  container.innerHTML = dept.blueprint;
  
  // Re-attach blueprint click and details handlers
  document.querySelectorAll('.blueprint-room').forEach(svgRoom => {
    svgRoom.addEventListener('click', () => {
      const roomId = svgRoom.dataset.svgRoomId;
      const room = state.rooms[roomId];
      if (room) openRoomDetailModal(room);
    });
  });
}

function populateSimulationRooms() {
  const dept = DEPARTMENTS[state.currentDept];
  const rooms = ROOMS_DATA.filter(r => dept.roomIds.includes(r.id));
  DOM.simRoom.innerHTML = rooms.map(r => `<option value="${r.id}">${r.name} (${r.floor})</option>`).join('');
}

// Initial dropdown populator
DOM.simProfessor.innerHTML = PROFESSORS.map(p => `<option value="${p.id}" data-avatar="${p.avatar}">${p.name} — ${p.dept}</option>`).join('');
populateSimulationRooms();

// Helper to build professor avatar HTML
function profAvatarHTML(prof, size = 32) {
  if (!prof) return '';
  return `<img class="prof-avatar" src="${prof.avatar}" alt="${prof.name}" width="${size}" height="${size}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;border:2px solid ${prof.color};flex-shrink:0;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">`
    + `<span class="prof-avatar-fallback" style="display:none;width:${size}px;height:${size}px;border-radius:50%;background:${prof.color};color:#fff;font-size:${Math.round(size*0.38)}px;font-weight:700;line-height:${size}px;text-align:center;flex-shrink:0;">${prof.initials}</span>`;
}

// ======================= STATS =======================

function updateStats() {
  const rooms = Object.values(state.rooms);
  const occupied = rooms.filter(r => r.status === 'occupied').length;
  DOM.statTotal.textContent = rooms.length;
  DOM.statOccupied.textContent = occupied;
  DOM.statVacant.textContent = rooms.length - occupied - rooms.filter(r=>r.status==='alert').length;
  DOM.statClasses.textContent = occupied;
  DOM.statProfessors.textContent = state.detectedProfessors.size;
}
updateStats();

// ======================= ROOM CARD UPDATES =======================

function updateRoomCard(roomId) {
  const room = state.rooms[roomId];
  
  // 1. Update Card Grid
  const card = document.getElementById(`room-${roomId}`);
  if (card) {
    card.classList.remove('vacant','occupied','alert');
    card.classList.add(room.status);
    const badge = card.querySelector('.room-status-badge');
    badge.className = 'room-status-badge ' + room.status;
    const statusText = room.status === 'vacant' ? 'Vacant' : room.status === 'occupied' ? 'Occupied' : 'Alert';
    badge.innerHTML = `<span class="badge-dot"></span> ${statusText}`;
    const occupantEl = card.querySelector('.occupant-name');
    const classEl = card.querySelector('.class-name');
    
    let avatarWrap = card.querySelector('.room-avatar-wrap');
    if (!avatarWrap) {
      avatarWrap = document.createElement('div');
      avatarWrap.className = 'room-avatar-wrap';
      avatarWrap.style.cssText = 'display:flex;align-items:center;gap:8px;margin-top:6px;';
      const detailsSection = card.querySelector('.room-details');
      if (detailsSection) detailsSection.parentNode.insertBefore(avatarWrap, detailsSection);
    }
    
    if (room.occupant) {
      avatarWrap.innerHTML = profAvatarHTML(room.occupant, 40) + `<div style="display:flex;flex-direction:column;"><span style="color:#e8edf5;font-weight:600;font-size:0.85rem;">${room.occupant.name}</span><span style="color:rgba(255,255,255,0.4);font-size:0.75rem;">${room.occupant.dept}</span></div>`;
      avatarWrap.style.display = 'flex';
      occupantEl.textContent = room.occupant.name;
      occupantEl.classList.add('professor-name');
      occupantEl.style.color = '';
      classEl.textContent = room.className || '—';
    } else if (room.alertPerson) {
      avatarWrap.innerHTML = '<div style="width:40px;height:40px;border-radius:50%;background:rgba(255,170,0,0.2);border:2px solid var(--amber);display:flex;align-items:center;justify-content:center;font-size:18px;">⚠️</div><div style="display:flex;flex-direction:column;"><span style="color:var(--amber);font-weight:600;font-size:0.85rem;">Unknown Person</span><span style="color:rgba(255,255,255,0.4);font-size:0.75rem;">Not in database</span></div>';
      avatarWrap.style.display = 'flex';
      occupantEl.textContent = '⚠ Unknown Person';
      occupantEl.classList.remove('professor-name');
      occupantEl.style.color = 'var(--amber)';
      classEl.textContent = '—';
    } else {
      avatarWrap.innerHTML = '';
      avatarWrap.style.display = 'none';
      occupantEl.textContent = 'None';
      occupantEl.classList.remove('professor-name');
      occupantEl.style.color = '';
      classEl.textContent = '—';
    }
  }

  // 2. Update SVG Blueprint
  const svgRoom = document.querySelector(`[data-svg-room-id="${roomId}"]`);
  if (svgRoom) {
    svgRoom.setAttribute('class', `blueprint-room ${room.status}`);
    const svgStatusEl = document.getElementById(`svg-status-${roomId}`);
    if (svgStatusEl) {
      const isAr = state.currentLang === 'ar';
      const term = room.status === 'vacant' ? 'svg_free' : room.status === 'occupied' ? 'svg_occupied' : 'svg_alert';
      svgStatusEl.textContent = TRANSLATIONS[isAr ? 'ar' : 'en'][term];
    }
  }

  // 3. Re-apply Free Rooms Filter to keep sync
  applyFreeRoomsFilter();
}

// ======================= TOAST NOTIFICATION SYSTEM =======================

let toastId = 0;
function showToast(type, title, message, duration = 5000) {
  const id = ++toastId;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.id = `toast-${id}`;
  const icons = { info:'ℹ️', success:'✅', warning:'⚠️', danger:'🚨' };
  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || 'ℹ️'}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${message}</div>
    </div>
    <button class="toast-close" onclick="dismissToast(${id})">✕</button>
    <div class="toast-progress" style="animation-duration:${duration}ms"></div>
  `;
  DOM.toastContainer.appendChild(toast);
  setTimeout(() => dismissToast(id), duration);
  return id;
}

function dismissToast(id) {
  const toast = document.getElementById(`toast-${id}`);
  if (!toast) return;
  toast.classList.add('removing');
  setTimeout(() => toast.remove(), 350);
}

// ======================= NOTIFICATION CENTER =======================

function addNotification(type, title, message) {
  const now = new Date();
  const time = now.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
  state.notifications.unshift({ type, title, message, time, read: false });
  state.unreadCount++;
  renderNotifications();
}

function renderNotifications() {
  DOM.notifCount.textContent = state.unreadCount;
  DOM.notifCount.classList.toggle('hidden', state.unreadCount === 0);
  if (state.notifications.length === 0) {
    DOM.notifEmpty.style.display = '';
    return;
  }
  DOM.notifEmpty.style.display = 'none';
  const icons = { info:'ℹ️', success:'✅', warning:'⚠️', danger:'🚨' };
  const typeClass = { info:'info', success:'success', warning:'warning', danger:'danger' };
  DOM.notifList.innerHTML = state.notifications.slice(0, 20).map((n, i) => `
    <div class="notif-item ${n.read ? '' : 'unread'}" data-idx="${i}">
      <div class="notif-icon-wrap ${typeClass[n.type] || 'info'}">${icons[n.type] || 'ℹ️'}</div>
      <div class="notif-content">
        <div class="notif-title">${n.title}</div>
        <div class="notif-msg">${n.message}</div>
        <div class="notif-time">${n.time}</div>
      </div>
    </div>
  `).join('');
}

DOM.notifBell.addEventListener('click', (e) => {
  e.stopPropagation();
  DOM.notifDropdown.classList.toggle('open');
});

DOM.notifMarkRead.addEventListener('click', () => {
  state.notifications.forEach(n => n.read = true);
  state.unreadCount = 0;
  renderNotifications();
});

document.addEventListener('click', (e) => {
  if (!DOM.notifDropdown.contains(e.target) && e.target !== DOM.notifBell) {
    DOM.notifDropdown.classList.remove('open');
  }
});

// ======================= SYSTEM LOG =======================

function addLog(source, message) {
  const now = new Date();
  const time = now.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.innerHTML = `<span class="log-time">[${time}]</span><span class="log-source ${source}">${source.toUpperCase()}:</span><span class="log-message">${message}</span>`;
  DOM.systemLog.prepend(entry);
  while (DOM.systemLog.children.length > 100) DOM.systemLog.removeChild(DOM.systemLog.lastChild);
}

addLog('system', 'UniVision AI v2.4.1 initialized successfully.');
addLog('system', `Monitoring ${ROOMS_DATA.length} rooms across 3 floors.`);
addLog('camera', 'All camera feeds connected. 4 primary streams active.');
addLog('ai', 'Face recognition engine loaded. Model: UniVision-FR v3.2 (98.7% accuracy).');
addLog('db', 'Database connection established. Ready for attendance logging.');

// ======================= ATTENDANCE DATABASE =======================

function addAttendanceRecord(room, professor, status, method) {
  const now = new Date();
  const timestamp = now.toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit' });
  const record = { timestamp, room:room.name, professor:professor?professor.name:'Unknown', course:professor?professor.course:'—', status, method, professorObj:professor||null };
  state.attendanceLogs.unshift(record);
  DOM.dbEmpty.style.display = 'none';
  const tr = document.createElement('tr');
  tr.className = 'new-entry';
  const statusClass = status==='Present'||status==='Auto-Logged' ? 'auto-logged' : status==='Departed' ? 'departed' : 'alert';
  const profCell = professor ? `<div style="display:flex;align-items:center;gap:8px;">${profAvatarHTML(professor, 28)}<span>${record.professor}</span></div>` : record.professor;
  tr.innerHTML = `<td>${record.timestamp}</td><td>${record.room}</td><td>${profCell}</td><td>${record.course}</td><td><span class="attendance-status ${statusClass}">${status}</span></td><td><span class="method-badge">${method}</span></td>`;
  DOM.attendanceBody.prepend(tr);
  DOM.recordsBadge.textContent = `${state.attendanceLogs.length} Records`;
}

// ======================= CAMERA CANVAS ENGINE =======================

const cameraCanvases = {};
let cameraAnimationFrame = null;

function initCameraCanvases() {
  const grid = document.getElementById('camera-grid');
  if (!grid) return;

  const dept = DEPARTMENTS[state.currentDept];
  const rooms = ROOMS_DATA.filter(r => dept.roomIds.includes(r.id));

  // Generate HTML for camera grid dynamically
  grid.innerHTML = rooms.map(room => {
    return `
      <div class="camera-feed" id="cam-feed-${room.id}">
        <canvas id="cam-canvas-${room.id}"></canvas>
        <div class="scan-line"></div>
        <div class="cam-overlay">
          <span class="cam-id">${room.camId}</span>
          <span class="cam-status live"><span class="rec-dot"></span> LIVE</span>
        </div>
        <div class="cam-bottom-overlay">
          <span class="cam-room">${room.name}</span>
          <span class="cam-time cam-clock">—</span>
        </div>
      </div>
    `;
  }).join('');

  // Update DOM badges
  const badge = document.getElementById('active-cams-badge');
  if (badge) badge.textContent = `${rooms.length} ACTIVE`;

  // Set up camera Canvases objects
  for (const key in cameraCanvases) delete cameraCanvases[key];

  rooms.forEach(room => {
    const canvas = document.getElementById(`cam-canvas-${room.id}`);
    if (!canvas) return;
    const container = canvas.parentElement;
    canvas.width = container.offsetWidth || 300;
    canvas.height = container.offsetHeight || 180;
    cameraCanvases[room.id] = { canvas, ctx: canvas.getContext('2d'), roomId: room.id };
  });

  if (!cameraAnimationFrame) renderCameraFrames();
}

function renderCameraFrames() {
  Object.values(cameraCanvases).forEach(cam => {
    const { ctx, canvas, roomId } = cam;
    const w = canvas.width, h = canvas.height;
    const room = state.rooms[roomId];
    ctx.fillStyle = '#0a0e1a';
    ctx.fillRect(0, 0, w, h);
    // Noise
    const img = ctx.createImageData(w, h);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random()*18;
      img.data[i]=v; img.data[i+1]=v+Math.random()*5; img.data[i+2]=v+Math.random()*8; img.data[i+3]=255;
    }
    ctx.putImageData(img, 0, 0);
    // Grid
    ctx.strokeStyle = 'rgba(0,212,255,0.04)'; ctx.lineWidth = 0.5;
    for (let x=0;x<w;x+=30){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
    for (let y=0;y<h;y+=30){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
    // Scanlines
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    for (let y=0;y<h;y+=3) ctx.fillRect(0,y,w,1);
    // Room silhouette
    drawRoomSilhouette(ctx, w, h);
    // Detection
    if (room.status === 'occupied' && room.occupant) {
      drawPersonSilhouette(ctx, w, h);
      drawDetectionBox(ctx, w, h, room.occupant.name, room.occupant.id, true);
    } else if (room.status === 'alert') {
      drawPersonSilhouette(ctx, w, h);
      drawDetectionBox(ctx, w, h, 'UNKNOWN PERSON', '???', false);
    }
    drawCornerMarkers(ctx, w, h);
    const ts = new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    ctx.font='10px "JetBrains Mono",monospace'; ctx.fillStyle='rgba(255,255,255,0.4)';
    ctx.textAlign='right'; ctx.fillText(`${w}×${h} | 30fps`, w-8, h-8);
    ctx.textAlign='left'; ctx.fillText(`● REC  ${ts}`, 8, h-8);
  });
  cameraAnimationFrame = requestAnimationFrame(renderCameraFrames);
}

function drawRoomSilhouette(ctx,w,h) {
  ctx.fillStyle='rgba(40,55,80,0.3)'; ctx.fillRect(0,h*0.75,w,h*0.25);
  ctx.fillStyle='rgba(50,65,90,0.4)'; ctx.fillRect(w*0.3,h*0.62,w*0.4,h*0.08);
  ctx.fillStyle='rgba(30,45,70,0.5)'; ctx.fillRect(w*0.15,h*0.08,w*0.7,h*0.25);
  ctx.strokeStyle='rgba(60,80,110,0.4)'; ctx.lineWidth=1; ctx.strokeRect(w*0.15,h*0.08,w*0.7,h*0.25);
  ctx.fillStyle='rgba(35,50,75,0.3)';
  for(let i=0;i<5;i++) ctx.fillRect(w*0.1+i*(w*0.18),h*0.82,w*0.08,h*0.06);
}

function drawPersonSilhouette(ctx,w,h) {
  const cx=w*0.5, cy=h*0.48;
  ctx.fillStyle='rgba(120,140,170,0.5)'; ctx.beginPath(); ctx.arc(cx,cy-20,12,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(100,120,150,0.4)'; ctx.beginPath(); ctx.moveTo(cx-16,cy-6); ctx.lineTo(cx+16,cy-6); ctx.lineTo(cx+20,cy+30); ctx.lineTo(cx-20,cy+30); ctx.closePath(); ctx.fill();
}

function drawDetectionBox(ctx,w,h,label,id,recognized) {
  const bx=w*0.33,by=h*0.2,bw=w*0.34,bh=h*0.52;
  const pulse=0.6+0.4*Math.sin(Date.now()/400);
  const color=recognized?`rgba(0,255,136,${pulse})`:`rgba(255,170,0,${pulse})`;
  const solid=recognized?'#00ff88':'#ffaa00';
  ctx.strokeStyle=color; ctx.lineWidth=2; ctx.setLineDash([8,4]); ctx.strokeRect(bx,by,bw,bh); ctx.setLineDash([]);
  const cl=12; ctx.strokeStyle=solid; ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(bx,by+cl);ctx.lineTo(bx,by);ctx.lineTo(bx+cl,by);ctx.stroke();
  ctx.beginPath();ctx.moveTo(bx+bw-cl,by);ctx.lineTo(bx+bw,by);ctx.lineTo(bx+bw,by+cl);ctx.stroke();
  ctx.beginPath();ctx.moveTo(bx,by+bh-cl);ctx.lineTo(bx,by+bh);ctx.lineTo(bx+cl,by+bh);ctx.stroke();
  ctx.beginPath();ctx.moveTo(bx+bw-cl,by+bh);ctx.lineTo(bx+bw,by+bh);ctx.lineTo(bx+bw,by+bh-cl);ctx.stroke();
  ctx.fillStyle=solid; ctx.font='bold 10px "JetBrains Mono",monospace';
  const tw=ctx.measureText(label).width; ctx.fillRect(bx,by-18,tw+12,16);
  ctx.fillStyle='#000'; ctx.fillText(label,bx+6,by-6);
  const conf=recognized?(95+Math.random()*4.5).toFixed(1)+'% Match':'NO MATCH — ID: '+id;
  ctx.font='9px "JetBrains Mono",monospace'; ctx.fillStyle=solid; ctx.fillText(conf,bx,by+bh+14);
  if(recognized){const cx=w*0.5,cy=h*0.28;ctx.fillStyle='rgba(0,255,136,0.7)';[[-5,-3],[5,-3],[0,2],[-3,6],[3,6]].forEach(([dx,dy])=>{ctx.beginPath();ctx.arc(cx+dx,cy+dy,1.5,0,Math.PI*2);ctx.fill();});}
}

function drawCornerMarkers(ctx,w,h) {
  ctx.strokeStyle='rgba(0,212,255,0.3)'; ctx.lineWidth=1.5; const m=6,l=18;
  ctx.beginPath();ctx.moveTo(m,m+l);ctx.lineTo(m,m);ctx.lineTo(m+l,m);ctx.stroke();
  ctx.beginPath();ctx.moveTo(w-m-l,m);ctx.lineTo(w-m,m);ctx.lineTo(w-m,m+l);ctx.stroke();
  ctx.beginPath();ctx.moveTo(m,h-m-l);ctx.lineTo(m,h-m);ctx.lineTo(m+l,h-m);ctx.stroke();
  ctx.beginPath();ctx.moveTo(w-m-l,h-m);ctx.lineTo(w-m,h-m);ctx.lineTo(w-m,h-m-l);ctx.stroke();
}

// ======================= SIMULATION ENGINE =======================

function simulateProfessorEntry() {
  const prof = PROFESSORS.find(p => p.id === DOM.simProfessor.value);
  const roomId = DOM.simRoom.value;
  const room = state.rooms[roomId];
  if (!prof || !room) return;
  if (room.status === 'occupied') { addLog('system',`⚠ "${room.name}" already occupied by ${room.occupant.name}.`); showToast('warning','Room Occupied',`${room.name} is already in use.`); return; }
  room.alertPerson = false;
  addLog('camera', `Camera ${room.camId}: Motion detected in ${room.name}.`);
  playSound('info');
  setTimeout(()=>{ addLog('ai',`Face detected in ${room.name}. Running recognition...`); }, 400);
  setTimeout(()=>{
    const conf=(95+Math.random()*4.5).toFixed(1);
    addLog('ai',`✓ Match: ${prof.name} (${prof.id}) — ${conf}%`);
    playSound('success');
  }, 900);
  setTimeout(()=>{
    room.status='occupied'; room.occupant=prof; room.className=prof.course;
    state.detectedProfessors.add(prof.id);
    updateRoomCard(roomId); updateStats();
    addLog('db',`Attendance logged: ${prof.name} → ${room.name} (${prof.course}).`);
    addLog('system',`Room "${room.name}": VACANT → OCCUPIED.`);
    addAttendanceRecord(room, prof, 'Auto-Logged', 'AI Face-ID');
    showToast('success','Professor Detected',`${prof.name} identified in ${room.name}.`);
    addNotification('success','Professor Entry',`${prof.name} entered ${room.name} — ${prof.course}`);
    
    // DB API sync
    if (!state.isOfflineMode) {
      apiFetch(`/rooms/${roomId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'occupied', occupant_id: prof.id, method: 'face_recognition' })
      }).catch(e => console.error('Failed to sync room entry:', e));
    }
  }, 1400);
}

function simulateProfessorExit() {
  const roomId = DOM.simRoom.value;
  const room = state.rooms[roomId];
  if (!room || room.status !== 'occupied') { addLog('system',`"${room?.name}" is not occupied.`); showToast('warning','Not Occupied','Select an occupied room.'); return; }
  const prof = room.occupant;
  addLog('camera',`Camera ${room.camId}: Subject leaving ${room.name}.`);
  setTimeout(()=>{ addLog('ai',`${prof.name} no longer detected. Confirming exit...`); }, 500);
  setTimeout(()=>{
    room.status='vacant'; room.occupant=null; room.className=null; room.detectionActive=false;
    if(!Object.values(state.rooms).some(r=>r.occupant&&r.occupant.id===prof.id)) state.detectedProfessors.delete(prof.id);
    updateRoomCard(roomId); updateStats();
    addLog('db',`Session ended: ${prof.name} left ${room.name}.`);
    addLog('system',`Room "${room.name}": OCCUPIED → VACANT.`);
    addAttendanceRecord(room, prof, 'Departed', 'AI Track-Out');
    showToast('info','Professor Departed',`${prof.name} has left ${room.name}.`);
    addNotification('info','Professor Exit',`${prof.name} departed from ${room.name}`);
    playSound('info');

    // DB API sync
    if (!state.isOfflineMode) {
      apiFetch(`/rooms/${roomId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'vacant' })
      }).catch(e => console.error('Failed to sync room exit:', e));
    }
  }, 1000);
}

function simulateUnknownPerson() {
  const roomId = DOM.simRoom.value;
  const room = state.rooms[roomId];
  if (!room || room.status === 'occupied') { showToast('warning','Cannot Simulate','Room is occupied or invalid.'); return; }
  addLog('camera',`Camera ${room.camId}: Motion in ${room.name}.`);
  playSound('warning');
  setTimeout(()=>{ addLog('ai',`Face detected in ${room.name}. Running recognition...`); }, 400);
  setTimeout(()=>{ addLog('security',`✘ NO MATCH in ${room.name}. UNREGISTERED.`); playSound('alert'); }, 900);
  setTimeout(()=>{
    room.status='alert'; room.occupant=null; room.className=null; room.alertPerson=true;
    updateRoomCard(roomId); updateStats();
    addLog('security',`ALERT: Unregistered individual in ${room.name}.`);
    addAttendanceRecord(room, null, 'Alert', 'Security');
    showToast('danger','Security Alert',`Unrecognized person detected in ${room.name}!`, 8000);
    addNotification('danger','Security Alert',`Unregistered person in ${room.name}`);

    // DB API sync
    if (!state.isOfflineMode) {
      apiFetch(`/rooms/${roomId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'alert' })
      }).catch(e => console.error('Failed to sync room alert:', e));
    }
  }, 1400);
}

function resetAllRooms() {
  Object.keys(state.rooms).forEach(id => {
    const r = state.rooms[id];
    r.status='vacant'; r.occupant=null; r.className=null; r.detectionActive=false; r.alertPerson=false;
    updateRoomCard(id);
  });
  state.detectedProfessors.clear();
  state.attendanceLogs = [];
  DOM.attendanceBody.innerHTML = '';
  DOM.dbEmpty.style.display = '';
  DOM.recordsBadge.textContent = '0 Records';
  updateStats();
  DOM.systemLog.innerHTML = '';
  addLog('system','All rooms reset. System ready.');
  showToast('info','System Reset','All rooms and records cleared.');
}

// Full demo: sequentially simulate multiple entries
async function runFullDemo() {
  resetAllRooms();
  const demos = [
    { profIdx:0, roomIdx:4 },  // Dr. Jenkins → Turing 101
    { profIdx:3, roomIdx:9 },  // Prof. Okafor → Einstein 202
    { profIdx:4, roomIdx:10 }, // Dr. Laurent → Curie 203
  ];
  showToast('info','Demo Starting','Running automated demo sequence...');
  addNotification('info','Demo Mode','Automated demonstration started');

  for (let i = 0; i < demos.length; i++) {
    await new Promise(r => setTimeout(r, 2500));
    DOM.simProfessor.value = PROFESSORS[demos[i].profIdx].id;
    DOM.simRoom.value = ROOMS_DATA[demos[i].roomIdx].id;
    simulateProfessorEntry();
  }

  // Unknown person after all entries
  await new Promise(r => setTimeout(r, 3000));
  DOM.simRoom.value = 'seminar-103';
  simulateUnknownPerson();
}

// ======================= EVENT LISTENERS =======================

function toggleSimPanel() {
  state.simPanelOpen = !state.simPanelOpen;
  DOM.simPanel.classList.toggle('open', state.simPanelOpen);
  DOM.simToggle.classList.toggle('active', state.simPanelOpen);
  document.body.classList.toggle('sim-open', state.simPanelOpen);
}

DOM.simToggle.addEventListener('click', toggleSimPanel);

const btnHeaderSettings = document.getElementById('header-btn-settings');
if (btnHeaderSettings) {
  btnHeaderSettings.addEventListener('click', toggleSimPanel);
}

DOM.btnEnter.addEventListener('click', simulateProfessorEntry);
DOM.btnExit.addEventListener('click', simulateProfessorExit);
DOM.btnUnknown.addEventListener('click', simulateUnknownPerson);
DOM.btnReset.addEventListener('click', resetAllRooms);
DOM.btnDemo.addEventListener('click', runFullDemo);

function openRoomDetailModal(room) {
  DOM.modalRoomName.textContent = room.name;
  const sc = room.status==='vacant'?'var(--emerald)':room.status==='occupied'?'var(--rose)':'var(--amber)';
  const isAr = state.currentLang === 'ar';
  let st = isAr ? 'شاغرة' : 'Vacant';
  if (room.status === 'occupied') st = isAr ? 'مشغولة' : 'Occupied';
  if (room.status === 'alert') st = isAr ? 'تنبيه' : 'Alert';
  
  let occ = isAr ? 'لا أحد' : 'None';
  let occAvatar = '';
  if (room.occupant) {
    occ = room.occupant.name;
    occAvatar = `<div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(255,255,255,0.03);border-radius:12px;margin-bottom:8px;">${profAvatarHTML(room.occupant, 52)}<div style="display:flex;flex-direction:column;gap:2px;"><span style="color:#e8edf5;font-weight:700;font-size:1rem;">${room.occupant.name}</span><span style="color:rgba(255,255,255,0.5);font-size:0.8rem;">${room.occupant.dept}</span><span style="color:var(--cyan);font-size:0.8rem;">${room.occupant.course}</span></div></div>`;
  } else if (room.alertPerson) {
    occ = isAr ? '⚠ شخص غير معروف' : '⚠ Unregistered Person';
  }
  const fl = room.floor==='GF' 
    ? (isAr ? 'الطابق الأرضي' : 'Ground Floor') 
    : room.floor==='1F' 
      ? (isAr ? 'الطابق الأول' : 'First Floor') 
      : (isAr ? 'الطابق الثاني' : 'Second Floor');
      
  DOM.modalBody.innerHTML = `
    ${occAvatar}
    <div class="modal-detail"><div class="md-icon">📍</div><div class="md-info"><span class="md-label">${isAr ? 'الموقع' : 'Location'}</span><span class="md-value">${fl} — ${room.type}</span></div></div>
    <div class="modal-detail"><div class="md-icon">🔲</div><div class="md-info"><span class="md-label">${isAr ? 'الحالة' : 'Status'}</span><span class="md-value" style="color:${sc}">${st}</span></div></div>
    <div class="modal-detail"><div class="md-icon">👥</div><div class="md-info"><span class="md-label">${isAr ? 'السعة الاستيعابية' : 'Capacity'}</span><span class="md-value">${room.capacity||'—'} ${isAr ? 'مقاعد' : 'seats'}</span></div></div>
    <div class="modal-detail"><div class="md-icon">👤</div><div class="md-info"><span class="md-label">${isAr ? 'المستخدم الحالي' : 'Current Occupant'}</span><span class="md-value">${occ}</span></div></div>
    <div class="modal-detail"><div class="md-icon">📖</div><div class="md-info"><span class="md-label">${isAr ? 'المادة الجارية' : 'Active Course'}</span><span class="md-value">${room.className||(isAr ? 'لا يوجد' : 'None')}</span></div></div>
    <div class="modal-detail"><div class="md-icon">📹</div><div class="md-info"><span class="md-label">${isAr ? 'تلقيم الكاميرا' : 'Camera Feed'}</span><span class="md-value">${room.camId}</span></div></div>`;
  DOM.roomModal.classList.add('visible');
}

// Room card click → modal
document.querySelectorAll('.room-card').forEach(card => {
  card.addEventListener('click', () => {
    const room = state.rooms[card.dataset.roomId];
    if (room) openRoomDetailModal(room);
  });
});

DOM.modalClose.addEventListener('click', () => DOM.roomModal.classList.remove('visible'));
DOM.roomModal.addEventListener('click', e => { if (e.target === DOM.roomModal) DOM.roomModal.classList.remove('visible'); });

// Theme Switcher & Dropdown Toggle
DOM.btnTheme.addEventListener('click', (e) => {
  e.stopPropagation();
  DOM.themeDropdown.classList.toggle('open');
  DOM.langDropdown.classList.remove('open');
});

document.addEventListener('click', (e) => {
  if (!DOM.themeDropdown.contains(e.target) && e.target !== DOM.btnTheme) {
    DOM.themeDropdown.classList.remove('open');
  }
});

// App Theme Handler
function setAppTheme(themeName) {
  document.body.setAttribute('data-theme', themeName);
  document.querySelectorAll('.theme-option').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.theme === themeName);
  });
  saveState();
}

document.querySelectorAll('.theme-option').forEach(opt => {
  opt.addEventListener('click', (e) => {
    e.stopPropagation();
    const themeName = opt.dataset.theme;
    setAppTheme(themeName);
    DOM.themeDropdown.classList.remove('open');
    showToast('info', 'Theme Changed', `App color set to ${opt.textContent.trim()}`);
  });
});

// Language Switcher Dropdown Toggle
DOM.btnLang.addEventListener('click', (e) => {
  e.stopPropagation();
  DOM.langDropdown.classList.toggle('open');
  DOM.themeDropdown.classList.remove('open');
});

document.addEventListener('click', (e) => {
  if (!DOM.langDropdown.contains(e.target) && e.target !== DOM.btnLang) {
    DOM.langDropdown.classList.remove('open');
  }
});

// Translate Page Function
function translatePage(lang) {
  const t = TRANSLATIONS[lang];
  if (!t) return;
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', lang);

  // Header System Status
  const statusSpan = document.querySelector('.system-status span:not(.status-dot)');
  if (statusSpan) statusSpan.textContent = t.system_online;

  // View Tabs
  document.getElementById('tab-kiosk').innerHTML = `🗺️ ${t.tab_kiosk}`;
  document.getElementById('tab-admin').innerHTML = `🛡️ ${t.tab_admin}`;
  document.getElementById('tab-schedule').innerHTML = `📅 ${t.tab_schedule}`;
  document.getElementById('tab-analytics').innerHTML = `📊 ${t.tab_analytics}`;

  // Notification panel
  const notifHeader = document.querySelector('.notif-dropdown-header h4');
  if (notifHeader) notifHeader.textContent = t.notifications;
  const notifMark = document.getElementById('notif-mark-read');
  if (notifMark) notifMark.textContent = t.mark_all_read;
  const notifEmptyText = document.querySelector('#notif-empty div:last-child');
  if (notifEmptyText) notifEmptyText.textContent = t.no_notifications;

  // Stats bar
  const statCards = document.querySelectorAll('.stat-card');
  if (statCards[0]) statCards[0].querySelector('.stat-label').textContent = t.stat_total_rooms;
  if (statCards[1]) statCards[1].querySelector('.stat-label').textContent = t.stat_occupied;
  if (statCards[2]) statCards[2].querySelector('.stat-label').textContent = t.stat_vacant;
  if (statCards[3]) statCards[3].querySelector('.stat-label').textContent = t.stat_active_classes;
  if (statCards[4]) statCards[4].querySelector('.stat-label').textContent = t.stat_professors_detected;

  // View Headers
  const kioskH2 = document.querySelector('.kiosk-header h2');
  if (kioskH2) {
    if (lang === 'ar') {
      kioskH2.innerHTML = `جناح العلوم والهندسة — <span class="accent">حالة القاعات المباشرة</span>`;
    } else {
      kioskH2.innerHTML = `Science & Engineering Wing — <span class="accent">Live Room Status</span>`;
    }
  }
  document.getElementById('map-search').placeholder = t.search_placeholder;

  // Floor Labels
  const floorLabels = document.querySelectorAll('.floor-label h3');
  if (floorLabels[0]) floorLabels[0].textContent = t.ground_floor;
  if (floorLabels[1]) floorLabels[1].textContent = t.first_floor;
  if (floorLabels[2]) floorLabels[2].textContent = t.second_floor;

  // Admin Panels
  const panels = document.querySelectorAll('.panel');
  if (panels[0]) panels[0].querySelector('.panel-header h3').innerHTML = `<span class="panel-icon">📹</span> ${t.live_camera_feeds}`;
  if (panels[1]) panels[1].querySelector('.panel-header h3').innerHTML = `<span class="panel-icon">🗄️</span> ${t.attendance_database}`;
  if (panels[2]) panels[2].querySelector('.panel-header h3').innerHTML = `<span class="panel-icon">📋</span> ${t.system_event_log}`;

  // Table headers
  const ths = document.querySelectorAll('#attendance-table th');
  if (ths.length >= 6) {
    ths[0].textContent = t.th_timestamp;
    ths[1].textContent = t.th_room;
    ths[2].textContent = t.th_professor;
    ths[3].textContent = t.th_course;
    ths[4].textContent = t.th_status;
    ths[5].textContent = t.th_method;
  }

  // Schedule headers
  const schedH2 = document.querySelector('.schedule-header h2');
  if (schedH2) {
    if (lang === 'ar') {
      schedH2.innerHTML = `الجدول الدراسي الأسبوعي — <span class="accent">المواعيد والحضور</span>`;
    } else {
      schedH2.innerHTML = `Weekly Class Schedule — <span class="accent">Timetable & Attendance</span>`;
    }
  }
  
  // Legend items
  const legends = document.querySelectorAll('.legend-item');
  if (legends.length >= 5) {
    legends[0].innerHTML = `<span class="legend-dot active"></span> ${lang === 'ar' ? 'نشط (في الموعد)' : 'Active (On-Time)'}`;
    legends[1].innerHTML = `<span class="legend-dot late"></span> ${lang === 'ar' ? 'وصول متأخر' : 'Late Arrival'}`;
    legends[2].innerHTML = `<span class="legend-dot upcoming"></span> ${lang === 'ar' ? 'قادم' : 'Upcoming'}`;
    legends[3].innerHTML = `<span class="legend-dot completed"></span> ${lang === 'ar' ? 'مكتمل' : 'Completed'}`;
    legends[4].innerHTML = `<span class="legend-dot missed"></span> ${lang === 'ar' ? 'غائب / فائت' : 'Missed / Absent'}`;
  }

  // Analytics header
  const analyticsH2 = document.querySelector('.analytics-header h2');
  if (analyticsH2) {
    if (lang === 'ar') {
      analyticsH2.innerHTML = `تحليلات الأداء — <span class="accent">الرؤى والاتجاهات</span>`;
    } else {
      analyticsH2.innerHTML = `Performance Analytics — <span class="accent">Insights & Trends</span>`;
    }
  }

  // Sim Panel
  document.querySelector('.sim-panel-title').innerHTML = `<span class="title-icon">⚙️</span> ${t.sim_controls}`;
  const simSecs = document.querySelectorAll('.sim-section-title');
  if (simSecs[0]) simSecs[0].textContent = t.sim_target;
  if (simSecs[1]) simSecs[1].textContent = t.sim_actions;
  if (simSecs[2]) simSecs[2].textContent = t.sim_security;
  if (simSecs[3]) simSecs[3].textContent = t.sim_management;
  if (simSecs[4]) simSecs[4].textContent = t.sim_quick_actions;

  const simLabels = document.querySelectorAll('.sim-label');
  if (simLabels[0]) simLabels[0].textContent = t.sim_professor;
  if (simLabels[1]) simLabels[1].textContent = t.sim_room;

  document.getElementById('btn-sim-enter').innerHTML = `🚪 ${t.sim_enter}`;
  document.getElementById('btn-sim-exit').innerHTML = `🚶 ${t.sim_exit}`;
  document.getElementById('btn-sim-unknown').innerHTML = `⚠️ ${t.sim_unknown}`;
  document.getElementById('btn-sim-add-prof').innerHTML = `➕ ${t.sim_add_prof}`;
  document.getElementById('btn-sim-reset').innerHTML = `🔄 ${t.sim_reset}`;
  document.getElementById('btn-sim-demo').innerHTML = `🎬 ${t.sim_demo}`;

  // Add Prof Modal
  document.querySelector('#add-prof-modal h3').innerHTML = `➕ ${t.add_prof_title}`;
  const formLabels = document.querySelectorAll('#add-prof-form .form-label');
  if (formLabels[0]) formLabels[0].textContent = t.prof_name;
  if (formLabels[1]) formLabels[1].textContent = t.prof_dept;
  if (formLabels[2]) formLabels[2].textContent = t.prof_course;
  if (formLabels[3]) formLabels[3].textContent = t.prof_photo;

  document.getElementById('add-prof-cancel').textContent = t.btn_cancel;
  document.querySelector('#add-prof-form .form-btn.submit').textContent = `✓ ${t.btn_register}`;

  // Add Class Modal & Button
  const btnAddClass = document.getElementById('btn-add-class');
  if (btnAddClass) btnAddClass.textContent = `➕ ${t.btn_submit_class}`;
  
  const addClassTitle = document.getElementById('add-class-title-h3');
  if (addClassTitle) addClassTitle.textContent = `➕ ${t.add_class_title}`;
  
  const labelCourse = document.getElementById('label-class-course');
  if (labelCourse) labelCourse.textContent = t.class_course;
  
  const labelProf = document.getElementById('label-class-professor');
  if (labelProf) labelProf.textContent = t.class_professor;
  
  const labelRoom = document.getElementById('label-class-room');
  if (labelRoom) labelRoom.textContent = t.class_room;
  
  const labelDay = document.getElementById('label-class-day');
  if (labelDay) labelDay.textContent = t.class_day;
  
  const labelStart = document.getElementById('label-class-start');
  if (labelStart) labelStart.textContent = t.class_start;
  
  const labelDur = document.getElementById('label-class-duration');
  if (labelDur) labelDur.textContent = t.class_duration;
  
  const cancelBtn = document.getElementById('add-class-cancel');
  if (cancelBtn) cancelBtn.textContent = t.btn_cancel;
  
  const submitBtn = document.getElementById('btn-submit-class');
  if (submitBtn) submitBtn.textContent = `✓ ${t.btn_submit_class}`;

  // Department selector options translations
  const optDeptSci = document.getElementById('opt-dept-science');
  if (optDeptSci) optDeptSci.textContent = lang === 'ar' ? DEPARTMENTS.science.nameAr : DEPARTMENTS.science.name;
  const optDeptBiz = document.getElementById('opt-dept-business');
  if (optDeptBiz) optDeptBiz.textContent = lang === 'ar' ? DEPARTMENTS.business.nameAr : DEPARTMENTS.business.name;

  // Professors View Header
  const profsH2 = document.getElementById('professors-title-h2');
  if (profsH2) {
    if (lang === 'ar') {
      profsH2.innerHTML = `دليل أعضاء هيئة التدريس — <span class="accent">ملفات التعريف للأساتذة</span>`;
    } else {
      profsH2.innerHTML = `Faculty Directory — <span class="accent">Professors Profile</span>`;
    }
  }

  // If professors directory is active, re-render to update translations
  if (state.activeView === 'professors') {
    renderProfessorsList();
  }

  // Blueprint translations
  document.getElementById('label-show-free').textContent = t.show_free;
  document.getElementById('label-view-grid').textContent = t.view_grid;
  document.getElementById('label-view-blueprint').textContent = t.view_blueprint;
  document.getElementById('label-gf-blue').textContent = t.gf_blue;
  document.getElementById('label-1f-blue').textContent = t['1f_blue'];
  document.getElementById('label-2f-blue').textContent = t['2f_blue'];

  // Update SVG status texts in real-time
  ROOMS_DATA.forEach(r => {
    const statusEl = document.getElementById(`svg-status-${r.id}`);
    if (statusEl) {
      const room = state.rooms[r.id];
      const term = room.status === 'vacant' ? 'svg_free' : room.status === 'occupied' ? 'svg_occupied' : 'svg_alert';
      statusEl.textContent = t[term];
    }
  });
  
  document.querySelectorAll('.lang-option').forEach(o => {
    o.classList.toggle('active', o.dataset.lang === lang);
  });

  state.currentLang = lang;
  saveState();
}

document.querySelectorAll('.lang-option').forEach(opt => {
  opt.addEventListener('click', (e) => {
    e.stopPropagation();
    const lang = opt.dataset.lang;
    translatePage(lang);
    DOM.langDropdown.classList.remove('open');
    showToast('info', lang === 'ar' ? 'تم تغيير اللغة' : 'Language Changed', lang === 'ar' ? 'تم تحويل التطبيق إلى اللغة العربية' : 'App language set to English');
  });
});

// Add Professor Modal Controls
function showAddProfModal() {
  DOM.addProfModal.classList.add('visible');
  DOM.profName.focus();
}

function hideAddProfModal() {
  DOM.addProfModal.classList.remove('visible');
  DOM.addProfForm.reset();
  DOM.profPhotoPreview.innerHTML = '';
}

DOM.btnAddProf.addEventListener('click', showAddProfModal);
DOM.btnSimAddProf.addEventListener('click', showAddProfModal);
DOM.addProfClose.addEventListener('click', hideAddProfModal);
DOM.addProfCancel.addEventListener('click', hideAddProfModal);
DOM.addProfModal.addEventListener('click', e => { if (e.target === DOM.addProfModal) hideAddProfModal(); });

// Add Class Modal Controls
function showAddClassModal() {
  DOM.addClassModal.classList.add('visible');
  // Populate Professor Selector
  DOM.classProfessor.innerHTML = PROFESSORS.map(p => `<option value="${p.id}">${p.name} — ${p.dept}</option>`).join('');
  // Populate Room Selector (All registered rooms)
  DOM.classRoom.innerHTML = ROOMS_DATA.map(r => `<option value="${r.id}">${r.name} (${r.floor})</option>`).join('');
  DOM.classCourse.focus();
}

function hideAddClassModal() {
  DOM.addClassModal.classList.remove('visible');
  DOM.addClassForm.reset();
}

DOM.btnAddClass.addEventListener('click', showAddClassModal);
DOM.addClassClose.addEventListener('click', hideAddClassModal);
DOM.addClassCancel.addEventListener('click', hideAddClassModal);
DOM.addClassModal.addEventListener('click', e => { if (e.target === DOM.addClassModal) hideAddClassModal(); });

// Add Class Form Submit with Real-time Conflict checking
DOM.addClassForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const course = DOM.classCourse.value.trim();
  const profId = DOM.classProfessor.value;
  const roomId = DOM.classRoom.value;
  const day = parseInt(DOM.classDay.value);
  const start = parseFloat(DOM.classStart.value);
  const duration = parseFloat(DOM.classDuration.value);
  const end = start + duration;

  const isAr = state.currentLang === 'ar';

  if (end > 17.5) {
    showToast('warning', isAr ? 'وقت غير صالح' : 'Invalid Time', isAr ? 'لا يمكن للمحاضرات أن تنتهي بعد الساعة 17:00.' : 'Classes cannot end after 17:00.');
    return;
  }

  // 1. Conflict Check: Room already booked
  const roomConflict = SCHEDULE_DATA.find(s => s.roomId === roomId && s.day === day && (
    (start >= s.start && start < s.end) || 
    (end > s.start && end <= s.end) || 
    (start <= s.start && end >= s.end)
  ));
  if (roomConflict) {
    showToast('danger', 
      isAr ? 'تعارض في القاعة' : 'Room Conflict', 
      isAr 
        ? `هذه القاعة محجوزة بالفعل لمادة "${roomConflict.course}" في هذا الوقت.` 
        : `This room is already scheduled for "${roomConflict.course}" at this time.`
    );
    playSound('alert');
    return;
  }

  // 2. Conflict Check: Professor already teaching
  const profConflict = SCHEDULE_DATA.find(s => s.profId === profId && s.day === day && (
    (start >= s.start && start < s.end) || 
    (end > s.start && end <= s.end) || 
    (start <= s.start && end >= s.end)
  ));
  if (profConflict) {
    const prof = PROFESSORS.find(p => p.id === profId);
    showToast('danger', 
      isAr ? 'تعارض للأستاذ' : 'Professor Conflict', 
      isAr 
        ? `الأستاذ ${prof ? prof.name : profId} يدرس بالفعل مادة "${profConflict.course}" في هذا الوقت.` 
        : `Dr. ${prof ? prof.name : profId} is already teaching "${profConflict.course}" at this time.`
    );
    playSound('alert');
    return;
  }

  const newClass = {
    profId: profId,
    roomId: roomId,
    day: day,
    start: start,
    end: end,
    course: course,
    isCustom: true
  };

  const scheduleLocal = () => {
    SCHEDULE_DATA.push(newClass);
    saveState();
    hideAddClassModal();
    renderSchedule();
    showToast('success', 
      isAr ? 'تم جدولة المحاضرة' : 'Class Scheduled', 
      isAr ? `تمت إضافة محاضرة "${course}" بنجاح.` : `"${course}" scheduled successfully.`
    );
    addLog('system', `Scheduled New Class: ${course} (Room: ${roomId}, Day: ${day}, Time: ${start}-${end})`);
    playSound('success');
  };

  if (!state.isOfflineMode) {
    const dayNames = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
    apiFetch('/schedule', {
      method: 'POST',
      body: JSON.stringify({
        professor_id: profId,
        room_id: roomId,
        day_of_week: dayNames[day],
        start_time: String(start),
        end_time: String(end),
        course: course
      })
    })
    .then(savedClass => {
      newClass.id = savedClass.id;
      scheduleLocal();
    })
    .catch(err => {
      console.warn('API class scheduling failed, saving locally:', err.message);
      showToast('danger', isAr ? 'خطأ في الجدولة' : 'Scheduling Error', err.message || 'Verification failed on server.');
      playSound('alert');
    });
  } else {
    scheduleLocal();
  }
});

// Image preview reader
let uploadedPhotoData = null;
DOM.profPhoto.addEventListener('change', () => {
  const file = DOM.profPhoto.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedPhotoData = e.target.result;
      DOM.profPhotoPreview.innerHTML = `<img src="${uploadedPhotoData}" alt="Preview">`;
    };
    reader.readAsDataURL(file);
  } else {
    uploadedPhotoData = null;
    DOM.profPhotoPreview.innerHTML = '';
  }
});

// Add Professor Form Submit
DOM.addProfForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = DOM.profName.value.trim();
  const dept = DOM.profDept.value.trim();
  const course = DOM.profCourse.value.trim();
  
  if (!name || !dept || !course) return;

  // Initials
  const nameParts = name.replace(/^(Dr\.|Prof\.)\s+/i, '').split(' ');
  const initials = nameParts.map(p => p[0] || '').join('').toUpperCase().slice(0, 2);
  
  // Random color selection
  const color = AVATAR_COLORS[PROFESSORS.length % AVATAR_COLORS.length];
  const newId = 'P-' + String(PROFESSORS.length + 1).padStart(3, '0');

  const newProf = {
    id: newId,
    name: name,
    dept: dept,
    course: course,
    initials: initials,
    color: color,
    avatar: uploadedPhotoData || `assets/prof-${name.toLowerCase().replace(/[^a-z]/g, '-')}.png`,
    isCustom: true
  };

  const isAr = state.currentLang === 'ar';

  const registerLocal = () => {
    PROFESSORS.push(newProf);
    DOM.simProfessor.innerHTML = PROFESSORS.map(p => `<option value="${p.id}">${p.name} — ${p.dept}</option>`).join('');
    DOM.simProfessor.value = newId;
    const classProfSelect = document.getElementById('class-professor');
    if (classProfSelect) {
      classProfSelect.innerHTML = PROFESSORS.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    }
    saveState();
    hideAddProfModal();
    uploadedPhotoData = null;
    addLog('system', `Registered New Professor: ${name} (${dept})`);
    showToast('success', isAr ? 'تم تسجيل الأستاذ' : 'Professor Registered', isAr ? `تم تسجيل ${name} بنجاح.` : `${name} has been registered successfully.`);
    addNotification('success', 'New Registration', `${name} (${dept}) registered into the system.`);
    playSound('success');
  };

  if (!state.isOfflineMode) {
    apiFetch('/professors', {
      method: 'POST',
      body: JSON.stringify({
        id: newId,
        name: name,
        department: dept,
        course: course,
        initials: initials
      })
    })
    .then(savedProf => {
      newProf.id = savedProf.id;
      registerLocal();
    })
    .catch(err => {
      console.warn('API professor register failed, saving locally:', err.message);
      showToast('warning', isAr ? 'فشل الاتصال بالخادم' : 'Sync Failed', isAr ? 'تم الحفظ محلياً في ذاكرة المتصفح.' : 'Registered locally in browser storage.');
      registerLocal();
    });
  } else {
    registerLocal();
  }
});

// Search
DOM.mapSearch.addEventListener('input', () => {
  const q = DOM.mapSearch.value.toLowerCase().trim();
  document.querySelectorAll('.room-card').forEach(card => {
    card.classList.remove('highlighted');
    if (!q) return;
    const r = state.rooms[card.dataset.roomId];
    const s = [r.name, r.type, r.occupant?r.occupant.name:'', r.className||'', r.camId].join(' ').toLowerCase();
    if (s.includes(q)) card.classList.add('highlighted');
  });
});

// Grid vs Blueprint View Switching
DOM.btnKioskGrid.addEventListener('click', () => {
  DOM.btnKioskGrid.classList.add('active');
  DOM.btnKioskMap.classList.remove('active');
  DOM.kioskCardsContainer.style.display = 'flex';
  DOM.kioskBlueprintContainer.style.display = 'none';
});

DOM.btnKioskMap.addEventListener('click', () => {
  DOM.btnKioskMap.classList.add('active');
  DOM.btnKioskGrid.classList.remove('active');
  DOM.kioskCardsContainer.style.display = 'none';
  DOM.kioskBlueprintContainer.style.display = 'flex';
  renderKioskBlueprint();
  DEPARTMENTS[state.currentDept].roomIds.forEach(id => {
    updateRoomCard(id);
  });
  // Force browser layout repaint for SVG viewBox scaling
  window.dispatchEvent(new Event('resize'));
});

// Show Free Only Filter Checkbox handler
DOM.checkboxFilterFree.addEventListener('change', () => {
  applyFreeRoomsFilter();
  const isChecked = DOM.checkboxFilterFree.checked;
  const isAr = state.currentLang === 'ar';
  showToast('info', 
    isAr ? 'تصفية القاعات' : 'Filter Applied', 
    isAr 
      ? (isChecked ? 'تم إخفاء القاعات المشغولة' : 'تم إظهار جميع القاعات') 
      : (isChecked ? 'Occupied rooms hidden' : 'Showing all rooms')
  );
});

// Department Switcher dropdown handler
DOM.selectKioskDept.addEventListener('change', (e) => {
  switchKioskDept(e.target.value);
});

// Free Rooms Filter Logic Helper
function applyFreeRoomsFilter() {
  const showFreeOnly = DOM.checkboxFilterFree.checked;
  
  // Apply to Cards
  document.querySelectorAll('#floor-plan-cards-container .room-card').forEach(card => {
    const roomId = card.dataset.roomId;
    const room = state.rooms[roomId];
    if (showFreeOnly && room.status !== 'vacant') {
      card.classList.add('filtered-out');
    } else {
      card.classList.remove('filtered-out');
    }
  });

  // Apply to SVG Blueprint
  document.querySelectorAll('.blueprint-room').forEach(svgRoom => {
    const roomId = svgRoom.dataset.svgRoomId;
    const room = state.rooms[roomId];
    if (showFreeOnly && room.status !== 'vacant') {
      svgRoom.classList.add('filtered-out');
    } else {
      svgRoom.classList.remove('filtered-out');
    }
  });
}

// Blueprint Room Click Handler -> Modal detail popup
document.querySelectorAll('.blueprint-room').forEach(svgRoom => {
  svgRoom.addEventListener('click', () => {
    const roomId = svgRoom.dataset.svgRoomId;
    const room = state.rooms[roomId];
    if (!room) return;
    
    // Open standard modal detail
    DOM.modalRoomName.textContent = room.name;
    const sc = room.status==='vacant'?'var(--emerald)':room.status==='occupied'?'var(--rose)':'var(--amber)';
    const isAr = state.currentLang === 'ar';
    let st = isAr ? 'شاغرة' : 'Vacant';
    if (room.status === 'occupied') st = isAr ? 'مشغولة' : 'Occupied';
    if (room.status === 'alert') st = isAr ? 'تنبيه' : 'Alert';
    
    let occ = isAr ? 'لا أحد' : 'None';
    let occAvatar = '';
    if (room.occupant) {
      occ = room.occupant.name;
      occAvatar = `<div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(255,255,255,0.03);border-radius:12px;margin-bottom:8px;">${profAvatarHTML(room.occupant, 52)}<div style="display:flex;flex-direction:column;gap:2px;"><span style="color:#e8edf5;font-weight:700;font-size:1rem;">${room.occupant.name}</span><span style="color:rgba(255,255,255,0.5);font-size:0.8rem;">${room.occupant.dept}</span><span style="color:var(--cyan);font-size:0.8rem;">${room.occupant.course}</span></div></div>`;
    } else if (room.alertPerson) {
      occ = isAr ? '⚠ شخص غير مسجل' : '⚠ Unregistered Person';
    }
    const fl = room.floor==='GF' 
      ? (isAr ? 'الطابق الأرضي' : 'Ground Floor') 
      : room.floor==='1F' 
        ? (isAr ? 'الطابق الأول' : 'First Floor') 
        : (isAr ? 'الطابق الثاني' : 'Second Floor');
        
    DOM.modalBody.innerHTML = `
      ${occAvatar}
      <div class="modal-detail"><div class="md-icon">📍</div><div class="md-info"><span class="md-label">${isAr ? 'الموقع' : 'Location'}</span><span class="md-value">${fl} — ${room.type}</span></div></div>
      <div class="modal-detail"><div class="md-icon">🔲</div><div class="md-info"><span class="md-label">${isAr ? 'الحالة' : 'Status'}</span><span class="md-value" style="color:${sc}">${st}</span></div></div>
      <div class="modal-detail"><div class="md-icon">👥</div><div class="md-info"><span class="md-label">${isAr ? 'السعة الاستيعابية' : 'Capacity'}</span><span class="md-value">${room.capacity||'—'} ${isAr ? 'مقاعد' : 'seats'}</span></div></div>
      <div class="modal-detail"><div class="md-icon">👤</div><div class="md-info"><span class="md-label">${isAr ? 'المستخدم الحالي' : 'Current Occupant'}</span><span class="md-value">${occ}</span></div></div>
      <div class="modal-detail"><div class="md-icon">📖</div><div class="md-info"><span class="md-label">${isAr ? 'المادة الجارية' : 'Active Course'}</span><span class="md-value">${room.className||(isAr ? 'لا يوجد' : 'None')}</span></div></div>
      <div class="modal-detail"><div class="md-icon">📹</div><div class="md-info"><span class="md-label">${isAr ? 'تلقيم الكاميرا' : 'Camera Feed'}</span><span class="md-value">${room.camId}</span></div></div>`;
    DOM.roomModal.classList.add('visible');
  });
});

// Canvas resize
let resizeTimeout;
window.addEventListener('resize', () => { clearTimeout(resizeTimeout); resizeTimeout = setTimeout(()=>{ if(state.activeView==='admin') initCameraCanvases(); }, 200); });

// ======================= SCHEDULE ENGINE =======================

function renderSchedule() {
  const now = new Date();
  const rawDay = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const todayIdx = rawDay === 6 ? 0 : rawDay + 1; // Map to: Sat=0, Sun=1, Mon=2, Tue=3, Wed=4, Thu=5, Fri=6
  const currentHour = now.getHours() + now.getMinutes()/60;

  // Day nav
  DOM.scheduleDayNav.innerHTML = DAY_SHORT.map((d, i) =>
    `<button class="schedule-day-btn ${i === Math.min(todayIdx, 5) ? 'active' : ''}" data-day="${i}">${d}</button>`
  ).join('');

  // Build grid
  let html = '';
  // Header row
  html += `<div class="schedule-corner">TIME</div>`;
  DAY_SHORT.forEach((d, i) => {
    html += `<div class="schedule-day-header ${i === todayIdx && todayIdx < 6 ? 'today' : ''}">${d}</div>`;
  });

  // Time rows (1.5-hour sessions)
  TIME_SLOTS.forEach(slot => {
    html += `<div class="schedule-time-label" style="font-size:0.75rem; font-family:var(--font-mono); color:var(--cyan); height: 75px; display:flex; align-items:center; justify-content:center;">${slot.label}</div>`;
    for (let day = 0; day < 6; day++) {
      const blocks = SCHEDULE_DATA.filter(s => s.day === day && Math.abs(s.start - slot.start) < 0.1);
      let cellContent = '';
      blocks.forEach(s => {
        const prof = PROFESSORS.find(p => p.id === s.profId);
        const room = ROOMS_DATA.find(r => r.id === s.roomId);
        let blockStatus = 'upcoming';
        if (day < todayIdx) blockStatus = 'completed';
        else if (day === todayIdx && todayIdx < 6) {
          if (currentHour >= s.end) blockStatus = 'completed';
          else if (currentHour >= s.start) {
            const roomState = state.rooms[s.roomId];
            if (roomState && roomState.status === 'occupied' && roomState.occupant && roomState.occupant.id === s.profId) {
              blockStatus = 'active';
            } else {
              blockStatus = 'late';
            }
          }
        }
        const span = s.end - s.start; // e.g. 1.5 or 3.0
        const blockHeight = (span / 1.5) * 65;
        const statusLabels = { active:'ACTIVE', late:'LATE', upcoming:'UPCOMING', completed:'DONE', missed:'MISSED' };
        const schedAvatar = prof ? `<div style="display:flex;align-items:center;gap:6px;margin-top:2px;">${profAvatarHTML(prof, 20)}<span class="sb-prof" style="font-size:0.7rem; font-weight:600;">${prof.name}</span></div>` : '<div class="sb-prof">TBD</div>';
        cellContent += `
          <div class="schedule-block ${blockStatus}" style="min-height:${blockHeight}px; margin-bottom: 4px; padding: 6px; display:flex; flex-direction:column; justify-content:space-between; border-radius: 6px;">
            <div class="sb-course" style="font-size: 0.72rem; font-weight:700; line-height:1.2; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;" title="${s.course}">${s.course}</div>
            ${schedAvatar}
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:2px;">
              <span class="sb-room" style="font-size: 0.65rem; font-family:var(--font-mono);">${room ? room.name : 'TBD'}</span>
              <span class="sb-status-tag" style="font-size:0.55rem; padding: 1px 4px; border-radius: 4px;">${statusLabels[blockStatus]}</span>
            </div>
          </div>`;
      });
      html += `<div class="schedule-cell" style="height: 75px; padding: 4px; overflow:hidden;">${cellContent}</div>`;
    }
  });

  DOM.scheduleGrid.innerHTML = html;
}

// ======================= ANALYTICS ENGINE =======================

function renderAnalytics() {
  // Summary cards
  const totalLogs = state.attendanceLogs.length + 47; // Base + simulated
  const avgPunctuality = state.analyticsData.punctuality.onTime;
  const busiestRoom = state.analyticsData.roomUtil.reduce((a,b)=>a.pct>b.pct?a:b, {room:'—',pct:0});
  DOM.analyticsSummary.innerHTML = `
    <div class="summary-card"><div class="sc-label">Total Attendance Records</div><div class="sc-value">${totalLogs}</div><div class="sc-change positive">↑ 12% vs last week</div></div>
    <div class="summary-card"><div class="sc-label">Average Punctuality</div><div class="sc-value" style="color:var(--emerald)">${avgPunctuality}%</div><div class="sc-change positive">↑ 3% improvement</div></div>
    <div class="summary-card"><div class="sc-label">Busiest Room</div><div class="sc-value" style="color:var(--cyan)">${busiestRoom.room}</div><div class="sc-change neutral">${busiestRoom.pct}% utilization</div></div>
    <div class="summary-card"><div class="sc-label">Active Professors</div><div class="sc-value" style="color:var(--purple)">${PROFESSORS.length}</div><div class="sc-change neutral">All departments covered</div></div>
  `;

  // Draw charts
  setTimeout(() => {
    drawAttendanceTrend();
    drawRoomUtilization();
    drawPunctualityDonut();
    drawPeakHoursHeatmap();
  }, 100);
}

function drawAttendanceTrend() {
  const canvas = document.getElementById('chart-attendance-trend');
  if (!canvas) return;
  const container = canvas.parentElement;
  canvas.width = container.offsetWidth;
  canvas.height = 250;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const data = state.analyticsData.trend;
  const pad = { top:30, right:30, bottom:40, left:50 };
  const cw = w - pad.left - pad.right;
  const ch = h - pad.top - pad.bottom;
  const maxVal = Math.max(...data.map(d=>d.count)) * 1.2;

  // Background
  ctx.fillStyle = '#0d1528'; ctx.fillRect(0,0,w,h);

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (ch/4)*i;
    ctx.beginPath(); ctx.moveTo(pad.left,y); ctx.lineTo(w-pad.right,y); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '10px "JetBrains Mono"'; ctx.textAlign='right';
    ctx.fillText(Math.round(maxVal - (maxVal/4)*i), pad.left-8, y+4);
  }

  // Gradient fill
  const gradient = ctx.createLinearGradient(0, pad.top, 0, h-pad.bottom);
  gradient.addColorStop(0, 'rgba(0,212,255,0.2)');
  gradient.addColorStop(1, 'rgba(0,212,255,0)');

  // Line + fill
  ctx.beginPath();
  data.forEach((d, i) => {
    const x = pad.left + (cw/(data.length-1))*i;
    const y = pad.top + ch - (d.count/maxVal)*ch;
    if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.strokeStyle = '#00d4ff'; ctx.lineWidth = 2.5; ctx.stroke();

  // Fill area
  ctx.lineTo(pad.left+cw, pad.top+ch); ctx.lineTo(pad.left, pad.top+ch); ctx.closePath();
  ctx.fillStyle = gradient; ctx.fill();

  // Dots
  data.forEach((d, i) => {
    const x = pad.left + (cw/(data.length-1))*i;
    const y = pad.top + ch - (d.count/maxVal)*ch;
    ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2);
    ctx.fillStyle = '#00d4ff'; ctx.fill();
    ctx.strokeStyle = '#0d1528'; ctx.lineWidth=2; ctx.stroke();
    // Label
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font='10px "JetBrains Mono"'; ctx.textAlign='center';
    ctx.fillText(d.day, x, h-pad.bottom+18);
  });
}

function drawRoomUtilization() {
  const canvas = document.getElementById('chart-room-util');
  if (!canvas) return;
  const container = canvas.parentElement;
  canvas.width = container.offsetWidth;
  canvas.height = 250;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const data = state.analyticsData.roomUtil;
  const pad = { top:20, right:20, bottom:50, left:50 };
  const cw = w - pad.left - pad.right;
  const ch = h - pad.top - pad.bottom;
  const barW = (cw/data.length) * 0.6;
  const gap = (cw/data.length) * 0.4;

  ctx.fillStyle = '#0d1528'; ctx.fillRect(0,0,w,h);

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth=1;
  for(let i=0;i<=4;i++){ const y=pad.top+(ch/4)*i; ctx.beginPath();ctx.moveTo(pad.left,y);ctx.lineTo(w-pad.right,y);ctx.stroke(); ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='10px "JetBrains Mono"'; ctx.textAlign='right'; ctx.fillText(100-(25*i)+'%',pad.left-8,y+4); }

  // Bars
  const colors = ['#00d4ff','#a855f7','#00ff88','#ff3366','#f59e0b','#ec4899','#6366f1','#14b8a6'];
  data.forEach((d, i) => {
    const x = pad.left + (cw/data.length)*i + gap/2;
    const barH = (d.pct/100)*ch;
    const y = pad.top + ch - barH;
    const grad = ctx.createLinearGradient(x,y,x,y+barH);
    grad.addColorStop(0, colors[i%colors.length]);
    grad.addColorStop(1, colors[i%colors.length]+'40');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, barW, barH, [4,4,0,0]);
    ctx.fill();
    // Label
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font='9px "JetBrains Mono"'; ctx.textAlign='center';
    ctx.fillText(d.room, x+barW/2, h-pad.bottom+15);
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillText(d.pct+'%', x+barW/2, y-6);
  });
}

function drawPunctualityDonut() {
  const canvas = document.getElementById('chart-punctuality');
  if (!canvas) return;
  const container = canvas.parentElement;
  canvas.width = container.offsetWidth;
  canvas.height = 250;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.fillStyle = '#0d1528'; ctx.fillRect(0,0,w,h);
  const cx = w/2, cy = h/2;
  const radius = Math.min(w,h)/2 - 40;
  const innerR = radius * 0.6;
  const { onTime, late, absent } = state.analyticsData.punctuality;
  const total = onTime+late+absent;
  const segments = [
    { val:onTime, color:'#00ff88', label:'On Time' },
    { val:late,   color:'#ffaa00', label:'Late' },
    { val:absent, color:'#ff3366', label:'Absent' },
  ];

  let startAngle = -Math.PI/2;
  segments.forEach(seg => {
    const sweep = (seg.val/total)*Math.PI*2;
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,radius,startAngle,startAngle+sweep);
    ctx.closePath(); ctx.fillStyle=seg.color; ctx.fill();
    startAngle += sweep;
  });

  // Inner circle (donut hole)
  ctx.beginPath(); ctx.arc(cx,cy,innerR,0,Math.PI*2);
  ctx.fillStyle='#0d1528'; ctx.fill();

  // Center text
  ctx.fillStyle='#e8edf5'; ctx.font='bold 24px "Plus Jakarta Sans"'; ctx.textAlign='center';
  ctx.fillText(onTime+'%', cx, cy+2);
  ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='11px "Plus Jakarta Sans"';
  ctx.fillText('On Time', cx, cy+18);

  // Legend
  let ly = h - 20;
  ctx.textAlign='left';
  segments.forEach((seg,i) => {
    const lx = 20 + i * (w/3);
    ctx.fillStyle=seg.color; ctx.fillRect(lx,ly,10,10);
    ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='10px "JetBrains Mono"';
    ctx.fillText(`${seg.label}: ${seg.val}%`, lx+14, ly+9);
  });
}

function drawPeakHoursHeatmap() {
  const canvas = document.getElementById('chart-peak-hours');
  if (!canvas) return;
  const container = canvas.parentElement;
  canvas.width = container.offsetWidth;
  canvas.height = 250;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.fillStyle = '#0d1528'; ctx.fillRect(0,0,w,h);

  const days = DAY_SHORT;
  const hours = ['08','09','10','11','12','13','14','15','16','17'];
  const pad = { top:30, right:15, bottom:30, left:45 };
  const cw = w - pad.left - pad.right;
  const ch = h - pad.top - pad.bottom;
  const cellW = cw / hours.length;
  const cellH = ch / days.length;

  // Generate heatmap data
  const heatData = days.map(() => hours.map(() => Math.random()));

  // Peak hours during class times
  SCHEDULE_DATA.forEach(s => {
    for (let hr = s.start; hr < s.end && hr < 18; hr++) {
      const hi = hr - 8;
      if (hi >= 0 && hi < hours.length) {
        heatData[s.day][hi] = Math.min(1, heatData[s.day][hi] + 0.3);
      }
    }
  });

  // Draw cells
  heatData.forEach((row, di) => {
    row.forEach((val, hi) => {
      const x = pad.left + hi * cellW;
      const y = pad.top + di * cellH;
      const intensity = Math.min(1, val);
      const r = Math.floor(0 + intensity * 0);
      const g = Math.floor(30 + intensity * 180);
      const b = Math.floor(50 + intensity * 205);
      ctx.fillStyle = `rgba(${r},${g},${b},${0.3 + intensity * 0.7})`;
      ctx.beginPath();
      ctx.roundRect(x+1, y+1, cellW-2, cellH-2, 3);
      ctx.fill();
    });
  });

  // Labels
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font='9px "JetBrains Mono"'; ctx.textAlign='center';
  hours.forEach((hr, i) => { ctx.fillText(hr+':00', pad.left + i*cellW + cellW/2, h - pad.bottom + 16); });
  ctx.textAlign='right';
  days.forEach((d, i) => { ctx.fillText(d, pad.left - 8, pad.top + i*cellH + cellH/2 + 4); });
}

// ======================= PROFESSORS DIRECTORY =======================
function renderProfessorsList() {
  const grid = DOM.professorsListGrid;
  if (!grid) return;
  
  const isAr = state.currentLang === 'ar';
  
  grid.innerHTML = PROFESSORS.map(prof => {
    // Find current room
    let currentRoom = null;
    Object.values(state.rooms).forEach(room => {
      if (room.status === 'occupied' && room.occupant && room.occupant.id === prof.id) {
        currentRoom = room;
      }
    });
    
    let statusClass = 'vacant';
    let statusText = isAr ? '💤 خارج الخدمة / غير متواجد' : '💤 Away / Off-Duty';
    if (currentRoom) {
      statusClass = 'occupied';
      statusText = isAr 
        ? `📍 متواجد في ${currentRoom.name}` 
        : `📍 Present in ${currentRoom.name}`;
    }
    
    return `
      <div class="room-card ${statusClass}" style="cursor: default; min-height: 190px; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 12px;">
            ${profAvatarHTML(prof, 56)}
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 1rem; font-weight: 700; color: var(--text-primary);">${prof.name}</span>
              <span style="font-size: 0.72rem; font-family: var(--font-mono); color: var(--text-muted); margin-top: 2px;">${prof.id}</span>
            </div>
          </div>
          <div class="room-details" style="margin-bottom: 12px; gap: 4px;">
            <div class="room-detail-row">
              <span class="detail-icon">🏛️</span>
              <span class="detail-label" style="min-width: 70px;">${isAr ? 'القسم:' : 'Dept:'}</span>
              <span class="detail-value">${prof.dept}</span>
            </div>
            <div class="room-detail-row">
              <span class="detail-icon">📖</span>
              <span class="detail-label" style="min-width: 70px;">${isAr ? 'المادة:' : 'Course:'}</span>
              <span class="detail-value">${prof.course}</span>
            </div>
          </div>
        </div>
        <div style="padding: 8px 12px; border-radius: 8px; font-size: 0.78rem; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; width: 100%; justify-content: center; background: ${statusClass === 'occupied' ? 'var(--rose-bg)' : 'rgba(255,255,255,0.03)'}; border: 1px solid ${statusClass === 'occupied' ? 'rgba(255,51,102,0.15)' : 'var(--border)'}; color: ${statusClass === 'occupied' ? 'var(--rose)' : 'var(--text-secondary)'};">
          ${statusText}
        </div>
      </div>
    `;
  }).join('');
}

// ======================= LOCALSTORAGE PERSISTENCE =======================

function saveState() {
  try {
    const save = {
      rooms: Object.fromEntries(Object.entries(state.rooms).map(([k,v]) => [k, { status:v.status, occupantId:v.occupant?.id||null, className:v.className, alertPerson:v.alertPerson }])),
      attendanceLogs: state.attendanceLogs.slice(0,50),
      detectedProfessors: [...state.detectedProfessors],
      notifications: state.notifications.slice(0,30),
      customProfessors: PROFESSORS.filter(p => p.isCustom),
      customSchedule: SCHEDULE_DATA.filter(s => s.isCustom),
      customRooms: state.customRooms,
      currentDept: state.currentDept,
      theme: document.body.getAttribute('data-theme') || 'default',
      lang: state.currentLang,
    };
    localStorage.setItem('univision_state', JSON.stringify(save));
  } catch(e) { /* Storage not available */ }
}

function loadState() {
  try {
    const raw = localStorage.getItem('univision_state');
    if (!raw) {
      translatePage('en');
      switchKioskDept('science');
      return;
    }
    const save = JSON.parse(raw);
    
    // Restore Theme
    if (save.theme) {
      setAppTheme(save.theme);
    }

    // Restore Custom Professors
    if (save.customProfessors) {
      save.customProfessors.forEach(p => {
        if (!PROFESSORS.some(existing => existing.id === p.id)) {
          PROFESSORS.push(p);
        }
      });
      DOM.simProfessor.innerHTML = PROFESSORS.map(p => `<option value="${p.id}">${p.name} — ${p.dept}</option>`).join('');
    }

    // Restore Custom Schedule Classes
    if (save.customSchedule) {
      save.customSchedule.forEach(s => {
        if (!SCHEDULE_DATA.some(existing => existing.profId === s.profId && existing.roomId === s.roomId && existing.day === s.day && existing.start === s.start)) {
          SCHEDULE_DATA.push(s);
        }
      });
    }

    // Restore Custom Rooms designed by user
    if (save.customRooms && save.customRooms.length > 0) {
      state.customRooms = save.customRooms;
      state.customRooms.forEach(r => {
        if (!ROOMS_DATA.some(existing => existing.id === r.id)) {
          ROOMS_DATA.push(r);
        }
        if (!state.rooms[r.id]) {
          state.rooms[r.id] = { ...r, status: 'vacant', occupant: null, className: null, detectionActive: false, alertPerson: false };
        }
      });

      // Inject custom option in dropdown
      if (!DOM.selectKioskDept.querySelector('option[value="custom"]')) {
        const opt = document.createElement('option');
        opt.value = 'custom';
        opt.id = 'opt-dept-custom';
        opt.textContent = save.lang === 'ar' ? 'مخطط الحرم المخصص' : 'Custom Campus Layout';
        DOM.selectKioskDept.appendChild(opt);
      }

      // Populate custom department layout
      DEPARTMENTS.custom = {
        name: "Custom Campus Layout",
        nameAr: "مخطط الحرم المخصص",
        roomIds: state.customRooms.map(r => r.id),
        blueprint: generateCustomBlueprint()
      };
    }

    if (save.rooms) {
      Object.entries(save.rooms).forEach(([id, data]) => {
        if (state.rooms[id]) {
          state.rooms[id].status = data.status || 'vacant';
          state.rooms[id].alertPerson = data.alertPerson || false;
          state.rooms[id].className = data.className || null;
          if (data.occupantId) {
            const prof = PROFESSORS.find(p => p.id === data.occupantId);
            state.rooms[id].occupant = prof || null;
          }
        }
      });
    }
    if (save.detectedProfessors) save.detectedProfessors.forEach(id => state.detectedProfessors.add(id));
    if (save.notifications) { state.notifications = save.notifications; state.unreadCount = save.notifications.filter(n=>!n.read).length; renderNotifications(); }
    if (save.attendanceLogs && save.attendanceLogs.length) {
      DOM.dbEmpty.style.display = 'none';
      save.attendanceLogs.reverse().forEach(rec => {
        state.attendanceLogs.unshift(rec);
        const tr = document.createElement('tr');
        const sc = rec.status==='Present'||rec.status==='Auto-Logged'?'auto-logged':rec.status==='Departed'?'departed':'alert';
        const profObj = rec.professorObj || PROFESSORS.find(p => p.name === rec.professor);
        const profCell = profObj ? `<div style="display:flex;align-items:center;gap:8px;">${profAvatarHTML(profObj, 28)}<span>${rec.professor}</span></div>` : rec.professor;
        tr.innerHTML = `<td>${rec.timestamp}</td><td>${rec.room}</td><td>${profCell}</td><td>${rec.course}</td><td><span class="attendance-status ${sc}">${rec.status}</span></td><td><span class="method-badge">${rec.method}</span></td>`;
        DOM.attendanceBody.prepend(tr);
      });
      DOM.recordsBadge.textContent = `${state.attendanceLogs.length} Records`;
    }
    updateStats();

    // Restore active department
    if (save.currentDept) {
      switchKioskDept(save.currentDept);
      DOM.selectKioskDept.value = save.currentDept;
    } else {
      switchKioskDept('science');
    }

    if (save.lang) {
      translatePage(save.lang);
    } else {
      translatePage('en');
    }
  } catch(e) { /* Storage not available or corrupted */ }
}

// Auto-save every 10 seconds
setInterval(saveState, 10000);

// Load saved state on startup
loadState();
initDataFromBackend();

// ======================= MAP DESIGNER ENGINE =======================

function generateCustomBlueprint() {
  const floors = { GF: [], '1F': [], '2F': [] };
  state.customRooms.forEach(room => {
    floors[room.floor].push(room);
  });

  let blueprintHTML = '';
  const isAr = state.currentLang === 'ar';
  
  Object.entries(floors).forEach(([floorName, rooms]) => {
    if (rooms.length === 0) return;
    let svgRoomsHTML = '';
    rooms.forEach((room, idx) => {
      const colWidth = 470 / Math.max(rooms.length, 1);
      const x = 10 + idx * colWidth;
      const w = colWidth - 10;
      svgRoomsHTML += `
        <g class="blueprint-room vacant" data-svg-room-id="${room.id}">
          <rect x="${x}" y="10" width="${w}" height="90" rx="6" />
          <text x="${x + w/2}" y="55" class="blueprint-room-name" text-anchor="middle">${room.name}</text>
          <text x="${x + w/2}" y="75" class="blueprint-room-status" id="svg-status-${room.id}" text-anchor="middle">${isAr ? 'شاغرة' : 'Free'}</text>
        </g>`;
    });
    
    blueprintHTML += `
      <div class="floor-section">
        <div class="floor-label"><span class="floor-badge">${floorName}</span><h3 id="label-${floorName.toLowerCase()}-blue">${floorName} — Blueprint</h3></div>
        <div class="blueprint-wrapper" style="position:relative; width:100%; max-width:800px; margin:0 auto;">
          <svg viewBox="0 0 500 150" class="blueprint-svg">
            ${svgRoomsHTML}
            <rect x="10" y="110" width="470" height="30" rx="4" fill="rgba(255,255,255,0.02)" stroke="var(--border)" stroke-dasharray="4 4" />
            <text x="245" y="128" fill="var(--text-muted)" font-size="10" font-family="var(--font-mono)" text-anchor="middle">CORRIDOR / الممر</text>
          </svg>
        </div>
      </div>`;
  });

  return blueprintHTML;
}

function renderDesignerWorkspace() {
  const roomListEl = document.getElementById('designer-room-list');
  const workspaceEl = document.getElementById('designer-grid-workspace');
  if (!roomListEl || !workspaceEl) return;

  const isAr = state.currentLang === 'ar';

  if (state.customRooms.length === 0) {
    roomListEl.innerHTML = `<div style="color:var(--text-muted); font-size:0.8rem; text-align:center; padding:20px 0;">${isAr ? 'لم يتم إضافة قاعات بعد. حدد الخصائص واضغط إضافة قاعة.' : 'No rooms added yet. Configure parameters and click Add Room.'}</div>`;
    workspaceEl.innerHTML = `
      <div style="text-align:center; color:var(--text-muted); grid-column: 1 / -1; padding: 40px 0;">
        <div style="font-size:3rem; margin-bottom:12px;">🗺️</div>
        <div style="font-size:1rem; font-weight:700; margin-bottom:4px; color:#fff;">${isAr ? 'مساحة عمل مصمم الخرائط التفاعلي' : 'Interactive Visual Designer Workspace'}</div>
        <div style="font-size:0.8rem; max-width:400px; margin:0 auto;">${isAr ? 'استخدم لوحة الخصائص على اليسار لإضافة قاعات. قم بترتيب وتعديل القاعات في هذه المساحة.' : 'Use the parameter panel on the left to add rooms. Configure and preview your custom wing map within this blueprint grid.'}</div>
      </div>`;
    return;
  }

  // Render left list of rooms
  roomListEl.innerHTML = state.customRooms.map((room, idx) => {
    return `
      <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 12px; background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:8px;">
        <div style="display:flex; flex-direction:column; gap:2px;">
          <span style="font-weight:700; font-size:0.82rem; color:#fff;">${room.name}</span>
          <span style="font-size:0.7rem; color:var(--text-muted);">${room.floor} • ${room.type} • ${room.capacity} seats</span>
        </div>
        <button onclick="removeDesignedRoom(${idx})" style="background:none; border:none; color:var(--rose); cursor:pointer; font-size:0.9rem; padding:4px;" title="Remove Room">✕</button>
      </div>
    `;
  }).join('');

  // Render right visual layout preview blocks
  workspaceEl.innerHTML = state.customRooms.map((room, idx) => {
    return `
      <div class="room-card vacant" style="cursor:default; height:130px; display:flex; flex-direction:column; justify-content:space-between; padding:12px; border: 1px solid var(--border); border-radius:10px; background:var(--bg-card); position:relative;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <div style="font-weight:800; font-size:0.82rem; color:#fff; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:110px;">${room.name}</div>
            <div style="font-size:0.65rem; color:var(--text-muted); margin-top:2px;">${room.type}</div>
          </div>
          <span style="font-size:0.65rem; padding:2px 6px; border-radius:4px; background:rgba(0,255,136,0.1); color:var(--emerald); font-weight:700;">${room.floor}</span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.68rem; color:var(--text-secondary);">👥 ${room.capacity} seats</span>
          <span style="font-size:0.65rem; font-family:var(--font-mono); color:var(--text-muted);">${room.camId}</span>
        </div>
      </div>
    `;
  }).join('');
}

// Global window handle to support delete button inside rendered template inline onclick
window.removeDesignedRoom = function(idx) {
  const isAr = state.currentLang === 'ar';
  const name = state.customRooms[idx].name;
  state.customRooms.splice(idx, 1);
  renderDesignerWorkspace();
  showToast('info', isAr ? 'تم إزالة القاعة' : 'Room Removed', isAr ? `تم حذف قاعة ${name} من المخطط.` : `Deleted ${name} from your designed layout.`);
  saveState();
};

// Add Room click handler
const btnDesignAdd = document.getElementById('btn-design-add');
if (btnDesignAdd) {
  btnDesignAdd.addEventListener('click', () => {
    const nameEl = document.getElementById('design-room-name');
    const floorEl = document.getElementById('design-room-floor');
    const capEl = document.getElementById('design-room-cap');
    const typeEl = document.getElementById('design-room-type');
    if (!nameEl || !floorEl || !capEl || !typeEl) return;

    const name = nameEl.value.trim();
    const floor = floorEl.value;
    const capacity = parseInt(capEl.value) || 30;
    const type = typeEl.value;

    const isAr = state.currentLang === 'ar';

    if (!name) {
      showToast('warning', isAr ? 'اسم غير صالح' : 'Invalid Name', isAr ? 'يرجى إدخال اسم القاعة أولاً.' : 'Please enter a room name first.');
      return;
    }

    const roomId = `custom-${state.customRooms.length + 1}`;
    state.customRooms.push({
      id: roomId,
      name: name,
      floor: floor,
      capacity: capacity,
      type: type,
      camId: `CAM-C${state.customRooms.length + 1}`
    });

    // Reset inputs
    nameEl.value = '';
    capEl.value = '';

    renderDesignerWorkspace();
    showToast('success', isAr ? 'تم إضافة القاعة' : 'Room Added', isAr ? `تم إضافة ${name} إلى المخطط.` : `Added ${name} to your custom layout.`);
    saveState();
  });
}

// Clear map handler
const btnDesignClear = document.getElementById('btn-design-clear');
if (btnDesignClear) {
  btnDesignClear.addEventListener('click', () => {
    const isAr = state.currentLang === 'ar';
    state.customRooms = [];
    renderDesignerWorkspace();
    showToast('info', isAr ? 'تم مسح المخطط' : 'Layout Cleared', isAr ? 'تم إفراغ مساحة تصميم المخطط.' : 'Your designer workspace has been reset.');
    saveState();
  });
}

// Apply & Load Custom Map handler
const btnDesignApply = document.getElementById('btn-design-apply');
if (btnDesignApply) {
  btnDesignApply.addEventListener('click', () => {
    const isAr = state.currentLang === 'ar';
    if (state.customRooms.length === 0) {
      showToast('warning', isAr ? 'مخطط فارغ' : 'Empty Layout', isAr ? 'لا يمكن تطبيق مخطط فارغ. يرجى إضافة قاعات أولاً.' : 'Cannot apply empty layout. Please add designed rooms first.');
      return;
    }

    // Register all custom rooms in ROOMS_DATA and state.rooms
    state.customRooms.forEach(r => {
      if (!ROOMS_DATA.some(existing => existing.id === r.id)) {
        ROOMS_DATA.push(r);
      }
      if (!state.rooms[r.id]) {
        state.rooms[r.id] = { ...r, status: 'vacant', occupant: null, className: null, detectionActive: false, alertPerson: false };
      }
    });

    // Inject custom option in dropdown
    if (!DOM.selectKioskDept.querySelector('option[value="custom"]')) {
      const opt = document.createElement('option');
      opt.value = 'custom';
      opt.id = 'opt-dept-custom';
      opt.textContent = isAr ? 'مخطط الحرم المخصص' : 'Custom Campus Layout';
      DOM.selectKioskDept.appendChild(opt);
    }

    // Populate custom department layout
    DEPARTMENTS.custom = {
      name: "Custom Campus Layout",
      nameAr: "مخطط الحرم المخصص",
      roomIds: state.customRooms.map(r => r.id),
      blueprint: generateCustomBlueprint()
    };

    // Save State
    saveState();

    // Switch Department to Custom
    switchKioskDept('custom');
    DOM.selectKioskDept.value = 'custom';

    // Switch Tab View to Kiosk (Entrance Map)
    state.activeView = 'kiosk';
    DOM.viewTabs.forEach(t => t.classList.toggle('active', t.dataset.view === 'kiosk'));
    Object.entries(VIEWS).forEach(([k,id]) => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('active', k === 'kiosk');
    });

    showToast('success', isAr ? 'تم تطبيق المخطط' : 'Layout Applied', isAr ? 'تم تحميل الحرم المخصص بنجاح في خريطة المدخل!' : 'Custom department layout has been loaded successfully!');
    playSound('success');
  });
}

// ======================= WEBCAM CHECK-IN SCANNER =======================

let webcamStream = null;
let webcamAnimationFrame = null;
let isScanningWebcam = false;
let webcamScanTimeout1 = null;
let webcamScanTimeout2 = null;
let webcamScanTimeout3 = null;
let webcamScanTimeout4 = null;

function startWebcamScan() {
  const video = document.getElementById('webcam-video');
  const canvas = document.getElementById('webcam-overlay-canvas');
  const container = document.getElementById('webcam-scan-container');
  const toggleBtn = document.getElementById('btn-webcam-toggle');
  const diag = document.getElementById('webcam-diagnostic');
  if (!video || !canvas || !container || !toggleBtn || !diag) return;

  const isAr = state.currentLang === 'ar';
  diag.textContent = isAr ? 'تشخيص: جاري الوصول إلى الكاميرا...' : 'Diagnostics: Accessing camera...';
  container.style.display = 'flex';
  isScanningWebcam = true;
  toggleBtn.textContent = isAr ? '🛑 إيقاف المسح الضوئي' : '🛑 Stop Camera Scan';
  toggleBtn.style.background = 'linear-gradient(135deg, var(--rose), #d62450)';

  navigator.mediaDevices.getUserMedia({ video: { width: 300, height: 300 } })
    .then(stream => {
      webcamStream = stream;
      video.srcObject = stream;
      video.play();
      
      canvas.width = 150;
      canvas.height = 150;
      animateWebcamOverlay(canvas.getContext('2d'), canvas.width, canvas.height);

      // Phase 2: landmark detection simulation
      webcamScanTimeout1 = setTimeout(() => {
        diag.textContent = isAr ? 'تشخيص: تم اكتشاف الوجه. جاري تحليل العلامات الحيوية...' : 'Diagnostics: Face detected. Analyzing bio-landmarks...';
      }, 1500);

      // Phase 3: database match verification
      webcamScanTimeout2 = setTimeout(() => {
        diag.textContent = isAr ? 'تشخيص: جاري مطابقة البيانات مع سجل الأساتذة...' : 'Diagnostics: Matching biometric markers with directory...';
      }, 3500);

      // Phase 4: successful check-in
      webcamScanTimeout3 = setTimeout(() => {
        const profId = DOM.simProfessor.value;
        const roomId = DOM.simRoom.value;
        const prof = PROFESSORS.find(p => p.id === profId);
        const room = state.rooms[roomId];

        if (prof && room) {
          diag.innerHTML = isAr 
            ? `<span style="color:var(--emerald);">✓ تم المطابقة: ${prof.name} (${prof.id})</span>` 
            : `<span style="color:var(--emerald);">✓ MATCH FOUND: ${prof.name} (${prof.id})</span>`;
          
          // Trigger entry simulation
          room.status = 'occupied';
          room.occupant = prof;
          room.className = prof.course;
          room.detectionActive = true;
          room.alertPerson = false;

          updateRoomCard(roomId);
          if (state.currentView === 'admin') initCameraCanvases();
          updateStats();
          playSound('success');

          // Log database attendance
          const ts = new Date().toISOString();
          const logEntry = {
            timestamp: new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            room: room.name,
            professor: prof.name,
            course: prof.course || '—',
            status: 'Present',
            method: 'Face-Scan (Webcam)'
          };
          state.attendanceLogs.unshift(logEntry);
          
          // DOM Prepend
          const tr = document.createElement('tr');
          const profCell = `<div style="display:flex;align-items:center;gap:8px;">${profAvatarHTML(prof, 28)}<span>${prof.name}</span></div>`;
          tr.innerHTML = `<td>${logEntry.timestamp}</td><td>${room.name}</td><td>${profCell}</td><td>${prof.course}</td><td><span class="attendance-status auto-logged">Present</span></td><td><span class="method-badge">Face-Scan</span></td>`;
          DOM.attendanceBody.prepend(tr);
          DOM.dbEmpty.style.display = 'none';
          DOM.recordsBadge.textContent = `${state.attendanceLogs.length} Records`;

          // API backend PUT sync
          if (!state.isOfflineMode) {
            apiFetch(`/rooms/${roomId}`, {
              method: 'PUT',
              body: JSON.stringify({ status: 'occupied', occupant_id: profId, method: 'face_recognition' })
            }).catch(e => console.error('Failed to sync webcam checkin:', e));
          } else {
            saveState();
          }

          addNotification('success', 'Face Check-in', `${prof.name} auto-logged in ${room.name} via Web-Camera.`);
          addLog('system', `Webcam Face Detector: Matched face for ${prof.name} (ID: ${prof.id}). Checked into ${room.name}.`);
        }
      }, 5500);

      // Phase 5: automatically stop camera
      webcamScanTimeout4 = setTimeout(() => {
        stopWebcamScan();
      }, 7500);

    })
    .catch(err => {
      console.warn('Camera stream rejected:', err.message);
      showToast('warning', isAr ? 'فشل تشغيل الكاميرا' : 'Camera Blocked', isAr ? 'يرجى السماح بالوصول للكاميرا لتجربة ميزة التعرف.' : 'Please allow camera permission to test webcam face-scan.');
      stopWebcamScan();
    });
}

function stopWebcamScan() {
  const container = document.getElementById('webcam-scan-container');
  const toggleBtn = document.getElementById('btn-webcam-toggle');
  const video = document.getElementById('webcam-video');
  if (container) container.style.display = 'none';
  
  isScanningWebcam = false;
  
  if (toggleBtn) {
    const isAr = state.currentLang === 'ar';
    toggleBtn.textContent = isAr ? '📷 مسح الكاميرا الحي' : '📷 Live Webcam Check-in';
    toggleBtn.style.background = 'linear-gradient(135deg, var(--emerald), #02a356)';
  }

  // Clear timeouts
  clearTimeout(webcamScanTimeout1);
  clearTimeout(webcamScanTimeout2);
  clearTimeout(webcamScanTimeout3);
  clearTimeout(webcamScanTimeout4);

  // Stop video stream
  if (webcamStream) {
    webcamStream.getTracks().forEach(track => track.stop());
    webcamStream = null;
  }
  if (video) video.srcObject = null;

  // Cancel animation frame
  if (webcamAnimationFrame) {
    cancelAnimationFrame(webcamAnimationFrame);
    webcamAnimationFrame = null;
  }
}

function animateWebcamOverlay(ctx, w, h) {
  if (!isScanningWebcam) return;
  ctx.clearRect(0, 0, w, h);
  
  const now = Date.now();
  
  // 1. Digital scanning reticle
  ctx.strokeStyle = 'rgba(0, 212, 255, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(w/2, h/2, 60, 0, Math.PI*2);
  ctx.stroke();

  // 2. Corner indicators
  ctx.strokeStyle = 'var(--cyan)';
  ctx.lineWidth = 2;
  const size = 15;
  const padding = 20;

  // Top Left
  ctx.beginPath(); ctx.moveTo(padding, padding + size); ctx.lineTo(padding, padding); ctx.lineTo(padding + size, padding); ctx.stroke();
  // Top Right
  ctx.beginPath(); ctx.moveTo(w - padding, padding + size); ctx.lineTo(w - padding, padding); ctx.lineTo(w - padding - size, padding); ctx.stroke();
  // Bottom Left
  ctx.beginPath(); ctx.moveTo(padding, h - padding - size); ctx.lineTo(padding, h - padding); ctx.lineTo(padding + size, h - padding); ctx.stroke();
  // Bottom Right
  ctx.beginPath(); ctx.moveTo(w - padding, h - padding - size); ctx.lineTo(w - padding, h - padding); ctx.lineTo(w - padding - size, h - padding); ctx.stroke();

  // 3. Dynamic target tracking box (Simulates Face Recognition)
  const isSecondPhase = (now % 2000) > 1000;
  ctx.strokeStyle = isSecondPhase ? 'var(--emerald)' : 'var(--cyan)';
  ctx.lineWidth = 1.5;
  const boxW = 55 + Math.sin(now / 200) * 3;
  const boxH = 65 + Math.cos(now / 200) * 3;
  ctx.strokeRect(w/2 - boxW/2, h/2 - boxH/2, boxW, boxH);

  // Landmark dots inside target box
  ctx.fillStyle = isSecondPhase ? 'rgba(0, 255, 136, 0.7)' : 'rgba(0, 212, 255, 0.7)';
  const dx = w/2, dy = h/2;
  ctx.beginPath();
  ctx.arc(dx - 12, dy - 8, 2, 0, Math.PI*2); // Left Eye
  ctx.arc(dx + 12, dy - 8, 2, 0, Math.PI*2); // Right Eye
  ctx.arc(dx, dy + 2, 2, 0, Math.PI*2);      // Nose
  ctx.arc(dx - 8, dy + 15, 1, 0, Math.PI*2); // Left mouth
  ctx.arc(dx + 8, dy + 15, 1, 0, Math.PI*2); // Right mouth
  ctx.fill();

  webcamAnimationFrame = requestAnimationFrame(() => animateWebcamOverlay(ctx, w, h));
}

// Bind Webcam scan toggler click event
const btnWebcamToggle = document.getElementById('btn-webcam-toggle');
if (btnWebcamToggle) {
  btnWebcamToggle.addEventListener('click', () => {
    if (isScanningWebcam) stopWebcamScan();
    else startWebcamScan();
  });
}

// ======================= INIT =======================

addLog('system','Dashboard loaded. Ready for monitoring.');
showToast('info','System Online','UniVision AI Room Management is active and monitoring.');
