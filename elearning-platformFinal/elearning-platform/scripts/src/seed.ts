import { db } from "@workspace/db";
import {
  coursesTable,
  usersTable,
  liveClassesTable,
  quizzesTable,
  quizQuestionsTable,
  notificationsTable,
  enrollmentsTable,
  courseMaterialsTable,
} from "@workspace/db/schema";
import crypto from "crypto";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "elearning-salt").digest("hex");
}

const categories = [
  "Programming",
  "Data Science",
  "Design",
  "Business",
  "Marketing",
  "Language",
  "Personal Development",
  "Health & Fitness",
  "Music",
  "Photography",
];

const instructors = [
  "Dr. Sarah Johnson",
  "Prof. Michael Chen",
  "Dr. Emily Davis",
  "Prof. Robert Wilson",
  "Dr. Priya Sharma",
  "Prof. David Martinez",
  "Dr. Lisa Thompson",
  "Prof. James Anderson",
  "Dr. Aisha Rahman",
  "Prof. Carlos Rivera",
];

const courseImages: Record<string, string> = {
  Programming: "https://images.unsplash.com/photo-1587620962725-abab19836100?w=400",
  "Data Science": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
  Design: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400",
  Business: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400",
  Marketing: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=400",
  Language: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400",
  "Personal Development": "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400",
  "Health & Fitness": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
  Music: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400",
  Photography: "https://images.unsplash.com/photo-1452780212441-b91f0ac2c8b9?w=400",
};

const courseTitles: Record<string, string[]> = {
  Programming: [
    "Complete Python Bootcamp: Zero to Hero",
    "JavaScript: From Beginner to Pro",
    "React.js Complete Course 2024",
    "Node.js Backend Development",
    "Java Programming Masterclass",
    "C++ for Beginners to Advanced",
    "Full Stack Web Development",
    "TypeScript for Professional Developers",
    "Django Framework Complete Guide",
    "Angular Framework Mastery",
    "Vue.js Complete Developer Course",
    "PHP & MySQL Web Development",
  ],
  "Data Science": [
    "Machine Learning A-Z: Python & R",
    "Data Analysis with Python",
    "Deep Learning & Neural Networks",
    "SQL for Data Science",
    "Data Visualization with Tableau",
    "Statistics for Data Science",
    "Big Data with Apache Spark",
    "Natural Language Processing",
    "Computer Vision with OpenCV",
    "R Programming for Data Science",
    "TensorFlow Complete Guide",
    "Data Science Career Bootcamp",
  ],
  Design: [
    "UI/UX Design Fundamentals",
    "Adobe Photoshop Masterclass",
    "Figma Complete Design Course",
    "Graphic Design Bootcamp",
    "Web Design with HTML & CSS",
    "Illustrator Advanced Techniques",
    "Motion Graphics with After Effects",
    "Brand Identity Design",
    "3D Modeling with Blender",
    "Logo Design for Beginners",
    "Typography Mastery",
    "Color Theory in Design",
  ],
  Business: [
    "MBA Essentials: Business Strategy",
    "Entrepreneurship: Start Your Business",
    "Financial Accounting for Beginners",
    "Project Management Professional",
    "Business Analytics with Excel",
    "Leadership & Management Skills",
    "Supply Chain Management",
    "Corporate Finance Fundamentals",
    "Business Communication Skills",
    "Operations Management",
    "Strategic Planning Masterclass",
    "E-Commerce Business Setup",
  ],
  Marketing: [
    "Digital Marketing Complete Course",
    "Social Media Marketing Strategy",
    "SEO Fundamentals & Advanced",
    "Content Marketing Mastery",
    "Email Marketing Campaigns",
    "Google Ads Certification Course",
    "Facebook & Instagram Advertising",
    "Influencer Marketing Strategy",
    "Marketing Analytics & Data",
    "Brand Management Course",
    "Customer Psychology in Marketing",
    "Affiliate Marketing Mastery",
  ],
  Language: [
    "English Speaking for Beginners",
    "Advanced English Grammar",
    "Spanish for Beginners",
    "French Language Complete Course",
    "Mandarin Chinese Fundamentals",
    "Business English Communication",
    "German Language Basics",
    "Japanese for Beginners",
    "IELTS Preparation Course",
    "Public Speaking Mastery",
    "Arabic Language Fundamentals",
    "Portuguese for Beginners",
  ],
  "Personal Development": [
    "Time Management Mastery",
    "Emotional Intelligence Course",
    "Mindfulness & Meditation",
    "Goal Setting & Achievement",
    "Confidence Building Workshop",
    "Critical Thinking Skills",
    "Memory Improvement Techniques",
    "Stress Management Strategies",
    "Productivity Hacks & Systems",
    "Communication Skills Mastery",
    "Decision Making Framework",
    "Personal Finance Management",
  ],
  "Health & Fitness": [
    "Complete Yoga for Beginners",
    "Nutrition & Healthy Eating",
    "Home Workout Complete Guide",
    "Mental Health & Wellness",
    "Weight Loss Science & Strategy",
    "Running for Beginners",
    "Strength Training Fundamentals",
    "Plant-Based Diet Guide",
    "Pilates for Core Strength",
    "Sports Psychology",
    "Sleep Optimization Course",
    "Mindful Eating Habits",
  ],
  Music: [
    "Guitar for Absolute Beginners",
    "Piano Fundamentals Course",
    "Music Theory Complete Guide",
    "Singing & Vocal Training",
    "Music Production with FL Studio",
    "DJ Course for Beginners",
    "Drums & Percussion Basics",
    "Music Composition Techniques",
    "Bass Guitar Fundamentals",
    "Electronic Music Production",
    "Music Mixing & Mastering",
    "Songwriting Masterclass",
  ],
  Photography: [
    "Photography for Beginners",
    "Lightroom Photo Editing",
    "Portrait Photography Mastery",
    "Landscape Photography Guide",
    "Wedding Photography Business",
    "Street Photography Techniques",
    "Food Photography & Styling",
    "Wildlife Photography Tips",
    "Photoshop for Photographers",
    "Travel Photography Course",
    "Product Photography for E-Commerce",
    "Black & White Photography Art",
  ],
};

async function seed() {
  console.log("🌱 Starting database seed...");

  const existingCourses = await db.select().from(coursesTable).limit(1);
  if (existingCourses.length > 0) {
    console.log("Database already seeded. Skipping...");
    return;
  }

  const adminUser = await db.insert(usersTable).values({
    name: "Admin User",
    email: "admin@elearning.com",
    passwordHash: hashPassword("admin123"),
    role: "admin",
    phone: "+1-555-0100",
    qualification: "Ph.D. in Education Technology",
    experience: "10 years",
    address: "123 Education Street, Learning City",
  }).returning();
  console.log("✅ Admin user created: admin@elearning.com / admin123");

  const studentUser = await db.insert(usersTable).values({
    name: "John Student",
    email: "student@elearning.com",
    passwordHash: hashPassword("student123"),
    role: "student",
    phone: "+1-555-0200",
    parentPhone: "+1-555-0201",
    address: "456 Learning Lane, Study Town",
    qualification: "Bachelor's Degree",
    photoUrl: null,
  }).returning();
  console.log("✅ Student user created: student@elearning.com / student123");

  const insertedCourses = [];
  for (const category of categories) {
    const titles = courseTitles[category] || [];
    for (let i = 0; i < titles.length; i++) {
      const instructor = instructors[i % instructors.length];
      const price = (1999 + Math.floor(Math.random() * 8000)) / 100;
      const course = await db.insert(coursesTable).values({
        title: titles[i],
        instructorName: instructor,
        category,
        description: `A comprehensive ${category.toLowerCase()} course covering everything from fundamentals to advanced concepts. Perfect for beginners and professionals looking to enhance their skills.`,
        syllabus: `Module 1: Introduction and Fundamentals\nModule 2: Core Concepts and Techniques\nModule 3: Intermediate Topics\nModule 4: Advanced Applications\nModule 5: Real-world Projects\nModule 6: Best Practices\nModule 7: Capstone Project`,
        price: String(price.toFixed(2)),
        duration: `${Math.floor(Math.random() * 20) + 10} hours`,
        imageUrl: courseImages[category],
        rating: String((3.5 + Math.random() * 1.5).toFixed(1)),
      }).returning();
      insertedCourses.push(course[0]);
    }
  }
  console.log(`✅ ${insertedCourses.length} courses created`);

  const firstCourse = insertedCourses[0];
  const secondCourse = insertedCourses[1];

  await db.insert(enrollmentsTable).values({
    studentId: studentUser[0].id,
    courseId: firstCourse.id,
    progress: 65,
  });
  await db.insert(enrollmentsTable).values({
    studentId: studentUser[0].id,
    courseId: secondCourse.id,
    progress: 30,
  });
  console.log("✅ Student enrollments created");

  await db.insert(courseMaterialsTable).values([
    { courseId: firstCourse.id, title: "Introduction Video Lecture", type: "video", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", description: "Welcome and course overview" },
    { courseId: firstCourse.id, title: "Course Notes - Module 1", type: "pdf", url: "#", description: "Downloadable notes for module 1" },
    { courseId: firstCourse.id, title: "Advanced Concepts Video", type: "video", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", description: "Deep dive into advanced topics" },
    { courseId: secondCourse.id, title: "Getting Started Guide", type: "pdf", url: "#", description: "Your first steps guide" },
    { courseId: secondCourse.id, title: "Lecture 1: Basics", type: "video", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", description: "Foundation concepts explained" },
  ]);
  console.log("✅ Course materials created");

  const futureDate1 = new Date();
  futureDate1.setDate(futureDate1.getDate() + 2);
  const futureDate2 = new Date();
  futureDate2.setDate(futureDate2.getDate() + 5);
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 3);

  await db.insert(liveClassesTable).values([
    { courseId: firstCourse.id, title: "Live Q&A Session - Module 1", zoomLink: "https://zoom.us/j/123456789", scheduledAt: futureDate1, duration: 60, status: "upcoming" },
    { courseId: firstCourse.id, title: "Advanced Topics Workshop", zoomLink: "https://zoom.us/j/987654321", scheduledAt: futureDate2, duration: 90, status: "upcoming" },
    { courseId: secondCourse.id, title: "Recorded Workshop Session", zoomLink: "https://zoom.us/j/111222333", scheduledAt: pastDate, duration: 60, status: "completed" },
  ]);
  console.log("✅ Live classes created");

  const [quiz] = await db.insert(quizzesTable).values({
    courseId: firstCourse.id,
    title: `${firstCourse.title} - Module 1 Quiz`,
    duration: 30,
    totalMarks: 50,
  }).returning();

  await db.insert(quizQuestionsTable).values([
    { quizId: quiz.id, question: "What is the main purpose of this course?", options: JSON.stringify(["Entertainment", "Learning and skill development", "Gaming", "Social networking"]), correctAnswer: 1, marks: 10 },
    { quizId: quiz.id, question: "How many modules does this course have?", options: JSON.stringify(["3 modules", "5 modules", "7 modules", "10 modules"]), correctAnswer: 2, marks: 10 },
    { quizId: quiz.id, question: "What will you achieve after completing this course?", options: JSON.stringify(["Nothing", "Basic knowledge only", "Professional-level skills", "Expert certification"]), correctAnswer: 2, marks: 10 },
    { quizId: quiz.id, question: "Is this course suitable for beginners?", options: JSON.stringify(["No", "Only for experts", "Yes, all levels welcome", "Only for intermediate"]), correctAnswer: 2, marks: 10 },
    { quizId: quiz.id, question: "What type of projects will you build?", options: JSON.stringify(["No projects", "Theory only", "Real-world capstone projects", "Sample projects"]), correctAnswer: 2, marks: 10 },
  ]);
  console.log("✅ Quiz and questions created");

  await db.insert(notificationsTable).values([
    { userId: studentUser[0].id, title: "Welcome to E-Learning Platform!", message: "Start your learning journey today. You have been enrolled in your first course!", type: "success", isRead: false },
    { userId: studentUser[0].id, title: "New Live Class Scheduled", message: "A live class has been scheduled for your enrolled course. Don't miss it!", type: "info", isRead: false },
    { userId: studentUser[0].id, title: "Complete Your Profile", message: "Add a profile photo and complete your learning profile for a better experience.", type: "warning", isRead: true },
  ]);
  console.log("✅ Notifications created");

  console.log("\n🎉 Database seeding complete!");
  console.log("📧 Admin: admin@elearning.com / admin123");
  console.log("📧 Student: student@elearning.com / student123");
}

seed().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
