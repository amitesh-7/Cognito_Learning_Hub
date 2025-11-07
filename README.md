# Cognito Learning Hub

**Intelligence Meets Interaction**

Cognito Learning Hub is a modern, full-stack AI-powered educational platform designed to enhance the learning and teaching experience through the power of artificial intelligence. It provides a comprehensive suite of tools for creating, taking, and managing quizzes, supported by a robust, role-based user system.

**Made with team OPTIMISTIC MUTANT CODERS** | IIT Bombay Techfest 2025

1. Core User Roles & Access Control
   The platform is built on a secure authentication system with four distinct user roles, ensuring that each user has access only to the features relevant to them.

Student: The primary user of the platform. Students can sign up, browse the full library of quizzes, take quizzes, view their scores and history on a personal dashboard, and use the AI Doubt Solver for academic help.

Teacher: Content creators on the platform. Teachers have all the permissions of a Student, plus exclusive access to the Quiz Maker Studio. They can create, edit, and delete their own quizzes and view a personal dashboard to track how many times their quizzes have been taken.

Moderator: Responsible for maintaining a safe and high-quality environment. Moderators can view, edit, and delete any quiz on the platform. They also have access to a dedicated dashboard to review and manage questions that have been reported by users.

Admin: The super-user with complete control over the platform. Admins have all the permissions of every other role and can also manage all users (e.g., change their roles) and view site-wide analytics from a powerful admin dashboard.

2. The Quiz Maker Studio (For Teachers)
   This is the creative heart of the application, offering three distinct methods for quiz creation to provide maximum flexibility and efficiency.

AI Generation from Topic: Teachers can simply enter a topic (e.g., "The French Revolution"), select the number of questions, and choose a difficulty level. The AI analyzes the topic and instantly generates a relevant, ready-to-use quiz. Use Case: Quickly creating a quiz for a new lesson plan or for a subject that needs fresh questions.

AI Generation from File: Teachers can upload a document (PDF or TXT file) containing study notes, a textbook chapter, or any other text-based material. The AI reads and understands the content to generate a quiz based directly on the provided information. Use Case: Transforming existing lesson materials or student handouts into an interactive assessment with zero manual effort.

Manual Creation: For complete control, teachers can use an intuitive, step-by-step editor to write their own questions and answers. They can add as many questions as needed and define the correct option for each. Use Case: Crafting highly specific questions for an exam or tailoring a quiz to the exact curriculum covered in class.

3. The Student Experience
   The platform is designed to be an engaging and helpful tool for students, with a focus on interactive learning and support.

Interactive Quiz Taker: A modern, gamified quiz player that presents one question at a time. It features a timer for each question, instant visual and audio feedback for correct/incorrect answers, and a progress bar.

Celebratory Results Screen: Upon completion, students are shown a celebratory results screen with their final score, a percentage, and a confetti effect for high scores. From here, they can play again, view the leaderboard, or return to the quiz list.

AI Doubt Solver / AI Tutor: A dedicated chat interface where students can ask any academic question and receive instant, helpful explanations from the AI, which is prompted to act as a friendly and encouraging tutor.

Personalized Dashboard: Each student has a private dashboard that displays key stats like their average score and total quizzes completed. It includes a score progression chart to visualize their improvement over time and an achievements section with badges to gamify the learning process.

Quiz Library & Leaderboards: Students can browse a central library of all available quizzes. For each quiz, they can view a public leaderboard to see how their score compares to the top players, adding a fun, competitive element.

4. Platform-Wide Features & UI/UX
   Quizwise-AI is built with a focus on modern design and a high-quality user experience.

Secure Authentication: A complete login and sign-up system protects user data. Passwords are never stored directly; they are securely hashed using bcryptjs. User sessions are managed with JSON Web Tokens (JWT).

Modern, Responsive UI: The entire application is built with a clean, professional aesthetic that is fully responsive and works beautifully on desktops, tablets, and mobile devices.

Dark Theme: Users can switch between a light and a sleek, modern dark theme at any time. The application remembers the user's preference.

Fluid Animations: The interface is enhanced with smooth, subtle animations powered by Framer Motion, making the application feel dynamic and responsive.

Content Moderation: A "report question" feature is integrated into the quiz taker, allowing students to flag incorrect or inappropriate content. These reports are sent directly to the Moderator and Admin dashboards for review, ensuring the platform remains a safe and reliable learning environment.
