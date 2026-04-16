import React, { useState, useEffect } from 'react';
import { ShieldCheck, Target, AlertTriangle, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const mockLedgerScan = [
  { month: 'Jan', inflow: 85000, outflow: 62000, balance: 23000 },
  { month: 'Feb', inflow: 85000, outflow: 68000, balance: 17000 },
  { month: 'Mar', inflow: 88000, outflow: 71000, balance: 17000 },
  { month: 'Apr', inflow: 85000, outflow: 80000, balance: 5000 }, // Spike -> Leak
];

const mockGhostSubscriptions = [
  { id: 1, name: 'Spotify Premium', amount: 119, dates: ['02-Feb', '02-Mar', '02-Apr'], risk: 'Low' },
  { id: 2, name: 'Unknown "Fintrax" Charge', amount: 899, dates: ['14-Jan', '14-Feb', '14-Mar', '14-Apr'], risk: 'High' },
  { id: 3, name: 'Gym Membership', amount: 1500, dates: ['28-Feb', '28-Mar'], risk: 'Medium' }
];

export default function LedgerPage() {
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setScanning(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (scanning) {
    return (
      <div className="container mt-12 text-center">
        <ActivityIndicator />
        <h2 className="text-xl mt-6 gradient-text animate-pulse">Running Ledger Intelligence Scan...</h2>
        <p className="text-muted mt-2">Checking double-entry validation and scanning for ghost subscriptions.</p>
      </div>
    );
  }

  return (
    <div className="container mt-8">
      <div className="flex justify-between items-center mb-6">
         <h1 className="text-2xl">Ledger Analysis Report</h1>
         <button className="btn btn-outline text-success" style={{ borderColor: 'var(--accent-success)' }}>
            <ShieldCheck size={18} /> Audit Passed
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="glass-panel text-center">
           <h3 className="text-muted text-sm mb-4">Cash-Flow Integrity Score</h3>
           <div className="text-5xl font-bold gradient-text">84/100</div>
           <p className="text-sm mt-4">We found perfect matching for IN vs OUT, but you have 1 concerning high-risk recurring charge.</p>
        </div>
        <div className="glass-panel">
           <h3 className="font-bold mb-4 flex items-center gap-2">
              <Target size={20} className="text-accent-secondary" /> 
              Net Cash-Flow Trajectory
           </h3>
           <div style={{ height: '150px' }}>
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={mockLedgerScan}>
                  <defs>
                    <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={{ backgroundColor: '#1a1e26', borderColor: '#10b981' }} />
                  <Area type="monotone" dataKey="balance" stroke="#10b981" fillOpacity={1} fill="url(#colorBal)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

      <h2 className="text-xl mb-4 text-warning">Detected Ghost Subscriptions</h2>
      <div className="grid grid-cols-1 gap-4">
        {mockGhostSubscriptions.map(sub => (
          <div key={sub.id} className="glass-panel flex justify-between items-center hover-scale transition-all" style={{ borderLeft: sub.risk === 'High' ? '4px solid var(--accent-danger)' : '1px solid var(--border-light)' }}>
             <div>
                <h4 className="font-bold text-lg">{sub.name}</h4>
                <p className="text-sm text-muted mt-1">Hits on: {sub.dates.join(', ')}</p>
             </div>
             <div className="text-right">
                <div className="text-xl font-bold mb-1">₹{sub.amount} <span className="text-sm font-normal text-muted">/ mo</span></div>
                {sub.risk === 'High' ? (
                   <span className="flex items-center gap-1 text-xs text-danger"><AlertTriangle size={12}/> High Risk - Unknown</span>
                ) : (
                   <span className="text-xs text-success">Verified</span>
                )}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityIndicator() {
  return (
    <div className="inline-block relative w-20 h-20">
      <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-accent-primary border-r-transparent border-b-accent-secondary border-l-transparent animate-spin"></div>
    </div>
  );
}
