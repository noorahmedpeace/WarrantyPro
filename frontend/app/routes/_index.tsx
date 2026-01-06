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
  TrendingUp,
  Bell,
  Settings,
  LayoutDashboard,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock
} from "lucide-react";
import { warrantiesApi } from "~/lib/api";
import { cn, formatDate } from "~/lib/utils";
import { ClientOnly } from "~/components/ClientOnly";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const warranties = await warrantiesApi.getAll();
    return json({ warranties });
  } catch (error) {
    return json({ warranties: [], error: "Service currently unavailable" });
  }
}

export default function Index() {
  const { warranties, error } = useLoaderData<typeof loader>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date();
    const active = warranties.filter((w: any) => new Date(w.expiry_date) > now).length;
    const expiringSoon = warranties.filter((w: any) => {
      const expiry = new Date(w.expiry_date);
      const daysUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
    }).length;
    const expired = warranties.filter((w: any) => new Date(w.expiry_date) <= now).length;

    return {
      total: warranties.length,
      active,
      expiringSoon,
      expired
    };
  }, [warranties]);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = warranties.map((w: any) => w.category?.name).filter(Boolean);
    return ["all", ...Array.from(new Set(cats))];
  }, [warranties]);

  // Filter warranties
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

  // Simplified variants for better performance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="flex min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Static Gradient Background - Performance Optimized */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-cyan-500/5 via-transparent to-transparent" />
      </div>

      {/* Sidebar */}
      <aside className="hidden border-r border-white/10 bg-white/5 backdrop-blur-md lg:flex lg:w-72 lg:flex-col relative z-10">
        <div className="flex h-20 items-center px-8">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-2xl shadow-blue-500/50 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20" />
            <ShieldCheck className="h-6 w-6 text-white relative z-10" />
          </motion.div>
          <span className="ml-3 text-lg font-bold tracking-tight text-white">WarrantyPro</span>
        </div>

        <nav className="mt-8 flex-1 space-y-2 px-4">
          <NavItem to="/" icon={LayoutDashboard} active>Dashboard</NavItem>
          <NavItem to="/alerts" icon={Bell}>Alerts</NavItem>
          <NavItem to="/configuration" icon={Settings}>Settings</NavItem>
        </nav>

        <div className="p-6">
          <div className="rounded-2xl bg-gradient-to-br from-blue-600/20 to-cyan-600/20 p-4 border border-blue-500/30 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">Premium Tier</p>
            </div>
            <p className="text-xs text-slate-300">All features unlocked</p>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col relative z-10">
        {/* Header */}
        <header className="flex h-20 items-center border-b border-white/10 bg-white/5 backdrop-blur-md px-8">
          <div className="flex flex-1 items-center justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search warranties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-sm text-white placeholder:text-slate-400 outline-none focus:border-blue-400/50 focus:ring-4 focus:ring-blue-400/10 transition-all [color-scheme:dark]"
              />
            </div>
            <Link
              to="/warranties/new"
              className="ml-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 px-6 py-3 text-sm font-bold text-white shadow-2xl shadow-blue-500/50 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Secure New Item
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Hero Section */}
            <motion.div variants={itemVariants} className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                Portfolio <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Overview</span>
              </h1>
              <p className="text-slate-300 text-lg">
                Monitoring your valuable assets with enterprise-grade protection
              </p>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <motion.div variants={itemVariants}>
                <StatsCard
                  icon={Package}
                  label="Total Warranties"
                  value={stats.total}
                  color="blue"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatsCard
                  icon={CheckCircle2}
                  label="Active Coverage"
                  value={stats.active}
                  color="green"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatsCard
                  icon={Clock}
                  label="Expiring Soon"
                  value={stats.expiringSoon}
                  color="amber"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatsCard
                  icon={AlertTriangle}
                  label="Expired"
                  value={stats.expired}
                  color="red"
                />
              </motion.div>
            </div>

            {/* Category Filter */}
            <motion.div variants={itemVariants} className="mb-8 flex gap-2 flex-wrap">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all",
                    selectedCategory === category
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-500/50"
                      : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-300 border border-white/10"
                  )}
                >
                  {category}
                </button>
              ))}
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div
                variants={itemVariants}
                className="mb-8 rounded-xl bg-red-500/10 backdrop-blur-sm p-4 border border-red-500/30 flex items-center gap-3 text-red-400"
              >
                <AlertTriangle className="h-5 w-5" />
                <p className="text-sm font-semibold">{error}</p>
              </motion.div>
            )}

            {/* Warranty Cards Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filteredWarranties.length > 0 ? (
                  filteredWarranties.map((warranty: any, index: number) => (
                    <motion.div
                      key={warranty.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{
                        delay: index * 0.03,
                        duration: 0.2,
                        ease: "easeOut"
                      }}
                      className="group relative"
                    >
                      {/* Glow Effect */}
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500" />

                      {/* Card */}
                      <Link
                        to={`/warranties/${warranty.id}`}
                        className="relative flex flex-col justify-between p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/12 hover:border-white/25 transition-all duration-200 ease-out h-full"
                      >
                        <div>
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 border border-white/20 group-hover:bg-blue-500 group-hover:border-blue-400 group-hover:scale-105 transition-all duration-300 ease-out will-change-transform">
                              <Package className="h-6 w-6 text-slate-300 group-hover:text-white transition-colors duration-300 ease-out" />
                            </div>
                            <StatusBadge expiryDate={warranty.expiry_date} />
                          </div>

                          <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors duration-300 ease-out">
                            {warranty.product_name}
                          </h3>
                          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
                            {warranty.brand || "Premium"}
                          </p>

                          <div className="space-y-3">
                            <div className="flex items-center text-xs text-slate-400">
                              <Calendar className="mr-2 h-4 w-4 text-blue-400" />
                              <span>
                                Expires: <ClientOnly fallback={<span className="animate-pulse bg-white/10 rounded h-3 w-20 inline-block" />}>
                                  {formatDate(warranty.expiry_date)}
                                </ClientOnly>
                              </span>
                            </div>
                            <ExpiryProgress expiryDate={warranty.expiry_date} purchaseDate={warranty.purchase_date} />
                          </div>
                        </div>

                        <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/10">
                          <span className="text-[10px] font-bold tracking-wider text-blue-400 uppercase">
                            {warranty.category?.name || "Premium"}
                          </span>
                          <div className="flex items-center text-xs font-semibold text-white group/btn">
                            View Details
                            <ArrowRight className="ml-1 h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))
                ) : (
                  <EmptyState searchQuery={searchQuery} />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
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
        "flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all",
        active
          ? "bg-blue-500 text-white shadow-lg shadow-blue-500/50"
          : "text-slate-300 hover:bg-white/10 hover:text-white"
      )}
    >
      <Icon className="h-5 w-5" />
      {children}
    </Link>
  );
}

function StatsCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: number, color: string }) {
  const colorClasses = {
    blue: "from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400",
    green: "from-emerald-500/20 to-green-500/20 border-emerald-500/30 text-emerald-400",
    amber: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400",
    red: "from-red-500/20 to-rose-500/20 border-red-500/30 text-red-400"
  };

  return (
    <div className={cn(
      "relative group rounded-2xl bg-gradient-to-br backdrop-blur-xl border p-6 transition-all hover:scale-105",
      colorClasses[color as keyof typeof colorClasses]
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          "p-3 rounded-xl bg-white/10 border border-white/20",
          color === 'blue' && "group-hover:bg-blue-500/20",
          color === 'green' && "group-hover:bg-emerald-500/20",
          color === 'amber' && "group-hover:bg-amber-500/20",
          color === 'red' && "group-hover:bg-red-500/20"
        )}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm font-medium text-slate-300">{label}</p>
    </div>
  );
}

function EmptyState({ searchQuery }: { searchQuery: string }) {
  return (
    <div className="col-span-full py-24 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/20 bg-white/5 backdrop-blur-md text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/10 border border-white/20">
        <ShieldCheck className="h-10 w-10 text-slate-400" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">No warranties found</h3>
      <p className="mt-2 max-w-xs text-sm text-slate-400 px-4">
        {searchQuery ? "Try adjusting your search or filters" : "Start by adding your first warranty"}
      </p>
      <Link
        to="/warranties/new"
        className="mt-8 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 px-8 py-3 text-sm font-bold text-white hover:from-blue-400 hover:to-cyan-500 transition-all shadow-xl shadow-blue-500/50 hover:scale-105 active:scale-95"
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
      "px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase border backdrop-blur-sm",
      isExpired ? "bg-red-500/20 text-red-400 border-red-500/30" :
        isExpiringSoon ? "bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse" :
          "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    )}>
      {isExpired ? "Expired" : isExpiringSoon ? "Expiring Soon" : "Active"}
    </span>
  );
}

function ExpiryProgress({ expiryDate, purchaseDate }: { expiryDate: string, purchaseDate: string }) {
  const total = new Date(expiryDate).getTime() - new Date(purchaseDate).getTime();
  const remaining = new Date(expiryDate).getTime() - new Date().getTime();
  const percentage = Math.max(0, Math.min(100, (remaining / total) * 100));

  return (
    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={cn(
          "h-full rounded-full bg-gradient-to-r",
          percentage < 20
            ? "from-red-500 to-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
            : percentage < 50
              ? "from-amber-500 to-orange-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
              : "from-blue-500 to-cyan-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
        )}
      />
    </div>
  );
}
