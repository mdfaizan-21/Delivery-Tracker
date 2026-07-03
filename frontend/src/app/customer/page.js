"use client";
import { useEffect, useState } from 'react';
import api from '../../lib/api';

export default function CustomerDashboard() {
  const [orders, setOrders] = useState([]);
  
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/customer/orders');
      setOrders(res.data);
    } catch (e) { console.error(e); }
  };

  const handleReschedule = async (id) => {
    const newDate = prompt("Enter new date (YYYY-MM-DD):");
    if (newDate) {
      try {
        await api.post(`/customer/orders/${id}/reschedule?newDateStr=${newDate}`);
        fetchOrders();
      } catch (e) { alert("Reschedule failed"); }
    }
  };

  return (
    <div className="container animate-fade-in">
      <h1 style={{ color: 'var(--primary)', marginBottom: '2rem' }}>My Orders</h1>
      
      <div className="card">
        {orders.length === 0 ? <p>No orders found. (Order placement UI would go here)</p> : null}
        
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {orders.map(order => (
            <div key={order.id} style={{ border: '1px solid var(--border)', padding: '1rem', borderRadius: '8px' }}>
              <h3>Order #{order.id}</h3>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Charge:</strong> ${order.totalCharge}</p>
              <p><strong>Pickup:</strong> {order.pickupAddress}</p>
              <p><strong>Drop:</strong> {order.dropAddress}</p>
              
              {order.status === 'FAILED' && (
                <button className="btn" style={{ marginTop: '1rem', backgroundColor: 'var(--warning)' }} onClick={() => handleReschedule(order.id)}>
                  Reschedule
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
