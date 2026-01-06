import { useState, useRef } from "react";
import { json, redirect, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form, useNavigation, Link } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    Camera,
    Sparkles,
    Tag,
    Calendar,
    Hash,
    ShoppingBag,
    Info,
    ChevronDown,
    Loader2,
    Package,
    ShieldCheck,
    UploadCloud,
    X,
    CheckCircle2,
    ArrowRight
} from "lucide-react";
import { warrantiesApi, categoriesApi } from "~/lib/api";
import { cn } from "~/lib/utils";

export async function loader() {
    const categories = await categoriesApi.getAll();
    return json({ categories });
}

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    const isBulk = data.isBulk === "true";
    const productNames = isBulk
        ? (data.product_name as string).split(',').map(n => n.trim()).filter(n => n)
        : [data.product_name as string];

    const basePayload = {
        brand: data.brand as string,
        categoryId: data.categoryId as string,
        shop_name: data.shop_name as string,
        warranty_duration_months: parseInt(data.warranty_duration_months as string),
        purchase_date: new Date(data.purchase_date as string).toISOString(),
    };

    try {
        let createdWarranties: any[] = [];
        if (isBulk && productNames.length > 1) {
            const payloads = productNames.map(name => ({ ...basePayload, product_name: name }));
            createdWarranties = await warrantiesApi.createBulk(payloads);
        } else {
            const w = await warrantiesApi.create({ ...basePayload, product_name: productNames[0] });
            createdWarranties = [w];
        }

        const attachments = formData.getAll("attachment") as File[];
        if (attachments.length > 0) {
            for (const warranty of createdWarranties) {
                for (const file of attachments) {
                    if (file.size > 0 && file.name) {
                        await warrantiesApi.uploadFile(warranty.id, file);
                    }
                }
            }
        }

        return redirect("/");
    } catch (error: any) {
        return json({ error: error.message || "Failed to create warranty" }, { status: 400 });
    }
}

export default function NewWarranty() {
    const { categories } = useLoaderData<typeof loader>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";
    const fileInputRef = useRef<HTMLInputElement>(null);
    const attachmentInputRef = useRef<HTMLInputElement>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scannedFiles, setScannedFiles] = useState<File[]>([]);

    const [formData, setFormData] = useState({
        product_name: "",
        brand: "",
        purchase_date: "",
        warranty_duration_months: 12,
        categoryId: "",
        shop_name: ""
    });
    const [isBulk, setIsBulk] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsScanning(true);
        try {
            const result = await warrantiesApi.scanImage(file);
            setFormData(prev => ({
                ...prev,
                product_name: result.product_name || prev.product_name,
                brand: result.brand || prev.brand,
                purchase_date: result.purchase_date || prev.purchase_date,
                warranty_duration_months: result.warranty_duration_months || 12,
            }));
        } catch (err) {
            console.error("Scanning failed", err);
        } finally {
            setIsScanning(false);
        }
    };

    const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setScannedFiles(Array.from(e.target.files));
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FB] flex flex-col font-sans selection:bg-blue-500/20">
            {/* Navbar */}
            <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 supports-[backdrop-filter]:bg-white/60">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="group flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
                        <div className="p-1.5 rounded-lg bg-white border border-slate-200 group-hover:border-slate-300 shadow-sm transition-all">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                        <span className="ml-1">Dashboard</span>
                    </Link>
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <ShieldCheck className="h-4.5 w-4.5 text-white" />
                        </div>
                        <span className="text-sm font-bold text-slate-900 tracking-tight">WarrantyPro</span>
                    </div>
                </div>
            </nav>

            <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-12">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={itemVariants} className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-4">
                            <Sparkles className="w-3 h-3" />
                            AI Powered Protection
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                            Secure New Item
                        </h1>
                        <p className="text-lg text-slate-500 max-w-lg mx-auto leading-relaxed">
                            Upload your receipt and let our AI handle the details, or manually enter your product information below.
                        </p>
                    </motion.div>

                    {/* Magic Scan Card */}
                    <motion.div variants={itemVariants} className="mb-12 relative group rounded-3xl p-[1px] bg-gradient-to-b from-blue-400 to-indigo-600 shadow-2xl shadow-blue-900/10">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
                        <div className="relative rounded-[23px] bg-white overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50 pointer-events-none" />

                            <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center justify-center md:justify-start gap-2">
                                        <Camera className="w-5 h-5 text-blue-600" />
                                        Magic Scan
                                    </h3>
                                    <p className="text-slate-500 text-sm leading-relaxed mb-6">
                                        Instantly extract product name, purchase date, and price from any receipt or warranty card photo.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isScanning}
                                        className="inline-flex w-full md:w-auto items-center justify-center gap-2 bg-slate-900 text-white font-semibold py-3 px-6 rounded-xl hover:bg-slate-800 active:scale-[0.98] transition-all shadow-lg shadow-slate-900/20 disabled:opacity-70"
                                    >
                                        {isScanning ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Analyzing Receipt...</span>
                                            </>
                                        ) : (
                                            <>
                                                <UploadCloud className="w-4 h-4" />
                                                <span>Upload Receipt</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="hidden md:block w-px h-32 bg-gradient-to-b from-transparent via-slate-200 to-transparent" />
                                <div className="w-full md:w-auto flex justify-center">
                                    <div className="w-24 h-32 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-300 group-hover:border-blue-200 group-hover:bg-blue-50/50 transition-colors">
                                        <div className="w-8 h-1 bg-slate-200 rounded-full" />
                                        <div className="w-12 h-1 bg-slate-200 rounded-full" />
                                        <div className="w-10 h-1 bg-slate-200 rounded-full mt-1" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleScan}
                            className="hidden"
                            accept="image/*"
                            capture="environment"
                        />
                    </motion.div>

                    {/* Main Form */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden"
                    >
                        <div className="border-b border-slate-100 bg-slate-50/50 p-4 flex justify-center">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manual Entry Details</span>
                        </div>

                        <Form method="post" className="p-8 md:p-10 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                {/* Product Name & Bulk Toggle */}
                                <div className="md:col-span-2 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <FieldLabel icon={Package} label={isBulk ? "Product Names (Comma Separated)" : "Product Name"} />
                                        <button
                                            type="button"
                                            onClick={() => setIsBulk(!isBulk)}
                                            className={cn(
                                                "text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all uppercase tracking-wider flex items-center gap-1.5",
                                                isBulk
                                                    ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                                                    : "bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300"
                                            )}
                                        >
                                            <Hash className="w-3 h-3" />
                                            {isBulk ? "Bulk Mode On" : "Enable Bulk Mode"}
                                        </button>
                                    </div>
                                    <input type="hidden" name="isBulk" value={isBulk.toString()} />
                                    <AnimatePresence mode="wait">
                                        {isBulk ? (
                                            <motion.div
                                                key="bulk-input"
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                            >
                                                <textarea
                                                    name="product_name"
                                                    required
                                                    placeholder="e.g. MacBook Pro M3, iPhone 15 Pro, iPad Air 5"
                                                    rows={3}
                                                    defaultValue={formData.product_name}
                                                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none font-medium placeholder:text-slate-400 text-slate-900"
                                                />
                                                <p className="mt-2 text-xs text-slate-400 font-medium">
                                                    One warranty will be created for each comma-separated item.
                                                </p>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="single-input"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                            >
                                                <input
                                                    name="product_name"
                                                    required
                                                    placeholder="e.g. MacBook Pro M3"
                                                    defaultValue={formData.product_name}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium placeholder:text-slate-400 text-slate-900"
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Category */}
                                <div className="space-y-3">
                                    <FieldLabel icon={ChevronDown} label="Category" />
                                    <div className="relative">
                                        <select
                                            name="categoryId"
                                            required
                                            value={formData.categoryId}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-900 appearance-none cursor-pointer"
                                        >
                                            <option value="" disabled>Select Category...</option>
                                            {categories.map((cat: any) => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Brand */}
                                <div className="space-y-3">
                                    <FieldLabel icon={Tag} label="Brand" />
                                    <input
                                        name="brand"
                                        placeholder="e.g. Apple"
                                        value={formData.brand}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium placeholder:text-slate-400 text-slate-900"
                                    />
                                </div>

                                {/* Purchase Date */}
                                <div className="space-y-3">
                                    <FieldLabel icon={Calendar} label="Date of Purchase" />
                                    <input
                                        type="date"
                                        name="purchase_date"
                                        required
                                        value={formData.purchase_date}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-900"
                                    />
                                </div>

                                {/* Duration */}
                                <div className="space-y-3">
                                    <FieldLabel icon={Hash} label="Duration (Months)" />
                                    <input
                                        type="number"
                                        name="warranty_duration_months"
                                        required
                                        min="1"
                                        value={formData.warranty_duration_months}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-900"
                                    />
                                </div>

                                {/* Shop Name */}
                                <div className="md:col-span-2 space-y-3">
                                    <FieldLabel icon={ShoppingBag} label="Retailer / Store" />
                                    <input
                                        name="shop_name"
                                        placeholder="e.g. Apple Store, Amazon"
                                        value={formData.shop_name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium placeholder:text-slate-400 text-slate-900"
                                    />
                                </div>

                                {/* Attachments */}
                                <div className="md:col-span-2 space-y-3">
                                    <FieldLabel icon={UploadCloud} label="Documents (Invoice, Warranty Card)" />
                                    <div
                                        onClick={() => attachmentInputRef.current?.click()}
                                        className="group relative w-full h-32 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2"
                                    >
                                        <input
                                            type="file"
                                            name="attachment"
                                            multiple
                                            ref={attachmentInputRef}
                                            onChange={handleAttachmentChange}
                                            className="hidden"
                                        />
                                        <div className="p-3 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300">
                                            <UploadCloud className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <div>
                                            {scannedFiles.length > 0 ? (
                                                <p className="text-sm font-semibold text-slate-900">
                                                    {scannedFiles.length} file(s) selected
                                                </p>
                                            ) : (
                                                <p className="text-sm font-medium text-slate-600 group-hover:text-blue-600 transition-colors">
                                                    Click to upload or drag and drop
                                                </p>
                                            )}
                                            <p className="text-xs text-slate-400">PDF, JPG, PNG up to 10MB</p>
                                        </div>

                                        {/* File Preview Chips */}
                                        {scannedFiles.length > 0 && (
                                            <div className="absolute bottom-2 left-0 w-full px-4 flex gap-2 overflow-x-auto justify-center">
                                                {scannedFiles.map((f, i) => (
                                                    <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-medium text-slate-600 shadow-sm">
                                                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                                                        {f.name.slice(0, 15)}...
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || isScanning}
                                    className="w-full bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-bold text-lg py-4 rounded-xl shadow-xl shadow-slate-900/20 active:scale-[0.99] transition-all disabled:opacity-70 disabled:shadow-none flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            Save Warranty
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                                <div className="mt-4 flex items-center justify-center gap-2 text-slate-400 select-none">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Encrypted & Secure Storage</span>
                                </div>
                            </div>
                        </Form>
                    </motion.div>
                </motion.div>
            </main>
        </div>
    );
}

function FieldLabel({ icon: Icon, label }: { icon: any, label: string }) {
    return (
        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide px-1">
            <Icon className="w-3.5 h-3.5 text-slate-400" />
            {label}
        </label>
    );
}
