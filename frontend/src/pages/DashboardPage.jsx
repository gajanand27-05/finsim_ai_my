import React from 'react';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

const mockSpendData = [
  { name: 'Food', value: 3200, color: '#3b82f6' },
  { name: 'Transport', value: 800, color: '#8b5cf6' },
  { name: 'Shopping', value: 1500, color: '#10b981' },
];

const mockTrendData = [
  { day: '01', spend: 0, budget: 150 },
  { day: '05', spend: 800, budget: 150 },
  { day: '10', spend: 1200, budget: 150 },
  { day: '15', spend: 2300, budget: 150 },
  { day: '20', spend: 3500, budget: 150 },
  { day: '25', spend: 4000, budget: 150 },
];

export default function DashboardPage() {
  return (
    <div className="container mt-8">
      <h1 className="text-2xl mb-6">Financial Overview</h1>
      
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel">
          <h3 className="text-muted text-sm mb-2">Total Monthly Spend</h3>
          <p className="text-3xl font-bold">₹5,500</p>
          <p className="text-xs text-muted mt-2">vs Budget (₹10,000)</p>
        </div>
        <div className="glass-panel">
          <h3 className="text-muted text-sm mb-2 flex items-center justify-between">
            Remaining Budget
            <ShieldCheck size={18} className="text-success" />
          </h3>
          <p className="text-3xl font-bold text-success">₹4,500</p>
          <div className="w-full bg-[rgba(0,0,0,0.3)] h-2 rounded-full mt-3 overflow-hidden">
             <div className="bg-success h-full" style={{ width: '55%' }}></div>
          </div>
        </div>
        <div className="glass-panel" style={{ borderColor: 'var(--border-focus)' }}>
          <h3 className="text-muted text-sm mb-2 flex items-center justify-between">
            AI Insight
            <Activity size={18} className="text-accent-primary" />
          </h3>
          <p className="text-md text-active leading-tight">
            You're spending 25% more on Weekends compared to last month. Watch out for impulse food deliveries!
          </p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel lg:col-span-2 relative">
          <h3 className="font-bold mb-6">Spending Trend vs Run-rate</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockTrendData}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#8892b0" fill="#8892b0" />
                <YAxis stroke="#8892b0" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1e26', borderColor: '#3b82f6' }} />
                <Area type="monotone" dataKey="spend" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSpend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          {/* Mock Pre-Spend Warning Overlay Demo */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[rgba(0,0,0,0.8)] p-6 rounded-xl border border-accent-warning text-center backdrop-blur-md hidden">
             <AlertTriangle className="mx-auto text-accent-warning mb-2" size={32} />
             <h3 className="text-lg font-bold text-active">Pre-Spend Warning</h3>
             <p className="text-sm text-muted mt-2">This swiggy order pushes you 110% over food budget!</p>
             <div className="mt-4 flex gap-2 justify-center">
                <button className="btn btn-outline" style={{ borderColor: 'var(--accent-warning)', color: 'var(--accent-warning)' }}>Cancel</button>
                <button className="btn text-muted hover:text-active">Ignore</button>
             </div>
          </div>
        </div>

        <div className="glass-panel text-center">
          <h3 className="font-bold mb-6">Category Breakdown</h3>
          <div style={{ height: '240px', width: '100%', display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockSpendData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {mockSpendData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1a1e26', borderColor: '#ffffff20' }} itemStyle={{ color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2 mt-4">
             {mockSpendData.map(c => (
                <div key={c.name} className="flex justify-between items-center text-sm">
                   <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }}></div>
                      <span className="text-muted">{c.name}</span>
                   </div>
                   <span className="font-bold">₹{c.value.toLocaleString()}</span>
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
