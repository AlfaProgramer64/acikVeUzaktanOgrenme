/**
 * Card – Glassmorphism kart bileşeni.
 *
 * Props:
 *  glow   : 'blue' | 'sky' | 'indigo' | 'emerald' | 'amber' | false
 *  hover  : boolean (hover lift efekti)
 *  padding: 'sm' | 'md' | 'lg'
 */
export default function Card({
  children,
  glow = false,
  hover = false,
  padding = 'md',
  className = '',
  ...props
}) {
  const paddings = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const glows = {
    blue:    'shadow-[0_0_30px_rgba(59,130,246,0.2)]',
    sky:     'shadow-[0_0_30px_rgba(14,165,233,0.2)]',
    indigo:  'shadow-[0_0_30px_rgba(79,70,229,0.2)]',
    emerald: 'shadow-[0_0_30px_rgba(16,185,129,0.2)]',
    amber:   'shadow-[0_0_30px_rgba(245,158,11,0.2)]',
  };

  return (
    <div
      className={[
        'glass rounded-2xl',
        paddings[padding],
        hover ? 'card-lift cursor-pointer' : '',
        glow && glows[glow] ? glows[glow] : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}
