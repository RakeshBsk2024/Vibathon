🧪 Test Case Generator Extension
This project is a Chrome Extension that intelligently scans a web page and generates high-quality test cases — both manual and automation-ready — using a Gemini AI-powered backend.

🚀 Features
🖱️ Floating "Generate Test Cases" button
📋 Auto-detection of visible web elements (buttons, inputs, links, images, headings, logo, navigation, etc.)
⚡️ 5 Positive, 10 Negative, 5 Edge test cases per element
🧠 AI-generated test cases via Gemini (server-side)

📂 Sidebar popup with:
Fixed header with title + Close button
Live search & priority filter (High / Medium / Low)
Grouping by element type
Pagination for large test sets
Light / Dark mode toggle
📄 Export options: TXT, CSV, XLSX
✅ Manual + Automation-style test case format
🔒 Ignores extension-injected UI (avoids duplicate or irrelevant cases)

🛠️ Tech Stack
Frontend (Chrome Extension)	Backend (Node.js Server)
HTML, CSS, JavaScript	Node.js + Express
Manifest v3	Gemini API (Google AI)

🧰 Folder Structure
project-root/
├── extension/                # Chrome Extension files
│   ├── contentScript.js
│   ├── style.css
│   ├── manifest.json
│   └── icons/
├── backend/                  # Node.js Gemini AI backend
│   ├── server.js
│   └── .env                  # Gemini API Key here
├── README.md

🔧 Installation
Chrome Extension Setup
Open Chrome → Go to chrome://extensions/
Enable Developer Mode (top-right)
Click “Load Unpacked”
Select the extension/ folder
You’ll now see a floating “Generate Test Cases” button on web pages

Backend SetupNavigate to the backend/ folder
Install dependencies: npm install
Create a .env file: GEMINI_API_KEY=your_api_key_here
Start the backend server: Ensure it's running at http://localhost:3000

📦 Build & Deploy
You can deploy the backend to services like Render, Vercel, or Railway for public access.

Update the endpoint in contentScript.js accordingly:
fetch('http://localhost:3000/generate-test-cases' ... )
// → e.g., replace with: https://your-backend-url/generate-test-cases

🧪 Sample Use Cases
QA testers generating test cases for login, registration, dashboards
Product owners validating feature readiness
Automated test script writers needing structured steps and expected results

✅ TODOs
 Add PDF export
 Add accessibility test cases (WCAG)
 Drag-resize sidebar
 User login and history in backend (optional)

👩‍💻 Author
Created by Rakesh Patil
