# Smart Job Portal 🚀

Welcome to the **Smart Job Portal**! This isn't just another job board; it's a modern, AI-powered platform designed to bridge the gap between job seekers and recruiters using intelligent matching and a beautiful, glassmorphism-inspired UI.

I built this project to explore how AI can make the job hunt less painful for candidates and more efficient for recruiters.

## ✨ What makes it special?

* **AI-Powered Resume Analysis:** Job seekers can upload their resumes (PDF/DOCX), and the system uses AI to parse the text, calculate an ATS score, and extract key strengths and missing skills.
* **Smart Recommendations:** No more endless scrolling. The platform automatically matches candidates to open roles based on the exact skills extracted from their resumes.
* **Three Distinct Experiences:**
  * **Job Seekers:** Get AI feedback on resumes, track applications, save jobs, and view custom recommendations.
  * **Recruiters:** Post jobs, review applicants, and manage the company profile.
  * **Admins:** Oversee the entire platform, manage users, and moderate job postings.
* **OTP Email Verification:** Secure account creation with real-time email OTP verification.
* **Beautiful UI:** Built with React, Tailwind, and Framer Motion for a fluid, responsive, and modern "glassmorphism" aesthetic.

## 🛠️ Tech Stack

**Frontend:**
- React (Vite)
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- React Query (Data Fetching)
- Framer Motion (Animations)

**Backend:**
- Java 17 & Spring Boot 3
- Spring Security & JWT
- PostgreSQL
- Flyway (Database Migrations)
- MailHog (Local Email Testing)
- Gemini AI API Integration

## 🚀 Getting Started Locally

Want to spin this up on your own machine? Here's how:

### Prerequisites
- Node.js (v18+)
- Java 17
- PostgreSQL running locally
- MailHog (for testing OTP emails)

### 1. Database & Services Setup
1. Create a PostgreSQL database named `jobportal`.
2. Start MailHog (runs on ports `1025` for SMTP and `8025` for the web UI).

### 2. Backend Setup
Navigate to the `backend` directory:
```bash
cd backend
```
Update the `application.yml` file with your database credentials and Gemini API key (if you want the AI features, otherwise it will use a smart mock fallback!).
Run the Spring Boot application:
```bash
./mvnw spring-boot:run
```

### 3. Frontend Setup
Navigate to the `frontend` directory:
```bash
cd frontend
```
Install dependencies and start the dev server:
```bash
npm install
npm run dev
```
Visit `http://localhost:5173` in your browser!

## 📸 Sneak Peek
*(Feel free to add some screenshots of the awesome UI here!)*

## 🤝 Contributing
This was built as a passion project, but if you have ideas on how to improve the AI matching, make the UI even sleeker, or add new features, feel free to fork the repo and open a PR!

## 📝 License
This project is open-source and available under the MIT License.
