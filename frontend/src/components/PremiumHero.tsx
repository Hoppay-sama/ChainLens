import { motion } from 'framer-motion'
import { ArrowRight, Play, Shield, Zap, Globe } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import heroBanner from '@/assets/hero-banner.png'

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

function AnimatedHeroBanner() {
  const routePulses = [
    {
      className:
        'left-[38%] top-[56%] h-px w-[34%] rotate-[18deg] from-accent/0 via-accent/70 to-accent/0',
      delay: 0,
    },
    {
      className:
        'left-[52%] top-[41%] h-px w-[28%] -rotate-[24deg] from-accent2/0 via-accent2/70 to-accent2/0',
      delay: 1.4,
    },
    {
      className:
        'left-[56%] top-[72%] h-px w-[32%] rotate-[7deg] from-accent3/0 via-accent3/65 to-accent3/0',
      delay: 2.8,
    },
  ]

  const verificationPings = [
    { className: 'right-[22%] top-[21%] border-accent/60', delay: 0.3 },
    { className: 'right-[13%] top-[48%] border-accent2/60', delay: 1.6 },
    { className: 'right-[31%] bottom-[16%] border-accent3/60', delay: 2.7 },
  ]

  return (
    <div
      role="img"
      aria-label="Supply-chain provenance model"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <motion.img
        data-testid="hero-banner-image"
        src={heroBanner}
        alt=""
        aria-hidden="true"
        initial={{ opacity: 0, scale: 1.08, x: 36 }}
        animate={{
          opacity: 0.84,
          scale: [1.08, 1.12, 1.08],
          x: [36, 12, 36],
          y: [-8, 8, -8],
        }}
        transition={{
          opacity: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
          scale: { duration: 18, repeat: Infinity, ease: 'easeInOut' },
          x: { duration: 18, repeat: Infinity, ease: 'easeInOut' },
          y: { duration: 14, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/70 to-bg/10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_47%,transparent_0%,rgba(10,10,10,0.22)_43%,rgba(10,10,10,0.72)_78%)]" />

      {routePulses.map((pulse) => (
        <motion.span
          key={pulse.className}
          aria-hidden="true"
          initial={{ opacity: 0, scaleX: 0.18 }}
          animate={{ opacity: [0, 0.9, 0], scaleX: [0.18, 1, 0.18] }}
          transition={{
            duration: 4.8,
            delay: pulse.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`absolute origin-left bg-gradient-to-r ${pulse.className}`}
        />
      ))}

      {verificationPings.map((ping) => (
        <motion.span
          key={ping.className}
          aria-hidden="true"
          initial={{ opacity: 0, scale: 0.35 }}
          animate={{ opacity: [0, 0.75, 0], scale: [0.35, 1.8, 2.35] }}
          transition={{
            duration: 3.6,
            delay: ping.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
          className={`absolute h-20 w-20 rounded-full border ${ping.className}`}
        />
      ))}

      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.1, 0.28, 0.1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute right-[20%] top-[16%] h-[36rem] w-[36rem] rounded-full bg-accent/10 blur-[96px]"
      />
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

      <AnimatedHeroBanner />
    </section>
  )
}
