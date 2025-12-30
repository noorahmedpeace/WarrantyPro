export default function Home() {
    return (
        <main className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Warranty Manager</h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--color-secondary)', marginBottom: '2rem' }}>
                Store and track all your product warranties in one place.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <a href="/login" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                    Get Started
                </a>
            </div>
        </main>
    )
}
