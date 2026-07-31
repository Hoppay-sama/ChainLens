export default function Terms() {
  return (
    <div className="animate-fade-in space-y-6 px-6 sm:px-12 lg:px-20">
      {/* ─── Header ──────────────────────────────────────────────── */}
      <div className="space-y-3 pt-28">
        <div className="flex items-center gap-4">
          <div className="h-px w-8 bg-accent/40" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent/60">
            Legal
          </span>
        </div>
        <h1 className="font-serif text-3xl leading-[1.1] tracking-tight text-text sm:text-4xl">
          Terms &amp; Conditions
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-muted">
          Terms governing your use of the Veritras supply-chain platform.
        </p>
        <p className="text-xs text-muted/50">Last Updated: July 31, 2026</p>
      </div>

      {/* ─── 1. Acceptance of Terms ──────────────────────────────── */}
      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-xl">
        <h2 className="mb-3 font-serif text-xl tracking-tight text-text">
          Acceptance of Terms
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          By accessing or using Veritras, you agree to be bound by these terms.
          If you do not agree, do not use the platform.
        </p>
      </section>

      {/* ─── 2. Description of Service ───────────────────────────── */}
      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-xl">
        <h2 className="mb-3 font-serif text-xl tracking-tight text-text">
          Description of Service
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          Veritras is a blockchain-based supply chain transparency platform that
          allows users to register products, track shipments, and verify
          authenticity using Ethereum smart contracts.
        </p>
      </section>

      {/* ─── 3. Testnet Disclaimer ───────────────────────────────── */}
      <section className="rounded-2xl border border-accent/20 bg-accent/[0.04] p-6 backdrop-blur-xl">
        <h2 className="mb-3 font-serif text-xl tracking-tight text-accent">
          Testnet Disclaimer
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          <span className="font-semibold text-text">CRITICAL:</span> Veritras
          currently operates on the Ethereum Sepolia testnet. The platform is
          provided for development, testing, and evaluation purposes only. No
          real-world value is associated with testnet transactions. The platform
          should not be used for production supply chain operations.
        </p>
      </section>

      {/* ─── 4. No Warranty ──────────────────────────────────────── */}
      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-xl">
        <h2 className="mb-3 font-serif text-xl tracking-tight text-text">
          No Warranty
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          The service is provided &ldquo;as is&rdquo; without warranties of any
          kind, either express or implied. We do not guarantee uptime, data
          accuracy, or smart contract correctness.
        </p>
      </section>

      {/* ─── 5. Limitation of Liability ──────────────────────────── */}
      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-xl">
        <h2 className="mb-3 font-serif text-xl tracking-tight text-text">
          Limitation of Liability
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          Veritras shall not be liable for any indirect, incidental, special, or
          consequential damages, including but not limited to loss of data, loss
          of goods, or business interruption. This includes any transactions
          made via the platform&rsquo;s smart contracts.
        </p>
      </section>

      {/* ─── 6. Blockchain Risks ─────────────────────────────────── */}
      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-xl">
        <h2 className="mb-3 font-serif text-xl tracking-tight text-text">
          Blockchain Risks
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          Users acknowledge that blockchain transactions are irreversible. Smart
          contracts may contain bugs or vulnerabilities. Gas fees on mainnet (if
          ever deployed) are the user&rsquo;s responsibility.
        </p>
      </section>

      {/* ─── 7. Acceptable Use ───────────────────────────────────── */}
      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-xl">
        <h2 className="mb-3 font-serif text-xl tracking-tight text-text">
          Acceptable Use
        </h2>
        <p className="mb-3 text-sm leading-relaxed text-muted">
          You agree not to:
        </p>
        <ul className="space-y-3 text-sm leading-relaxed text-muted">
          <li>Submit false or misleading product or shipment data.</li>
          <li>
            Attempt to exploit vulnerabilities in the smart contracts or backend.
          </li>
          <li>Use the platform for any unlawful purpose.</li>
          <li>Interfere with other users&rsquo; access to the service.</li>
        </ul>
      </section>

      {/* ─── 8. Intellectual Property ────────────────────────────── */}
      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-xl">
        <h2 className="mb-3 font-serif text-xl tracking-tight text-text">
          Intellectual Property
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          The Veritras platform code is open source. The brand name and logo are
          proprietary.
        </p>
      </section>

      {/* ─── 9. Changes to Terms ─────────────────────────────────── */}
      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-xl">
        <h2 className="mb-3 font-serif text-xl tracking-tight text-text">
          Changes to Terms
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          We reserve the right to modify these terms at any time. Continued use
          of the platform constitutes acceptance of updated terms.
        </p>
      </section>

      {/* ─── 10. Contact ─────────────────────────────────────────── */}
      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-xl">
        <h2 className="mb-3 font-serif text-xl tracking-tight text-text">
          Contact
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          For questions about these terms, contact the project maintainer via
          the GitHub repository.
        </p>
      </section>
    </div>
  )
}
