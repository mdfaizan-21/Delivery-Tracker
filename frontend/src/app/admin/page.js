"use client";
import { useEffect, useState } from 'react';
import api from '../../lib/api';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [zones, setZones] = useState([]);
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    fetchOrders();
    fetchZones();
    // Normally fetch agents from an endpoint
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/admin/orders');
      setOrders(res.data);
    } catch (e) { console.error("Error fetching orders", e); }
  };

  const fetchZones = async () => {
    try {
      const res = await api.get('/admin/zones');
      setZones(res.data);
    } catch (e) { console.error("Error fetching zones", e); }
  };

  const handleAutoAssign = async (orderId) => {
    try {
      await api.post(`/admin/orders/${orderId}/auto-assign`);
      fetchOrders();
    } catch (e) { alert("Auto-assign failed"); }
  };

  return (
    <div className="container animate-fade-in">
      <h1 style={{ color: 'var(--primary)', marginBottom: '2rem' }}>Admin Dashboard</h1>
      
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2>System Orders</h2>
        <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
              <th style={{ padding: '0.5rem' }}>ID</th>
              <th style={{ padding: '0.5rem' }}>Status</th>
              <th style={{ padding: '0.5rem' }}>Charge</th>
              <th style={{ padding: '0.5rem' }}>Agent</th>
              <th style={{ padding: '0.5rem' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.5rem' }}>#{order.id}</td>
                <td style={{ padding: '0.5rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '4px', 
                    fontSize: '0.75rem',
                    backgroundColor: order.status === 'PENDING' ? 'var(--warning)' : (order.status === 'DELIVERED' ? 'var(--success)' : 'var(--primary)'),
                    color: 'white'
                  }}>
                    {order.status}
                  </span>
                </td>
                <td style={{ padding: '0.5rem' }}>${order.totalCharge}</td>
                <td style={{ padding: '0.5rem' }}>{order.agent?.name || 'Unassigned'}</td>
                <td style={{ padding: '0.5rem' }}>
                  {order.status === 'PENDING' && (
                    <button className="btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }} onClick={() => handleAutoAssign(order.id)}>
                      Auto-Assign
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
