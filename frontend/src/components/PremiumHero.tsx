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

export default function PremiumHero() {
  const navigate = useNavigate()

  return (
    <section className="relative flex min-h-screen flex-col justify-center overflow-hidden px-6 py-20 sm:px-12 lg:px-20">
      {/* Ambient glow orbs */}
      <div className="pointer-events-none absolute right-0 top-1/4 h-[600px] w-[600px] rounded-full bg-accent/5 blur-[120px]" />
      <div className="pointer-events-none absolute -left-32 bottom-1/4 h-[400px] w-[400px] rounded-full bg-accent2/5 blur-[100px]" />

      {/* Main Content - Left Aligned */}
      <div className="relative z-10 max-w-3xl">
        {/* Top Label */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="mb-6 flex items-center gap-3"
        >
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
          className="font-serif leading-[1.05] tracking-tight"
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
          className="mt-8 flex flex-wrap items-center gap-4"
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
        {/* Glowing orb to simulate a 3D figure presence */}
        <div className="absolute right-1/4 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-gradient-to-br from-accent/10 via-accent2/10 to-transparent blur-[100px]" />
        <div className="absolute right-1/3 top-1/3 h-64 w-64 rounded-full bg-gradient-to-br from-white/5 to-transparent blur-[60px]" />
      </div>
    </section>
  )
}
