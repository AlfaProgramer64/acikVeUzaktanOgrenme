/**
 * Button – Yeniden kullanılabilir buton bileşeni.
 *
 * Props:
 *  variant  : 'primary' | 'secondary' | 'ghost' | 'danger'
 *  size     : 'sm' | 'md' | 'lg'
 *  fullWidth: boolean
 *  loading  : boolean
 *  icon     : ReactNode (solda görünür)
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon = null,
  className = '',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-bold rounded-xl ' +
    'transition-all duration-200 active:scale-95 select-none cursor-pointer ' +
    'disabled:opacity-50 disabled:cursor-not-allowed';

  const sizes = {
    sm:  'px-4 py-2 text-sm',
    md:  'px-6 py-3 text-base',
    lg:  'px-8 py-4 text-lg',
  };

  const variants = {
    primary:
      'text-white bg-gradient-to-r from-blue-600 to-cyan-500 ' +
      'shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5',
    secondary:
      'text-slate-700 bg-white border border-slate-200 ' +
      'hover:bg-slate-50 hover:border-slate-300',
    ghost:
      'text-slate-600 hover:text-blue-600 hover:bg-blue-50',
    danger:
      'text-white bg-gradient-to-r from-rose-600 to-red-500 ' +
      'shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 hover:-translate-y-0.5',
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : icon}
      {children}
    </button>
  );
}
