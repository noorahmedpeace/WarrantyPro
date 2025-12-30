import { WarrantyForm } from '@/components/WarrantyForm'
import { createWarranty } from '@/app/actions/warranty'

export default function AddWarrantyPage() {
    return (
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: '800px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>Add New Warranty</h1>
            <div style={{ padding: '2rem', border: '1px solid #e2e8f0', borderRadius: 'var(--radius)', background: 'white' }}>
                <WarrantyForm createAction={createWarranty} />
            </div>
        </div>
    )
}
