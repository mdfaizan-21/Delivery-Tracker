"use client";
import { useEffect, useState } from 'react';
import api from '../../lib/api';

export default function CustomerDashboard() {
  const [orders, setOrders] = useState([]);
  const [zones, setZones] = useState([]);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'new_order'

  // Form State
  const [formData, setFormData] = useState({
    pickupAddress: '',
    pickupZoneId: '',
    dropAddress: '',
    dropZoneId: '',
    lengthCm: '',
    widthCm: '',
    heightCm: '',
    actualWeight: '',
    orderType: 'B2C',
    paymentType: 'PREPAID'
  });
  const [quote, setQuote] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchZones();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/customer/orders');
      setOrders(res.data);
    } catch (e) { console.error("Failed to fetch orders", e); }
  };

  const fetchZones = async () => {
    try {
      const res = await api.get('/customer/zones');
      setZones(res.data);
    } catch (e) { console.error("Failed to fetch zones", e); }
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setQuote(null); // Reset quote if any field changes
  };

  const handleCalculateQuote = async (e) => {
    e.preventDefault();
    if (!formData.pickupZoneId || !formData.dropZoneId) {
      alert("Please select both Pickup and Drop zones");
      return;
    }
    
    try {
      const res = await api.post(`/customer/quotes?fromZoneId=${formData.pickupZoneId}&toZoneId=${formData.dropZoneId}&orderType=${formData.orderType}&paymentType=${formData.paymentType}&length=${formData.lengthCm}&width=${formData.widthCm}&height=${formData.heightCm}&weight=${formData.actualWeight}`);
      setQuote(res.data);
    } catch (e) {
      alert("Failed to calculate quote. Make sure a Rate Card exists for this route and type.");
      console.error(e);
    }
  };

  const handlePlaceOrder = async () => {
    if (!quote) return;
    setIsSubmitting(true);
    
    const payload = {
      pickupAddress: formData.pickupAddress,
      pickupZone: { id: parseInt(formData.pickupZoneId) },
      dropAddress: formData.dropAddress,
      dropZone: { id: parseInt(formData.dropZoneId) },
      lengthCm: parseFloat(formData.lengthCm),
      widthCm: parseFloat(formData.widthCm),
      heightCm: parseFloat(formData.heightCm),
      actualWeight: parseFloat(formData.actualWeight),
      orderType: formData.orderType,
      paymentType: formData.paymentType
    };

    try {
      await api.post('/customer/orders', payload);
      alert("Order placed successfully!");
      
      // Reset form
      setFormData({
        pickupAddress: '', pickupZoneId: '', dropAddress: '', dropZoneId: '',
        lengthCm: '', widthCm: '', heightCm: '', actualWeight: '',
        orderType: 'B2C', paymentType: 'PREPAID'
      });
      setQuote(null);
      
      // Refresh and switch tab
      fetchOrders();
      setActiveTab('orders');
    } catch (e) {
      alert("Failed to place order.");
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container animate-fade-in">
      <h1 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Customer Dashboard</h1>
      
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <button 
          className="btn" 
          style={{ 
            backgroundColor: activeTab === 'orders' ? 'var(--primary)' : '#9CA3AF',
            color: 'white'
          }}
          onClick={() => setActiveTab('orders')}
        >
          My Orders
        </button>
        <button 
          className="btn" 
          style={{ 
            backgroundColor: activeTab === 'new_order' ? 'var(--primary)' : '#9CA3AF',
            color: 'white'
          }}
          onClick={() => setActiveTab('new_order')}
        >
          Place New Order
        </button>
      </div>

      {activeTab === 'orders' && (
        <div className="card">
          <h2 style={{ marginBottom: '1rem' }}>Order History</h2>
          {orders.length === 0 ? <p>No orders found. Click "Place New Order" to get started.</p> : null}
          
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {orders.map(order => (
              <div key={order.id} style={{ border: '1px solid var(--border)', padding: '1rem', borderRadius: '8px' }}>
                <h3>Order #{order.id}</h3>
                <p><strong>Status:</strong> <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{order.status}</span></p>
                <p><strong>Charge:</strong> ${order.totalCharge}</p>
                <p><strong>Type:</strong> {order.orderType} | {order.paymentType}</p>
                <p><strong>Pickup:</strong> {order.pickupAddress} (Zone {order.pickupZone?.zoneName})</p>
                <p><strong>Drop:</strong> {order.dropAddress} (Zone {order.dropZone?.zoneName})</p>
                <p><strong>Tracking:</strong> {order.status}</p>
                
                {order.status === 'FAILED' && (
                  <button className="btn" style={{ marginTop: '1rem', backgroundColor: 'var(--warning)', width: '100%' }} onClick={() => handleReschedule(order.id)}>
                    Reschedule Delivery
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'new_order' && (
        <div className="card">
          <h2 style={{ marginBottom: '1rem' }}>Place a New Order</h2>
          <form onSubmit={handleCalculateQuote} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label>Pickup Address</label>
                <input required type="text" name="pickupAddress" className="input" value={formData.pickupAddress} onChange={handleChange} />
              </div>
              <div>
                <label>Pickup Zone</label>
                <select required name="pickupZoneId" className="input" value={formData.pickupZoneId} onChange={handleChange}>
                  <option value="">Select Zone</option>
                  {zones.map(z => <option key={z.id} value={z.id}>{z.zoneName}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label>Drop Address</label>
                <input required type="text" name="dropAddress" className="input" value={formData.dropAddress} onChange={handleChange} />
              </div>
              <div>
                <label>Drop Zone</label>
                <select required name="dropZoneId" className="input" value={formData.dropZoneId} onChange={handleChange}>
                  <option value="">Select Zone</option>
                  {zones.map(z => <option key={z.id} value={z.id}>{z.zoneName}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label>Length (cm)</label>
                <input required type="number" step="0.1" name="lengthCm" className="input" value={formData.lengthCm} onChange={handleChange} />
              </div>
              <div>
                <label>Width (cm)</label>
                <input required type="number" step="0.1" name="widthCm" className="input" value={formData.widthCm} onChange={handleChange} />
              </div>
              <div>
                <label>Height (cm)</label>
                <input required type="number" step="0.1" name="heightCm" className="input" value={formData.heightCm} onChange={handleChange} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label>Actual Wt (kg)</label>
                <input required type="number" step="0.1" name="actualWeight" className="input" value={formData.actualWeight} onChange={handleChange} />
              </div>
              <div>
                <label>Order Type</label>
                <select name="orderType" className="input" value={formData.orderType} onChange={handleChange}>
                  <option value="B2C">B2C</option>
                  <option value="B2B">B2B</option>
                </select>
              </div>
              <div>
                <label>Payment</label>
                <select name="paymentType" className="input" value={formData.paymentType} onChange={handleChange}>
                  <option value="PREPAID">Prepaid</option>
                  <option value="COD">COD</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn" style={{ marginTop: '1rem' }}>
              Calculate Shipping Quote
            </button>
          </form>

          {quote !== null && (
            <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'var(--background)', border: '2px solid var(--primary)', borderRadius: '8px', textAlign: 'center' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>Estimated Shipping Cost</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '1rem' }}>${quote}</p>
              
              <button 
                className="btn" 
                onClick={handlePlaceOrder} 
                disabled={isSubmitting}
                style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}
              >
                {isSubmitting ? 'Placing Order...' : 'Confirm & Place Order'}
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
