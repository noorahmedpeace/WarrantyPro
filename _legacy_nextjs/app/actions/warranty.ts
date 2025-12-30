'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createWarranty(formData: FormData) {
    const supabase = createClient()

    const product_name = formData.get('product_name') as string
    const brand = formData.get('brand') as string
    const category = formData.get('category') as string
    const purchase_date = formData.get('purchase_date') as string
    const duration = parseInt(formData.get('duration') as string)
    const shop_name = formData.get('shop_name') as string
    const notes = formData.get('notes') as string

    // Calculate expiry
    const purDate = new Date(purchase_date)
    const expiryDate = new Date(purDate.setMonth(purDate.getMonth() + duration))
    const expiry_date = expiryDate.toISOString().split('T')[0]

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { message: 'Unauthorized' }
    }

    // Insert Warranty
    const { data: warranty, error } = await supabase
        .from('warranties')
        .insert({
            user_id: user.id,
            product_name,
            brand,
            category,
            purchase_date,
            warranty_duration_months: duration,
            expiry_date,
            shop_name,
            notes
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating warranty:', error)
        // Since we are not using useFormState, we can't easily return error to form.
        // We'll redirect with error params.
        const params = new URLSearchParams()
        params.set('error', error.message)
        redirect(`/warranties/new?${params.toString()}`)
    }

    // Handle File Links (Files uploaded client-side, we get a list of paths/urls)
    // Ideally, we'd pass the file paths as a hidden field or separate args.
    // For simplicity MVP, we'll assume file upload happens after or separate, 
    // OR we parse a hidden JSON field for file_paths.
    const filePathsJson = formData.get('file_paths') as string
    if (filePathsJson) {
        try {
            const paths = JSON.parse(filePathsJson)
            const fileInserts = paths.map((path: string) => ({
                warranty_id: warranty.id,
                file_url: path, // Storing path as URL for now, or full URL
                file_path: path
            }))

            if (fileInserts.length > 0) {
                await supabase.from('warranty_files').insert(fileInserts)
            }
        } catch (e) {
            console.error('Error linking files:', e)
        }
    }

    redirect('/dashboard')
}
