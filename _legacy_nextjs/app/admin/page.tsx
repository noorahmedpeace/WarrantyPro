import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminDashboard() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    // Simple MVP Admin check: Allow specific domain or specific email
    // In production, use Custom Claims or a separate 'profiles' table with role column
    const isAdmin = user.email?.endsWith('@admin.com') || user.email === 'admin@example.com'

    if (!isAdmin) {
        return (
            <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
                <h1 style={{ color: '#dc2626' }}>Access Denied</h1>
                <p>You do not have permission to view this page.</p>
            </div>
        )
    }

    const { data: allWarranties } = await supabase
        .from('warranties')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>Admin Dashboard</h1>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '0.75rem' }}>ID</th>
                            <th style={{ padding: '0.75rem' }}>Product</th>
                            <th style={{ padding: '0.75rem' }}>User ID</th>
                            <th style={{ padding: '0.75rem' }}>Status</th>
                            <th style={{ padding: '0.75rem' }}>Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(allWarranties || []).map((w) => (
                            <tr key={w.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>{w.id.slice(0, 8)}...</td>
                                <td style={{ padding: '0.75rem' }}>{w.product_name}</td>
                                <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>{w.user_id.slice(0, 8)}...</td>
                                <td style={{ padding: '0.75rem' }}>{w.status}</td>
                                <td style={{ padding: '0.75rem' }}>{new Date(w.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
