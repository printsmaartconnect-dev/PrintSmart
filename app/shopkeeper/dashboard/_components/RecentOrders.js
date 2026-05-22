'use client'

import { MoveRight } from 'lucide-react'
import OrderCard from './OrderCard'

function EmptyState({ activeFilter }) {
  const label = activeFilter === 'All' ? 'orders' : `${activeFilter.toLowerCase()} orders`

  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
      <div className="text-base font-extrabold text-slate-900">No {label} found.</div>
      <p className="mt-2 text-sm text-slate-500">
        Try another filter from the dock to view a different order status.
      </p>
    </div>
  )
}

export default function RecentOrders({ orders, activeFilter = 'All' }) {
  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-extrabold text-slate-900">Recent Orders</h2>
        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-800"
        >
          View All Orders <MoveRight size={16} />
        </button>
      </div>

      <div className="mt-4">
        {orders.length === 0 ? (
          <EmptyState activeFilter={activeFilter} />
        ) : (
          <div className="flex gap-5 overflow-x-auto pb-2 pr-2">
            {orders.map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
