import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import HeroSection from '@/components/HeroSection'
import { useKPIData, useProducts } from '@/hooks/useApi'
import { formatDate } from '@/utils/formatters'
import {
  Package,
  Truck,
  Clock,
  TrendingUp,
  Activity,
  AlertCircle,
  ArrowUpRight,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { Product } from '@/types'

const chartData = [
  { name: 'Mon', shipments: 420, products: 240 },
  { name: 'Tue', shipments: 380, products: 300 },
  { name: 'Wed', shipments: 510, products: 280 },
  { name: 'Thu', shipments: 460, products: 320 },
  { name: 'Fri', shipments: 540, products: 350 },
  { name: 'Sat', shipments: 320, products: 210 },
  { name: 'Sun', shipments: 290, products: 190 },
]

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
}

export default function Dashboard() {
  const [hoveredKpi, setHoveredKpi] = useState<number | null>(null)
  const { data: kpiData, isLoading: kpiLoading, error: kpiError } = useKPIData()
  const { data: productsData, isLoading: productsLoading } = useProducts()

  const isLoading = kpiLoading || productsLoading
  const error = kpiError

  const kpis = kpiData
    ? [
        {
          label: 'Total Products',
          value: kpiData.total_shipments?.toLocaleString() ?? '0',
          icon: Package,
          variant: 'accent' as const,
          gradient: 'from-accent/20 to-accent/5',
        },
        {
          label: 'Active Shipments',
          value: kpiData.active_shipments?.toLocaleString() ?? '0',
          icon: Truck,
          variant: 'blue' as const,
          gradient: 'from-accent2/20 to-accent2/5',
        },
        {
          label: 'Avg Transit Time',
          value:
            kpiData.avg_transit_time_hours != null
              ? `${kpiData.avg_transit_time_hours.toFixed(1)} hrs`
              : 'N/A',
          icon: Clock,
          variant: 'orange' as const,
          gradient: 'from-accent3/20 to-accent3/5',
        },
        {
          label: 'On-Time Rate',
          value:
            kpiData.on_time_rate_percent != null
              ? `${kpiData.on_time_rate_percent.toFixed(1)}%`
              : 'N/A',
          icon: TrendingUp,
          variant: 'purple' as const,
          gradient: 'from-accent4/20 to-accent4/5',
        },
      ]
    : []

  const recentProducts: Product[] =
    Array.isArray(productsData) && productsData.length > 0
      ? [...productsData].reverse().slice(0, 5)
      : []

  return (
    <div className="relative">
      {/* Hero */}
      <HeroSection />

      {/* Dashboard Content */}
      <div className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeInUp}
          className="mb-10 flex items-end justify-between"
        >
          <div>
            <h2 className="font-serif text-3xl text-text sm:text-4xl">
              Supply Chain Overview
            </h2>
            <p className="mt-2 max-w-xl text-muted">
              Real-time visibility into your product journey from manufacturer to consumer.
            </p>
          </div>
          <Badge variant="accent" className="hidden sm:flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Live
          </Badge>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 backdrop-blur-sm"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
            <div>
              <p className="font-medium text-red-400">Failed to load dashboard data</p>
              <p className="text-sm text-red-400/70">
                {error instanceof Error ? error.message : 'Please try again later.'}
              </p>
            </div>
          </motion.div>
        )}

        {!isLoading && !error && (
          <>
            {/* KPI Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {kpis.map((kpi, index) => (
                <motion.div
                  key={kpi.label}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  transition={{ delay: index * 0.1 }}
                  onMouseEnter={() => setHoveredKpi(index)}
                  onMouseLeave={() => setHoveredKpi(null)}
                >
                  <Card
                    variant={kpi.variant}
                    className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-glow"
                  >
                    {/* Background gradient */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${kpi.gradient} opacity-0 transition-opacity group-hover:opacity-100`}
                    />
                    <div className="relative">
                      <div className="flex items-start justify-between">
                        <div className="space-y-3">
                          <p className="text-sm text-muted">{kpi.label}</p>
                          <p className="font-mono text-3xl font-medium text-text">
                            {kpi.value}
                          </p>
                        </div>
                        <div className="rounded-xl bg-surface2/80 p-2.5 transition-colors group-hover:bg-surface2">
                          <kpi.icon className="h-5 w-5 text-muted transition-colors group-hover:text-text" />
                        </div>
                      </div>
                      {hoveredKpi === index && (
                        <motion.div
                          layoutId="kpi-glow"
                          className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent"
                        />
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Chart + Recent Activity */}
            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2"
              >
                <Card className="h-full transition-all hover:border-border">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="font-serif text-xl text-text">Shipment Volume</h2>
                      <p className="text-sm text-muted">Daily shipments and product registrations</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-accent" />
                        Shipments
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-accent2" />
                        Products
                      </span>
                    </div>
                  </div>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="shipments" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#c8f060" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#c8f060" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="products" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#60d0f0" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#60d0f0" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                        <XAxis dataKey="name" stroke="#333" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#333" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0a0a0a',
                            border: '1px solid #222',
                            borderRadius: '12px',
                            fontSize: '12px',
                            backdropFilter: 'blur(10px)',
                          }}
                          itemStyle={{ color: '#f0ece4' }}
                        />
                        <Area type="monotone" dataKey="shipments" stroke="#c8f060" strokeWidth={2} fill="url(#shipments)" />
                        <Area type="monotone" dataKey="products" stroke="#60d0f0" strokeWidth={2} fill="url(#products)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                transition={{ delay: 0.3 }}
              >
                <Card className="h-full transition-all hover:border-border">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-serif text-xl text-text">Recent Products</h2>
                    <Activity className="h-4 w-4 text-muted" />
                  </div>
                  <div className="space-y-3">
                    {recentProducts.length === 0 && (
                      <p className="py-8 text-center text-sm text-muted">No products registered yet.</p>
                    )}
                    {recentProducts.map((item, i) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group flex items-start gap-3 rounded-xl p-3 transition-all hover:bg-surface2/50"
                      >
                        <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent shadow-[0_0_8px_rgba(200,240,96,0.5)]" />
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-sm font-medium text-text">
                              {item.product_id}
                            </span>
                            <ArrowUpRight className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                          </div>
                          <p className="text-xs text-muted truncate">{item.name}</p>
                          <p className="text-xs text-muted/50">
                            {formatDate(item.registered_at)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
