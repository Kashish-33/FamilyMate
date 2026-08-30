# FamilyMate — AI-Assisted Family Management Platform

🔗 **Live Demo:** https://familymate-1.onrender.com

FamilyMate is a full-stack application that helps families centralize and manage **medicines, important documents, expiry-based reminders, notifications, and family data**, with an integrated **Google Gemini AI assistant, OCR-based data extraction, and agentic tool calling**.

---

## Problem Statement

Managing important information for multiple family members is easy to get wrong:

* Medicine expiry dates can be forgotten.
* Important documents can silently expire.
* Notifications can accumulate indefinitely.
* Family information is scattered across different apps, notes, and memory.

FamilyMate centralizes this information and automates expiry tracking, reminders, notifications, and AI-assisted interaction with family data.

---

## Features

### 👨‍👩‍👧 Family & Member Management

* Create and manage families
* Add and manage individual family members
* Associate medicines and documents with specific members

### 💊 Medicine Management

* Add and track medicines for family members
* Track medicine expiry dates
* Automatic expiry detection
* Reminder generation for medicines approaching expiry

### 📄 Document Management

* Upload and manage family documents
* Associate documents with specific family members
* Track document expiry dates
* Automatic reminders for documents approaching expiry

### 🔍 OCR-Based Data Extraction

* OCR processing of uploaded documents/images
* Extract relevant information from uploaded documents
* Use extracted information in medicine/document management and reminder workflows

### 🔔 Notification System

* Create and manage notifications
* Read/unread state tracking
* Unread notification count
* Duplicate-notification prevention
* Individual and bulk "mark as read"
* Automatic cleanup of read notifications after 24 hours

### ⏰ Background Automation

* Background scheduler for periodic medicine and document checks
* Automatic reminder generation
* Automatic notification cleanup
* Reminder checking also runs when the backend starts

### 🤖 AI Assistant

* Google Gemini integration
* Natural-language interaction with family data
* AI-powered Q&A about family members, medicines, and documents
* **Agentic tool calling** for supported backend operations
* AI can execute backend functions through tools instead of only generating text responses

### 💻 Frontend

* React + TypeScript
* Tailwind CSS-based UI
* Family management interface
* Medicine management interface
* Document management interface
* Notification management
* AI chat interface
* Responsive and component-based frontend

---

## Tech Stack

| Layer           | Technology                      |
| --------------- | ------------------------------- |
| Frontend        | React, TypeScript, Tailwind CSS |
| Backend         | FastAPI, Python                 |
| ORM             | SQLAlchemy                      |
| Database        | PostgreSQL                      |
| AI              | Google Gemini API               |
| OCR             | OCR-based document extraction   |
| Scheduler       | APScheduler                     |
| Server          | Uvicorn                         |
| Configuration   | Environment variables (`.env`)  |
| Version Control | Git, GitHub                     |

---

## Architecture

```text
                         ┌─────────────────────┐
                         │      React UI       │
                         │ TypeScript + Tailwind│
                         └──────────┬──────────┘
                                    │ REST API
                                    ▼
                         ┌─────────────────────┐
                         │   FastAPI Backend   │
                         └──────────┬──────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
       Family Module        Medicine Module       Document Module
              │                     │                     │
              │                     │                     ▼
              │                     │                   OCR
              │                     │                     │
              └─────────────────────┼─────────────────────┘
                                    ▼
                         ┌─────────────────────┐
                         │ Notification Service│
                         └──────────┬──────────┘
                                    ▼
                         ┌─────────────────────┐
                         │ Reminder Scheduler  │
                         └──────────┬──────────┘
                                    ▼
                         ┌─────────────────────┐
                         │     PostgreSQL      │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   AI Module         │
                         │   Gemini + Tools    │
                         └─────────────────────┘
```

---

## Notification Lifecycle

```text
Created
   ↓
UNREAD
   ↓
User reads notification
   ↓
READ + read_at timestamp
   ↓
24 hours pass
   ↓
Eligible for cleanup
   ↓
Background scheduler runs
   ↓
DELETED
```

Only **read notifications** are automatically removed. Unread notifications are not deleted by the 24-hour cleanup.

---

## Project Structure

```text
FamilyMate/
├── app/
│   ├── core/             # Configuration and database setup
│   ├── models/           # SQLAlchemy database models
│   ├── routers/          # FastAPI API route handlers
│   ├── services/         # Business logic, reminders, notifications, scheduler
│   └── main.py           # FastAPI application entry point
│
├── frontend/             # React + TypeScript + Tailwind CSS application
├── uploads/              # Uploaded document storage
├── requirements.txt
└── README.md
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=your_postgresql_connection_string
GEMINI_API_KEY=your_gemini_api_key
SECRET_KEY=your_secret_key
FRONTEND_URL=your_frontend_url

```

Never commit `.env` or expose API keys and database credentials in source code.

---

## Deployment

FamilyMate is deployed with the following setup:

- **Frontend:** Deployed React + TypeScript application
- **Backend:** FastAPI application deployed on Render
- **Database:** PostgreSQL hosted on Neon
- **AI:** Google Gemini API
- **Backend Start Command:**

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```


## Installation & Setup

### Clone the Repository

```bash
git clone https://github.com/Kashish-33/FamilyMate.git
cd FamilyMate
```

### Create Virtual Environment

```bash
python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

### Install Backend Dependencies

```bash
pip install -r requirements.txt
```

### Configure PostgreSQL

Create a PostgreSQL database and configure the `DATABASE_URL` in `.env`.

---

## Run the Backend

```bash
uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

FastAPI API documentation:

```text
http://127.0.0.1:8000/docs
```

---

## Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## API Modules

The backend currently exposes modules for:

```text
/users
/families
/family-members
/documents
/medicines
/notifications
/ai
```

Complete endpoint details are available through the FastAPI documentation at `/docs`.

---

## Security & Configuration

* Sensitive configuration is loaded through environment variables.
* API keys and database credentials are not hardcoded.
* `.env` is excluded from version control.
* Local and sensitive files are excluded through `.gitignore`.
* Uploaded files are kept outside source control where appropriate.

---

## Current Status

### Implemented

* FastAPI backend
* PostgreSQL database integration
* SQLAlchemy ORM
* Family and family-member management
* Medicine management
* Document management
* OCR-based data extraction
* Medicine and document expiry detection
* Automated reminder generation
* Background reminder scheduler
* Notification creation and management
* Read/unread notification tracking
* Unread notification count
* Duplicate notification prevention
* Individual and bulk notification read actions
* 24-hour cleanup of read notifications
* React + TypeScript frontend
* Tailwind CSS-based UI
* Google Gemini AI integration
* Natural-language AI interaction
* Agentic tool calling for supported backend operations
* Environment-based configuration

---

## License

MIT
