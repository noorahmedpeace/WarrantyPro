import { useState } from "react";
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { Form, Link, useNavigation, useActionData } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShieldCheck,
    Loader2,
    Lock,
    Mail,
    ArrowRight,
    Sparkles,
    AlertCircle
} from "lucide-react";
import { authApi } from "~/lib/auth-api";

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
        const { access_token } = await authApi.login({ email, password });
        return json({ token: access_token });
    } catch (error: any) {
        return json({ error: error.message }, { status: 400 });
    }
}

export default function Login() {
    const navigation = useNavigation();
    const actionData = useActionData<typeof action>();
    const isSubmitting = navigation.state === "submitting";
    const [focusedField, setFocusedField] = useState<string | null>(null);

    if (actionData?.token && typeof document !== "undefined") {
        localStorage.setItem("token", actionData.token);
        window.location.href = "/";
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100
            }
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        rotate: [90, 0, 90],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl"
                />

                {/* Floating Particles */}
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            y: [0, -30, 0],
                            x: [0, Math.random() * 20 - 10, 0],
                            opacity: [0.2, 0.5, 0.2]
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2
                        }}
                        className="absolute w-1 h-1 bg-white/40 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                    />
                ))}
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative w-full max-w-md z-10"
            >
                {/* Glass Card */}
                <motion.div
                    variants={itemVariants}
                    className="relative group"
                >
                    {/* Glow Effect */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200 animate-pulse" />

                    {/* Main Card */}
                    <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 md:p-10 shadow-2xl">
                        {/* Header */}
                        <motion.div variants={itemVariants} className="text-center mb-8">
                            <motion.div
                                whileHover={{ scale: 1.05, rotate: -5 }}
                                className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/50 mb-6 relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20" />
                                <ShieldCheck className="w-10 h-10 text-white relative z-10" />
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                                />
                            </motion.div>

                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
                                Welcome <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Back</span>
                            </h1>
                            <p className="text-slate-300 text-sm md:text-base">
                                Sign in to manage your warranty portfolio
                            </p>
                        </motion.div>

                        {/* Error Messages */}
                        <AnimatePresence mode="wait">
                            {actionData?.error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="mb-6 p-4 bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-xl flex items-center gap-3"
                                >
                                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                    <p className="text-red-200 text-sm">{actionData.error}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Form */}
                        <Form method="post" className="space-y-5">
                            {/* Email Field */}
                            <motion.div variants={itemVariants} className="relative">
                                <div className="relative">
                                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300 ${focusedField === 'email' ? 'text-blue-400' : 'text-slate-400'
                                        }`} />
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField(null)}
                                        placeholder="Email Address"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-4 text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-400/50 focus:ring-4 focus:ring-blue-400/10 focus:bg-white/10 transition-all duration-300 hover:bg-white/10 font-medium [color-scheme:dark]"
                                    />
                                    <motion.div
                                        initial={false}
                                        animate={{
                                            scale: focusedField === 'email' ? 1 : 0,
                                            opacity: focusedField === 'email' ? 1 : 0
                                        }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2"
                                    >
                                        <Sparkles className="w-4 h-4 text-blue-400" />
                                    </motion.div>
                                </div>
                            </motion.div>

                            {/* Password Field */}
                            <motion.div variants={itemVariants} className="relative">
                                <div className="relative">
                                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300 ${focusedField === 'password' ? 'text-blue-400' : 'text-slate-400'
                                        }`} />
                                    <input
                                        name="password"
                                        type="password"
                                        required
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField(null)}
                                        placeholder="Password"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-4 text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-400/50 focus:ring-4 focus:ring-blue-400/10 focus:bg-white/10 transition-all duration-300 hover:bg-white/10 font-medium [color-scheme:dark]"
                                    />
                                    <motion.div
                                        initial={false}
                                        animate={{
                                            scale: focusedField === 'password' ? 1 : 0,
                                            opacity: focusedField === 'password' ? 1 : 0
                                        }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2"
                                    >
                                        <Sparkles className="w-4 h-4 text-blue-400" />
                                    </motion.div>
                                </div>
                            </motion.div>

                            {/* Submit Button */}
                            <motion.div variants={itemVariants} className="pt-2">
                                <motion.button
                                    type="submit"
                                    disabled={isSubmitting}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="relative w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white font-bold py-4 rounded-xl shadow-2xl shadow-blue-500/50 transition-all duration-300 flex items-center justify-center group overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />

                                    {isSubmitting ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Signing In...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 relative z-10">
                                            <span>Sign In</span>
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    )}
                                </motion.button>
                            </motion.div>
                        </Form>

                        {/* Footer */}
                        <motion.div variants={itemVariants} className="mt-8 text-center">
                            <div className="flex items-center gap-2 justify-center mb-4">
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                <span className="text-xs text-slate-400 uppercase tracking-wider">Or</span>
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            </div>

                            <p className="text-sm text-slate-300">
                                Don't have an account?{" "}
                                <Link
                                    to="/register"
                                    className="text-blue-400 hover:text-blue-300 font-semibold transition-colors inline-flex items-center gap-1 group"
                                >
                                    Create Account
                                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                            </p>
                        </motion.div>

                        {/* Security Badge */}
                        <motion.div
                            variants={itemVariants}
                            className="mt-6 flex items-center justify-center gap-2 text-slate-400"
                        >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                                AES-256 Encrypted • SOC 2 Compliant
                            </span>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Bottom Decoration */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mt-6 text-center"
                >
                    <p className="text-xs text-slate-500">
                        Protected by enterprise-grade security
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
}
