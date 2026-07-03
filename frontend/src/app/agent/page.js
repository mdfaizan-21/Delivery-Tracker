"use client";
import { useEffect, useState } from 'react';
import api from '../../lib/api';

export default function AgentDashboard() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/agent/orders');
      setOrders(res.data);
    } catch (e) { console.error(e); }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await api.put(`/agent/orders/${id}/status?newStatus=${newStatus}`);
      fetchOrders();
    } catch (e) { alert("Update failed"); }
  };

  return (
    <div className="container animate-fade-in">
      <h1 style={{ color: 'var(--primary)', marginBottom: '2rem' }}>Agent Tasks</h1>
      
      <div className="card">
        {orders.length === 0 ? <p>No assigned tasks at the moment.</p> : null}
        
        {orders.map(order => (
          <div key={order.id} style={{ border: '1px solid var(--border)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3>Order #{order.id} - {order.status}</h3>
                <p style={{ marginTop: '0.5rem' }}><strong>From:</strong> {order.pickupAddress}</p>
                <p><strong>To:</strong> {order.dropAddress}</p>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                {order.status === 'ASSIGNED' && <button className="btn" onClick={() => updateStatus(order.id, 'PICKED_UP')}>Mark Picked Up</button>}
                {order.status === 'PICKED_UP' && <button className="btn" onClick={() => updateStatus(order.id, 'IN_TRANSIT')}>In Transit</button>}
                {order.status === 'IN_TRANSIT' && <button className="btn" onClick={() => updateStatus(order.id, 'OUT_FOR_DELIVERY')}>Out for Delivery</button>}
                {order.status === 'OUT_FOR_DELIVERY' && (
                  <>
                    <button className="btn" style={{ backgroundColor: 'var(--success)' }} onClick={() => updateStatus(order.id, 'DELIVERED')}>Delivered</button>
                    <button className="btn" style={{ backgroundColor: 'var(--danger)' }} onClick={() => updateStatus(order.id, 'FAILED')}>Failed</button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
