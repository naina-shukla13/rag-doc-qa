# 🧠 DocMind AI — RAG-Powered Document Q&A

A full-stack AI application that lets you upload any PDF and ask questions about it in natural language. Built with a complete RAG (Retrieval-Augmented Generation) pipeline using LangChain, FAISS vector search, and Groq's ultra-fast LLM inference.

**Live Demo:** https://docmind-ai.up.railway.app

---

## ✨ Features

- **PDF Upload & Processing** — Upload any PDF and the app automatically extracts, chunks, and indexes the content
- **RAG Pipeline** — Retrieval-Augmented Generation ensures answers are grounded in your actual document, not hallucinated
- **Semantic Search** — FAISS vector store finds the most relevant chunks from your document for each question
- **Groq-powered LLM** — Ultra-fast inference using LLaMA 3 via Groq API
- **Conversational Q&A** — Ask any question in plain English about your uploaded document
- **JWT Authentication** — Secure register/login with per-user session management
- **Clean UI** — Minimal dark-themed interface focused on the Q&A experience

---

## 🛠️ Tech Stack

**Frontend**
- React + Vite
- Tailwind CSS
- Axios
- React Router DOM
- React Hot Toast

**Backend / AI Pipeline**
- Python + FastAPI
- LangChain
- FAISS (Facebook AI Similarity Search)
- HuggingFace Embeddings
- Groq API (LLaMA 3)
- PyPDF2 / pdfplumber

**Deployment**
- Railway (Full Stack)
- MongoDB Atlas

---

## 📸 Screenshots

### Login Page
> Clean dark-themed authentication screen

### Upload & Q&A Interface
> PDF upload with instant question answering powered by RAG

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js v18+
- Python 3.9+
- Groq API key (free at console.groq.com)
- MongoDB Atlas account

### 1. Clone the repo
```bash
git clone https://github.com/naina-shukla13/rag-doc-qa.git
cd rag-doc-qa
```

### 2. Setup Backend
```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file in the `backend` folder:
```env
GROQ_API_KEY=your_groq_api_key
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
```

Start the backend:
```bash
uvicorn main:app --reload --port 8000
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev
```

Open `http://localhost:5173`

---

## 💡 How the RAG Pipeline Works

```
PDF Upload
    ↓
Text Extraction (PyPDF2 / pdfplumber)
    ↓
Text Chunking (LangChain RecursiveCharacterTextSplitter)
    ↓
Embedding Generation (HuggingFace Embeddings)
    ↓
Vector Indexing (FAISS)
    ↓
User asks a question
    ↓
Semantic Search → Top K relevant chunks retrieved
    ↓
Chunks + Question sent to LLaMA 3 via Groq
    ↓
Grounded Answer returned to user
```

---

## 📁 Project Structure

```
rag-doc-qa/
├── backend/
│   ├── main.py              # FastAPI app + endpoints
│   ├── rag_pipeline.py      # LangChain RAG logic
│   ├── requirements.txt
│   └── .env
└── frontend/
    └── src/
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   └── Chat.jsx
        ├── api.js
        └── App.jsx
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/upload` | Upload PDF and build vector index |
| POST | `/ask` | Ask a question about uploaded document |
| GET | `/health` | Health check |

---

## 🌐 Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Full Stack | Railway | https://docmind-ai.up.railway.app |
| Database | MongoDB Atlas | Cluster0 |

---

## 👩‍💻 Author

**Naina Shukla**
- GitHub: [@naina-shukla13](https://github.com/naina-shukla13)

---

## 📄 License

MIT License — feel free to use this project for learning or portfolio purposes.
