'use client'

export function Card({ title, subtitle, icon: Icon, action, children }) {
  return (
    <div className="rounded-2xl bg-white shadow-sm border border-slate-200">
      <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-slate-100">
        <div className="flex items-start gap-3">
          {Icon ? (
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 border border-violet-100">
              <Icon size={18} className="text-violet-700" />
            </span>
          ) : null}
          <div>
            <div className="text-sm font-semibold text-slate-900">{title}</div>
            {subtitle ? <div className="text-xs text-slate-500">{subtitle}</div> : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

export function Field({ label, required, hintRight, children }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700">
          {label}{required ? <span className="text-red-500"> *</span> : null}
        </label>
        {hintRight ? <span className="text-[11px] text-slate-400">{hintRight}</span> : null}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  )
}

export function TextInput(props) {
  const {
    left,
    className = '',
    ...rest
  } = props

  return (
    <div className="relative">
      {left ? (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{left}</span>
      ) : null}
      <input
        {...rest}
        className={
          'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 ' +
          (left ? 'pl-10 ' : '') +
          className
        }
      />
    </div>
  )
}

export function SelectInput(props) {
  const { className = '', children, ...rest } = props
  return (
    <select
      {...rest}
      className={
        'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 ' +
        className
      }
    >
      {children}
    </select>
  )
}

export function Textarea(props) {
  const { className = '', ...rest } = props
  return (
    <textarea
      {...rest}
      className={
        'w-full min-h-[110px] resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 ' +
        className
      }
    />
  )
}

export function PrimaryButton({ children, className = '', ...rest }) {
  return (
    <button
      {...rest}
      className={
        'inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed ' +
        className
      }
    >
      {children}
    </button>
  )
}

export function SecondaryButton({ children, className = '', ...rest }) {
  return (
    <button
      {...rest}
      className={
        'inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 ' +
        className
      }
    >
      {children}
    </button>
  )
}

export function IconInput({ icon: Icon, ...props }) {
  return <TextInput left={<Icon size={16} />} {...props} />
}

export function RupeeInput(props) {
  return <TextInput left={<span className="text-sm">₹</span>} inputMode="decimal" {...props} />
}
