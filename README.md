# Lohitha Dharma Real Estate AI Email Automation System

This is a complete, production-ready AI-powered email automation and lead relationship management (CRM) dashboard for **Lohitha Dharma**, a real estate company. It automatically ingests incoming customer inquiries in **English**, **Telugu**, and **Hindi**, processes them using Large Language Models (Gemini/OpenAI), drafts native-language replies, sends them out via SMTP (Gmail), and captures detailed lead indicators (Name, Phone, Budget, Location, Property type) inside MongoDB.

---

## Technical Stack
- **Frontend**: React.js, Tailwind CSS, Axios, Lucide Icons, Vite
- **Backend**: Node.js, Express.js, MVC architecture, Express input validation
- **Database**: MongoDB (via Mongoose schemas)
- **AI Integrations**: Gemini API (via `@google/generative-ai`) and OpenAI API (via `openai`)
- **Email Gateway**: Nodemailer SMTP (optimised for Gmail App Passwords)

---

## Directory Structure

```text
email-automation-system/
├── package.json                   # Root monorepo configuration (concurrently runner)
├── README.md                      # Setup and usage manual
├── backend/                       # Express Node.js application
│   ├── config/                    # DB connection setups
│   ├── controllers/               # Route endpoint handlers
│   ├── middleware/                # Validation & error handlers
│   ├── models/                    # MongoDB Mongoose models
│   ├── routes/                    # Route mappings
│   ├── services/                  # AI and SMTP nodemailer integrations
│   ├── utils/                     # Integration test scripts
│   ├── package.json
│   ├── .env                       # Environment configs (local)
│   └── server.js                  # Express entry file
└── frontend/                      # React Vite + Tailwind SPA
    ├── src/
    │   ├── components/            # Sidebar, Header layouts
    │   ├── pages/                 # Login, Dashboard, Inbox, Leads, Settings
    │   ├── App.jsx                # Router, global context state, notifications
    │   └── main.jsx
    ├── index.html
    ├── tailwind.config.js
    └── vite.config.js
```

---

## Getting Started

### Prerequisites
1. **Node.js** (v16.x or newer) installed.
2. **MongoDB** installed and running locally, or a MongoDB Atlas URI link.
3. *Optional*: A **Gemini API Key** or **OpenAI API Key** (for dynamic AI generation).
4. *Optional*: A **Gmail account** and a **Gmail App Password** (for sending actual emails).

---

### Setup Instructions

1. **Clone/Open Workspace**:
   Ensure you are in the project folder `/Users/suryakamalchebrolu/.gemini/antigravity-ide/scratch/email-automation-system`. We recommend setting this folder as your active IDE workspace.

2. **Install Dependencies**:
   Run the following script at the root directory to install all monorepo dependencies (root, backend, and frontend) automatically:
   ```bash
   npm run install-all
   ```

3. **Configure Environment Variables**:
   Open `backend/.env` (pre-created with defaults) and fill in your details:
   ```env
   PORT=5001
   MONGO_URI=mongodb://127.0.0.1:27017/lohitha_dharma
   
   # Add your AI APIs:
   GEMINI_API_KEY=your_gemini_api_key_here
   # OR:
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Setup actual email delivery (Optional):
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_gmail_app_password
   ```

4. **Start the Application**:
   Start both the backend server and React dashboard concurrently with a single command run from the root:
   ```bash
   npm start
   ```
   - **Frontend Dev Server**: [http://localhost:5173](http://localhost:5173)
   - **Backend API Server**: [http://localhost:5001](http://localhost:5001)

---

## Simulation & Health Features

- **AI Simulation Mode**: If neither `GEMINI_API_KEY` nor `OPENAI_API_KEY` are provided, the system safely runs in **Simulation Mode**, using language-matched professional real estate templates to respond to English, Telugu, and Hindi queries.
- **SMTP Simulation Mode**: If email user/pass credentials are omitted, outgoing replies are logged to the backend console console instead of throwing errors.
- **Inbound Email Simulator**: The Dashboard page provides a live form console where you can simulate receiving real emails from customers. Submit it to watch the AI automatically analyze, extract leads, draft replies, and update the table in real-time.
- **Config Health Checks**: The Settings page contacts the backend `/api/config-status` endpoint to confirm if MongoDB, Gemini API, OpenAI API, and SMTP setups are successfully connected.

---

## Administrator Login
To access the Dashboard, use the following administrator credentials (pre-loaded in the Login window):
- **Email**: `admin@lohithadharma.com`
- **Password**: `admin123`

---

## Running Integration Tests
To verify all REST API endpoints and simulate incoming multi-lingual customer inquiries (English, Telugu, Hindi), start the server (`npm start`), then open a separate terminal and run:
```bash
node backend/utils/test-api.js
```
This script will submit mock customer payloads, verify that the AI extracts contact details/budgets/property types correctly, check if database entries are successfully logged, and display logs of the operation.
