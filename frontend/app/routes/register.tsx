import { json, type ActionFunctionArgs } from "@remix-run/node";
import { Form, Link, useNavigation, useActionData } from "@remix-run/react";
import { ShieldCheck, Loader2, Lock, Mail, User, ArrowRight } from "lucide-react";
import { authApi } from "~/lib/auth-api";

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    try {
        const { access_token } = await authApi.register({ email, password, name });
        return json({ token: access_token });
    } catch (error: any) {
        return json({ error: error.message }, { status: 400 });
    }
}

export default function Register() {
    const navigation = useNavigation();
    const actionData = useActionData<typeof action>();
    const isSubmitting = navigation.state === "submitting";

    if (actionData?.token && typeof document !== "undefined") {
        localStorage.setItem("token", actionData.token);
        window.location.href = "/";
    }

    return (
        <div className="min-h-screen flex items-center justify-center mesh-gradient p-4">
            <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="mx-auto h-16 w-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-4">
                        <ShieldCheck className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Join WarrantyPro</h1>
                    <p className="text-slate-400 mt-2">Start securing your valuable assets today</p>
                </div>

                <Form method="post" className="space-y-6">
                    {actionData?.error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm text-center">
                            {actionData.error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                name="name"
                                type="text"
                                required
                                placeholder="Full Name"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all hover:bg-white/10"
                            />
                        </div>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                name="email"
                                type="email"
                                required
                                placeholder="Email Address"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all hover:bg-white/10"
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                name="password"
                                type="password"
                                required
                                placeholder="Password"
                                minLength={6}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all hover:bg-white/10"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.98] flex items-center justify-center group"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : (
                            <>
                                Create Account <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </Form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-slate-400">
                        Already have an account?{" "}
                        <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
