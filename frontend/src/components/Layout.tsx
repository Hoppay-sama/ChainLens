import { NavLink, Outlet } from 'react-router-dom'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, BarChart3, ShieldCheck, Hexagon, Truck, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: BarChart3 },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/shipments', label: 'Shipments', icon: Truck },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/verify', label: 'Verify', icon: ShieldCheck },
]

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Floating Pill Navigation */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-4 left-0 right-0 z-50 mx-auto max-w-fit px-4 transition-all duration-500 ${
          scrolled ? 'top-2' : 'top-4'
        }`}
      >
        <div
          className={`flex items-center gap-2 rounded-full border border-white/10 px-2 py-2 backdrop-blur-2xl transition-all duration-500 ${
            scrolled
              ? 'bg-bg/80 shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
              : 'bg-bg/40'
          }`}
        >
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2.5 pl-3 pr-2 group">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full border border-accent/30 bg-accent/10">
              <Hexagon className="h-4 w-4 text-accent" strokeWidth={2} />
              <div className="absolute inset-0 rounded-full bg-accent/20 blur-md opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <span className="hidden font-serif text-lg tracking-wide text-text sm:block">
              Veritras
            </span>
          </NavLink>

          {/* Divider */}
          <div className="hidden h-5 w-px bg-white/10 md:block" />

          {/* Desktop Navigation Pills */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `relative rounded-full px-4 py-2 text-xs font-medium uppercase tracking-wider transition-all duration-300 ${
                    isActive
                      ? 'text-text'
                      : 'text-muted hover:text-text'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute inset-0 rounded-full border border-white/10 bg-white/10"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Divider */}
          <div className="hidden h-5 w-px bg-white/10 md:block" />

          {/* Wallet Connect */}
          <div className="pl-1">
            <ConnectButton
              showBalance={false}
              accountStatus="address"
              chainStatus="icon"
            />
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-muted transition-colors hover:text-text md:hidden"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="mt-2 rounded-3xl border border-white/10 bg-bg/90 p-2 backdrop-blur-2xl md:hidden"
            >
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-white/10 text-text'
                        : 'text-muted hover:bg-white/5 hover:text-text'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10">
        <Outlet />
      </main>
    </div>
  )
}
