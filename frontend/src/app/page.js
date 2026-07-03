export default function Home() {
  return (
    <div className="container animate-fade-in" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: '600px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>Last-Mile Delivery Tracker</h1>
        <p style={{ fontSize: '1.125rem', marginBottom: '2rem', color: '#4B5563' }}>
          Welcome to the next-generation logistics platform. Please log in or register to manage your orders and deliveries.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <a href="/login" className="btn">Sign In</a>
          <a href="/register" className="btn" style={{ backgroundColor: 'white', color: 'var(--primary)', border: '1px solid var(--primary)' }}>Register</a>
        </div>
      </div>
    </div>
  );
}
