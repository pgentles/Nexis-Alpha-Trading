import React, { useState, useEffect } from 'react';
import { Shield, Key, Globe, CheckCircle, AlertTriangle } from 'lucide-react';

export default function IntegrationsView({ integrations, onSaveIntegrations }) {
  const [binanceEnabled, setBinanceEnabled] = useState(false);
  const [binanceKey, setBinanceKey] = useState('');
  const [binanceSecret, setBinanceSecret] = useState('');

  const [coinbaseEnabled, setCoinbaseEnabled] = useState(false);
  const [coinbaseKey, setCoinbaseKey] = useState('');
  const [coinbaseSecret, setCoinbaseSecret] = useState('');

  const [solanaUrl, setSolanaUrl] = useState('');
  const [ethereumUrl, setEthereumUrl] = useState('');

  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (integrations) {
      setBinanceEnabled(integrations.binance.enabled);
      setBinanceKey(integrations.binance.apiKey);
      setBinanceSecret(integrations.binance.apiSecret);

      setCoinbaseEnabled(integrations.coinbase.enabled);
      setCoinbaseKey(integrations.coinbase.apiKey);
      setCoinbaseSecret(integrations.coinbase.apiSecret);

      setSolanaUrl(integrations.solanaRpc.url);
      setEthereumUrl(integrations.ethereumRpc.url);
    }
  }, [integrations]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveIntegrations({
      binance: { enabled: binanceEnabled, apiKey: binanceKey, apiSecret: binanceSecret },
      coinbase: { enabled: coinbaseEnabled, apiKey: coinbaseKey, apiSecret: coinbaseSecret },
      solanaRpc: { enabled: true, url: solanaUrl },
      ethereumRpc: { enabled: true, url: ethereumUrl }
    });
    
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '6px' }}>API & RPC Integrations</h2>
        <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '14px' }}>Connect trading APIs and Web3 provider nodes. Credentials are stored encrypted locally.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '24px', alignItems: 'start' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* RPC Integration Card */}
          <div className="glass-card">
            <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={18} /> Web3 Node RPC Providers
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Solana Mainnet RPC Connection</label>
                <input 
                  type="text" 
                  value={solanaUrl} 
                  onChange={(e) => setSolanaUrl(e.target.value)}
                  placeholder="https://api.mainnet-beta.solana.com"
                  required
                />
                <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>
                  Used by Jupiter aggregator routing for low-latency swaps.
                </span>
              </div>
              <div className="form-group">
                <label>Ethereum RPC Endpoint (Infura/Alchemy/QuickNode)</label>
                <input 
                  type="text" 
                  value={ethereumUrl} 
                  onChange={(e) => setEthereumUrl(e.target.value)}
                  placeholder="https://mainnet.infura.io/v3/YOUR_KEY"
                  required
                />
                <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>
                  Used to fetch mempool updates and submit swaps.
                </span>
              </div>
            </div>
          </div>

          {/* CEX API Keys Card */}
          <div className="glass-card">
            <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={18} /> Centralized Exchanges (CEX)
            </h3>
            
            {/* Binance API */}
            <div style={{ paddingBottom: '20px', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontWeight: 600, fontSize: '16px' }}>Binance Global API</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={binanceEnabled} 
                    onChange={() => setBinanceEnabled(!binanceEnabled)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              {binanceEnabled && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group">
                    <label>Binance API Key</label>
                    <input 
                      type="password" 
                      value={binanceKey} 
                      onChange={(e) => setBinanceKey(e.target.value)}
                      placeholder="Enter Binance API key..."
                    />
                  </div>
                  <div className="form-group">
                    <label>Binance Secret Key</label>
                    <input 
                      type="password" 
                      value={binanceSecret} 
                      onChange={(e) => setBinanceSecret(e.target.value)}
                      placeholder="Enter Binance Secret..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Coinbase API */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontWeight: 600, fontSize: '16px' }}>Coinbase Advanced Trade</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={coinbaseEnabled} 
                    onChange={() => setCoinbaseEnabled(!coinbaseEnabled)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              {coinbaseEnabled && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group">
                    <label>Coinbase API Key</label>
                    <input 
                      type="password" 
                      value={coinbaseKey} 
                      onChange={(e) => setCoinbaseKey(e.target.value)}
                      placeholder="Enter Coinbase API key..."
                    />
                  </div>
                  <div className="form-group">
                    <label>Coinbase API Secret</label>
                    <input 
                      type="password" 
                      value={coinbaseSecret} 
                      onChange={(e) => setCoinbaseSecret(e.target.value)}
                      placeholder="Enter Coinbase API secret..."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '14px 28px' }}>
              Save Credentials
            </button>
            {saveSuccess && (
              <span className="text-success" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600 }}>
                <CheckCircle size={18} /> Credentials saved & encrypted!
              </span>
            )}
          </div>

        </form>

        {/* Security / Privacy Warning Sidebar */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '18px', borderLeft: '3px solid hsl(var(--primary))' }}>
          <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} style={{ color: 'hsl(var(--primary))' }} /> Security & Storage Details
          </h3>
          <p style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', lineHeight: '1.6' }}>
            All private keys, API secrets, and RPC endpoint details are stored in an encrypted database residing entirely on your local machine.
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '12px', background: 'rgba(239, 68, 68, 0.05)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
            <AlertTriangle size={16} className="text-danger" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ color: 'hsl(var(--text-secondary))', lineHeight: '1.4' }}>
              <strong style={{ color: '#fff' }}>Caution:</strong> Never share your local <code style={{ fontFamily: 'var(--font-mono)', background: 'rgba(0,0,0,0.2)', padding: '2px 4px', borderRadius: '4px' }}>db.json</code> file with anyone, as it contains references to credentials.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
