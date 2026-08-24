import { useEffect, useRef, useState } from "react";
import { sendChatMessage } from "../services/chatApi";
import type { ChatMessage } from "../types/chat";

const suggestedPrompts = [
  "Who are the members of my family?",
  "What medicines are expiring soon?",
  "Show my recent notifications.",
];

function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const handleSend = async (messageToSend = input) => {
    const message = messageToSend.trim();
    if (!message || isSending) return;

    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "user", content: message },
    ]);
    setInput("");
    setError("");
    setIsSending(true);

    try {
      const data = await sendChatMessage(message);
      setMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), role: "assistant", content: data.response },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not get a response from Family Copilot.");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] min-h-[620px] flex-col">
      <div>
        <p className="text-sm font-semibold tracking-wide text-[#B86F83]">FAMILY ASSISTANT</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-800">Chat</h1>
        <p className="mt-2 text-slate-500">Ask about your family, medicines, documents, and notifications.</p>
      </div>

      <section className="mt-6 flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-[#F0E1E5] bg-white shadow-sm">
        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">
          {messages.length === 0 ? (
            <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#FCECEF] text-3xl">AI</div>
              <h2 className="mt-5 text-2xl font-bold text-slate-800">Hello, I&apos;m your Family Copilot</h2>
              <p className="mt-2 max-w-lg text-slate-500">I can help you find information already saved for your family.</p>
              <div className="mt-7 grid w-full gap-3 sm:grid-cols-3">
                {suggestedPrompts.map((prompt) => (
                  <button key={prompt} type="button" disabled={isSending} onClick={() => void handleSend(prompt)} className="rounded-2xl border border-[#F0E1E5] bg-[#FFF9FA] px-4 py-4 text-left text-sm font-medium text-slate-600 transition hover:border-[#D98FA3] hover:bg-[#FFF4F6] disabled:cursor-not-allowed disabled:opacity-60">
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-5">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] whitespace-pre-wrap rounded-3xl px-5 py-3.5 text-sm leading-6 ${message.role === "user" ? "rounded-br-md bg-[#D98FA3] text-white" : "rounded-bl-md bg-[#FFF4F6] text-slate-700"}`}>
                    {message.content}
                  </div>
                </div>
              ))}
              {isSending && <div className="flex justify-start"><div className="rounded-3xl rounded-bl-md bg-[#FFF4F6] px-5 py-3.5 text-sm text-slate-500">Family Copilot is thinking...</div></div>}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-[#F0E1E5] bg-[#FFF9FA] p-4 sm:p-5">
          {error && <div className="mx-auto mb-3 max-w-3xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
          <div className="mx-auto flex max-w-3xl items-end gap-3">
            <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={handleKeyDown} disabled={isSending} rows={1} placeholder="Ask Family Copilot..." className="max-h-32 min-h-12 flex-1 resize-y rounded-2xl border border-[#E8DDE1] bg-white px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#D98FA3] focus:ring-2 focus:ring-[#FCECEF] disabled:cursor-not-allowed disabled:bg-slate-50" />
            <button type="button" onClick={() => void handleSend()} disabled={isSending || !input.trim()} className="rounded-2xl bg-[#D98FA3] px-5 py-3 font-semibold text-white transition hover:bg-[#C77890] disabled:cursor-not-allowed disabled:opacity-60">
              {isSending ? "Sending..." : "Send"}
            </button>
          </div>
          <p className="mx-auto mt-2 max-w-3xl text-xs text-slate-400">Press Enter to send. Use Shift+Enter for a new line.</p>
        </div>
      </section>
    </div>
  );
}

export default Chat;
