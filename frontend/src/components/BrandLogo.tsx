import crystalLogo from '@/assets/veritras-crystal-logo-512.png'

type BrandLogoProps = {
  className?: string
  label?: string
  decorative?: boolean
}

export default function BrandLogo({
  className = '',
  label = 'Veritras crystal logo',
  decorative = false,
}: BrandLogoProps) {
  return (
    <span className={`relative inline-grid place-items-center ${className}`}>
      <span
        aria-hidden="true"
        className="absolute inset-[18%] rounded-full bg-accent/20 blur-md"
      />
      <img
        src={crystalLogo}
        alt={decorative ? '' : label}
        aria-hidden={decorative ? true : undefined}
        className="relative h-full w-full object-contain drop-shadow-[0_0_18px_rgba(200,240,96,0.3)]"
      />
    </span>
  )
}
