import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { WarrantyList } from '@/components/WarrantyList'

export default async function Dashboard() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    const signOut = async () => {
        'use server'
        const supabase = createClient()
        await supabase.auth.signOut()
        return redirect('/login')
    }

    // Fetch Warranties
    const { data: warranties, error } = await supabase
        .from('warranties')
        .select('*')
        .eq('user_id', user.id)
        .order('expiry_date', { ascending: true })

    if (error) {
        console.error(error)
    }

    const allWarranties = warranties || []

    // Calculate Stats
    const today = new Date()
    const activeWarranties = allWarranties.filter(w => new Date(w.expiry_date) > today)
    const expiredWarranties = allWarranties.filter(w => new Date(w.expiry_date) <= today)
    const expiringSoonCount = activeWarranties.filter(w => {
        const diffTime = new Date(w.expiry_date).getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays <= 30
    }).length

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>My Warranties</h1>
                    <p style={{ color: 'var(--color-secondary)', fontSize: '0.875rem' }}>Welcome, {user.email}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <form action={signOut}>
                        <button className="btn" style={{ border: '1px solid #cbd5e1' }}>Sign Out</button>
                    </form>
                    <Link href="/warranties/new" className="btn btn-primary">
                        + Add New
                    </Link>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid #e2e8f0', background: 'white' }}>
                    <h3 style={{ fontSize: '0.875rem', color: 'var(--color-secondary)', marginBottom: '0.5rem' }}>Total Active</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 700, color: '#16a34a' }}>{activeWarranties.length}</p>
                </div>

                <div style={{ padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid #e2e8f0', background: 'white' }}>
                    <h3 style={{ fontSize: '0.875rem', color: 'var(--color-secondary)', marginBottom: '0.5rem' }}>Expiring Soon (30 Days)</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 700, color: '#ca8a04' }}>{expiringSoonCount}</p>
                </div>

                <div style={{ padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid #e2e8f0', background: 'white' }}>
                    <h3 style={{ fontSize: '0.875rem', color: 'var(--color-secondary)', marginBottom: '0.5rem' }}>Expired</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 700, color: '#dc2626' }}>{expiredWarranties.length}</p>
                </div>
            </div>

            {allWarranties.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-secondary)', border: '2px dashed #e2e8f0', borderRadius: 'var(--radius)' }}>
                    <p>You haven&apos;t added any warranties yet.</p>
                    <Link href="/warranties/new" className="btn btn-primary" style={{ marginTop: '1rem', textDecoration: 'none' }}>
                        Add First Warranty
                    </Link>
                </div>
            ) : (
                <WarrantyList initialWarranties={allWarranties} />
            )}
        </div>
    )
}
