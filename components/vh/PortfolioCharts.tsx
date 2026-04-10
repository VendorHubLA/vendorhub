'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadialBarChart, RadialBar, Legend,
} from 'recharts'

const STATUS_COLORS: Record<string, string> = {
  active:    '#C4A35A',
  draft:     '#9CA3AF',
  on_hold:   '#F59E0B',
  completed: '#2E5A40',
  cancelled: '#EF4444',
}

interface Props {
  spendByProperty: { name: string; spent: number }[]
  projectStatusData: { status: string; count: number }[]
  topVendors: { name: string; score: number }[]
  totalBudget: number
  totalSpent: number
  totalMilestonePaid: number
}

export function PortfolioCharts({
  spendByProperty,
  projectStatusData,
  topVendors,
  totalBudget,
  totalSpent,
  totalMilestonePaid,
}: Props) {
  const budgetRemaining = Math.max(0, totalBudget - totalSpent)
  const donutData = [
    { name: 'Spent',     value: totalSpent,     fill: '#C4A35A' },
    { name: 'Remaining', value: budgetRemaining, fill: '#EDE6D8' },
  ]

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Spend by property */}
      <div className="lg:col-span-2 rounded-xl border border-[#D6CCBC] bg-white p-5">
        <h2 className="text-sm font-semibold text-[#1E3829] mb-4">Spend by Property</h2>
        {spendByProperty.length ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={spendByProperty} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Spent']}
                contentStyle={{ borderRadius: 8, border: '1px solid #D6CCBC', fontSize: 12 }}
              />
              <Bar dataKey="spent" fill="#C4A35A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[220px] flex items-center justify-center text-sm text-gray-400">
            No spend data yet
          </div>
        )}
      </div>

      {/* Budget donut */}
      <div className="rounded-xl border border-[#D6CCBC] bg-white p-5">
        <h2 className="text-sm font-semibold text-[#1E3829] mb-4">Budget Utilization</h2>
        {totalBudget > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={70}
                  dataKey="value" strokeWidth={0}>
                  {donutData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`}
                  contentStyle={{ borderRadius: 8, border: '1px solid #D6CCBC', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1 mt-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Spent</span>
                <span className="font-semibold text-[#C4A35A]">${totalSpent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Remaining</span>
                <span className="font-semibold text-[#1E3829]">${budgetRemaining.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Milestone Paid</span>
                <span className="font-semibold text-[#2E5A40]">${totalMilestonePaid.toLocaleString()}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-sm text-gray-400">
            No budget data
          </div>
        )}
      </div>

      {/* Project status breakdown */}
      <div className="rounded-xl border border-[#D6CCBC] bg-white p-5">
        <h2 className="text-sm font-semibold text-[#1E3829] mb-4">Projects by Status</h2>
        {projectStatusData.length ? (
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={projectStatusData} cx="50%" cy="50%" outerRadius={70}
                dataKey="count" nameKey="status" strokeWidth={0}>
                {projectStatusData.map((entry, i) => (
                  <Cell key={i} fill={STATUS_COLORS[entry.status] ?? '#9CA3AF'} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #D6CCBC', fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[180px] flex items-center justify-center text-sm text-gray-400">
            No projects yet
          </div>
        )}
      </div>

      {/* Top vendors by score */}
      <div className="lg:col-span-2 rounded-xl border border-[#D6CCBC] bg-white p-5">
        <h2 className="text-sm font-semibold text-[#1E3829] mb-4">Top Vendors by Performance Score</h2>
        {topVendors.length ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={topVendors} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#6B7280' }}
                axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }}
                axisLine={false} tickLine={false} width={110} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #D6CCBC', fontSize: 12 }} />
              <Bar dataKey="score" fill="#2E5A40" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[180px] flex items-center justify-center text-sm text-gray-400">
            No vendor scores yet
          </div>
        )}
      </div>
    </div>
  )
}
