import { motion } from 'framer-motion'
import { ArrowRight, Play, Shield, Zap, Globe } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
}

function VeritrasMark({
  className = '',
  decorative = false,
}: {
  className?: string
  decorative?: boolean
}) {
  const gradientId = decorative
    ? 'veritras-mark-stroke-decorative'
    : 'veritras-mark-stroke'

  return (
    <div
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : 'Veritras provenance mark'}
      className={`relative grid place-items-center ${className}`}
    >
      <div className="absolute inset-0 rounded-2xl bg-accent/10 blur-md" />
      <svg
        aria-hidden="true"
        viewBox="0 0 64 64"
        className="relative h-full w-full drop-shadow-[0_0_18px_rgba(200,240,96,0.25)]"
      >
        <defs>
          <linearGradient id={gradientId} x1="8" x2="56" y1="8" y2="56">
            <stop stopColor="#c8f060" />
            <stop offset="0.55" stopColor="#60d0f0" />
            <stop offset="1" stopColor="#f0a060" />
          </linearGradient>
        </defs>
        <path
          d="M32 5 55 18v27L32 59 9 45V18L32 5Z"
          fill="rgba(255,255,255,0.025)"
          stroke={`url(#${gradientId})`}
          strokeWidth="2"
        />
        <path
          d="m18 22 14 24 14-24"
          fill="none"
          stroke="#f0ece4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        />
        <path
          d="M20 21h24M32 10v10M32 46v8"
          stroke="#c8f060"
          strokeLinecap="round"
          strokeWidth="2"
        />
        <circle cx="32" cy="20" r="4" fill="#c8f060" />
        <circle cx="18" cy="22" r="3" fill="#60d0f0" />
        <circle cx="46" cy="22" r="3" fill="#f0a060" />
      </svg>
    </div>
  )
}

function ProvenanceModel() {
  const nodes = [
    { label: 'Origin', x: '18%', y: '58%', color: 'bg-accent' },
    { label: 'Custody', x: '43%', y: '33%', color: 'bg-accent2' },
    { label: 'Verify', x: '72%', y: '56%', color: 'bg-accent3' },
  ]

  return (
    <div
      role="img"
      aria-label="Supply-chain provenance model"
      className="absolute right-8 top-1/2 h-[560px] w-[560px] -translate-y-1/2"
    >
      <div className="absolute inset-8 rounded-full border border-white/10 bg-white/[0.015]" />
      <div className="absolute inset-20 rounded-full border border-dashed border-accent/20" />
      <div className="absolute left-[14%] top-[52%] h-px w-[62%] -rotate-[19deg] bg-gradient-to-r from-accent/60 via-accent2/50 to-accent3/40" />
      <div className="absolute left-[42%] top-[37%] h-px w-[34%] rotate-[22deg] bg-gradient-to-r from-accent2/60 to-accent3/40" />

      <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.14] to-white/[0.02] shadow-[0_0_60px_rgba(200,240,96,0.12)] backdrop-blur-2xl">
        <div className="absolute inset-5 rounded-[1.35rem] border border-accent/20" />
        <div className="absolute inset-10 rounded-xl bg-bg/70" />
      </div>
      <VeritrasMark
        decorative
        className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2"
      />

      {nodes.map((node) => (
        <div
          key={node.label}
          className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-3"
          style={{ left: node.x, top: node.y }}
        >
          <span className={`h-3 w-3 rounded-full ${node.color} shadow-[0_0_18px_currentColor]`} />
          <span className="rounded-full border border-white/10 bg-bg/70 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted backdrop-blur-xl">
            {node.label}
          </span>
        </div>
      ))}

      <div className="absolute right-24 top-24 rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl">
        <div className="h-2 w-16 rounded-full bg-accent/60" />
        <div className="mt-3 h-2 w-24 rounded-full bg-white/15" />
        <div className="mt-2 h-2 w-14 rounded-full bg-accent2/35" />
      </div>
      <div className="absolute bottom-28 left-24 rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl">
        <div className="grid grid-cols-3 gap-1">
          {[...Array(9)].map((_, index) => (
            <span
              key={index}
              className={`h-2 w-2 rounded-sm ${index % 2 === 0 ? 'bg-accent/70' : 'bg-white/15'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function PremiumHero() {
  const navigate = useNavigate()

  return (
    <section className="relative flex min-h-[100dvh] flex-col justify-center overflow-hidden px-6 py-20 sm:px-12 lg:px-20">
      {/* Ambient glow orbs */}
      <div className="pointer-events-none absolute right-0 top-1/4 h-[600px] w-[600px] rounded-full bg-accent/5 blur-[120px]" />
      <div className="pointer-events-none absolute -left-32 bottom-1/4 h-[400px] w-[400px] rounded-full bg-accent2/5 blur-[100px]" />

      {/* Main Content - Left Aligned */}
      <div className="relative z-10 max-w-3xl text-center sm:text-left">
        {/* Top Label */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="mb-6 flex items-center gap-3"
        >
          <VeritrasMark className="h-9 w-9" />
          <span className="inline-block h-px w-4 bg-accent" />
          <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-accent">
            Where Transparency Becomes Reality
          </span>
        </motion.div>

        {/* Massive Serif Headline */}
        <motion.h1
          custom={0.1}
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="break-words font-serif leading-[1.05] tracking-tight"
        >
          <span className="block text-[clamp(3.5rem,10vw,8rem)] text-text">
            Track
          </span>
          <span className="block pb-2 text-[clamp(3.5rem,10vw,8rem)] bg-gradient-to-r from-accent via-accent2 to-accent3 bg-clip-text text-transparent">
            Beyond
          </span>
          <span className="block mt-2 text-[clamp(1.2rem,3vw,2.5rem)] uppercase tracking-[0.3em] text-muted">
            The Ordinary
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          custom={0.2}
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="mt-8 max-w-md text-sm leading-relaxed text-muted"
        >
          Veritras is the next generation supply chain platform designed to bring
          trust to life. Track, verify, and transcend the limits of transparency
          with blockchain-powered provenance.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          custom={0.3}
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="mt-8 flex flex-col items-center gap-4 sm:flex-row"
        >
          <button
            onClick={() => navigate('/products')}
            className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-accent/90 to-accent2/80 px-8 py-3.5 text-sm font-semibold text-bg shadow-[0_0_30px_rgba(200,240,96,0.2)] transition-all hover:shadow-[0_0_40px_rgba(200,240,96,0.35)] hover:scale-[1.02]"
          >
            Explore Now
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
          <button
            onClick={() => navigate('/verify')}
            className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/[0.03] px-8 py-3.5 text-sm font-medium text-text backdrop-blur-xl transition-all hover:border-white/30 hover:bg-white/[0.06]"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            Verify Product
          </button>
        </motion.div>
      </div>

      {/* Bottom Feature Bar */}
      <motion.div
        custom={0.5}
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="relative z-10 mt-20 grid max-w-2xl grid-cols-1 gap-6 border-t border-white/5 pt-8 sm:grid-cols-3"
      >
        {[
          {
            icon: Shield,
            title: 'On-Chain',
            desc: 'Immutable records on Ethereum Sepolia',
          },
          {
            icon: Zap,
            title: 'Real-Time',
            desc: 'Live tracking at every checkpoint',
          },
          {
            icon: Globe,
            title: 'Verified',
            desc: 'Global verification by product ID',
          },
        ].map((feature) => (
          <div key={feature.title} className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.03] border border-white/5">
              <feature.icon className="h-3.5 w-3.5 text-accent" />
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text">
                {feature.title}
              </h3>
              <p className="mt-1 text-[11px] leading-relaxed text-muted">
                {feature.desc}
              </p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Decorative 3D Element Placeholder - Right Side */}
      <div className="pointer-events-none absolute right-0 top-1/2 hidden h-[80vh] w-[50vw] -translate-y-1/2 lg:block">
        <div className="absolute right-1/4 top-1/2 h-[34rem] w-[34rem] -translate-y-1/2 rounded-full bg-gradient-to-br from-accent/10 via-accent2/10 to-transparent blur-[100px]" />
        <div className="absolute right-1/3 top-1/3 h-64 w-64 rounded-full bg-gradient-to-br from-white/5 to-transparent blur-[60px]" />
        <ProvenanceModel />
      </div>
    </section>
  )
}
