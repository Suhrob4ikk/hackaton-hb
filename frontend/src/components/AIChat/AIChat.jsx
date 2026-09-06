import ChatInput from '../ChatInput/ChatInput.jsx'

function AIChat({ messages = [], onSend }) {
  return (
    <section className="ai-chat" aria-labelledby="chat-title">
      <h2 id="chat-title">AI-консультант</h2>
      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id}>{message.text}</div>
        ))}
      </div>
      <ChatInput onSend={onSend} />
    </section>
  )
}

export default AIChat
