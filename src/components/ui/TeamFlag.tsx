'use client'
import Image from 'next/image'

interface TeamFlagProps {
  name: string
  flagUrl: string | null
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: { img: 24, cls: 'w-6 h-4' },
  md: { img: 40, cls: 'w-10 h-7' },
  lg: { img: 64, cls: 'w-16 h-11' },
}

export function TeamFlag({ name, flagUrl, size = 'md' }: TeamFlagProps) {
  const { img, cls } = sizes[size]
  if (!flagUrl) return <span className={`${cls} bg-[#334155] rounded-sm inline-block`} aria-hidden />

  return (
    <span
      className={`${cls} inline-block rounded-sm overflow-hidden shadow-md shrink-0 border border-white/10`}
      style={{ display: 'inline-block' }}
    >
      <Image
        src={flagUrl}
        alt={`Drapeau ${name}`}
        width={img}
        height={Math.round(img * 0.67)}
        className="w-full h-full object-cover"
        unoptimized
      />
    </span>
  )
}
