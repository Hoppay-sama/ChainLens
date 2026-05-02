import { useState } from 'react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import {
  Package,
  Truck,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
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

const kpiData = [
  {
    label: 'Total Products',
    value: '12,847',
    change: '+8.2%',
    up: true,
    icon: Package,
    variant: 'accent' as const,
  },
  {
    label: 'Active Shipments',
    value: '3,291',
    change: '+12.4%',
    up: true,
    icon: Truck,
    variant: 'blue' as const,
  },
  {
    label: 'Avg Transit Time',
    value: '4.2 days',
    change: '-0.8 days',
    up: true,
    icon: Clock,
    variant: 'orange' as const,
  },
  {
    label: 'On-Time Rate',
    value: '94.3%',
    change: '-1.2%',
    up: false,
    icon: TrendingUp,
    variant: 'purple' as const,
  },
]

const chartData = [
  { name: 'Mon', shipments: 420, products: 240 },
  { name: 'Tue', shipments: 380, products: 300 },
  { name: 'Wed', shipments: 510, products: 280 },
  { name: 'Thu', shipments: 460, products: 320 },
  { name: 'Fri', shipments: 540, products: 350 },
  { name: 'Sat', shipments: 320, products: 210 },
  { name: 'Sun', shipments: 290, products: 190 },
]

const recentActivity = [
  { id: 'PROD-8842', action: 'Transferred', from: 'Factory A', to: 'Warehouse B', time: '2 min ago', status: 'success' as const },
  { id: 'PROD-7721', action: 'Shipped', from: 'Warehouse B', to: 'Retailer C', time: '15 min ago', status: 'warning' as const },
  { id: 'PROD-5510', action: 'Verified', from: 'Retailer C', to: 'Customer', time: '1 hr ago', status: 'success' as const },
  { id: 'PROD-3391', action: 'Created', from: 'Manufacturer', to: 'Factory A', time: '3 hr ago', status: 'default' as const },
]

export default function Dashboard() {
  const [hoveredKpi, setHoveredKpi] = useState<number | null>(null)

  return (
    <div className="animate-fade-in space-y-8">
      {/* Hero Section */}
      <div className="space-y-2">
        <h1 className="font-serif text-3xl text-text sm:text-4xl">
          Supply Chain Overview
        </h1>
        <p className="max-w-2xl text-muted">
          Real-time visibility into your product journey from manufacturer to consumer.
          Track shipments, verify authenticity, and analyze performance metrics.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi, index) => (
          <Card
            key={kpi.label}
            variant={kpi.variant}
            className="relative cursor-default transition-transform duration-200 hover:-translate-y-0.5"
            onMouseEnter={() => setHoveredKpi(index)}
            onMouseLeave={() => setHoveredKpi(null)}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-sm text-muted">{kpi.label}</p>
                <p className="font-mono text-2xl font-medium text-text">
                  {kpi.value}
                </p>
                <div className="flex items-center gap-1 text-xs">
                  {kpi.up ? (
                    <ArrowUpRight className="h-3.5 w-3.5 text-accent" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5 text-accent3" />
                  )}
                  <span className={kpi.up ? 'text-accent' : 'text-accent3'}>
                    {kpi.change}
                  </span>
                  <span className="text-muted">vs last week</span>
                </div>
              </div>
              <div className="rounded-lg bg-surface2 p-2">
                <kpi.icon className="h-5 w-5 text-muted" />
              </div>
            </div>
            {hoveredKpi === index && (
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
            )}
          </Card>
        ))}
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-text">Shipment Volume</h2>
              <p className="text-sm text-muted">Daily shipments and product registrations</p>
            </div>
            <Badge variant="accent">Live</Badge>
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
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e1e1e',
                    border: '1px solid #2a2a2a',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#f0ece4' }}
                />
                <Area type="monotone" dataKey="shipments" stroke="#c8f060" strokeWidth={2} fill="url(#shipments)" />
                <Area type="monotone" dataKey="products" stroke="#60d0f0" strokeWidth={2} fill="url(#products)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-text">Recent Activity</h2>
            <Activity className="h-4 w-4 text-muted" />
          </div>
          <div className="space-y-4">
            {recentActivity.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-surface2"
              >
                <div className="mt-0.5 h-2 w-2 rounded-full bg-accent" />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-medium text-text">
                      {item.id}
                    </span>
                    <Badge
                      variant={
                        item.status === 'success'
                          ? 'success'
                          : item.status === 'warning'
                          ? 'warning'
                          : 'default'
                      }
                    >
                      {item.action}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted">
                    {item.from} → {item.to}
                  </p>
                  <p className="text-xs text-muted/60">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
