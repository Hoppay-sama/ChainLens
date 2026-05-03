import { motion } from 'framer-motion'
import { ArrowRight, Shield, Globe, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function PremiumHero() {
  const navigate = useNavigate()

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-20">
      {/* Central 3D Ring / Halo Effect */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {/* Outer glow */}
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-accent/10 via-accent2/5 to-transparent blur-[80px]" />
        {/* Ring halo */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2"
        >
          <div className="h-full w-full rounded-full border border-accent/20" />
          <div className="absolute inset-4 rounded-full border border-accent2/10" />
          <div className="absolute inset-8 rounded-full border border-accent/5" />
        </motion.div>
        {/* Inner glow orb */}
        <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-accent/20 via-accent2/10 to-transparent blur-[40px]" />
      </div>

      {/* Vertical accent lines */}
      <div className="pointer-events-none absolute inset-0 flex justify-center gap-[30vw]">
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: '100%' }}
          transition={{ duration: 2, delay: 0.5, ease: 'easeOut' }}
          className="w-px bg-gradient-to-b from-transparent via-accent/20 to-transparent"
        />
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: '100%' }}
          transition={{ duration: 2, delay: 0.8, ease: 'easeOut' }}
          className="w-px bg-gradient-to-b from-transparent via-accent2/20 to-transparent"
        />
      </div>

      {/* Floating glass panels - left */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="pointer-events-none absolute left-8 top-1/3 hidden lg:block"
      >
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur-2xl">
          <div className="mb-2 h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_rgba(200,240,96,0.5)]" />
          <div className="space-y-1.5">
            <div className="h-1.5 w-24 rounded-full bg-white/10" />
            <div className="h-1.5 w-16 rounded-full bg-white/5" />
          </div>
        </div>
      </motion.div>

      {/* Floating glass panels - right */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.7 }}
        className="pointer-events-none absolute right-8 top-1/2 hidden lg:block"
      >
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur-2xl">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-6 w-6 rounded-full border border-accent/30 bg-accent/10" />
            <div className="h-2 w-20 rounded-full bg-white/10" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-accent2" />
              <div className="h-1 w-12 rounded-full bg-white/10" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-accent3" />
              <div className="h-1 w-10 rounded-full bg-white/5" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Top label pill */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 mb-12"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 backdrop-blur-xl">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
            Blockchain Supply Chain Platform
          </span>
        </div>
      </motion.div>

      {/* Main Typography - Massive */}
      <div className="relative z-10 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="font-sans text-[clamp(3rem,12vw,10rem)] font-bold leading-[0.9] tracking-tighter text-text"
        >
          <span className="block">Track</span>
          <span className="block">
            <span className="bg-gradient-to-r from-accent via-accent2 to-accent3 bg-clip-text text-transparent">
              Beyond
            </span>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mx-auto mt-8 max-w-lg text-sm leading-relaxed tracking-wide text-muted sm:text-base"
        >
          Veritras brings immutable transparency to supply chains.
          Every product, every handoff, every mile — recorded on-chain.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <button
            onClick={() => navigate('/products')}
            className="group relative flex items-center gap-3 rounded-full bg-text px-8 py-4 text-sm font-semibold text-bg transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(200,240,96,0.3)]"
          >
            Explore Platform
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
          <button
            onClick={() => navigate('/verify')}
            className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-8 py-4 text-sm font-medium text-text backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/10"
          >
            <Shield className="h-4 w-4 text-accent" />
            Verify Product
          </button>
        </motion.div>
      </div>

      {/* Feature orbs at bottom */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1 }}
        className="relative z-10 mt-24 grid grid-cols-1 gap-6 sm:grid-cols-3"
      >
        {[
          {
            icon: Globe,
            title: 'On-Chain',
            desc: 'Immutable provenance on Ethereum Sepolia',
            color: 'from-accent/20 to-accent/5',
            borderColor: 'border-accent/20',
          },
          {
            icon: Zap,
            title: 'Real-Time',
            desc: 'Live shipment tracking with every checkpoint',
            color: 'from-accent2/20 to-accent2/5',
            borderColor: 'border-accent2/20',
          },
          {
            icon: Shield,
            title: 'Verified',
            desc: 'Global verification by product ID instantly',
            color: 'from-accent4/20 to-accent4/5',
            borderColor: 'border-accent4/20',
          },
        ].map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 + i * 0.15 }}
            className={`group relative overflow-hidden rounded-3xl border ${feature.borderColor} bg-gradient-to-br ${feature.color} p-6 backdrop-blur-2xl transition-all duration-500 hover:scale-[1.02]`}
          >
            {/* Halo ring on hover */}
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full border border-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full border border-white/5 opacity-0 transition-opacity group-hover:opacity-100" />

            <div className="relative">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <feature.icon className="h-5 w-5 text-text" />
              </div>
              <h3 className="mb-1 text-lg font-semibold text-text">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{feature.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs uppercase tracking-widest text-muted/50">Scroll</span>
          <div className="h-8 w-5 rounded-full border border-white/20 p-1">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="h-2 w-full rounded-full bg-white/40"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
