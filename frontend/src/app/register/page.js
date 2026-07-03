"use client";
import { useState } from 'react';
import api from '../../lib/api';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CUSTOMER');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/auth/register', { name, email, password, role });
      setSuccess('Registration successful! You can now log in.');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setSuccess('');
    } finally {
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
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: 'var(--primary)' }}>Register</h2>
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        {success && <div style={{ color: 'var(--success)', marginBottom: '1rem', textAlign: 'center' }}>{success}</div>}
        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label>Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="CUSTOMER">Customer</option>
              <option value="AGENT">Delivery Agent</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <button type="submit" className="btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} disabled={isLoading}>
            {isLoading && <span className="spinner" />}
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
          Already have an account? <a href="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Login here</a>
        </p>
      </div>
    </div>
  );
}
