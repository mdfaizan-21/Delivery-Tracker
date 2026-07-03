"use client";
import { useState } from 'react';
import api from '../../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      const role = response.data.roles[0];
      
      if (role === 'ROLE_ADMIN') window.location.href = '/admin';
      else if (role === 'ROLE_AGENT') window.location.href = '/agent';
      else window.location.href = '/customer';
    } catch (err) {
      setError('Invalid email or password');
      setIsLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', position: 'relative' }}>
      {isLoading && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <span className="spinner" style={{ width: '40px', height: '40px', borderTopColor: 'var(--primary)', marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Waking up server...</h3>
          <p style={{ maxWidth: '350px', textAlign: 'center', color: '#666', lineHeight: '1.5' }}>
            Please wait. Our backend is hosted on a free tier and may take up to <strong>50 seconds</strong> to wake up from inactivity.
          </p>
        </div>
      )}

      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: 'var(--primary)' }}>Sign In</h2>
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center', padding: '0.5rem', background: '#FEF2F2', borderRadius: '6px' }}>{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />
          </div>
          <button
            type="submit"
            className="btn"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            disabled={isLoading}
          >
            {isLoading && <span className="spinner" />}
            {isLoading ? 'Signing in...' : 'Login'}
          </button>
        </form>
        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
          Don't have an account? <a href="/register" style={{ color: 'var(--primary)', fontWeight: '600' }}>Register here</a>
        </p>
      </div>
    </div>
  );
}
