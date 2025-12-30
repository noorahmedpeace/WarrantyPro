'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation' // Not using router here, relying on server action redirect

export function WarrantyForm({ createAction }: { createAction: any }) {
    const [uploading, setUploading] = useState(false)
    const [filePaths, setFilePaths] = useState<string[]>([])

    // State for calculation
    const [purchaseDate, setPurchaseDate] = useState('')
    const [duration, setDuration] = useState(12)
    const [expiryDate, setExpiryDate] = useState('')

    useEffect(() => {
        if (purchaseDate && duration) {
            const date = new Date(purchaseDate)
            date.setMonth(date.getMonth() + parseInt(duration.toString()))
            setExpiryDate(date.toISOString().split('T')[0])
        }
    }, [purchaseDate, duration])

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)

            if (!e.target.files || e.target.files.length === 0) {
                throw new Error('You must select an image to upload.')
            }

            const file = e.target.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            const supabase = createClient()
            const { error: uploadError } = await supabase.storage
                .from('warranty-docs')
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            setFilePaths((prev) => [...prev, filePath])
        } catch (error) {
            alert('Error uploading file!')
            console.log(error)
        } finally {
            setUploading(false)
        }
    }

    return (
        <form action={createAction} className="space-y-6" style={{ display: 'grid', gap: '1.5rem' }}>
            <input type="hidden" name="file_paths" value={JSON.stringify(filePaths)} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Product Name</label>
                    <input name="product_name" required className="border rounded-md p-2" placeholder="e.g. MacBook Pro" style={{ border: '1px solid #cbd5e1', padding: '0.5rem', borderRadius: 'var(--radius)' }} />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Brand</label>
                    <input name="brand" className="border rounded-md p-2" placeholder="e.g. Apple" style={{ border: '1px solid #cbd5e1', padding: '0.5rem', borderRadius: 'var(--radius)' }} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Category</label>
                    <select name="category" className="border rounded-md p-2" style={{ border: '1px solid #cbd5e1', padding: '0.5rem', borderRadius: 'var(--radius)' }}>
                        <option value="electronics">Electronics</option>
                        <option value="home_furniture">Home & Furniture</option>
                        <option value="accessories">Accessories (Watch, Bags)</option>
                        <option value="vehicle">Vehicle (Parts, Tyres)</option>
                        <option value="services">Services (Paint, Construction)</option>
                        <option value="clothing">Clothing</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Shop Name</label>
                    <input name="shop_name" className="border rounded-md p-2" placeholder="e.g. Amazon" style={{ border: '1px solid #cbd5e1', padding: '0.5rem', borderRadius: 'var(--radius)' }} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem' }}>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Purchase Date</label>
                    <input
                        type="date"
                        name="purchase_date"
                        required
                        className="border rounded-md p-2"
                        value={purchaseDate}
                        onChange={(e) => setPurchaseDate(e.target.value)}
                        style={{ border: '1px solid #cbd5e1', padding: '0.5rem', borderRadius: 'var(--radius)' }}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Duration (Months)</label>
                    <input
                        type="number"
                        name="duration"
                        required
                        min="0"
                        className="border rounded-md p-2"
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value))}
                        style={{ border: '1px solid #cbd5e1', padding: '0.5rem', borderRadius: 'var(--radius)' }}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Expires On</label>
                    <input
                        type="date"
                        disabled
                        className="border rounded-md p-2 bg-gray-100"
                        value={expiryDate}
                        style={{ border: '1px solid #cbd5e1', padding: '0.5rem', borderRadius: 'var(--radius)', background: '#f1f5f9' }}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Notes</label>
                <textarea name="notes" rows={3} className="border rounded-md p-2" style={{ border: '1px solid #cbd5e1', padding: '0.5rem', borderRadius: 'var(--radius)' }}></textarea>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Upload Receipt/Card</label>
                <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleUpload}
                    disabled={uploading}
                    style={{ padding: '0.5rem 0' }}
                />
                {uploading && <p className="text-sm text-blue-500">Uploading...</p>}
                {filePaths.length > 0 && (
                    <div className="flex gap-2 text-sm text-green-600">
                        ✓ {filePaths.length} file(s) attached
                    </div>
                )}
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={uploading}>
                Save Warranty
            </button>
        </form>
    )
}
