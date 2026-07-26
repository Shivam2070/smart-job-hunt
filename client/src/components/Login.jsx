import { useState } from 'react';
import axios from 'axios';
import './Login.css';

export default function Login({ onLoginSuccess, onToggleSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });
      localStorage.setItem('token', response.data.token);
      onLoginSuccess();
    } catch (error) {
      setMessage('❌ ' + (error.response?.data?.message || 'Error'));
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-header">
          <h1>Smart Job Hunt</h1>
          <p>Welcome back!</p>
        </div>

        <div className="auth-card">
          <h2>Sign In</h2>
          <p>Continue your job search journey</p>

          <form onSubmit={handleLogin} className="auth-form">
            <div className="log-form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="log-form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="forgot-password">
              <a href="#">Forgot password?</a>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {message && <div className="error-message">{message}</div>}

          <div className="auth-divider">
            <span>or</span>
          </div>

          <div className="auth-toggle">
            Don't have an account?{' '}
            <button onClick={onToggleSignup}>
              Sign Up
            </button>
          </div>
        </div>

        <p className="auth-footer">
          Secure login powered by industry-standard encryption
        </p>
      </div>
    </div>
  );
}