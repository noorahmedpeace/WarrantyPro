import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SubmitButton } from '@/components/SubmitButton'

export default function Login({
    searchParams,
}: {
    searchParams: { message: string }
}) {
    const signIn = async (formData: FormData) => {
        'use server'

        try {
            const email = formData.get('email') as string
            const password = formData.get('password') as string
            const supabase = createClient()

            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                console.error('Signin Error:', error)
                return redirect(`/login?message=${encodeURIComponent(error.message)}`)
            }
        } catch (e: any) {
            if (e.message?.includes('NEXT_REDIRECT')) throw e; // Re-throw redirect
            console.error('Unexpected Signin Error:', e)
            return redirect('/login?message=An unexpected error occurred')
        }

        return redirect('/dashboard')
    }

    const signUp = async (formData: FormData) => {
        'use server'

        try {
            const origin = headers().get('origin')
            const email = formData.get('email') as string
            const password = formData.get('password') as string
            const supabase = createClient()

            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${origin}/auth/callback`,
                },
            })

            if (error) {
                console.error('Signup Error:', error)
                return redirect(`/login?message=${encodeURIComponent(error.message)}`)
            }
        } catch (e: any) {
            if (e.message?.includes('NEXT_REDIRECT')) throw e; // Re-throw redirect
            console.error('Unexpected Signup Error:', e)
            return redirect('/login?message=An unexpected error occurred')
        }

        return redirect('/login?message=Check email to continue sign in process')
    }

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 4rem)' }}>
            <div style={{ width: '100%', maxWidth: '400px', padding: '2rem', border: '1px solid #e2e8f0', borderRadius: 'var(--radius)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem', textAlign: 'center' }}>Welcome Back</h2>

                <form action={signIn} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label htmlFor="email" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Email</label>
                        <input
                            className="bg-inherit border rounded-md px-4 py-2"
                            name="email"
                            placeholder="you@example.com"
                            required
                            style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid #cbd5e1' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label htmlFor="password" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Password</label>
                        <input
                            className="bg-inherit border rounded-md px-4 py-2"
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            required
                            style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid #cbd5e1' }}
                        />
                    </div>

                    <SubmitButton className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                        Sign In
                    </SubmitButton>

                    <SubmitButton formAction={signUp} className="btn" style={{ background: 'transparent', border: '1px solid #cbd5e1', color: 'var(--foreground-rgb)' }}>
                        Sign Up
                    </SubmitButton>

                    {searchParams?.message && (
                        <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center" style={{ color: '#ef4444', fontSize: '0.875rem', textAlign: 'center' }}>
                            {searchParams.message}
                        </p>
                    )}
                </form>
            </div>
        </div>
    )
}
