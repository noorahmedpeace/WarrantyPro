import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { EmailService } from '@/lib/email'

export async function GET() {
    console.log('[CRON] Starting Expiry Check...')
    const supabase = createClient()

    // 1. Calculate Target Dates (Today + 30 days, Today + 7 days)
    const today = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(today.getDate() + 30)
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(today.getDate() + 7)

    // Fetch expiring items
    const { data: warranties, error } = await supabase
        .from('warranties')
        .select('product_name, expiry_date, user_id')
        .gte('expiry_date', today.toISOString())
        .lte('expiry_date', thirtyDaysFromNow.toISOString())

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const itemsRefquiringAlert = warranties?.filter((w: any) => {
        const expiry = new Date(w.expiry_date)
        const diffTime = expiry.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays === 30 || diffDays === 7 // Alert exactly on 30 and 7 days left
    }) || []

    // Send Emails (Mock)
    let processed = 0;
    for (const item of itemsRefquiringAlert) {
        // In a real app, we would fetch the user's email here or via a join
        // const { data: user } = await supabase.auth.admin.getUserById(item.user_id)

        await EmailService.send({
            to: 'user_placeholder@example.com', // Placeholder until we have admin client
            subject: `Warranty Action: ${item.product_name} expires in ~30 days`,
            text: `Your ${item.product_name} is expiring soon. Check your dashboard.`
        })
        processed++;
    }

    return NextResponse.json({
        processed: warranties ? warranties.length : 0,
        alerts_sent: processed,
        items: itemsRefquiringAlert
    })
}
