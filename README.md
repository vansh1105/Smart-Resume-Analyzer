# Smart Resume Analyzer (ResumePilot) 🚀

Smart Resume Analyzer (also named **ResumePilot** internally) is an AI-powered, full-stack application designed to parse, critique, and analyze resumes against job descriptions. By leveraging the power of **Google Gemini 2.5 Flash**, the system provides deep career insights, ATS compliance scores, metrics-driven bullet-point recommendations, project critiques, and tailored mock interview preparation questions.

---

## 🌟 Key Features

1. **AI-Powered Resume Parsing**: Uses pdf-parse and Mammoth to extract raw text from PDF and DOCX uploads, sending structured data to Gemini to populate profile information (Contact, Skills, Experience, Education, and Projects).
2. **ATS Scoring & Section Breakdown**: Analyzes the structure and content of your resume to provide an ATS rating score with breakdown charts.
3. **AI Critique & Bullet Point Refinements**: Provides metrics-driven improvement suggestions, career paths, and grammar corrections.
4. **Project Critique**: Analyzes the projects on your resume, evaluates their depth, lists missing technical buzzwords, and proposes architectural enhancements.
5. **Tailored Mock Interview Prep**: Generates personalized behavioral, technical, and project-based interview questions customized specifically for your resume, along with high-quality model answers.
6. **Job Matching & Gap Analysis**: Matches your resume to a pasted Job Description, outlining matching/missing skills, keyword alignment, and day-one readiness scores.
7. **User Authentication**: Secure user registration and login using JWT (JSON Web Tokens) and bcrypt password hashing.
8. **Modern Dashboard**: Visually rich dashboard built with custom dark-themed components, animated with Framer Motion, and visual analytics via Recharts.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React (v18) with Vite (v5)
- **Language**: TypeScript
- **Styling**: TailwindCSS & PostCSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts/Visualization**: Recharts
- **Form Management**: React Hook Form with Zod validation
- **State/Caching**: React Query (TanStack Query)

### Backend
- **Framework**: Express (Node.js)
- **Language**: TypeScript (using `ts-node-dev` for live reloading)
- **Database**: MongoDB with Mongoose ODM
- **File Upload**: Multer
- **Parsers**: `pdf-parse` (for PDF files) and `mammoth` (for Word/DOCX files)
- **Security**: Helmet, CORS, and Express middle-wares
- **Authentication**: JSON Web Token (JWT) & bcryptjs
- **Validation**: Zod

### AI Integration
- **SDK**: Google Generative AI (`@google/generative-ai`)
- **Model**: `gemini-2.5-flash` (used for structured JSON extraction and analysis)

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js installed on your machine.
- A MongoDB cluster or local instance running.
- A Google Gemini API Key (obtained from [Google AI Studio](https://aistudio.google.com/)).

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` root directory and populate it with the following:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000/`.

---

## 🔒 Security Note
This project utilizes a `.gitignore` configured to ensure that **no credentials, `.env` files, or local dependencies (`node_modules`) are ever uploaded to public repositories.** Keep your Gemini and MongoDB credentials secure.
