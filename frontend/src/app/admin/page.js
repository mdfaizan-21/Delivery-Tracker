"use client";
import { useEffect, useState } from 'react';
import api from '../../lib/api';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('orders');

  // Orders state
  const [orders, setOrders] = useState([]);

  // Zones state
  const [zones, setZones] = useState([]);
  const [zoneForm, setZoneForm] = useState({ zoneName: '', description: '' });
  const [zoneLoading, setZoneLoading] = useState(false);

  // Rate Cards state
  const [rateCards, setRateCards] = useState([]);
  const [rateForm, setRateForm] = useState({
    fromZoneId: '', toZoneId: '', orderType: 'B2C',
    baseRate: '', codSurcharge: ''
  });
  const [rateLoading, setRateLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchZones();
    fetchRateCards();
  }, []);

  const fetchOrders = async () => {
    try { const res = await api.get('/admin/orders'); setOrders(res.data); }
    catch (e) { console.error("Error fetching orders", e); }
  };

  const fetchZones = async () => {
    try { const res = await api.get('/admin/zones'); setZones(res.data); }
    catch (e) { console.error("Error fetching zones", e); }
  };

  const fetchRateCards = async () => {
    try { const res = await api.get('/admin/rate-cards'); setRateCards(res.data); }
    catch (e) { console.error("Error fetching rate cards", e); }
  };

  const handleAutoAssign = async (orderId) => {
    try { await api.post(`/admin/orders/${orderId}/auto-assign`); fetchOrders(); }
    catch (e) { alert("Auto-assign failed"); }
  };

  const handleOverrideStatus = async (orderId, newStatus) => {
    try { await api.put(`/admin/orders/${orderId}/override-status?newStatus=${newStatus}`); fetchOrders(); }
    catch (e) { alert("Status override failed"); }
  };

  const handleCreateZone = async (e) => {
    e.preventDefault();
    setZoneLoading(true);
    try {
      await api.post('/admin/zones', zoneForm);
      setZoneForm({ zoneName: '', description: '' });
      fetchZones();
    } catch (e) { alert("Failed to create zone: " + (e.response?.data?.message || e.message)); }
    finally { setZoneLoading(false); }
  };

  const handleDeleteZone = async (id) => {
    if (!confirm("Delete this zone?")) return;
    try { await api.delete(`/admin/zones/${id}`); fetchZones(); }
    catch (e) { alert("Failed to delete zone"); }
  };

  const handleCreateRateCard = async (e) => {
    e.preventDefault();
    setRateLoading(true);
    const payload = {
      fromZone: { id: parseInt(rateForm.fromZoneId) },
      toZone: { id: parseInt(rateForm.toZoneId) },
      orderType: rateForm.orderType,
      baseRate: parseFloat(rateForm.baseRate),
      codSurcharge: parseFloat(rateForm.codSurcharge)
    };
    try {
      await api.post('/admin/rate-cards', payload);
      setRateForm({ fromZoneId: '', toZoneId: '', orderType: 'B2C', baseRate: '', codSurcharge: '' });
      fetchRateCards();
    } catch (e) { alert("Failed to create rate card: " + (e.response?.data?.message || e.message)); }
    finally { setRateLoading(false); }
  };

  const handleDeleteRateCard = async (id) => {
    if (!confirm("Delete this rate card?")) return;
    try { await api.delete(`/admin/rate-cards/${id}`); fetchRateCards(); }
    catch (e) { alert("Failed to delete rate card"); }
  };

  const tabs = [
    { key: 'orders', label: '📦 Orders' },
    { key: 'zones', label: '🗺️ Zones' },
    { key: 'rates', label: '💰 Rate Cards' },
  ];

  const tabStyle = (key) => ({
    padding: '0.6rem 1.2rem',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
    backgroundColor: activeTab === key ? 'var(--primary)' : '#E5E7EB',
    color: activeTab === key ? 'white' : '#374151',
    border: 'none',
    transition: 'all 0.2s ease'
  });

  const statusColor = (s) => s === 'PENDING' ? '#F59E0B' : s === 'DELIVERED' ? '#10B981' : s === 'FAILED' ? '#EF4444' : '#4F46E5';

  return (
    <div className="container animate-fade-in">
      <h1 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>Admin Dashboard</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.key} style={tabStyle(t.key)} onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── ORDERS TAB ── */}
      {activeTab === 'orders' && (
        <div className="card">
          <h2 style={{ marginBottom: '1rem' }}>System Orders</h2>
          {orders.length === 0 && <p style={{ color: '#6B7280' }}>No orders in the system yet.</p>}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left', background: '#F9FAFB' }}>
                  {['ID', 'Customer', 'Status', 'Type', 'Charge', 'Agent', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', fontWeight: 600, fontSize: '0.85rem', color: '#6B7280', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>#{order.id}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{order.customer?.name || '-'}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: statusColor(order.status), color: 'white' }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>{order.orderType} / {order.paymentType}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>₹{order.totalCharge}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{order.agent?.name || <em style={{ color: '#9CA3AF' }}>Unassigned</em>}</td>
                    <td style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {order.status === 'PENDING' && (
                        <button className="btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }} onClick={() => handleAutoAssign(order.id)}>
                          Auto-Assign
                        </button>
                      )}
                      <select
                        style={{ padding: '0.25rem', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                        defaultValue=""
                        onChange={e => { if (e.target.value) handleOverrideStatus(order.id, e.target.value); }}
                      >
                        <option value="">Override…</option>
                        {['PENDING','ASSIGNED','IN_TRANSIT','DELIVERED','FAILED'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ZONES TAB ── */}
      {activeTab === 'zones' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem', alignItems: 'start' }}>

          {/* Create Zone Form */}
          <div className="card">
            <h2 style={{ marginBottom: '1.5rem' }}>Create New Zone</h2>
            <form onSubmit={handleCreateZone} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label>Zone Name</label>
                <input
                  required type="text" className="input" placeholder="e.g. Zone A"
                  value={zoneForm.zoneName}
                  onChange={e => setZoneForm({ ...zoneForm, zoneName: e.target.value })}
                />
              </div>
              <div>
                <label>Description</label>
                <input
                  type="text" className="input" placeholder="e.g. North Region"
                  value={zoneForm.description}
                  onChange={e => setZoneForm({ ...zoneForm, description: e.target.value })}
                />
              </div>
              <button type="submit" className="btn" disabled={zoneLoading}>
                {zoneLoading && <span className="spinner" />}
                {zoneLoading ? 'Creating...' : '+ Add Zone'}
              </button>
            </form>
          </div>

          {/* Zones List */}
          <div className="card">
            <h2 style={{ marginBottom: '1rem' }}>Configured Zones ({zones.length})</h2>
            {zones.length === 0 && <p style={{ color: '#6B7280' }}>No zones yet. Create one to get started.</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {zones.map(z => (
                <div key={z.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#F9FAFB', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div>
                    <strong style={{ color: 'var(--primary)' }}>{z.zoneName}</strong>
                    {z.description && <p style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: '0.2rem' }}>{z.description}</p>}
                  </div>
                  <button onClick={() => handleDeleteZone(z.id)} style={{ background: 'none', border: '1px solid #EF4444', color: '#EF4444', padding: '0.3rem 0.7rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── RATE CARDS TAB ── */}
      {activeTab === 'rates' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem', alignItems: 'start' }}>

          {/* Create Rate Card Form */}
          <div className="card">
            <h2 style={{ marginBottom: '1.5rem' }}>Create Rate Card</h2>
            {zones.length < 2 && (
              <div style={{ padding: '0.75rem', background: '#FEF9C3', border: '1px solid #FCD34D', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem', color: '#92400E' }}>
                ⚠️ You need at least 2 zones first. Go to the <strong>Zones</strong> tab.
              </div>
            )}
            <form onSubmit={handleCreateRateCard} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label>From Zone</label>
                <select required className="input" value={rateForm.fromZoneId} onChange={e => setRateForm({ ...rateForm, fromZoneId: e.target.value })}>
                  <option value="">Select Zone</option>
                  {zones.map(z => <option key={z.id} value={z.id}>{z.zoneName}</option>)}
                </select>
              </div>
              <div>
                <label>To Zone</label>
                <select required className="input" value={rateForm.toZoneId} onChange={e => setRateForm({ ...rateForm, toZoneId: e.target.value })}>
                  <option value="">Select Zone</option>
                  {zones.map(z => <option key={z.id} value={z.id}>{z.zoneName}</option>)}
                </select>
              </div>
              <div>
                <label>Order Type</label>
                <select className="input" value={rateForm.orderType} onChange={e => setRateForm({ ...rateForm, orderType: e.target.value })}>
                  <option value="B2C">B2C</option>
                  <option value="B2B">B2B</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label>Base Rate (₹/kg)</label>
                  <input required type="number" step="0.01" className="input" placeholder="e.g. 50" value={rateForm.baseRate} onChange={e => setRateForm({ ...rateForm, baseRate: e.target.value })} />
                </div>
                <div>
                  <label>COD Surcharge (₹)</label>
                  <input required type="number" step="0.01" className="input" placeholder="e.g. 10" value={rateForm.codSurcharge} onChange={e => setRateForm({ ...rateForm, codSurcharge: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="btn" disabled={rateLoading || zones.length < 1}>
                {rateLoading && <span className="spinner" />}
                {rateLoading ? 'Creating...' : '+ Add Rate Card'}
              </button>
            </form>
          </div>

          {/* Rate Cards List */}
          <div className="card">
            <h2 style={{ marginBottom: '1rem' }}>Rate Cards ({rateCards.length})</h2>
            {rateCards.length === 0 && <p style={{ color: '#6B7280' }}>No rate cards yet.</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {rateCards.map(rc => (
                <div key={rc.id} style={{ padding: '0.75rem 1rem', background: '#F9FAFB', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{rc.fromZone?.zoneName} → {rc.toZone?.zoneName}</strong>
                    <div style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: '0.25rem' }}>
                      <span style={{ marginRight: '1rem' }}>{rc.orderType}</span>
                      <span style={{ marginRight: '1rem' }}>Base: ₹{rc.baseRate}/kg</span>
                      <span>COD: ₹{rc.codSurcharge}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteRateCard(rc.id)} style={{ background: 'none', border: '1px solid #EF4444', color: '#EF4444', padding: '0.3rem 0.7rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
