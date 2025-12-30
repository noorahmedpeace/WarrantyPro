import { type Database } from '@/lib/supabase/database.types'

type Warranty = {
    id: string
    product_name: string
    brand: string | null
    expiry_date: string
    status: string | null
    file_url?: string // Optional if we join files
}

export function WarrantyCard({ warranty }: { warranty: Warranty }) {
    const expiryDate = new Date(warranty.expiry_date)
    const today = new Date()
    const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
    const isExpired = daysLeft < 0
    const isExpiringSoon = daysLeft <= 30 && !isExpired

    return (
        <div style={{
            border: '1px solid #e2e8f0',
            borderRadius: 'var(--radius)',
            padding: '1.5rem',
            background: 'white',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                    <h3 style={{ fontWeight: 600, fontSize: '1.125rem' }}>{warranty.product_name}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-secondary)' }}>{warranty.brand}</p>
                </div>
                <span style={{
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '9999px',
                    background: isExpired ? '#fef2f2' : isExpiringSoon ? '#fefce8' : '#f0fdf4',
                    color: isExpired ? '#dc2626' : isExpiringSoon ? '#ca8a04' : '#16a34a',
                    fontWeight: 500
                }}>
                    {isExpired ? 'Expired' : isExpiringSoon ? `Expiring in ${daysLeft} days` : 'Active'}
                </span>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-secondary)' }}>Expires: {warranty.expiry_date}</p>
            </div>

            <div style={{ marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button className="btn" style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem', border: '1px solid #cbd5e1' }}>
                    View Details
                </button>
            </div>
        </div>
    )
}
