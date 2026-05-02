import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { Download, AlertTriangle, TrendingUp, Clock, Route } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const volumeData = [
  { route: 'NA-EU', volume: 420, delay: 2.1 },
  { route: 'AS-NA', volume: 380, delay: 3.2 },
  { route: 'EU-AS', volume: 290, delay: 1.8 },
  { route: 'NA-SA', volume: 240, delay: 1.5 },
  { route: 'EU-AF', volume: 180, delay: 4.2 },
  { route: 'AS-AU', volume: 150, delay: 2.8 },
]

const bottleneckData = [
  { name: 'Customs', value: 35, color: '#c8f060' },
  { name: 'Weather', value: 25, color: '#60d0f0' },
  { name: 'Port Congestion', value: 20, color: '#f0a060' },
  { name: 'Documentation', value: 15, color: '#d060f0' },
  { name: 'Other', value: 5, color: '#888888' },
]

const anomalies = [
  {
    id: 'SHIP-2291',
    type: 'Delay',
    severity: 'high',
    route: 'Shanghai → Los Angeles',
    expected: '2 days',
    actual: '6 days',
    detected: '2 hr ago',
  },
  {
    id: 'SHIP-4421',
    type: 'Route Deviation',
    severity: 'medium',
    route: 'Rotterdam → Dubai',
    expected: 'On route',
    actual: '45km off course',
    detected: '5 hr ago',
  },
  {
    id: 'SHIP-8832',
    type: 'Temperature Excursion',
    severity: 'high',
    route: 'Mumbai → London',
    expected: '2-8°C',
    actual: '12.4°C',
    detected: '8 hr ago',
  },
  {
    id: 'SHIP-1102',
    type: 'Documentation Error',
    severity: 'low',
    route: 'São Paulo → Miami',
    expected: 'Complete',
    actual: 'Missing customs form',
    detected: '12 hr ago',
  },
]

export default function Analytics() {
  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="font-serif text-3xl text-text sm:text-4xl">
            Analytics
          </h1>
          <p className="max-w-2xl text-muted">
            Deep insights into shipment performance, transit patterns, and anomaly detection.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="secondary">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Shipment Volume by Route */}
        <Card>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-text">Volume by Route</h2>
              <p className="text-sm text-muted">Shipment count per trade lane</p>
            </div>
            <Route className="h-5 w-5 text-muted" />
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                <XAxis dataKey="route" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
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
                <Bar dataKey="volume" fill="#c8f060" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Bottleneck Distribution */}
        <Card>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-text">Bottleneck Causes</h2>
              <p className="text-sm text-muted">Root cause analysis of delays</p>
            </div>
            <Clock className="h-5 w-5 text-muted" />
          </div>
          <div className="flex h-[300px] items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bottleneckData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {bottleneckData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e1e1e',
                    border: '1px solid #2a2a2a',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#f0ece4' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {bottleneckData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted">{item.name}</span>
                  <span className="font-mono text-text">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Transit Time by Route */}
        <Card>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-text">Transit Time by Route</h2>
              <p className="text-sm text-muted">Average delay in days</p>
            </div>
            <TrendingUp className="h-5 w-5 text-muted" />
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" horizontal={false} />
                <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="route" type="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={60} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e1e1e',
                    border: '1px solid #2a2a2a',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#f0ece4' }}
                  formatter={(value: number) => [`${value} days`, 'Avg Delay']}
                />
                <Bar dataKey="delay" fill="#60d0f0" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Anomaly Table */}
        <Card>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-text">Flagged Shipments</h2>
              <p className="text-sm text-muted">Detected anomalies requiring attention</p>
            </div>
            <AlertTriangle className="h-5 w-5 text-accent3" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase text-muted">
                  <th className="pb-3 font-medium">ID</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Severity</th>
                  <th className="pb-3 font-medium">Route</th>
                  <th className="pb-3 font-medium">Detected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {anomalies.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-surface2/50">
                    <td className="py-3 font-mono text-text">{item.id}</td>
                    <td className="py-3 text-muted">{item.type}</td>
                    <td className="py-3">
                      <Badge
                        variant={
                          item.severity === 'high'
                            ? 'error'
                            : item.severity === 'medium'
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {item.severity}
                      </Badge>
                    </td>
                    <td className="py-3 text-muted">{item.route}</td>
                    <td className="py-3 text-muted">{item.detected}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
