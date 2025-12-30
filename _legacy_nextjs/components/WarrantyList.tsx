'use client'

import { useState } from 'react'
import { WarrantyCard } from '@/components/WarrantyCard'

type Warranty = {
    id: string
    product_name: string
    brand: string | null
    expiry_date: string
    status: string | null
    category: string | null
}

export function WarrantyList({ initialWarranties }: { initialWarranties: Warranty[] }) {
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('all') // all, active, expired

    const filtered = initialWarranties.filter(w => {
        const matchesSearch = w.product_name.toLowerCase().includes(search.toLowerCase()) ||
            (w.brand && w.brand.toLowerCase().includes(search.toLowerCase()))

        if (!matchesSearch) return false

        const today = new Date()
        const isExpired = new Date(w.expiry_date) <= today

        if (filter === 'active') return !isExpired
        if (filter === 'expired') return isExpired

        return true
    })

    return (
        <div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <input
                    placeholder="Search products or brands..."
                    className="border rounded-md p-2"
                    style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid #cbd5e1' }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select
                    className="border rounded-md p-2"
                    style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid #cbd5e1' }}
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="all">All Status</option>
                    <option value="active">Active Only</option>
                    <option value="expired">Expired Only</option>
                </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {filtered.map((warranty) => (
                    <WarrantyCard key={warranty.id} warranty={warranty} />
                ))}
                {filtered.length === 0 && (
                    <p style={{ color: 'var(--color-secondary)' }}>No warranties found matching your filters.</p>
                )}
            </div>
        </div>
    )
}
