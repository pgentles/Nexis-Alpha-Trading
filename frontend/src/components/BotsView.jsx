import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Settings, 
  Play, 
  Pause, 
  Terminal, 
  TrendingUp, 
  Cpu, 
  HelpCircle 
} from 'lucide-react';

export default function BotsView({ 
  traders, 
  algoSettings, 
  onUpdateTrader, 
  onAddTrader, 
  onDeleteTrader, 
  onSaveAlgoSettings 
}) {
  const [activeTab, setActiveTab] = useState('copy'); // 'copy' or 'algo'
  const [consoleLogs, setConsoleLogs] = useState([]);
  
  // State for Add Trader Form
  const [newTraderName, setNewTraderName] = useState('');
  const [newTraderAddress, setNewTraderAddress] = useState('');
  const [newTraderChain, setNewTraderChain] = useState('Solana');
  const [newTraderMultiplier, setNewTraderMultiplier] = useState(1.0);
  const [newTraderMaxTrade, setNewTraderMaxTrade] = useState(1000);

  // State for Algo Form
  const [algoStatus, setAlgoStatus] = useState('paused');
  const [algoStrategy, setAlgoStrategy] = useState('RSI_Oversold');
  const [algoTradeSize, setAlgoTradeSize] = useState(250);
  const [algoRsiOversold, setAlgoRsiOversold] = useState(30);
  const [algoRsiOverbought, setAlgoRsiOverbought] = useState(70);
  const [algoStopLoss, setAlgoStopLoss] = useState(3.5);
  const [algoTakeProfit, setAlgoTakeProfit] = useState(10.0);

  // Fetch console logs
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/console');
        const data = await res.json();
        setConsoleLogs(data);
      } catch (err) {
        console.error("Error fetching console logs:", err);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  // Initialize algo settings form
  useEffect(() => {
    if (algoSettings) {
      setAlgoStatus(algoSettings.status);
      setAlgoStrategy(algoSettings.strategy);
      setAlgoTradeSize(algoSettings.tradeSizeUsd);
      setAlgoRsiOversold(algoSettings.rsiOversold);
      setAlgoRsiOverbought(algoSettings.rsiOverbought);
      setAlgoStopLoss(algoSettings.stopLossPercent);
      setAlgoTakeProfit(algoSettings.takeProfitPercent);
    }
  }, [algoSettings]);

  const handleAddTraderSubmit = (e) => {
    e.preventDefault();
    if (!newTraderName || !newTraderAddress) return;
    
    onAddTrader({
      name: newTraderName,
      address: newTraderAddress,
      chain: newTraderChain,
      multiplier: Number(newTraderMultiplier),
      maxTradeUsd: Number(newTraderMaxTrade)
    });

    // Reset
    setNewTraderName('');
    setNewTraderAddress('');
    setNewTraderMultiplier(1.0);
    setNewTraderMaxTrade(1000);
  };

  const handleAlgoSubmit = (e) => {
    e.preventDefault();
    onSaveAlgoSettings({
      status: algoStatus,
      strategy: algoStrategy,
      tradeSizeUsd: Number(algoTradeSize),
      rsiOversold: Number(algoRsiOversold),
      rsiOverbought: Number(algoRsiOverbought),
      stopLossPercent: Number(algoStopLoss),
      takeProfitPercent: Number(algoTakeProfit)
    });
  };

  const toggleAlgoStatus = () => {
    const newStatus = algoStatus === 'active' ? 'paused' : 'active';
    setAlgoStatus(newStatus);
    onSaveAlgoSettings({
      status: newStatus,
      strategy: algoStrategy,
      tradeSizeUsd: Number(algoTradeSize),
      rsiOversold: Number(algoRsiOversold),
      rsiOverbought: Number(algoRsiOverbought),
      stopLossPercent: Number(algoStopLoss),
      takeProfitPercent: Number(algoTakeProfit)
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* View Header with Sub-tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '6px' }}>Bot Configurations</h2>
          <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '14px' }}>Configure whale copy parameters and customize technical indicator triggers.</p>
        </div>
        
        {/* Toggle navigation tabs */}
        <div className="glass-card" style={{ display: 'flex', gap: '8px', padding: '6px 8px', borderRadius: '14px' }}>
          <button 
            className={`btn ${activeTab === 'copy' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '10px' }}
            onClick={() => setActiveTab('copy')}
          >
            Copy Trading Bot
          </button>
          <button 
            className={`btn ${activeTab === 'algo' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '10px' }}
            onClick={() => setActiveTab('algo')}
          >
            Custom Algorithmic Bot
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Side: Specific Config Tab */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {activeTab === 'copy' ? (
            <>
              {/* Copy Traders Configuration */}
              <div className="glass-card">
                <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Target Whale Wallets
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {traders.map((trader) => (
                    <div 
                      key={trader.id}
                      style={{ 
                        border: '1px solid var(--glass-border)', 
                        borderRadius: '16px', 
                        padding: '16px',
                        background: 'rgba(255,255,255,0.01)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontWeight: 600, fontSize: '16px' }}>{trader.name}</span>
                            <span className={`badge ${trader.status === 'active' ? 'badge-active' : 'badge-paused'}`}>
                              {trader.status.toUpperCase()}
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                            {trader.address} ({trader.chain})
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => onUpdateTrader(trader.id, { status: trader.status === 'active' ? 'paused' : 'active' })}
                          >
                            {trader.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                          </button>
                          <button 
                            className="btn btn-danger btn-sm"
                            style={{ padding: '8px 10px' }}
                            onClick={() => onDeleteTrader(trader.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      
                      {/* Configuration values */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '12px', fontSize: '13px' }}>
                        <div>
                          <div style={{ color: 'hsl(var(--text-secondary))', marginBottom: '4px' }}>Multiplier</div>
                          <input 
                            type="number" 
                            step="0.1" 
                            style={{ padding: '6px 10px', fontSize: '13px', width: '80px' }}
                            value={trader.multiplier} 
                            onChange={(e) => onUpdateTrader(trader.id, { multiplier: Number(e.target.value) })}
                          />
                        </div>
                        <div>
                          <div style={{ color: 'hsl(var(--text-secondary))', marginBottom: '4px' }}>Max Order size</div>
                          <input 
                            type="number" 
                            style={{ padding: '6px 10px', fontSize: '13px', width: '100px' }}
                            value={trader.maxTradeUsd} 
                            onChange={(e) => onUpdateTrader(trader.id, { maxTradeUsd: Number(e.target.value) })}
                          />
                          <span style={{ fontSize: '10px', color: 'hsl(var(--text-muted))', marginLeft: '4px' }}>USD</span>
                        </div>
                        <div>
                          <div style={{ color: 'hsl(var(--text-secondary))', marginBottom: '4px' }}>Est. Performance</div>
                          <div style={{ fontWeight: 600, color: 'hsl(var(--success))', fontFamily: 'var(--font-mono)', marginTop: '6px' }}>
                            {trader.winRate}% WR / +${trader.totalProfitUsd.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Trader Form */}
              <div className="glass-card">
                <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Add Target Whale Wallet</h3>
                <form onSubmit={handleAddTraderSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Wallet Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Smart Money Solana Address" 
                      value={newTraderName}
                      onChange={(e) => setNewTraderName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Wallet Address</label>
                    <input 
                      type="text" 
                      placeholder="Enter raw address (0x... or SOL address)" 
                      value={newTraderAddress}
                      onChange={(e) => setNewTraderAddress(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Network</label>
                    <select value={newTraderChain} onChange={(e) => setNewTraderChain(e.target.value)}>
                      <option value="Solana">Solana (Jupiter routing)</option>
                      <option value="Ethereum">Ethereum (Uniswap routing)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Multiplier</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={newTraderMultiplier}
                      onChange={(e) => setNewTraderMultiplier(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Max trade limit per swap (USD)</label>
                    <input 
                      type="number" 
                      value={newTraderMaxTrade}
                      onChange={(e) => setNewTraderMaxTrade(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ gridColumn: 'span 2', justifyContent: 'center' }}>
                    <Plus size={16} /> Connect Address & Copy
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* Algorithmic Settings View */
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Cpu size={18} /> Algorithmic strategy settings
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))' }}>
                    {algoStatus === 'active' ? 'Trading Enabled' : 'Trading Disabled'}
                  </span>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={algoStatus === 'active'} 
                      onChange={toggleAlgoStatus}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              <form onSubmit={handleAlgoSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Trading Strategy</label>
                    <select value={algoStrategy} onChange={(e) => setAlgoStrategy(e.target.value)}>
                      <option value="RSI_Oversold">RSI Oversold/Overbought (Mean Reversion)</option>
                      <option value="SMA_Crossover">Double SMA Crossover (Trend Following)</option>
                      <option value="MACD_Momentum">MACD Signal Line Cross (Momentum)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Trade Allocation Size (USD)</label>
                    <input 
                      type="number" 
                      value={algoTradeSize}
                      onChange={(e) => setAlgoTradeSize(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '20px' }}>
                  <h4 style={{ fontSize: '14px', marginBottom: '16px', color: 'hsl(var(--text-secondary))' }}>Strategy Threshold Rules</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label>RSI Oversold Level (BUY)</label>
                      <input 
                        type="number" 
                        value={algoRsiOversold}
                        onChange={(e) => setAlgoRsiOversold(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>RSI Overbought Level (SELL)</label>
                      <input 
                        type="number" 
                        value={algoRsiOverbought}
                        onChange={(e) => setAlgoRsiOverbought(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '20px' }}>
                  <h4 style={{ fontSize: '14px', marginBottom: '16px', color: 'hsl(var(--text-secondary))' }}>Risk Management Rules</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label>Stop Loss Percent (%)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={algoStopLoss}
                        onChange={(e) => setAlgoStopLoss(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Take Profit Percent (%)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={algoTakeProfit}
                        onChange={(e) => setAlgoTakeProfit(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
                  Save and Apply Rules
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Side: Live Logs Terminal */}
        <div className="glass-card" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={18} /> Bot Console Terminal
          </h3>
          <div className="terminal-window" style={{ flexGrow: 1 }}>
            {consoleLogs.length === 0 ? (
              <div className="terminal-line" style={{ color: 'hsl(var(--text-muted))' }}>Listening for live RPC ticks...</div>
            ) : (
              consoleLogs.map((log, idx) => (
                <div key={idx} className="terminal-line">
                  <span className="terminal-time">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="terminal-msg" style={{ 
                    color: log.message.includes('Executed') ? 'hsl(var(--success))' : 
                           log.message.includes('failed') || log.message.includes('skipped') ? 'hsl(var(--danger))' :
                           log.message.includes('Alert') ? 'hsl(var(--accent))' : '#e2e8f0'
                  }}>
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'hsl(var(--text-muted))', marginTop: '12px' }}>
            <span className="glow-dot glow-dot-pulse"></span> Streaming real-time micro logs from Node.js Engine
          </div>
        </div>

      </div>
    </div>
  );
}
