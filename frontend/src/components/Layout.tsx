import { NavLink, Outlet } from 'react-router-dom'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Package, BarChart3, ShieldCheck, Hexagon, Truck } from 'lucide-react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: BarChart3 },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/shipments', label: 'Shipments', icon: Truck },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/verify', label: 'Verify', icon: ShieldCheck },
]

export default function Layout() {
  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
              <Hexagon className="h-5 w-5 text-accent" strokeWidth={2} />
            </div>
            <span className="font-serif text-xl tracking-wide text-text">
              ChainLens
            </span>
          </div>

          {/* Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-button px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-surface2 text-accent'
                      : 'text-muted hover:bg-surface2 hover:text-text'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Wallet Connect */}
          <ConnectButton
            showBalance={false}
            accountStatus="address"
            chainStatus="icon"
          />
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="flex items-center justify-around border-b border-border bg-surface px-4 py-2 md:hidden">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                isActive ? 'text-accent' : 'text-muted'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
