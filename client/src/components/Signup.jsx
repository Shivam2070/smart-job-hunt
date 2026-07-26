import { useState } from 'react';
import axios from 'axios';
import './Signup.css';

export default function Signup({ onSignupSuccess, onToggleLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/signup', {
        name,
        email,
        password,
      });
      localStorage.setItem('token', response.data.token);
      onSignupSuccess();
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
          <p>Your AI-powered career companion</p>
        </div>

        <div className="auth-card">
          <h2>Create Account</h2>
          <p>Join thousands finding their dream job</p>

          <form onSubmit={handleSignup} className="auth-form">
            <div className="sign-form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="sign-form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="sign-form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          {message && <div className="error-message">{message}</div>}

          <div className="auth-divider">
            <span>or</span>
          </div>

          <div className="auth-toggle">
            Already have an account?{' '}
            <button onClick={onToggleLogin}>
              Sign In
            </button>
          </div>
        </div>

        <p className="auth-footer">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}