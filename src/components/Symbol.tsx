interface SymbolProps {
  size: number
}

export function Symbol({ size }: SymbolProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={size}
      height={size}
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <rect width="48" height="48" rx="12" fill="#15171C" />
      <rect x="8" y="21.25" width="32" height="5.5" rx="2.75" fill="#FFFFFF" />
      <rect x="13" y="13" width="5.5" height="22" rx="2.75" fill="#FFFFFF" />
      <rect x="29.5" y="13" width="5.5" height="22" rx="2.75" fill="#FFFFFF" />
    </svg>
  )
}
