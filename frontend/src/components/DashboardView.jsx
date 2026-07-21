import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Activity, 
  Cpu 
} from 'lucide-react';

export default function DashboardView({ portfolioData, algoSettings, traders }) {
  if (!portfolioData) return <div className="glass-card">Loading terminal metrics...</div>;

  const { portfolio, performanceHistory } = portfolioData;

  const activeTradersCount = traders.filter(t => t.status === 'active').length;
  const isAlgoActive = algoSettings?.status === 'active';

  // Custom tooltips for the chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card" style={{ padding: '10px 14px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ fontSize: '11px', color: '#94a3b8' }}>{payload[0].payload.date}</p>
          <p style={{ fontWeight: 'bold', color: '#fff', fontSize: '14px', marginTop: '4px' }}>
            ${payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '6px' }}>Terminal Hub</h2>
        <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '14px' }}>Real-time overview of assets and automated copy strategies.</p>
      </div>

      {/* Metric Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        
        {/* Total Assets Card */}
        <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.05, transform: 'scale(1.5)' }}>
            <Wallet size={120} />
          </div>
          <div className="card-title">
            <Wallet size={16} /> Total Asset Valuation
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, margin: '10px 0', fontFamily: 'var(--font-mono)' }}>
            ${portfolio.totalValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
            {portfolio.pnl24hUsd >= 0 ? (
              <span className="text-success" style={{ display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}>
                <TrendingUp size={16} /> +${portfolio.pnl24hUsd.toFixed(2)} (+{portfolio.pnl24hPercent}%)
              </span>
            ) : (
              <span className="text-danger" style={{ display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}>
                <TrendingDown size={16} /> -${Math.abs(portfolio.pnl24hUsd).toFixed(2)} ({portfolio.pnl24hPercent}%)
              </span>
            )}
            <span style={{ color: 'hsl(var(--text-muted))' }}>24h change</span>
          </div>
        </div>

        {/* Copy Bot Card */}
        <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.05, transform: 'scale(1.5)' }}>
            <Activity size={120} />
          </div>
          <div className="card-title">
            <Activity size={16} /> Copy Trader Bot
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, margin: '10px 0', fontFamily: 'var(--font-mono)' }}>
            {activeTradersCount} <span style={{ fontSize: '16px', fontWeight: 500, color: 'hsl(var(--text-secondary))' }}>Active Whales</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`badge ${activeTradersCount > 0 ? 'badge-active' : 'badge-paused'}`}>
              {activeTradersCount > 0 ? (
                <>
                  <span className="glow-dot glow-dot-pulse"></span>
                  FOLLOWING
                </>
              ) : 'INACTIVE'}
            </span>
          </div>
        </div>

        {/* Algo Trading Card */}
        <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.05, transform: 'scale(1.5)' }}>
            <Cpu size={120} />
          </div>
          <div className="card-title">
            <Cpu size={16} /> Custom Algorithmic Bot
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, margin: '10px 0', fontFamily: 'var(--font-mono)' }}>
            {isAlgoActive ? 'RUNNING' : 'STANDBY'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`badge ${isAlgoActive ? 'badge-active' : 'badge-paused'}`}>
              {isAlgoActive ? (
                <>
                  <span className="glow-dot glow-dot-pulse" style={{ backgroundColor: 'cyan', boxShadow: '0 0 10px cyan' }}></span>
                  {algoSettings?.strategy.replace('_', ' ')}
                </>
              ) : 'PAUSED'}
            </span>
          </div>
        </div>

      </div>

      {/* Main Charts & Balances Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '24px' }}>
        
        {/* Performance Chart Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '400px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            PnL Performance Curve
          </h3>
          <div style={{ flexGrow: 1, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--text-muted))" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="hsl(var(--text-muted))" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `$${val/1000}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Balances Card */}
        <div className="glass-card">
          <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Wallet Asset Balances</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {portfolio.balances.map((wallet) => (
              <div 
                key={wallet.id}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '16px',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.03)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '15px' }}>{wallet.name}</div>
                  <div style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                    {wallet.address}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '16px', fontFamily: 'var(--font-mono)' }}>
                    {wallet.balance.toLocaleString()} {wallet.symbol}
                  </div>
                  <div style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', marginTop: '4px' }}>
                    ${wallet.valueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
