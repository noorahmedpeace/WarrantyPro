import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import {
  ShieldCheck,
  Plus,
  Search,
  Calendar,
  Package,
  ArrowRight,
  TrendingDown,
  Bell,
  Settings,
  LayoutDashboard
} from "lucide-react";
import { warrantiesApi } from "~/lib/api";
import { cn, formatDate } from "~/lib/utils";
import { ClientOnly } from "~/components/ClientOnly";
import { WarrantyCardSkeleton } from "~/components/Skeleton";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const warranties = await warrantiesApi.getAll("temp-user-id");
    return json({ warranties });
  } catch (error) {
    return json({ warranties: [], error: "Service currently unavailable" });
  }
}

export default function Index() {
  const { warranties, error } = useLoaderData<typeof loader>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = warranties.map((w: any) => w.category?.name).filter(Boolean);
    return ["all", ...Array.from(new Set(cats))];
  }, [warranties]);

  // Filter warranties based on search and category
  const filteredWarranties = useMemo(() => {
    return warranties.filter((warranty: any) => {
      const matchesSearch =
        warranty.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        warranty.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        warranty.category?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" ||
        warranty.category?.name === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [warranties, searchQuery, selectedCategory]);

  return (
    <div className="flex min-h-screen mesh-gradient text-slate-100 overflow-hidden">
      {/* Sidebar - Luxurious Dark Glass */}
      <aside className="hidden border-r border-white/5 bg-white/[0.02] backdrop-blur-3xl lg:flex lg:w-72 lg:flex-col">
        <div className="flex h-20 items-center px-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <span className="ml-3 text-lg font-bold tracking-[0.1em] text-white uppercase italic">WarrantyPro</span>
        </div>
        <nav className="mt-8 flex-1 space-y-2 p-6">
          <NavItem to="/" icon={LayoutDashboard} active>Executive Panel</NavItem>
          <NavItem to="/alerts" icon={Bell}>Alerts Center</NavItem>
          <NavItem to="/configuration" icon={Settings}>Configuration</NavItem>
        </nav>
        <div className="p-6">
          <div className="rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 p-4 border border-blue-500/20">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Premium Tier</p>
            <p className="mt-1 text-xs text-slate-400">All features unlocked</p>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col relative">
        <header className="flex h-20 items-center border-b border-white/5 bg-transparent px-8">
          <div className="flex flex-1 items-center justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search your protection catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 transition-all placeholder:text-slate-500"
              />
            </div>
            <Link
              to="/warranties/new"
              className="luxury-button ml-6 flex items-center rounded-2xl px-6 py-3 text-sm font-bold"
            >
              <Plus className="mr-2 h-4 w-4" />
              Secure New Item
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Portfolio Overview</h1>
              <p className="text-slate-400 font-medium">Monitoring <span className="text-blue-400">{warranties.length}</span> active protection agreements.</p>
            </motion.div>
          </div>

          {/* Category Filter Tabs */}
          <div className="mb-6 flex gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all",
                  selectedCategory === category
                    ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-300 border border-white/10"
                )}
              >
                {category}
              </button>
            ))}
          </div>

          {error && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-8 rounded-2xl bg-red-500/10 p-4 border border-red-500/20 flex items-center gap-3 text-red-400 backdrop-blur-md"
            >
              <TrendingDown className="h-5 w-5" />
              <p className="text-sm font-bold tracking-wide">{error}</p>
            </motion.div>
          )}

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filteredWarranties.length > 0 ? (
                filteredWarranties.map((warranty: any, index: number) => (
                  <motion.div
                    key={warranty.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="glass-card group relative flex flex-col justify-between p-8 rounded-[2rem] transition-all cursor-pointer overflow-hidden"
                  >
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative z-10">
                      <div className="mb-6 flex items-center justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 group-hover:bg-blue-600 transition-all duration-500">
                          <Package className="h-6 w-6 text-slate-300 group-hover:text-white" />
                        </div>
                        <StatusBadge expiryDate={warranty.expiry_date} />
                      </div>

                      <h3 className="text-xl font-bold text-white mb-1 tracking-tight group-hover:text-blue-400 transition-colors">
                        {warranty.product_name}
                      </h3>
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{warranty.brand || "Exclusive Model"}</p>

                      <div className="mt-8 space-y-4">
                        <div className="flex items-center text-xs font-semibold text-slate-400">
                          <Calendar className="mr-3 h-4 w-4 text-blue-500" />
                          <span>Expiration: <ClientOnly fallback={<span className="animate-pulse bg-white/10 rounded h-4 w-20" />}>{formatDate(warranty.expiry_date)}</ClientOnly></span>
                        </div>
                        <ExpiryProgress expiryDate={warranty.expiry_date} purchaseDate={warranty.purchase_date} />
                      </div>
                    </div>

                    <div className="relative z-10 mt-8 flex items-center justify-between pt-6 border-t border-white/5">
                      <span className="text-[10px] font-black tracking-[0.2em] text-blue-500 uppercase">
                        {warranty.category?.name || "Premium"}
                      </span>
                      <Link to={`/warranties/${warranty.id}`} className="flex items-center text-xs font-bold text-white group/btn">
                        Explore <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </motion.div>
                ))
              ) : (
                <EmptyState />
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ to, icon: Icon, children, active = false }: { to: string, icon: any, children: React.ReactNode, active?: boolean }) {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
        active ? "bg-slate-50 text-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      <Icon className="mr-3 h-4 w-4" />
      {children}
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full py-24 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white/50 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 border border-slate-100">
        <ShieldCheck className="h-10 w-10 text-slate-300" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 text-balance px-4">Secure your first product</h3>
      <p className="mt-2 max-w-xs text-sm text-slate-500 px-4">Scan or add your warranty card to start receiving automated expiry reminders.</p>
      <Link
        to="/warranties/new"
        className="mt-8 rounded-full bg-slate-900 px-8 py-3 text-sm font-bold text-white hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/10"
      >
        Add Warranty
      </Link>
    </div>
  );
}

function StatusBadge({ expiryDate }: { expiryDate: string }) {
  const isExpired = new Date(expiryDate) <= new Date();
  const isExpiringSoon = !isExpired && (new Date(expiryDate).getTime() - new Date().getTime()) < (30 * 24 * 60 * 60 * 1000);

  return (
    <span className={cn(
      "px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase border",
      isExpired ? "bg-red-50 text-red-600 border-red-100" :
        isExpiringSoon ? "bg-amber-50 text-amber-600 border-amber-100 animate-pulse" :
          "bg-emerald-50 text-emerald-600 border-emerald-100"
    )}>
      {isExpired ? "Expired" : isExpiringSoon ? "Expiring Soon" : "Active Coverage"}
    </span>
  );
}

function ExpiryProgress({ expiryDate, purchaseDate }: { expiryDate: string, purchaseDate: string }) {
  const total = new Date(expiryDate).getTime() - new Date(purchaseDate).getTime();
  const remaining = new Date(expiryDate).getTime() - new Date().getTime();
  const percentage = Math.max(0, Math.min(100, (remaining / total) * 100));

  return (
    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={cn(
          "h-full rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.3)]",
          percentage < 20 ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]" : ""
        )}
      />
    </div>
  );
}
