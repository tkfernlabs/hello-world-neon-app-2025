import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE_URL = 'https://backend-morphvm-j9mt3es5.http.cloud.morph.so';

function App() {
  const [helloMessage, setHelloMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState(null);

  // Fetch API status
  useEffect(() => {
    fetchApiStatus();
  }, []);

  // Fetch hello message
  useEffect(() => {
    fetchHelloMessage();
  }, []);

  // Fetch all messages
  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchApiStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/`);
      const data = await response.json();
      setApiStatus(data);
    } catch (err) {
      console.error('Error fetching API status:', err);
    }
  };

  const fetchHelloMessage = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/hello`);
      const data = await response.json();
      setHelloMessage(data.message);
    } catch (err) {
      console.error('Error fetching hello message:', err);
      setError('Failed to fetch hello message');
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/messages`);
      const data = await response.json();
      setMessages(data.messages || []);
      setError('');
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) {
      setError('Message cannot be empty');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: newMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to create message');
      }

      await response.json(); // Consume response
      setNewMessage('');
      // Refresh messages list
      await fetchMessages();
      // Update hello message as well
      await fetchHelloMessage();
    } catch (err) {
      console.error('Error creating message:', err);
      setError('Failed to create message');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🌍 Hello World App</h1>
        <p className="subtitle">A Full-Stack Application with Neon PostgreSQL</p>
      </header>

      <main className="App-main">
        {/* API Status Section */}
        {apiStatus && (
          <section className="status-section">
            <h2>📡 API Status</h2>
            <div className="status-card">
              <span className={`status-badge ${apiStatus.status === 'ok' ? 'status-ok' : 'status-error'}`}>
                {apiStatus.status === 'ok' ? '✓ Connected' : '✗ Disconnected'}
              </span>
              <p className="api-message">{apiStatus.message}</p>
            </div>
          </section>
        )}

        {/* Hello Message Section */}
        <section className="hello-section">
          <h2>👋 Current Message</h2>
          <div className="hello-card">
            <p className="hello-message">{helloMessage || 'Loading...'}</p>
          </div>
        </section>

        {/* Create Message Form */}
        <section className="create-section">
          <h2>✏️ Create New Message</h2>
          <form onSubmit={handleSubmit} className="message-form">
            <div className="form-group">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Enter your message here..."
                className="message-input"
                disabled={loading}
              />
              <button 
                type="submit" 
                className="submit-button"
                disabled={loading || !newMessage.trim()}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
          {error && <p className="error-message">{error}</p>}
        </section>

        {/* Messages List Section */}
        <section className="messages-section">
          <h2>📜 All Messages ({messages.length})</h2>
          {loading && messages.length === 0 ? (
            <p className="loading">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="no-messages">No messages yet. Be the first to create one!</p>
          ) : (
            <div className="messages-list">
              {messages.map((msg) => (
                <div key={msg.id} className="message-card">
                  <div className="message-content">
                    <span className="message-id">#{msg.id}</span>
                    <p className="message-text">{msg.message}</p>
                    <span className="message-date">
                      {formatDate(msg.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="App-footer">
          <p>
            Backend API: <a href={API_BASE_URL} target="_blank" rel="noopener noreferrer">
              {API_BASE_URL}
            </a>
          </p>
          <p>Built with React + Node.js + Express + Neon PostgreSQL</p>
        </footer>
      </main>
    </div>
  );
}

export default App;
