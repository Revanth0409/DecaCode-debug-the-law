import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MessageCircle, X, Send, Minus, Bot, User, AlertCircle } from 'lucide-react'
import { sendChatMessage, type ChatMessage } from '@/services/aiService'
import i18n from '@/i18n/i18n'

export default function ChatWidget() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [lang, setLang] = useState<'en' | 'kn'>('en')
  const [hasGreeted, setHasGreeted] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && !hasGreeted) {
      const greeting: ChatMessage = {
        id: 'greeting',
        role: 'assistant',
        content: t('chatbot.greeting'),
        timestamp: new Date().toISOString(),
        isMock: true,
      }
      setMessages([greeting])
      setHasGreeted(true)
    }
  }, [open, hasGreeted, t])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const suggestions = [
    t('chatbot.suggestions.search'),
    t('chatbot.suggestions.encumbrance'),
    t('chatbot.suggestions.akhata'),
    t('chatbot.suggestions.track'),
    t('chatbot.suggestions.appeal'),
    t('chatbot.suggestions.discrepancy'),
  ]

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: text, timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const reply = await sendChatMessage(text, messages, lang)
      setMessages(prev => [...prev, reply])
    } catch {
      const err: ChatMessage = { id: `e-${Date.now()}`, role: 'assistant', content: 'Sorry, something went wrong. Please try again.', timestamp: new Date().toISOString(), isMock: true }
      setMessages(prev => [...prev, err])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#1e3a5f] text-white shadow-xl flex items-center justify-center hover:bg-[#152440] transition-all hover:scale-105 animate-pulse-slow"
          aria-label="Open Bhu-Assist chat"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className={`fixed bottom-6 right-6 z-50 w-80 sm:w-96 chat-widget rounded-2xl overflow-hidden border bg-white flex flex-col transition-all ${minimized ? 'h-14' : 'h-[520px]'}`}>
          {/* Header */}
          <div className="bg-[#1e3a5f] text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <div className="font-semibold text-sm">{t('chatbot.name')}</div>
                <div className="text-xs text-blue-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                  {lang === 'en' ? 'Mock AI Mode' : 'ಮಾಕ್ AI ಮೋಡ್'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setLang(l => l === 'en' ? 'kn' : 'en')}
                className="px-2 py-1 rounded text-xs bg-white/10 hover:bg-white/20 transition-colors"
              >
                {lang === 'en' ? 'ಕನ್ನಡ' : 'EN'}
              </button>
              <button onClick={() => setMinimized(m => !m)} className="p-1 hover:bg-white/20 rounded">
                <Minus className="h-4 w-4" />
              </button>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-white/20 rounded">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Disclaimer */}
              <div className="bg-amber-50 border-b border-amber-100 px-3 py-1.5 flex items-start gap-1.5 flex-shrink-0">
                <AlertCircle className="h-3 w-3 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-amber-700">{t('chatbot.disclaimer')}</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs ${msg.role === 'user' ? 'bg-[#1e3a5f]' : 'bg-orange-500'}`}>
                      {msg.role === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                    </div>
                    <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed ${msg.role === 'user' ? 'bg-[#1e3a5f] text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                      <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                      {msg.isMock && msg.role === 'assistant' && (
                        <div className="text-[9px] text-gray-400 mt-1">Mock AI response</div>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                      <Bot className="h-3 w-3 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-xl rounded-tl-none px-3 py-2">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Suggestions */}
              {messages.length <= 1 && (
                <div className="px-3 pb-2 flex flex-wrap gap-1 flex-shrink-0">
                  {suggestions.slice(0, 3).map((s, i) => (
                    <button key={i} onClick={() => sendMessage(s)} className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-full hover:bg-blue-100 transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="border-t px-3 py-2 flex gap-2 flex-shrink-0">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                  placeholder={t('chatbot.placeholder')}
                  className="flex-1 text-xs border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
                  disabled={loading}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={loading || !input.trim()}
                  className="bg-[#1e3a5f] text-white p-2 rounded-lg hover:bg-[#152440] disabled:opacity-50 transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}

