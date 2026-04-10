import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function Dashboard() {
  const [file, setFile] = useState(null)
  const [docId, setDocId] = useState(null)
  const [docName, setDocName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [asking, setAsking] = useState(false)
  const [uploadInfo, setUploadInfo] = useState(null)
  const chatEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await api.post('/api/upload', form)
      setDocId(res.data.doc_id)
      setDocName(res.data.filename)
      setUploadInfo(res.data)
      setMessages([{
        role: 'assistant',
        content: `Document "${res.data.filename}" processed! ${res.data.pages} pages, ${res.data.chunks} chunks indexed. Ask me anything about it.`
      }])
    } catch (err) {
      alert(err.response?.data?.detail || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleAsk = async (e) => {
    e.preventDefault()
    if (!question.trim() || !docId) return
    const userMsg = question.trim()
    setQuestion('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setAsking(true)

    try {
      const history = messages
        .filter((_, i) => i > 0)
        .reduce((acc, msg, i, arr) => {
          if (msg.role === 'user' && arr[i + 1]?.role === 'assistant') {
            acc.push([msg.content, arr[i + 1].content])
          }
          return acc
        }, [])

      const res = await api.post('/api/ask', {
        doc_id: docId,
        question: userMsg,
        chat_history: history
      })
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.answer,
        sources: res.data.sources
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.'
      }])
    } finally {
      setAsking(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const handleNewDoc = () => {
    setDocId(null)
    setDocName('')
    setFile(null)
    setMessages([])
    setUploadInfo(null)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="text-white font-semibold">DocMind AI</span>
          {docName && <span className="text-gray-400 text-sm">— {docName}</span>}
        </div>
        <div className="flex gap-3">
          {docId && (
            <button onClick={handleNewDoc} className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition">
              New Document
            </button>
          )}
          <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-white transition">
            Logout
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-6">
        {!docId ? (
          /* Upload Area */
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-lg">
              <div
                onClick={() => fileInputRef.current.click()}
                className="border-2 border-dashed border-gray-700 hover:border-indigo-500 rounded-2xl p-12 text-center cursor-pointer transition group"
              >
                <div className="w-16 h-16 bg-gray-800 group-hover:bg-indigo-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 transition">
                  <svg className="w-8 h-8 text-gray-400 group-hover:text-indigo-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-white font-medium mb-1">Drop your PDF here</p>
                <p className="text-gray-400 text-sm">or click to browse</p>
                {file && <p className="text-indigo-400 text-sm mt-3 font-medium">{file.name}</p>}
              </div>
              <input ref={fileInputRef} type="file" accept=".pdf" className="hidden"
                onChange={e => setFile(e.target.files[0])} />
              {file && (
                <button onClick={handleUpload} disabled={uploading}
                  className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition">
                  {uploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Processing PDF...
                    </span>
                  ) : 'Upload & Process'}
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Chat Area */
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-2xl rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-800 text-gray-100'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-700 flex flex-wrap gap-1">
                        <span className="text-xs text-gray-400">Sources:</span>
                        {msg.sources.map(p => (
                          <span key={p} className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">
                            Page {p}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {asking && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}}/>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}/>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}/>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleAsk} className="flex gap-3">
              <input
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="Ask anything about your document..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
              />
              <button type="submit" disabled={asking || !question.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-3 rounded-xl transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}