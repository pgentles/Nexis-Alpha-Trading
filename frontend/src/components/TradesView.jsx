import React from 'react';
import { ExternalLink, XCircle, RefreshCw } from 'lucide-react';

export default function TradesView({ trades, onCloseTrade, onRefresh }) {
  
  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '6px' }}>Trade Execution Logs</h2>
          <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '14px' }}>Complete database of all orders executed manually, via copy-trading, or indicators.</p>
        </div>
        <button className="btn btn-secondary" onClick={onRefresh} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={14} /> Refresh Logs
        </button>
      </div>

      <div className="glass-card" style={{ padding: '8px', overflowX: 'auto' }}>
        {trades.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>
            No trades recorded in database log.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date/Time</th>
                <th>Type</th>
                <th>Source</th>
                <th>Pair</th>
                <th>Side</th>
                <th>Quantity</th>
                <th>Entry Price</th>
                <th>Exit Price</th>
                <th>Value (USD)</th>
                <th>PnL (%)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => {
                const isBuy = trade.direction === "BUY";
                const isOpen = trade.status === "OPEN";
                const pnlClass = trade.pnlUsd >= 0 ? "text-success" : "text-danger";
                
                return (
                  <tr key={trade.id}>
                    <td style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))' }}>
                      {formatDate(trade.timestamp)}
                    </td>
                    <td>
                      <span className="badge" style={{ 
                        background: trade.type === 'COPY' ? 'rgba(147, 51, 234, 0.1)' : 'rgba(6, 182, 212, 0.1)',
                        color: trade.type === 'COPY' ? 'hsl(var(--primary))' : 'hsl(var(--secondary))',
                        border: `1px solid ${trade.type === 'COPY' ? 'rgba(147, 51, 234, 0.2)' : 'rgba(6, 182, 212, 0.2)'}`
                      }}>
                        {trade.type}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{trade.traderName}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{trade.pair}</td>
                    <td>
                      <span style={{ 
                        color: isBuy ? 'hsl(var(--success))' : 'hsl(var(--danger))',
                        fontWeight: 700 
                      }}>
                        {trade.direction}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>
                      {trade.amount}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>
                      ${trade.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>
                      {trade.exitPrice ? 
                        `$${trade.exitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 
                        '-'
                      }
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>
                      ${trade.valueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span className={`${pnlClass} font-mono`} style={{ fontWeight: 600 }}>
                        {trade.pnlUsd >= 0 ? '+' : ''}{trade.pnlUsd.toFixed(2)} ({trade.pnlPercent >= 0 ? '+' : ''}{trade.pnlPercent}%)
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${isOpen ? 'badge-active' : 'badge-paused'}`}>
                        {isOpen ? 'OPEN' : 'CLOSED'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {isOpen && (
                          <button 
                            className="btn btn-secondary btn-sm" 
                            style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.2)', color: 'hsl(var(--danger))' }}
                            onClick={() => onCloseTrade(trade.id)}
                          >
                            <XCircle size={13} /> Exit Trade
                          </button>
                        )}
                        <a 
                          href={trade.chain === 'Solana' ? `https://solscan.io/tx/${trade.hash}` : `https://etherscan.io/tx/${trade.hash}`} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', padding: '6px', borderRadius: '8px', border: '1px solid var(--glass-border)', color: 'hsl(var(--text-secondary))', textDecoration: 'none' }}
                        >
                          <ExternalLink size={13} />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
