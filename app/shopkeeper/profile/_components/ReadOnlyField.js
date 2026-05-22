'use client'

export function ReadOnlyBox({ value, placeholder = '—', className = '' }) {
  const text = value == null || String(value).trim().length === 0 ? placeholder : String(value)
  return (
    <div
      className={
        'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-800 ' +
        className
      }
    >
      {text}
    </div>
  )
}

export function ReadOnlyTextarea({ value, placeholder = '—', className = '' }) {
  const text = value == null || String(value).trim().length === 0 ? placeholder : String(value)
  return (
    <div
      className={
        'w-full whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-800 ' +
        className
      }
    >
      {text}
    </div>
  )
}

export function ReadOnlyIconBox({ icon: Icon, value, placeholder, className = '' }) {
  return (
    <div
      className={
        'flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-800 ' +
        className
      }
    >
      {Icon ? (
        <span className="text-slate-400">
          <Icon size={16} />
        </span>
      ) : null}
      <span className="truncate">{value == null || String(value).trim().length === 0 ? placeholder || '—' : String(value)}</span>
    </div>
  )
}
