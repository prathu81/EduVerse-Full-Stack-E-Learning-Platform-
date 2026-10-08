// ============================================================
// E-Learning Platform — Main Server
// Node.js + Express + MySQL
// ============================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'elp_super_secret_jwt_2024';

// ──────────────────────────────────────────────────────────
// MIDDLEWARE
// ──────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend statically
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve uploads
['photos','notes','videos'].forEach(dir => {
  const p = path.join(__dirname, 'uploads', dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../frontend')));
  
// ──────────────────────────────────────────────────────────
// DATABASE CONNECTION
// ──────────────────────────────────────────────────────────
let db = null;
let DEMO_MODE = false;

try {
  const mysql = require('mysql2/promise');
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'elearning_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    connectTimeout: 5000
  });

  pool.getConnection()
    .then(conn => { conn.release(); db = pool; console.log('✅ Database connected'); })
    .catch(() => { DEMO_MODE = true; console.log('⚠️  Demo Mode: No database. Using demo data.'); });
  db = pool;
} catch(e) {
  DEMO_MODE = true;
  console.log('⚠️  Demo Mode active');
}

// ──────────────────────────────────────────────────────────
// DEMO DATA
// ──────────────────────────────────────────────────────────
const DEMO = {
  users: [
    { id: 1, full_name: 'Admin User', email: 'admin@elearn.com', password_hash: '$2b$10$YourHashHere', role: 'admin', phone: '9876543210', qualification: 'M.Tech', experience: '10 years' },
    { id: 2, full_name: 'Demo Student', email: 'student@demo.com', password_hash: '$2b$10$YourHashHere', role: 'student', phone: '9876543211', parent_phone: '9876543212', address: 'Mumbai' }
  ],
  categories: [
    { id:1, name:'Web Development', slug:'web-development', icon:'fas fa-code', color:'#4F46E5' },
    { id:2, name:'Data Science', slug:'data-science', icon:'fas fa-chart-bar', color:'#7C3AED' },
    { id:3, name:'Mobile Development', slug:'mobile-development', icon:'fas fa-mobile-alt', color:'#0891B2' },
    { id:4, name:'Cloud Computing', slug:'cloud-computing', icon:'fas fa-cloud', color:'#0D9488' },
    { id:5, name:'Cybersecurity', slug:'cybersecurity', icon:'fas fa-shield-alt', color:'#DC2626' },
    { id:6, name:'UI/UX Design', slug:'ui-ux-design', icon:'fas fa-paint-brush', color:'#D97706' },
    { id:7, name:'Digital Marketing', slug:'digital-marketing', icon:'fas fa-bullhorn', color:'#059669' },
    { id:8, name:'Business & Management', slug:'business-management', icon:'fas fa-briefcase', color:'#7C3AED' },
    { id:9, name:'Programming Languages', slug:'programming', icon:'fas fa-laptop-code', color:'#1D4ED8' },
    { id:10, name:'Database Management', slug:'database', icon:'fas fa-database', color:'#9333EA' }
  ],
  courses: generateDemoCourses(),
  enrollments: [],
  live_classes: [
    { id:1, title:'Python for Beginners - Session 1', course_id:11, zoom_link:'https://zoom.us/j/demo123', platform:'Zoom', scheduled_at: new Date(Date.now()+86400000).toISOString(), duration_minutes:90, status:'scheduled', instructor_name:'Admin User' },
    { id:2, title:'HTML & CSS Workshop', course_id:1, zoom_link:'https://zoom.us/j/demo456', platform:'Zoom', scheduled_at: new Date(Date.now()+172800000).toISOString(), duration_minutes:60, status:'scheduled', instructor_name:'Admin User' },
    { id:3, title:'MERN Stack Live Coding', course_id:5, zoom_link:'https://zoom.us/j/demo789', platform:'Google Meet', scheduled_at: new Date(Date.now()+259200000).toISOString(), duration_minutes:120, status:'scheduled', instructor_name:'Admin User' }
  ],
  quizzes: [
    { id:1, title:'Python Basics Quiz', course_id:11, duration_minutes:30, pass_percent:60, total_marks:50 },
    { id:2, title:'HTML & CSS Fundamentals', course_id:1, duration_minutes:20, pass_percent:60, total_marks:40 }
  ],
  quiz_questions: [
    { id:1, quiz_id:1, question_text:'What does Python use for code blocks?', option_a:'Curly braces {}', option_b:'Indentation', option_c:'Parentheses ()', option_d:'Square brackets []', correct_option:'B', marks:10 },
    { id:2, quiz_id:1, question_text:'Which method converts string to integer?', option_a:'str()', option_b:'float()', option_c:'int()', option_d:'num()', correct_option:'C', marks:10 },
    { id:3, quiz_id:1, question_text:'Which keyword defines a function in Python?', option_a:'function', option_b:'def', option_c:'func', option_d:'define', correct_option:'B', marks:10 },
    { id:4, quiz_id:2, question_text:'What does HTML stand for?', option_a:'Hyper Text Markup Language', option_b:'High Text Machine Language', option_c:'Hyper Transfer Markup Logic', option_d:'None', correct_option:'A', marks:10 },
    { id:5, quiz_id:2, question_text:'Which CSS property changes text color?', option_a:'font-color', option_b:'text-color', option_c:'color', option_d:'foreground', correct_option:'C', marks:10 }
  ],
  notifications: [],
  messages: [],
  certificates: [],
  sms_logs: [],
  attendance: [],
  notes: [
    { id:1, course_id:11, title:'Python Basics - Module 1', description:'Introduction to Python syntax', file_url:'/uploads/notes/demo.pdf' },
    { id:2, course_id:1, title:'HTML Reference Sheet', description:'Complete HTML tags reference', file_url:'/uploads/notes/demo.pdf' }
  ],
  video_lectures: [
    { id:1, course_id:11, title:'Introduction to Python', duration_minutes:45, video_url:'', is_live_recording:false },
    { id:2, course_id:1, title:'HTML Document Structure', duration_minutes:30, video_url:'', is_live_recording:false }
  ]
};

function generateDemoCourses() {
  const data = [
    [1,'Complete HTML & CSS Bootcamp','Dr. Priya Sharma',0,25,'Beginner',4.8,3200],
    [1,'JavaScript Mastery Course','Prof. Rahul Verma',999,40,'Intermediate',4.9,5100],
    [1,'React.js Complete Guide','Sneha Patel',1499,50,'Intermediate',4.8,4200],
    [1,'Node.js & Express Backend','Amit Kumar',1299,35,'Intermediate',4.7,2800],
    [1,'Full Stack MERN Development','Dr. Ananya Roy',2499,80,'Advanced',4.9,3600],
    [1,'Vue.js 3 From Zero to Hero','Vikram Singh',1199,30,'Intermediate',4.6,1800],
    [1,'PHP & Laravel Framework','Meera Nair',999,40,'Intermediate',4.5,2100],
    [1,'WordPress Development','Rajesh Gupta',799,20,'Beginner',4.4,4500],
    [1,'Next.js & React Full Stack','Pooja Mehta',1699,45,'Advanced',4.8,2300],
    [1,'TypeScript Complete Course','Arjun Reddy',1099,25,'Intermediate',4.7,1900],
    [2,'Python for Data Science','Dr. Kavya Rao',999,35,'Beginner',4.8,6200],
    [2,'Machine Learning A-Z','Prof. Suresh Iyer',2499,65,'Intermediate',4.9,7100],
    [2,'Deep Learning & Neural Networks','Dr. Nisha Sharma',2999,55,'Advanced',4.8,3400],
    [2,'Natural Language Processing','Arun Krishnan',1999,40,'Advanced',4.7,2100],
    [2,'Data Visualization with Python','Deepa Pillai',799,20,'Beginner',4.6,3800],
    [2,'Statistics for Data Science','Prof. Mohan Das',699,30,'Beginner',4.5,4200],
    [2,'SQL for Data Analysis','Ritu Sharma',899,25,'Intermediate',4.7,5500],
    [2,'Power BI & Tableau','Sanjay Mehta',1199,30,'Intermediate',4.6,3100],
    [2,'Big Data with Hadoop & Spark','Dr. Venkat Rao',2499,50,'Advanced',4.7,1800],
    [2,'AI & Prompt Engineering','Priya Singh',1499,20,'Beginner',4.9,8900],
    [3,'Android Development with Kotlin','Rohit Sharma',1499,50,'Intermediate',4.8,3200],
    [3,'iOS Development with Swift','Anita Kapoor',1999,55,'Intermediate',4.7,2100],
    [3,'Flutter Cross-Platform Apps','Dev Kumar',1799,60,'Intermediate',4.9,4500],
    [3,'React Native Mobile Dev','Neha Gupta',1599,45,'Intermediate',4.8,3300],
    [3,'Android Jetpack Compose','Kiran Reddy',1299,35,'Advanced',4.7,1600],
    [4,'AWS Cloud Practitioner','Cloud Expert Raj',1999,30,'Beginner',4.8,5600],
    [4,'AWS Solutions Architect','Anil Sharma',2999,60,'Intermediate',4.9,3200],
    [4,'Google Cloud Platform','Maya Pillai',2499,45,'Intermediate',4.7,2100],
    [4,'Microsoft Azure Fundamentals','Sunil Kumar',1999,35,'Beginner',4.6,2800],
    [4,'Docker & Kubernetes','DevOps Guru',2499,50,'Advanced',4.9,4100],
    [4,'CI/CD & DevOps Pipeline','Prakash Nair',2199,40,'Advanced',4.8,2600],
    [4,'Terraform Infrastructure as Code','Ravi Verma',1999,30,'Advanced',4.7,1400],
    [5,'Ethical Hacking Complete Course','Cyber Expert Vikram',2499,60,'Intermediate',4.9,5200],
    [5,'Network Security Fundamentals','Security Pro Ankit',1499,35,'Beginner',4.7,3100],
    [5,'Web Application Security','Pradeep Sharma',1999,40,'Intermediate',4.8,2400],
    [5,'CompTIA Security+ Prep','Exam Expert Raj',2999,50,'Intermediate',4.8,2800],
    [5,'Cyber Forensics','Dr. Suresh Kumar',2199,45,'Advanced',4.7,1200],
    [6,'UI/UX Design Fundamentals','Designer Priya',999,30,'Beginner',4.8,4200],
    [6,'Figma Complete Masterclass','Creative Sneha',799,25,'Beginner',4.9,6800],
    [6,'Adobe XD for Beginners','Design Guru Amit',699,20,'Beginner',4.6,3500],
    [6,'Design Systems & Style Guides','Meera Design',1299,30,'Intermediate',4.7,1800],
    [6,'Motion Design & After Effects','Arun Creative',1499,35,'Intermediate',4.8,2100],
    [7,'Complete Digital Marketing','Marketing Guru Ravi',1299,50,'Beginner',4.7,7200],
    [7,'SEO Mastery 2024','SEO Expert Rahul',999,30,'Intermediate',4.8,5500],
    [7,'Social Media Marketing','Social Pro Neha',799,25,'Beginner',4.6,8100],
    [7,'Google Ads & PPC Mastery','Ads Expert Sunil',1199,25,'Intermediate',4.7,3400],
    [7,'Email Marketing Automation','Email Pro Deepa',699,20,'Beginner',4.5,4200],
    [7,'Content Marketing Strategy','Content Guru Priya',899,25,'Intermediate',4.6,3800],
    [8,'MBA Crash Course','Prof. Business Raj',1999,60,'Beginner',4.7,4500],
    [8,'Project Management Professional','PM Expert Anita',2999,70,'Intermediate',4.9,3200],
    [8,'Financial Analysis & Modeling','Finance Guru Dev',1799,45,'Intermediate',4.8,2800],
    [8,'Entrepreneurship & Startup','Startup Expert Kumar',1299,40,'Beginner',4.7,5100],
    [8,'Leadership & Management Skills','HR Expert Sharma',999,30,'Beginner',4.6,6200],
    [8,'Business Communication','Comm Expert Nair',699,20,'Beginner',4.5,7800],
    [9,'Python Complete Bootcamp','Python Guru Vikram',999,45,'Beginner',4.9,9200],
    [9,'Java Complete Course','Java Expert Amit',1499,60,'Intermediate',4.8,7100],
    [9,'C++ Programming Mastery','C++ Pro Rohit',1199,50,'Intermediate',4.7,4500],
    [9,'Go Language Complete Guide','Go Expert Dev',1399,35,'Intermediate',4.8,2300],
    [9,'Rust Programming Language','Rust Expert Anand',1599,40,'Advanced',4.9,1800],
    [9,'Kotlin Complete Course','Kotlin Pro Siri',1299,35,'Intermediate',4.7,2600],
    [9,'Swift Programming for iOS','Swift Guru Priya',1499,40,'Intermediate',4.8,2100],
    [9,'R Programming for Statistics','Statistics Prof',899,30,'Beginner',4.6,3200],
    [9,'MATLAB Engineering','Engineering Prof Rao',1199,35,'Intermediate',4.5,1900],
    [10,'MySQL Complete Masterclass','DB Expert Suresh',999,35,'Beginner',4.8,5600],
    [10,'PostgreSQL Advanced Guide','PG Pro Kavya',1199,30,'Intermediate',4.7,2800],
    [10,'MongoDB & NoSQL Complete','NoSQL Guru Anil',1099,30,'Intermediate',4.8,3400],
    [10,'Oracle Database Administration','Oracle Expert Raju',2499,60,'Advanced',4.7,1600],
    [10,'Database Design & Architecture','Design Expert Meena',899,25,'Intermediate',4.6,2100],
    [1,'Angular Complete Guide','Angular Pro Kiran',1399,45,'Intermediate',4.7,2800],
    [1,'GraphQL API Development','API Expert Priya',1299,30,'Advanced',4.8,1900],
    [1,'Django Python Web Framework','Django Expert Raj',1199,40,'Intermediate',4.7,3100],
    [2,'Computer Vision with OpenCV','Vision Expert Dev',2199,45,'Advanced',4.8,1700],
    [2,'Reinforcement Learning','RL Expert Kumar',2999,50,'Advanced',4.9,1200],
    [3,'Xamarin Mobile Development','Xamarin Pro Anita',1299,40,'Intermediate',4.5,900],
    [4,'Ansible Automation','DevOps Expert Sai',1799,30,'Intermediate',4.7,2100],
    [5,'Bug Bounty Hunting','Hacker Pro Rahul',2999,55,'Advanced',4.9,3400],
    [6,'3D Design with Blender','3D Expert Arjun',1299,45,'Beginner',4.8,2600],
    [7,'YouTube & Video Marketing','YT Expert Meera',799,20,'Beginner',4.7,9100],
    [8,'Human Resources Management','HR Prof Sunita',1299,35,'Intermediate',4.6,3200],
    [9,'Data Structures & Algorithms','DSA Guru Vikram',1999,70,'Intermediate',4.9,12500],
    [10,'Redis In-Memory Database','Redis Expert Mohan',1099,20,'Intermediate',4.7,2400],
    [1,'Bootstrap 5 Complete','Bootstrap Pro',599,15,'Beginner',4.5,6200],
    [1,'Tailwind CSS Mastery','Tailwind Pro Anand',799,20,'Beginner',4.8,5500],
    [2,'Pandas & NumPy Masterclass','Data Scientist Priya',799,25,'Beginner',4.7,7800],
    [4,'Linux Administration','Linux Expert Suresh',1399,40,'Intermediate',4.8,4100],
    [5,'Blockchain & Web3 Security','Blockchain Expert',2499,40,'Advanced',4.8,1500],
    [6,'Canva Graphic Design','Design Pro Sneha',499,15,'Beginner',4.6,11200],
    [8,'Supply Chain Management','SCM Expert Raj',1499,40,'Intermediate',4.6,2100],
    [9,'Competitive Programming','CP Champion Arjun',1799,60,'Advanced',4.9,4500],
    [10,'Elasticsearch & Kibana','Search Expert Nair',1499,30,'Advanced',4.7,1800],
    [2,'Time Series Analysis','TS Expert Kavya',1699,35,'Advanced',4.8,1400],
    [1,'WebSocket & Real-time Apps','RTA Expert Dev',1199,25,'Advanced',4.7,2200],
    [3,'AR/VR Development','AR Expert Kumar',2999,55,'Advanced',4.8,1100],
    [6,'Photoshop Complete Course','PS Expert Rohan',999,35,'Beginner',4.6,8700],
    [7,'Affiliate Marketing Mastery','Affiliate Pro Sunita',899,25,'Beginner',4.5,5600],
    [8,'Accounting & Tally ERP','Accounts Expert Sita',799,30,'Beginner',4.4,6800],
    [9,'Assembly Language Programming','Systems Expert',1499,40,'Advanced',4.6,800],
    [10,'Data Warehousing & ETL','DW Expert Ravi',1999,45,'Advanced',4.7,1300]
  ];
  return data.map((d,i) => ({
    id: i+1, category_id: d[0], title: d[1],
    slug: d[1].toLowerCase().replace(/[^a-z0-9]+/g,'-'),
    description: `Master ${d[1]} with hands-on projects and real-world examples. This comprehensive course takes you from basics to advanced topics with expert instruction.`,
    instructor_name: d[2], price: d[3], duration_hours: d[4], level: d[5], rating: d[6], enrolled_count: d[7],
    what_you_learn: ['Core fundamentals','Practical projects','Best practices','Real-world applications','Interview preparation'],
    syllabus: ['Module 1: Introduction','Module 2: Core Concepts','Module 3: Advanced Topics','Module 4: Projects','Module 5: Final Assessment'],
    requirements: ['Basic computer knowledge','Internet connection','Dedication to learn'],
    thumbnail_url: null, is_published: true, created_at: new Date().toISOString()
  }));
}

// Helper: query wrapper
async function query(sql, params = []) {
  if (DEMO_MODE || !db) throw new Error('DEMO_MODE');
  try {
    const [rows] = await db.execute(sql, params);
    return rows;
  } catch(e) { throw e; }
}

// ──────────────────────────────────────────────────────────
// MULTER SETUP
// ──────────────────────────────────────────────────────────
function makeStorage(folder) {
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads', folder)),
    filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname.replace(/\s+/g,'_'))
  });
}
const photoUpload = multer({ storage: makeStorage('photos'), limits: { fileSize: 5*1024*1024 } });
const noteUpload  = multer({ storage: makeStorage('notes'),  limits: { fileSize: 50*1024*1024 } });
const videoUpload = multer({ storage: makeStorage('videos'), limits: { fileSize: 500*1024*1024 } });

// ──────────────────────────────────────────────────────────
// AUTH MIDDLEWARE
// ──────────────────────────────────────────────────────────
function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    next();
  } catch(e) { return res.status(401).json({ error: 'Invalid token' }); }
}
function isAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
}

// ──────────────────────────────────────────────────────────
// HELPER: hash password check for demo
// ──────────────────────────────────────────────────────────
const DEMO_PASSWORDS = { 'admin@elearn.com': 'Admin@123', 'student@demo.com': 'Student@123' };

// ============================================================
// AUTH ROUTES
// ============================================================
app.post('/api/auth/register', photoUpload.single('photo'), async (req, res) => {
  try {
    const { full_name, email, password, phone, parent_phone, address, qualification, experience, specialization, role } = req.body;
    if (!full_name || !email || !password) return res.status(400).json({ error: 'Name, email and password required' });

    const hash = await bcrypt.hash(password, 10);
    const photo_url = req.file ? `/uploads/photos/${req.file.filename}` : null;

    if (!DEMO_MODE && db) {
      const existing = await query('SELECT id FROM users WHERE email=?', [email]);
      if (existing.length) return res.status(409).json({ error: 'Email already registered' });
      const result = await query(
        'INSERT INTO users (full_name,email,password_hash,phone,parent_phone,address,qualification,experience,specialization,photo_url,role) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
        [full_name, email, hash, phone||null, parent_phone||null, address||null, qualification||null, experience||null, specialization||null, photo_url, role||'student']
      );
      const user = { id: result.insertId, full_name, email, role: role||'student', photo_url };
      const token = jwt.sign({ id: user.id, email, role: user.role, full_name }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, user });
    }

    // Demo mode
    const existDemo = DEMO.users.find(u => u.email === email);
    if (existDemo) return res.status(409).json({ error: 'Email already registered' });
    const newUser = { id: DEMO.users.length + 1, full_name, email, password_hash: hash, phone, parent_phone, address, qualification, experience, specialization, photo_url, role: role||'student', created_at: new Date().toISOString() };
    DEMO.users.push(newUser);
    DEMO_PASSWORDS[email] = password;
    const token = jwt.sign({ id: newUser.id, email, role: newUser.role, full_name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: newUser.id, full_name, email, role: newUser.role, photo_url } });
  } catch(e) { console.error(e); res.status(500).json({ error: e.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    let user;
    if (!DEMO_MODE && db) {
      const rows = await query('SELECT * FROM users WHERE email=? AND is_active=1', [email]);
      if (!rows.length) return res.status(401).json({ error: 'Invalid email or password' });
      user = rows[0];
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) return res.status(401).json({ error: 'Invalid email or password' });
    } else {
      user = DEMO.users.find(u => u.email === email);
      if (!user) return res.status(401).json({ error: 'Invalid email or password' });
      const expectedPass = DEMO_PASSWORDS[email];
      if (expectedPass && password !== expectedPass) return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, full_name: user.full_name }, JWT_SECRET, { expiresIn: '7d' });
    const { password_hash, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/auth/profile', authenticate, async (req, res) => {
  try {
    if (!DEMO_MODE && db) {
      const rows = await query('SELECT id,full_name,email,phone,parent_phone,address,qualification,experience,specialization,photo_url,role,created_at FROM users WHERE id=?', [req.user.id]);
      if (!rows.length) return res.status(404).json({ error: 'User not found' });
      return res.json(rows[0]);
    }
    const user = DEMO.users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    const { password_hash, ...safe } = user;
    res.json(safe);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ============================================================
// CATEGORIES ROUTES
// ============================================================
app.get('/api/categories', async (req, res) => {
  try {
    if (!DEMO_MODE && db) {
      const rows = await query('SELECT c.*, COUNT(co.id) as course_count FROM categories c LEFT JOIN courses co ON co.category_id=c.id GROUP BY c.id ORDER BY c.name');
      return res.json(rows);
    }
    const cats = DEMO.categories.map(c => ({
      ...c,
      course_count: DEMO.courses.filter(co => co.category_id === c.id).length
    }));
    res.json(cats);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ============================================================
// COURSES ROUTES
// ============================================================
app.get('/api/courses', async (req, res) => {
  try {
    const { category, search, level, limit=12, page=1, sort='popular' } = req.query;
    const offset = (parseInt(page)-1) * parseInt(limit);

    if (!DEMO_MODE && db) {
      let sql = `SELECT c.*, cat.name as category_name, cat.color as category_color, cat.icon as category_icon
        FROM courses c LEFT JOIN categories cat ON cat.id=c.category_id WHERE c.is_published=1`;
      const params = [];
      if (category) { sql += ' AND cat.slug=?'; params.push(category); }
      if (search) { sql += ' AND (c.title LIKE ? OR c.description LIKE ?)'; params.push(`%${search}%`,`%${search}%`); }
      if (level) { sql += ' AND c.level=?'; params.push(level); }
      if (sort === 'popular') sql += ' ORDER BY c.enrolled_count DESC';
      else if (sort === 'rating') sql += ' ORDER BY c.rating DESC';
      else if (sort === 'newest') sql += ' ORDER BY c.created_at DESC';
      else if (sort === 'price_low') sql += ' ORDER BY c.price ASC';
      const countRows = await query(sql.replace(/SELECT.*?FROM/s,'SELECT COUNT(*) as total FROM'), params);
      sql += ` LIMIT ${parseInt(limit)} OFFSET ${offset}`;
      const courses = await query(sql, params);
      return res.json({ courses, total: countRows[0]?.total || 0, page: parseInt(page), limit: parseInt(limit) });
    }

    // Demo mode
    const catMap = {};
    DEMO.categories.forEach(c => { catMap[c.id] = c; });
    let courses = DEMO.courses.map(c => ({
      ...c,
      category_name: catMap[c.category_id]?.name || '',
      category_color: catMap[c.category_id]?.color || '#4F46E5',
      category_icon: catMap[c.category_id]?.icon || 'fas fa-book'
    }));
    if (category) { const cat = DEMO.categories.find(c => c.slug === category); if (cat) courses = courses.filter(c => c.category_id === cat.id); }
    if (search) { const q = search.toLowerCase(); courses = courses.filter(c => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)); }
    if (level) courses = courses.filter(c => c.level === level);
    const total = courses.length;
    if (sort === 'popular') courses.sort((a,b) => b.enrolled_count - a.enrolled_count);
    else if (sort === 'rating') courses.sort((a,b) => b.rating - a.rating);
    else if (sort === 'price_low') courses.sort((a,b) => a.price - b.price);
    courses = courses.slice(offset, offset + parseInt(limit));
    res.json({ courses, total, page: parseInt(page), limit: parseInt(limit) });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/courses/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!DEMO_MODE && db) {
      const rows = await query(`SELECT c.*, cat.name as category_name, cat.color as category_color FROM courses c LEFT JOIN categories cat ON cat.id=c.category_id WHERE c.id=?`, [id]);
      if (!rows.length) return res.status(404).json({ error: 'Course not found' });
      const course = rows[0];
      course.videos = await query('SELECT * FROM video_lectures WHERE course_id=? AND is_published=1 ORDER BY order_num', [id]);
      course.notes = await query('SELECT * FROM notes WHERE course_id=? ORDER BY created_at DESC', [id]);
      course.quizzes = await query('SELECT id,title,duration_minutes,pass_percent,total_marks FROM quizzes WHERE course_id=? AND is_published=1', [id]);
      return res.json(course);
    }
    const catMap = {}; DEMO.categories.forEach(c => catMap[c.id] = c);
    const course = DEMO.courses.find(c => c.id === id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json({
      ...course,
      category_name: catMap[course.category_id]?.name || '',
      category_color: catMap[course.category_id]?.color || '#4F46E5',
      videos: DEMO.video_lectures.filter(v => v.course_id === id),
      notes: DEMO.notes.filter(n => n.course_id === id),
      quizzes: DEMO.quizzes.filter(q => q.course_id === id)
    });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/courses', authenticate, isAdmin, async (req, res) => {
  try {
    const { title, category_id, description, instructor_name, price=0, duration_hours=0, level='Beginner', syllabus, requirements, what_you_learn } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g,'-') + '-' + Date.now();
    if (!DEMO_MODE && db) {
      const result = await query('INSERT INTO courses (title,slug,category_id,description,instructor_name,price,duration_hours,level,syllabus,requirements,what_you_learn) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
        [title,slug,category_id||null,description||null,instructor_name||null,price,duration_hours,level,JSON.stringify(syllabus||[]),JSON.stringify(requirements||[]),JSON.stringify(what_you_learn||[])]);
      return res.json({ id: result.insertId, message: 'Course created' });
    }
    const newCourse = { id: DEMO.courses.length+1, title, slug, category_id: parseInt(category_id)||1, description: description||'', instructor_name: instructor_name||'', price: parseFloat(price)||0, duration_hours: parseInt(duration_hours)||0, level, enrolled_count:0, rating:4.5, is_published:true, created_at: new Date().toISOString() };
    DEMO.courses.push(newCourse);
    res.json({ id: newCourse.id, message: 'Course created' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/courses/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, description, price, duration_hours, level, is_published } = req.body;
    if (!DEMO_MODE && db) {
      await query('UPDATE courses SET title=?,description=?,price=?,duration_hours=?,level=?,is_published=?,updated_at=NOW() WHERE id=?',
        [title,description,price,duration_hours,level,is_published,id]);
      return res.json({ message: 'Updated' });
    }
    const idx = DEMO.courses.findIndex(c => c.id === id);
    if (idx >= 0) Object.assign(DEMO.courses[idx], req.body);
    res.json({ message: 'Updated' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/courses/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!DEMO_MODE && db) { await query('DELETE FROM courses WHERE id=?', [id]); return res.json({ message: 'Deleted' }); }
    DEMO.courses = DEMO.courses.filter(c => c.id !== id);
    res.json({ message: 'Deleted' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ============================================================
// ENROLLMENTS ROUTES
// ============================================================
app.post('/api/enrollments', authenticate, async (req, res) => {
  try {
    const { course_id } = req.body;
    if (!course_id) return res.status(400).json({ error: 'course_id required' });
    if (!DEMO_MODE && db) {
      try {
        await query('INSERT INTO enrollments (user_id,course_id) VALUES (?,?)', [req.user.id, course_id]);
        await query('UPDATE courses SET enrolled_count=enrolled_count+1 WHERE id=?', [course_id]);
      } catch(e) { if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Already enrolled' }); throw e; }
      return res.json({ message: 'Enrolled successfully' });
    }
    const exists = DEMO.enrollments.find(e => e.user_id === req.user.id && e.course_id === parseInt(course_id));
    if (exists) return res.status(409).json({ error: 'Already enrolled' });
    DEMO.enrollments.push({ id: DEMO.enrollments.length+1, user_id: req.user.id, course_id: parseInt(course_id), progress_percent:0, is_completed:false, enrolled_at: new Date().toISOString() });
    res.json({ message: 'Enrolled successfully' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/enrollments/my', authenticate, async (req, res) => {
  try {
    if (!DEMO_MODE && db) {
      const rows = await query(`SELECT e.*, c.title as course_title, c.instructor_name, c.duration_hours, c.level, c.thumbnail_url, cat.name as category_name, cat.color as category_color, cat.icon as category_icon
        FROM enrollments e JOIN courses c ON c.id=e.course_id LEFT JOIN categories cat ON cat.id=c.category_id WHERE e.user_id=? ORDER BY e.enrolled_at DESC`, [req.user.id]);
      return res.json(rows);
    }
    const catMap = {}; DEMO.categories.forEach(c => catMap[c.id] = c);
    const courseMap = {}; DEMO.courses.forEach(c => { courseMap[c.id] = c; });
    const enrollments = DEMO.enrollments
      .filter(e => e.user_id === req.user.id)
      .map(e => {
        const c = courseMap[e.course_id] || {};
        const cat = catMap[c.category_id] || {};
        return { ...e, course_title: c.title, instructor_name: c.instructor_name, duration_hours: c.duration_hours, level: c.level, category_name: cat.name, category_color: cat.color, category_icon: cat.icon };
      });
    res.json(enrollments);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/enrollments/:courseId/progress', authenticate, async (req, res) => {
  try {
    const { progress_percent } = req.body;
    const course_id = parseInt(req.params.courseId);
    if (!DEMO_MODE && db) {
      const isCompleted = progress_percent >= 100;
      await query('UPDATE enrollments SET progress_percent=?, is_completed=?, completed_at=? WHERE user_id=? AND course_id=?',
        [progress_percent, isCompleted, isCompleted ? new Date() : null, req.user.id, course_id]);
      return res.json({ message: 'Progress updated' });
    }
    const e = DEMO.enrollments.find(en => en.user_id === req.user.id && en.course_id === course_id);
    if (e) { e.progress_percent = progress_percent; e.is_completed = progress_percent >= 100; }
    res.json({ message: 'Updated' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ============================================================
// LIVE CLASSES ROUTES
// ============================================================
app.get('/api/live-classes', async (req, res) => {
  try {
    if (!DEMO_MODE && db) {
      const rows = await query(`SELECT lc.*, c.title as course_title, u.full_name as instructor_name FROM live_classes lc LEFT JOIN courses c ON c.id=lc.course_id LEFT JOIN users u ON u.id=lc.instructor_id ORDER BY lc.scheduled_at ASC`);
      return res.json(rows);
    }
    const courseMap = {}; DEMO.courses.forEach(c => courseMap[c.id] = c);
    res.json(DEMO.live_classes.map(lc => ({ ...lc, course_title: courseMap[lc.course_id]?.title || '' })));
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/live-classes', authenticate, isAdmin, async (req, res) => {
  try {
    const { course_id, title, description, zoom_link, platform='Zoom', scheduled_at, duration_minutes=60 } = req.body;
    if (!title || !scheduled_at) return res.status(400).json({ error: 'Title and scheduled_at required' });
    if (!DEMO_MODE && db) {
      const result = await query('INSERT INTO live_classes (course_id,title,description,instructor_id,zoom_link,platform,scheduled_at,duration_minutes) VALUES (?,?,?,?,?,?,?,?)',
        [course_id||null, title, description||null, req.user.id, zoom_link||null, platform, scheduled_at, duration_minutes]);
      return res.json({ id: result.insertId, message: 'Live class scheduled' });
    }
    const lc = { id: DEMO.live_classes.length+1, course_id: parseInt(course_id)||null, title, description, zoom_link, platform, scheduled_at, duration_minutes, status:'scheduled', instructor_id: req.user.id, instructor_name: req.user.full_name };
    DEMO.live_classes.push(lc);
    res.json({ id: lc.id, message: 'Scheduled' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/live-classes/:id/status', authenticate, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status, recording_url } = req.body;
    if (!DEMO_MODE && db) {
      await query('UPDATE live_classes SET status=?,recording_url=? WHERE id=?', [status, recording_url||null, id]);
      if (status === 'completed' && recording_url) {
        const lc = await query('SELECT * FROM live_classes WHERE id=?', [id]);
        if (lc.length && lc[0].course_id) {
          await query('INSERT INTO video_lectures (course_id,title,video_url,is_live_recording,live_class_id) VALUES (?,?,?,1,?)',
            [lc[0].course_id, `Live Recording: ${lc[0].title}`, recording_url, id]);
        }
      }
      return res.json({ message: 'Updated' });
    }
    const lc = DEMO.live_classes.find(l => l.id === id);
    if (lc) { lc.status = status; if (recording_url) lc.recording_url = recording_url; }
    res.json({ message: 'Updated' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ============================================================
// ATTENDANCE ROUTES
// ============================================================
app.post('/api/attendance', authenticate, async (req, res) => {
  try {
    const { live_class_id } = req.body;
    if (!DEMO_MODE && db) {
      try {
        await query('INSERT INTO attendance (user_id,live_class_id) VALUES (?,?)', [req.user.id, live_class_id]);
      } catch(e) { if (e.code !== 'ER_DUP_ENTRY') throw e; }
      return res.json({ message: 'Attendance marked' });
    }
    const exists = DEMO.attendance.find(a => a.user_id === req.user.id && a.live_class_id === parseInt(live_class_id));
    if (!exists) DEMO.attendance.push({ id: DEMO.attendance.length+1, user_id: req.user.id, live_class_id: parseInt(live_class_id), joined_at: new Date().toISOString() });
    res.json({ message: 'Attendance marked' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/attendance/my', authenticate, async (req, res) => {
  try {
    if (!DEMO_MODE && db) {
      const rows = await query('SELECT a.*, lc.title as class_title, lc.scheduled_at FROM attendance a JOIN live_classes lc ON lc.id=a.live_class_id WHERE a.user_id=? ORDER BY a.joined_at DESC', [req.user.id]);
      return res.json(rows);
    }
    res.json(DEMO.attendance.filter(a => a.user_id === req.user.id));
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ============================================================
// QUIZ ROUTES
// ============================================================
app.get('/api/quizzes', async (req, res) => {
  try {
    const { course_id } = req.query;
    if (!DEMO_MODE && db) {
      let sql = 'SELECT q.*, c.title as course_title, COUNT(qq.id) as total_questions FROM quizzes q LEFT JOIN courses c ON c.id=q.course_id LEFT JOIN quiz_questions qq ON qq.quiz_id=q.id WHERE q.is_published=1';
      const params = [];
      if (course_id) { sql += ' AND q.course_id=?'; params.push(course_id); }
      sql += ' GROUP BY q.id ORDER BY q.created_at DESC';
      const rows = await query(sql, params);
      return res.json(rows);
    }
    let quizzes = DEMO.quizzes.map(q => ({
      ...q,
      total_questions: DEMO.quiz_questions.filter(qq => qq.quiz_id === q.id).length,
      course_title: DEMO.courses.find(c => c.id === q.course_id)?.title || ''
    }));
    if (course_id) quizzes = quizzes.filter(q => q.course_id === parseInt(course_id));
    res.json(quizzes);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/quizzes/:id/questions', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!DEMO_MODE && db) {
      const quiz = await query('SELECT * FROM quizzes WHERE id=?', [id]);
      if (!quiz.length) return res.status(404).json({ error: 'Quiz not found' });
      const questions = await query('SELECT id,question_text,option_a,option_b,option_c,option_d,marks,order_num FROM quiz_questions WHERE quiz_id=? ORDER BY order_num', [id]);
      return res.json({ quiz: quiz[0], questions });
    }
    const quiz = DEMO.quizzes.find(q => q.id === id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    const questions = DEMO.quiz_questions.filter(q => q.quiz_id === id).map(({ correct_option, ...q }) => q);
    res.json({ quiz, questions });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/quizzes/:id/submit', authenticate, async (req, res) => {
  try {
    const quiz_id = parseInt(req.params.id);
    const { answers, time_taken_seconds=0 } = req.body;

    if (!DEMO_MODE && db) {
      const qQuestions = await query('SELECT * FROM quiz_questions WHERE quiz_id=?', [quiz_id]);
      const quiz = await query('SELECT * FROM quizzes WHERE id=?', [quiz_id]);
      if (!quiz.length) return res.status(404).json({ error: 'Quiz not found' });

      let score = 0, total_marks = 0;
      const reviewData = [];
      qQuestions.forEach(q => {
        const ans = answers?.find(a => a.question_id === q.id);
        const is_correct = ans?.selected_option === q.correct_option;
        if (is_correct) score += q.marks;
        total_marks += q.marks;
        reviewData.push({ question: q.question_text, selected: ans?.selected_option, correct: q.correct_option, is_correct });
      });
      const percentage = total_marks > 0 ? (score / total_marks) * 100 : 0;
      const is_passed = percentage >= quiz[0].pass_percent;
      const result = await query('INSERT INTO quiz_attempts (quiz_id,user_id,score,total_marks,percentage,is_passed,time_taken_seconds) VALUES (?,?,?,?,?,?,?)',
        [quiz_id, req.user.id, score, total_marks, percentage, is_passed, time_taken_seconds]);
      for (const q of qQuestions) {
        const ans = answers?.find(a => a.question_id === q.id);
        await query('INSERT INTO quiz_answers (attempt_id,question_id,selected_option,is_correct) VALUES (?,?,?,?)',
          [result.insertId, q.id, ans?.selected_option||null, ans?.selected_option === q.correct_option]);
      }
      return res.json({ score, total_marks, percentage: percentage.toFixed(2), is_passed, review: reviewData });
    }

    // Demo mode
    const questions = DEMO.quiz_questions.filter(q => q.quiz_id === quiz_id);
    let score = 0, total_marks = 0;
    const review = [];
    questions.forEach(q => {
      const ans = (answers||[]).find(a => a.question_id === q.id);
      const is_correct = ans?.selected_option === q.correct_option;
      if (is_correct) score += q.marks;
      total_marks += q.marks;
      review.push({ question: q.question_text, selected: ans?.selected_option, correct: q.correct_option, is_correct });
    });
    const percentage = total_marks > 0 ? (score/total_marks)*100 : 0;
    res.json({ score, total_marks, percentage: percentage.toFixed(2), is_passed: percentage >= 60, review });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/quizzes', authenticate, isAdmin, async (req, res) => {
  try {
    const { title, course_id, description, duration_minutes=30, pass_percent=60, total_marks=100, questions=[] } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });

    if (!DEMO_MODE && db) {
      const result = await query('INSERT INTO quizzes (title,course_id,created_by,description,duration_minutes,pass_percent,total_marks) VALUES (?,?,?,?,?,?,?)',
        [title, course_id||null, req.user.id, description||null, duration_minutes, pass_percent, total_marks]);
      for (let i=0; i<questions.length; i++) {
        const q = questions[i];
        await query('INSERT INTO quiz_questions (quiz_id,question_text,option_a,option_b,option_c,option_d,correct_option,marks,order_num) VALUES (?,?,?,?,?,?,?,?,?)',
          [result.insertId, q.question_text, q.option_a, q.option_b, q.option_c||null, q.option_d||null, q.correct_option, q.marks||10, i+1]);
      }
      return res.json({ id: result.insertId, message: 'Quiz created' });
    }
    const newQuiz = { id: DEMO.quizzes.length+1, title, course_id: parseInt(course_id)||null, description, duration_minutes, pass_percent, total_marks, is_published: true };
    DEMO.quizzes.push(newQuiz);
    questions.forEach((q,i) => DEMO.quiz_questions.push({ id: DEMO.quiz_questions.length+1, quiz_id: newQuiz.id, ...q, order_num: i+1 }));
    res.json({ id: newQuiz.id, message: 'Created' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ============================================================
// CERTIFICATES ROUTES
// ============================================================
app.post('/api/certificates/generate', authenticate, async (req, res) => {
  try {
    const { course_id } = req.body;
    const cert_number = `ELP-${Date.now()}-${req.user.id}`;
    if (!DEMO_MODE && db) {
      const existing = await query('SELECT * FROM certificates WHERE user_id=? AND course_id=?', [req.user.id, course_id]);
      if (existing.length) return res.json({ certificate_number: existing[0].certificate_number, message: 'Already exists' });
      await query('INSERT INTO certificates (user_id,course_id,certificate_number) VALUES (?,?,?)', [req.user.id, course_id, cert_number]);
      const course = await query('SELECT title FROM courses WHERE id=?', [course_id]);
      const user = await query('SELECT full_name FROM users WHERE id=?', [req.user.id]);
      return res.json({ certificate_number: cert_number, course_title: course[0]?.title, student_name: user[0]?.full_name });
    }
    const cert = { id: DEMO.certificates.length+1, user_id: req.user.id, course_id: parseInt(course_id), certificate_number: cert_number, issued_at: new Date().toISOString() };
    DEMO.certificates.push(cert);
    const course = DEMO.courses.find(c => c.id === parseInt(course_id));
    const user = DEMO.users.find(u => u.id === req.user.id);
    res.json({ certificate_number: cert_number, course_title: course?.title, student_name: user?.full_name });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ============================================================
// NOTIFICATIONS ROUTES
// ============================================================
app.get('/api/notifications', authenticate, async (req, res) => {
  try {
    if (!DEMO_MODE && db) {
      const rows = await query('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 20', [req.user.id]);
      return res.json(rows);
    }
    res.json(DEMO.notifications.filter(n => n.user_id === req.user.id));
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/notifications/read-all', authenticate, async (req, res) => {
  try {
    if (!DEMO_MODE && db) { await query('UPDATE notifications SET is_read=1 WHERE user_id=?', [req.user.id]); return res.json({ message: 'Done' }); }
    DEMO.notifications.filter(n => n.user_id === req.user.id).forEach(n => n.is_read = true);
    res.json({ message: 'Done' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ============================================================
// MESSAGES / CHATBOT ROUTES
// ============================================================
app.post('/api/messages', authenticate, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    // Smart auto-reply
    const msg = message.toLowerCase();
    let reply = 'Your message has been received. Our instructor will respond soon!';
    if (msg.includes('hello') || msg.includes('hi')) reply = 'Hello! How can I help you today? Feel free to ask any questions about your courses.';
    else if (msg.includes('course')) reply = 'For course-related queries, please check the course detail page or contact your instructor directly.';
    else if (msg.includes('certificate')) reply = 'Certificates are issued automatically upon completing 100% of the course. Go to your dashboard to download it.';
    else if (msg.includes('quiz') || msg.includes('test')) reply = 'Quizzes are available in each course. Complete the course material before attempting the quiz for best results.';
    else if (msg.includes('live') || msg.includes('class')) reply = 'Live classes are shown in your dashboard under "Live Classes". You can join directly using the Zoom link.';
    else if (msg.includes('notes') || msg.includes('pdf')) reply = 'Notes and study materials can be downloaded from the course detail page under the "Notes" tab.';
    else if (msg.includes('password')) reply = 'For password reset, please contact admin at admin@elearn.com.';
    else if (msg.includes('fee') || msg.includes('pay') || msg.includes('price')) reply = 'Course fees vary by course. Many courses are free! Check the course page for pricing details.';

    if (!DEMO_MODE && db) {
      const result = await query('INSERT INTO messages (sender_id,message,reply) VALUES (?,?,?)', [req.user.id, message, reply]);
      return res.json({ id: result.insertId, message, reply });
    }
    const newMsg = { id: DEMO.messages.length+1, sender_id: req.user.id, message, reply, is_read: false, created_at: new Date().toISOString() };
    DEMO.messages.push(newMsg);
    res.json(newMsg);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/messages', authenticate, async (req, res) => {
  try {
    if (!DEMO_MODE && db) {
      const rows = await query('SELECT m.*, u.full_name as sender_name FROM messages m JOIN users u ON u.id=m.sender_id WHERE m.sender_id=? OR m.receiver_id=? ORDER BY m.created_at DESC LIMIT 50',
        [req.user.id, req.user.id]);
      return res.json(rows);
    }
    const msgs = DEMO.messages.filter(m => m.sender_id === req.user.id).map(m => {
      const user = DEMO.users.find(u => u.id === m.sender_id);
      return { ...m, sender_name: user?.full_name || '' };
    });
    res.json(msgs);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ============================================================
// NOTES / VIDEOS UPLOAD
// ============================================================
app.post('/api/notes/upload', authenticate, isAdmin, noteUpload.single('file'), async (req, res) => {
  try {
    const { course_id, title, description } = req.body;
    if (!req.file || !title || !course_id) return res.status(400).json({ error: 'File, title and course_id required' });
    const file_url = `/uploads/notes/${req.file.filename}`;
    if (!DEMO_MODE && db) {
      const result = await query('INSERT INTO notes (course_id,title,description,file_url,file_size,uploaded_by) VALUES (?,?,?,?,?,?)',
        [course_id, title, description||null, file_url, `${(req.file.size/1024).toFixed(0)} KB`, req.user.id]);
      return res.json({ id: result.insertId, file_url, message: 'Uploaded' });
    }
    const note = { id: DEMO.notes.length+1, course_id: parseInt(course_id), title, description, file_url };
    DEMO.notes.push(note);
    res.json({ id: note.id, file_url, message: 'Uploaded' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/videos/upload', authenticate, isAdmin, videoUpload.single('video'), async (req, res) => {
  try {
    const { course_id, title, description, duration_minutes } = req.body;
    if (!title || !course_id) return res.status(400).json({ error: 'Title and course_id required' });
    const video_url = req.file ? `/uploads/videos/${req.file.filename}` : req.body.video_url || '';
    if (!DEMO_MODE && db) {
      const result = await query('INSERT INTO video_lectures (course_id,title,description,video_url,duration_minutes) VALUES (?,?,?,?,?)',
        [course_id, title, description||null, video_url, duration_minutes||0]);
      return res.json({ id: result.insertId, video_url, message: 'Uploaded' });
    }
    const video = { id: DEMO.video_lectures.length+1, course_id: parseInt(course_id), title, description, video_url, duration_minutes: parseInt(duration_minutes)||0 };
    DEMO.video_lectures.push(video);
    res.json({ id: video.id, video_url, message: 'Uploaded' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ============================================================
// ADMIN ROUTES
// ============================================================
app.get('/api/admin/stats', authenticate, isAdmin, async (req, res) => {
  try {
    if (!DEMO_MODE && db) {
      const [students] = await query('SELECT COUNT(*) as count FROM users WHERE role="student"');
      const [courses] = await query('SELECT COUNT(*) as count FROM courses');
      const [enrollments] = await query('SELECT COUNT(*) as count FROM enrollments');
      const [live] = await query('SELECT COUNT(*) as count FROM live_classes');
      return res.json({ students: students.count, courses: courses.count, enrollments: enrollments.count, live_classes: live.count });
    }
    res.json({
      students: DEMO.users.filter(u => u.role === 'student').length,
      courses: DEMO.courses.length,
      enrollments: DEMO.enrollments.length,
      live_classes: DEMO.live_classes.length,
      quizzes: DEMO.quizzes.length,
      certificates: DEMO.certificates.length
    });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/students', authenticate, isAdmin, async (req, res) => {
  try {
    if (!DEMO_MODE && db) {
      const rows = await query(`SELECT u.id, u.full_name, u.email, u.phone, u.parent_phone, u.address, u.qualification, u.photo_url, u.created_at, COUNT(e.id) as enrolled_courses
        FROM users u LEFT JOIN enrollments e ON e.user_id=u.id WHERE u.role='student' GROUP BY u.id ORDER BY u.created_at DESC`);
      return res.json(rows);
    }
    const students = DEMO.users.filter(u => u.role === 'student').map(u => {
      const { password_hash, ...safe } = u;
      return { ...safe, enrolled_courses: DEMO.enrollments.filter(e => e.user_id === u.id).length };
    });
    res.json(students);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/quiz-results', authenticate, isAdmin, async (req, res) => {
  try {
    if (!DEMO_MODE && db) {
      const rows = await query(`SELECT qa.*, u.full_name as student_name, q.title as quiz_title, c.title as course_title FROM quiz_attempts qa
        JOIN users u ON u.id=qa.user_id JOIN quizzes q ON q.id=qa.quiz_id LEFT JOIN courses c ON c.id=q.course_id ORDER BY qa.submitted_at DESC`);
      return res.json(rows);
    }
    res.json([]);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/send-sms', authenticate, isAdmin, async (req, res) => {
  try {
    const { student_id, parent_phone, message, type='general' } = req.body;
    // In real app: integrate with SMS API (Twilio, MSG91, etc.)
    console.log(`📱 SMS to ${parent_phone}: ${message}`);
    if (!DEMO_MODE && db) {
      await query('INSERT INTO sms_logs (student_id,parent_phone,message,type,status) VALUES (?,?,?,?,"sent")',
        [student_id||null, parent_phone, message, type]);
    } else {
      DEMO.sms_logs.push({ id: DEMO.sms_logs.length+1, student_id, parent_phone, message, type, status:'sent', sent_at: new Date().toISOString() });
    }
    res.json({ message: 'SMS sent successfully', note: 'In production, integrate with Twilio/MSG91 API' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/attendance', authenticate, isAdmin, async (req, res) => {
  try {
    if (!DEMO_MODE && db) {
      const rows = await query(`SELECT a.*, u.full_name as student_name, lc.title as class_title FROM attendance a
        JOIN users u ON u.id=a.user_id JOIN live_classes lc ON lc.id=a.live_class_id ORDER BY a.joined_at DESC`);
      return res.json(rows);
    }
    res.json(DEMO.attendance);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ============================================================
// FACE VERIFICATION & ATTENDANCE ROUTE
// ============================================================

// Euclidean distance calculate karnyachi method (Don chehre match hotayt ka te check karnyasaathi)
function euclideanDistance(desc1, desc2) {
    let sum = 0;
    for (let i = 0; i < desc1.length; i++) {
        sum += Math.pow(desc1[i] - desc2[i], 2);
    }
    return Math.sqrt(sum);
}

app.post('/api/attendance/face-verify', authenticate, async (req, res) => {
  try {
    const { live_class_id, currentDescriptor } = req.body;

    if (!live_class_id || !currentDescriptor) {
      return res.status(400).json({ error: 'Live class ID and face descriptor required' });
    }

    if (!DEMO_MODE && db) {
      // 1. Database madhun user cha registered face descriptor gheu
      const rows = await query('SELECT face_descriptor FROM users WHERE id=?', [req.user.id]);
      
      if (!rows.length || !rows[0].face_descriptor) {
        return res.status(400).json({ error: 'Face not registered. Please register your face first.' });
      }

      // MySQL madhun aalela data array ahe ki string te check karun parse kara
      const savedDescriptor = typeof rows[0].face_descriptor === 'string' 
                              ? JSON.parse(rows[0].face_descriptor) 
                              : rows[0].face_descriptor;

      // 2. Saved Face ani Current Face madhil distance calculate kara
      const distance = euclideanDistance(savedDescriptor, currentDescriptor);

      // 0.6 ha standard threshold ahe face-api.js sathi (0.6 peksha kami = Match!)
      if (distance > 0.6) {
        return res.status(401).json({ error: 'Face does not match!', distance: distance.toFixed(2) });
      }

      // 3. Face Match zala! Aata attendance mark kara (Tumchya aadhichya logic pramane)
      try {
        await query('INSERT INTO attendance (user_id, live_class_id) VALUES (?,?)', [req.user.id, live_class_id]);
      } catch(e) { 
        if (e.code !== 'ER_DUP_ENTRY') throw e; 
        // Jar aadhich attendance mark zali asel tar ignore kara
      }

      return res.json({ success: true, message: 'Face verified! Attendance marked successfully.' });
    }

    res.status(500).json({ error: 'Demo mode does not support face verification' });
  } catch(e) { 
    res.status(500).json({ error: e.message }); 
  }
});

// ============================================================
// CATCH-ALL → SERVE FRONTEND
// ============================================================
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ──────────────────────────────────────────────────────────
// START SERVER
// ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 E-Learning Platform running → http://localhost:${PORT}`);
  console.log(`📊 Mode: ${DEMO_MODE ? 'Demo (No DB)' : 'Production (MySQL)'}`);
  console.log(`\n  Admin Login:   admin@elearn.com  /  Admin@123`);
  console.log(`  Student Login: student@demo.com  /  Student@123\n`);
});
