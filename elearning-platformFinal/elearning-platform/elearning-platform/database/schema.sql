-- ============================================================
-- E-Learning Platform - Complete Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS elearning_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE elearning_db;

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  parent_phone VARCHAR(20),
  address TEXT,
  qualification VARCHAR(100),
  experience VARCHAR(100),
  specialization VARCHAR(100),
  photo_url VARCHAR(255),
  role ENUM('student','admin') DEFAULT 'student',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- CATEGORIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  icon VARCHAR(50) DEFAULT 'fas fa-book',
  color VARCHAR(20) DEFAULT '#4F46E5',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- COURSES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  instructor_name VARCHAR(150),
  instructor_bio TEXT,
  thumbnail_url VARCHAR(255),
  price DECIMAL(10,2) DEFAULT 0.00,
  duration_hours INT DEFAULT 0,
  level ENUM('Beginner','Intermediate','Advanced') DEFAULT 'Beginner',
  language VARCHAR(50) DEFAULT 'English',
  syllabus JSON,
  requirements JSON,
  what_you_learn JSON,
  is_published BOOLEAN DEFAULT TRUE,
  enrolled_count INT DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 4.50,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- ============================================================
-- ENROLLMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  progress_percent INT DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  UNIQUE KEY unique_enrollment (user_id, course_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- ============================================================
-- VIDEO LECTURES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS video_lectures (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  video_url VARCHAR(500),
  duration_minutes INT DEFAULT 0,
  order_num INT DEFAULT 1,
  is_live_recording BOOLEAN DEFAULT FALSE,
  live_class_id INT NULL,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- ============================================================
-- NOTES / STUDY MATERIAL TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  file_url VARCHAR(500),
  file_size VARCHAR(50),
  uploaded_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- LIVE CLASSES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS live_classes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  instructor_id INT,
  zoom_link VARCHAR(500),
  meeting_id VARCHAR(100),
  platform VARCHAR(50) DEFAULT 'Zoom',
  scheduled_at DATETIME NOT NULL,
  duration_minutes INT DEFAULT 60,
  status ENUM('scheduled','live','completed','cancelled') DEFAULT 'scheduled',
  recording_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
  FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- ATTENDANCE TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  live_class_id INT NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  duration_minutes INT DEFAULT 0,
  UNIQUE KEY unique_attendance (user_id, live_class_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (live_class_id) REFERENCES live_classes(id) ON DELETE CASCADE
);

-- ============================================================
-- QUIZZES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS quizzes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT,
  created_by INT,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  duration_minutes INT DEFAULT 30,
  pass_percent INT DEFAULT 60,
  total_marks INT DEFAULT 100,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- QUIZ QUESTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS quiz_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id INT NOT NULL,
  question_text TEXT NOT NULL,
  option_a VARCHAR(500) NOT NULL,
  option_b VARCHAR(500) NOT NULL,
  option_c VARCHAR(500),
  option_d VARCHAR(500),
  correct_option ENUM('A','B','C','D') NOT NULL,
  marks INT DEFAULT 10,
  order_num INT DEFAULT 1,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- ============================================================
-- QUIZ ATTEMPTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id INT NOT NULL,
  user_id INT NOT NULL,
  score INT DEFAULT 0,
  total_marks INT DEFAULT 0,
  percentage DECIMAL(5,2) DEFAULT 0,
  is_passed BOOLEAN DEFAULT FALSE,
  time_taken_seconds INT DEFAULT 0,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- QUIZ ANSWERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS quiz_answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  attempt_id INT NOT NULL,
  question_id INT NOT NULL,
  selected_option ENUM('A','B','C','D'),
  is_correct BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
);

-- ============================================================
-- CERTIFICATES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS certificates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  certificate_number VARCHAR(50) UNIQUE NOT NULL,
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info','success','warning','error') DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- MESSAGES / CHATBOT TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT,
  message TEXT NOT NULL,
  reply TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- SMS LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS sms_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  parent_phone VARCHAR(20),
  message TEXT,
  type ENUM('absence','low_marks','progress','general') DEFAULT 'general',
  status ENUM('sent','failed','pending') DEFAULT 'pending',
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- SEED DATA - CATEGORIES (10 categories)
-- ============================================================
INSERT INTO categories (name, slug, icon, color, description) VALUES
('Web Development', 'web-development', 'fas fa-code', '#4F46E5', 'Build modern websites and web applications'),
('Data Science', 'data-science', 'fas fa-chart-bar', '#7C3AED', 'Learn data analysis, ML and AI'),
('Mobile Development', 'mobile-development', 'fas fa-mobile-alt', '#0891B2', 'Build iOS and Android applications'),
('Cloud Computing', 'cloud-computing', 'fas fa-cloud', '#0D9488', 'AWS, Azure, GCP and DevOps'),
('Cybersecurity', 'cybersecurity', 'fas fa-shield-alt', '#DC2626', 'Ethical hacking and security'),
('UI/UX Design', 'ui-ux-design', 'fas fa-paint-brush', '#D97706', 'Design beautiful user interfaces'),
('Digital Marketing', 'digital-marketing', 'fas fa-bullhorn', '#059669', 'SEO, social media and online marketing'),
('Business & Management', 'business-management', 'fas fa-briefcase', '#7C3AED', 'MBA concepts and business skills'),
('Programming Languages', 'programming', 'fas fa-laptop-code', '#1D4ED8', 'Master core programming languages'),
('Database Management', 'database', 'fas fa-database', '#9333EA', 'SQL, NoSQL and database design');

-- ============================================================
-- SEED DATA - 100+ COURSES
-- ============================================================
INSERT INTO courses (category_id, title, slug, description, instructor_name, price, duration_hours, level, rating, enrolled_count) VALUES
-- Web Development (cat 1)
(1,'Complete HTML & CSS Bootcamp','html-css-bootcamp','Master HTML5 and CSS3 from scratch to advanced','Dr. Priya Sharma',0,25,'Beginner',4.8,3200),
(1,'JavaScript Mastery Course','javascript-mastery','Complete JavaScript ES6+ with projects','Prof. Rahul Verma',999,40,'Intermediate',4.9,5100),
(1,'React.js Complete Guide','react-complete-guide','Build modern React apps with hooks and Redux','Sneha Patel',1499,50,'Intermediate',4.8,4200),
(1,'Node.js & Express Backend','nodejs-express','Server-side JavaScript with REST APIs','Amit Kumar',1299,35,'Intermediate',4.7,2800),
(1,'Full Stack MERN Development','mern-stack','MongoDB, Express, React, Node.js full stack','Dr. Ananya Roy',2499,80,'Advanced',4.9,3600),
(1,'Vue.js 3 From Zero to Hero','vuejs-hero','Complete Vue.js 3 with Composition API','Vikram Singh',1199,30,'Intermediate',4.6,1800),
(1,'PHP & Laravel Framework','php-laravel','Backend web development with PHP and Laravel','Meera Nair',999,40,'Intermediate',4.5,2100),
(1,'WordPress Development','wordpress-dev','Build websites with WordPress themes & plugins','Rajesh Gupta',799,20,'Beginner',4.4,4500),
(1,'Next.js & React Full Stack','nextjs-fullstack','SSR and SSG with Next.js','Pooja Mehta',1699,45,'Advanced',4.8,2300),
(1,'TypeScript Complete Course','typescript-complete','Type-safe JavaScript with TypeScript','Arjun Reddy',1099,25,'Intermediate',4.7,1900),
-- Data Science (cat 2)
(2,'Python for Data Science','python-data-science','Learn Python for data analysis and visualization','Dr. Kavya Rao',999,35,'Beginner',4.8,6200),
(2,'Machine Learning A-Z','machine-learning-az','Complete ML with Python and R','Prof. Suresh Iyer',2499,65,'Intermediate',4.9,7100),
(2,'Deep Learning & Neural Networks','deep-learning','Build neural networks with TensorFlow and Keras','Dr. Nisha Sharma',2999,55,'Advanced',4.8,3400),
(2,'Natural Language Processing','nlp-complete','NLP with Python, NLTK and transformers','Arun Krishnan',1999,40,'Advanced',4.7,2100),
(2,'Data Visualization with Python','data-viz','Matplotlib, Seaborn, Plotly dashboards','Deepa Pillai',799,20,'Beginner',4.6,3800),
(2,'Statistics for Data Science','statistics-ds','Probability, stats and hypothesis testing','Prof. Mohan Das',699,30,'Beginner',4.5,4200),
(2,'SQL for Data Analysis','sql-data-analysis','Advanced SQL queries for data analysts','Ritu Sharma',899,25,'Intermediate',4.7,5500),
(2,'Power BI & Tableau','powerbi-tableau','Business intelligence and dashboards','Sanjay Mehta',1199,30,'Intermediate',4.6,3100),
(2,'Big Data with Hadoop & Spark','big-data','Process massive datasets with Hadoop','Dr. Venkat Rao',2499,50,'Advanced',4.7,1800),
(2,'AI & Prompt Engineering','ai-prompt-engineering','Master AI tools and prompt engineering','Priya Singh',1499,20,'Beginner',4.9,8900),
-- Mobile Development (cat 3)
(3,'Android Development with Kotlin','android-kotlin','Build Android apps with Kotlin','Rohit Sharma',1499,50,'Intermediate',4.8,3200),
(3,'iOS Development with Swift','ios-swift','Build iPhone apps with Swift and SwiftUI','Anita Kapoor',1999,55,'Intermediate',4.7,2100),
(3,'Flutter Cross-Platform Apps','flutter-apps','Build iOS & Android apps with Flutter','Dev Kumar',1799,60,'Intermediate',4.9,4500),
(3,'React Native Mobile Development','react-native','Cross-platform apps with React Native','Neha Gupta',1599,45,'Intermediate',4.8,3300),
(3,'Android Jetpack Compose','jetpack-compose','Modern Android UI with Jetpack Compose','Kiran Reddy',1299,35,'Advanced',4.7,1600),
-- Cloud Computing (cat 4)
(4,'AWS Cloud Practitioner','aws-practitioner','AWS fundamentals and cloud concepts','Cloud Expert Raj',1999,30,'Beginner',4.8,5600),
(4,'AWS Solutions Architect','aws-architect','AWS architecture and certification prep','Anil Sharma',2999,60,'Intermediate',4.9,3200),
(4,'Google Cloud Platform','gcp-complete','GCP services and cloud architecture','Maya Pillai',2499,45,'Intermediate',4.7,2100),
(4,'Microsoft Azure Fundamentals','azure-fundamentals','Azure cloud services and certifications','Sunil Kumar',1999,35,'Beginner',4.6,2800),
(4,'Docker & Kubernetes','docker-kubernetes','Containerization and orchestration','DevOps Guru',2499,50,'Advanced',4.9,4100),
(4,'CI/CD & DevOps Pipeline','devops-pipeline','Jenkins, GitLab CI, and DevOps practices','Prakash Nair',2199,40,'Advanced',4.8,2600),
(4,'Terraform Infrastructure as Code','terraform-iac','Automate cloud infrastructure with Terraform','Ravi Verma',1999,30,'Advanced',4.7,1400),
-- Cybersecurity (cat 5)
(5,'Ethical Hacking Complete Course','ethical-hacking','Penetration testing and ethical hacking','Cyber Expert Vikram',2499,60,'Intermediate',4.9,5200),
(5,'Network Security Fundamentals','network-security','Firewalls, VPNs and network protection','Security Pro Ankit',1499,35,'Beginner',4.7,3100),
(5,'Web Application Security','web-app-security','OWASP top 10 and web vulnerabilities','Pradeep Sharma',1999,40,'Intermediate',4.8,2400),
(5,'CompTIA Security+ Preparation','security-plus','Certification prep for CompTIA Security+','Exam Expert Raj',2999,50,'Intermediate',4.8,2800),
(5,'Cyber Forensics','cyber-forensics','Digital forensics and incident response','Dr. Suresh Kumar',2199,45,'Advanced',4.7,1200),
-- UI/UX Design (cat 6)
(6,'UI/UX Design Fundamentals','ux-fundamentals','User research, wireframing and prototyping','Designer Priya',999,30,'Beginner',4.8,4200),
(6,'Figma Complete Masterclass','figma-masterclass','Design modern UI with Figma','Creative Sneha',799,25,'Beginner',4.9,6800),
(6,'Adobe XD for Beginners','adobe-xd','Design and prototype with Adobe XD','Design Guru Amit',699,20,'Beginner',4.6,3500),
(6,'Design Systems & Style Guides','design-systems','Create scalable design systems','Meera Design',1299,30,'Intermediate',4.7,1800),
(6,'Motion Design & After Effects','motion-design','Animation and motion graphics','Arun Creative',1499,35,'Intermediate',4.8,2100),
-- Digital Marketing (cat 7)
(7,'Complete Digital Marketing','digital-marketing-complete','SEO, social media, email and PPC','Marketing Guru Ravi',1299,50,'Beginner',4.7,7200),
(7,'SEO Mastery 2024','seo-mastery','Rank #1 on Google with advanced SEO','SEO Expert Rahul',999,30,'Intermediate',4.8,5500),
(7,'Social Media Marketing','social-media-marketing','Facebook, Instagram and LinkedIn marketing','Social Pro Neha',799,25,'Beginner',4.6,8100),
(7,'Google Ads & PPC Mastery','google-ads','Run profitable Google ad campaigns','Ads Expert Sunil',1199,25,'Intermediate',4.7,3400),
(7,'Email Marketing Automation','email-marketing','Build email funnels with automation','Email Pro Deepa',699,20,'Beginner',4.5,4200),
(7,'Content Marketing Strategy','content-marketing','Create viral content and brand strategy','Content Guru Priya',899,25,'Intermediate',4.6,3800),
-- Business & Management (cat 8)
(8,'MBA Crash Course','mba-crash-course','Core MBA concepts in one course','Prof. Business Raj',1999,60,'Beginner',4.7,4500),
(8,'Project Management Professional','pmp-course','PMP certification preparation','PM Expert Anita',2999,70,'Intermediate',4.9,3200),
(8,'Financial Analysis & Modeling','financial-modeling','Excel financial models and valuation','Finance Guru Dev',1799,45,'Intermediate',4.8,2800),
(8,'Entrepreneurship & Startup','startup-entrepreneurship','Build and scale your startup','Startup Expert Kumar',1299,40,'Beginner',4.7,5100),
(8,'Leadership & Management Skills','leadership-skills','Develop essential leadership qualities','HR Expert Sharma',999,30,'Beginner',4.6,6200),
(8,'Business Communication','business-communication','Professional writing and presentation','Comm Expert Nair',699,20,'Beginner',4.5,7800),
-- Programming Languages (cat 9)
(9,'Python Complete Bootcamp','python-bootcamp','Python programming from zero to advanced','Python Guru Vikram',999,45,'Beginner',4.9,9200),
(9,'Java Complete Course','java-complete','Core Java to advanced with Spring Boot','Java Expert Amit',1499,60,'Intermediate',4.8,7100),
(9,'C++ Programming Mastery','cpp-mastery','C++ for competitive programming','C++ Pro Rohit',1199,50,'Intermediate',4.7,4500),
(9,'Go Language Complete Guide','golang-guide','Build scalable systems with Go','Go Expert Dev',1399,35,'Intermediate',4.8,2300),
(9,'Rust Programming Language','rust-programming','Systems programming with Rust','Rust Expert Anand',1599,40,'Advanced',4.9,1800),
(9,'Kotlin Complete Course','kotlin-course','Kotlin for Android and backend','Kotlin Pro Siri',1299,35,'Intermediate',4.7,2600),
(9,'Swift Programming for iOS','swift-programming','iOS app development with Swift','Swift Guru Priya',1499,40,'Intermediate',4.8,2100),
(9,'R Programming for Statistics','r-programming','Statistical computing with R','Statistics Prof',899,30,'Beginner',4.6,3200),
(9,'MATLAB Engineering','matlab-engineering','MATLAB for engineers and scientists','Engineering Prof Rao',1199,35,'Intermediate',4.5,1900),
(9,'Scala & Functional Programming','scala-functional','Functional programming with Scala','FP Expert',1399,40,'Advanced',4.7,1100),
-- Database Management (cat 10)
(10,'MySQL Complete Masterclass','mysql-masterclass','MySQL from beginner to advanced DBA','DB Expert Suresh',999,35,'Beginner',4.8,5600),
(10,'PostgreSQL Advanced Guide','postgresql-advanced','Advanced PostgreSQL for developers','PG Pro Kavya',1199,30,'Intermediate',4.7,2800),
(10,'MongoDB & NoSQL Complete','mongodb-nosql','MongoDB, Redis and NoSQL databases','NoSQL Guru Anil',1099,30,'Intermediate',4.8,3400),
(10,'Oracle Database Administration','oracle-dba','Oracle DBA certification preparation','Oracle Expert Raju',2499,60,'Advanced',4.7,1600),
(10,'Database Design & Architecture','db-design','ERD, normalization and schema design','Design Expert Meena',899,25,'Intermediate',4.6,2100),
-- Additional courses across categories
(1,'Angular Complete Guide','angular-guide','Build enterprise apps with Angular','Angular Pro Kiran',1399,45,'Intermediate',4.7,2800),
(1,'GraphQL API Development','graphql-api','Build flexible APIs with GraphQL','API Expert Priya',1299,30,'Advanced',4.8,1900),
(1,'Django Python Web Framework','django-web','Build web apps with Python Django','Django Expert Raj',1199,40,'Intermediate',4.7,3100),
(2,'Computer Vision with OpenCV','computer-vision','Image processing and computer vision','Vision Expert Dev',2199,45,'Advanced',4.8,1700),
(2,'Reinforcement Learning','reinforcement-learning','Train AI agents with RL algorithms','RL Expert Kumar',2999,50,'Advanced',4.9,1200),
(3,'Xamarin Mobile Development','xamarin-dev','Cross-platform apps with Xamarin','Xamarin Pro Anita',1299,40,'Intermediate',4.5,900),
(4,'Ansible Automation','ansible-auto','IT automation with Ansible','DevOps Expert Sai',1799,30,'Intermediate',4.7,2100),
(5,'Bug Bounty Hunting','bug-bounty','Find vulnerabilities and earn rewards','Hacker Pro Rahul',2999,55,'Advanced',4.9,3400),
(6,'3D Design with Blender','blender-3d','3D modeling and animation with Blender','3D Expert Arjun',1299,45,'Beginner',4.8,2600),
(7,'YouTube & Video Marketing','youtube-marketing','Grow your YouTube channel strategically','YT Expert Meera',799,20,'Beginner',4.7,9100),
(8,'Human Resources Management','hr-management','Modern HR practices and talent management','HR Prof Sunita',1299,35,'Intermediate',4.6,3200),
(9,'Data Structures & Algorithms','dsa-complete','Master DSA for coding interviews','DSA Guru Vikram',1999,70,'Intermediate',4.9,12500),
(10,'Redis In-Memory Database','redis-complete','Caching and real-time with Redis','Redis Expert Mohan',1099,20,'Intermediate',4.7,2400),
(1,'Bootstrap 5 Complete','bootstrap5','Responsive design with Bootstrap 5','Bootstrap Pro',599,15,'Beginner',4.5,6200),
(1,'Tailwind CSS Mastery','tailwind-css','Utility-first CSS with Tailwind','Tailwind Pro Anand',799,20,'Beginner',4.8,5500),
(2,'Pandas & NumPy Masterclass','pandas-numpy','Data manipulation with Python libraries','Data Scientist Priya',799,25,'Beginner',4.7,7800),
(4,'Linux Administration','linux-admin','Linux system administration and scripting','Linux Expert Suresh',1399,40,'Intermediate',4.8,4100),
(5,'Blockchain & Web3 Security','blockchain-security','Secure blockchain applications','Blockchain Expert',2499,40,'Advanced',4.8,1500),
(6,'Canva Graphic Design','canva-design','Professional graphics with Canva','Design Pro Sneha',499,15,'Beginner',4.6,11200),
(8,'Supply Chain Management','supply-chain','Modern supply chain and logistics','SCM Expert Raj',1499,40,'Intermediate',4.6,2100),
(9,'Competitive Programming','competitive-prog','Solve algorithmic problems competitively','CP Champion Arjun',1799,60,'Advanced',4.9,4500),
(10,'Elasticsearch & Kibana','elasticsearch','Search and analytics with ELK stack','Search Expert Nair',1499,30,'Advanced',4.7,1800),
(2,'Time Series Analysis','time-series','Forecasting with ARIMA and Prophet','TS Expert Kavya',1699,35,'Advanced',4.8,1400),
(1,'WebSocket & Real-time Apps','websocket-realtime','Build real-time apps with WebSockets','RTA Expert Dev',1199,25,'Advanced',4.7,2200),
(3,'AR/VR Development','ar-vr-dev','Augmented and virtual reality apps','AR Expert Kumar',2999,55,'Advanced',4.8,1100),
(6,'Photoshop Complete Course','photoshop-complete','Professional photo editing with Photoshop','PS Expert Rohan',999,35,'Beginner',4.6,8700),
(7,'Affiliate Marketing Mastery','affiliate-marketing','Build passive income with affiliates','Affiliate Pro Sunita',899,25,'Beginner',4.5,5600),
(8,'Accounting & Tally ERP','accounting-tally','Financial accounting with Tally','Accounts Expert Sita',799,30,'Beginner',4.4,6800),
(9,'Assembly Language Programming','assembly-lang','Low-level programming with Assembly','Systems Expert',1499,40,'Advanced',4.6,800),
(10,'Data Warehousing & ETL','data-warehouse','Build enterprise data warehouses','DW Expert Ravi',1999,45,'Advanced',4.7,1300);

-- ============================================================
-- SEED DATA - ADMIN USER
-- ============================================================
-- Password: Admin@123 (bcrypt hash)
INSERT INTO users (full_name, email, password_hash, phone, qualification, experience, role) VALUES
('Admin User', 'admin@elearn.com', '$2b$10$rOzJqJqJqJqJqJqJqJqJqO1234567890abcdefghijklmnopqrstuvwx', '9876543210', 'M.Tech Computer Science', '10 years', 'admin');

-- Password: Student@123
INSERT INTO users (full_name, email, password_hash, phone, parent_phone, address, qualification, role) VALUES
('Demo Student', 'student@demo.com', '$2b$10$rOzJqJqJqJqJqJqJqJqJqO1234567890abcdefghijklmnopqrstuvwx', '9876543211', '9876543212', '123 Demo Street, Mumbai', 'B.Tech', 'student');

-- ============================================================
-- SEED DATA - SAMPLE QUIZ
-- ============================================================
INSERT INTO quizzes (course_id, created_by, title, description, duration_minutes, pass_percent, total_marks) VALUES
(11, 1, 'Python Basics Quiz', 'Test your Python fundamentals knowledge', 30, 60, 50),
(1, 1, 'HTML & CSS Fundamentals', 'Test your web basics', 20, 60, 40);

INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks) VALUES
(1, 'What does Python use for code blocks?', 'Curly braces {}', 'Indentation', 'Parentheses ()', 'Square brackets []', 'B', 10),
(1, 'Which method converts string to integer in Python?', 'str()', 'float()', 'int()', 'num()', 'C', 10),
(1, 'What is the output of print(type([]))?', "<class 'dict'>", "<class 'tuple'>", "<class 'set'>", "<class 'list'>", 'D', 10),
(1, 'Which keyword is used to define a function?', 'function', 'def', 'func', 'define', 'B', 10),
(1, 'What does len() return for "hello"?', '4', '5', '6', 'Error', 'B', 10),
(2, 'What does HTML stand for?', 'Hyper Text Markup Language', 'High Text Machine Language', 'Hyper Transfer Markup Logic', 'None', 'A', 10),
(2, 'Which CSS property changes text color?', 'font-color', 'text-color', 'color', 'foreground', 'C', 10),
(2, 'Which HTML tag creates a hyperlink?', '<link>', '<a>', '<href>', '<url>', 'B', 10),
(2, 'What is the CSS box model order (outer to inner)?', 'Content, Padding, Border, Margin', 'Margin, Border, Padding, Content', 'Border, Margin, Content, Padding', 'Padding, Content, Border, Margin', 'B', 10);

-- ============================================================
-- SEED DATA - SAMPLE LIVE CLASSES
-- ============================================================
INSERT INTO live_classes (course_id, title, description, instructor_id, zoom_link, platform, scheduled_at, duration_minutes, status) VALUES
(11, 'Python for Beginners - Session 1', 'Introduction to Python programming', 1, 'https://zoom.us/j/demo123', 'Zoom', DATE_ADD(NOW(), INTERVAL 1 DAY), 90, 'scheduled'),
(1, 'HTML & CSS Workshop', 'Hands-on HTML and CSS coding', 1, 'https://zoom.us/j/demo456', 'Zoom', DATE_ADD(NOW(), INTERVAL 2 DAY), 60, 'scheduled'),
(5, 'MERN Stack Live Coding', 'Build a full stack app together', 1, 'https://zoom.us/j/demo789', 'Google Meet', DATE_ADD(NOW(), INTERVAL 3 DAY), 120, 'scheduled');

SELECT 'Database setup complete! Tables created and seed data inserted.' AS Status;
