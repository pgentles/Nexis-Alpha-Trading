import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  runPriceSimulator, 
  runCopyTraderEngine, 
  runAlgoTradingEngine, 
  getConsoleLogs 
} from './bot-engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'db.json');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper database reader
function readDB() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading database:", err);
    return null;
  }
}

// Helper database writer
function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing database:", err);
  }
}

// REST Routes

// 1. Portfolio API
app.get('/api/portfolio', (req, res) => {
  const db = readDB();
  if (!db) return res.status(500).json({ error: "Database error" });
  res.json({
    portfolio: db.portfolio,
    performanceHistory: db.performanceHistory
  });
});

// 2. Whale Traders API
app.get('/api/traders', (req, res) => {
  const db = readDB();
  if (!db) return res.status(500).json({ error: "Database error" });
  res.json(db.traders);
});

app.post('/api/traders', (req, res) => {
  const db = readDB();
  if (!db) return res.status(500).json({ error: "Database error" });
  
  const { name, address, chain, multiplier, maxTradeUsd } = req.body;
  if (!name || !address || !chain) {
    return res.status(400).json({ error: "Name, address, and chain are required." });
  }

  const newTrader = {
    id: "trader_" + Math.floor(Math.random() * 100000),
    name,
    address,
    chain,
    status: "active",
    multiplier: Number(multiplier) || 1.0,
    slippage: 1.0,
    maxTradeUsd: Number(maxTradeUsd) || 1000,
    winRate: 0,
    totalTrades: 0,
    totalProfitUsd: 0
  };

  db.traders.push(newTrader);
  writeDB(db);
  res.status(201).json(newTrader);
});

app.put('/api/traders/:id', (req, res) => {
  const db = readDB();
  if (!db) return res.status(500).json({ error: "Database error" });
  
  const traderIndex = db.traders.findIndex(t => t.id === req.params.id);
  if (traderIndex === -1) {
    return res.status(404).json({ error: "Trader not found." });
  }

  db.traders[traderIndex] = {
    ...db.traders[traderIndex],
    ...req.body
  };

  writeDB(db);
  res.json(db.traders[traderIndex]);
});

app.delete('/api/traders/:id', (req, res) => {
  const db = readDB();
  if (!db) return res.status(500).json({ error: "Database error" });

  const traderIndex = db.traders.findIndex(t => t.id === req.params.id);
  if (traderIndex === -1) {
    return res.status(404).json({ error: "Trader not found." });
  }

  db.traders.splice(traderIndex, 1);
  writeDB(db);
  res.json({ message: "Trader removed successfully." });
});

// 3. Algorithmic Trading Settings API
app.get('/api/algo/settings', (req, res) => {
  const db = readDB();
  if (!db) return res.status(500).json({ error: "Database error" });
  res.json(db.algoSettings);
});

app.post('/api/algo/settings', (req, res) => {
  const db = readDB();
  if (!db) return res.status(500).json({ error: "Database error" });

  db.algoSettings = {
    ...db.algoSettings,
    ...req.body
  };

  writeDB(db);
  res.json(db.algoSettings);
});

// 4. Trade History API
app.get('/api/trades', (req, res) => {
  const db = readDB();
  if (!db) return res.status(500).json({ error: "Database error" });
  res.json(db.trades);
});

// Manually Close Trade
app.post('/api/trades/:id/close', (req, res) => {
  const db = readDB();
  if (!db) return res.status(500).json({ error: "Database error" });

  const trade = db.trades.find(t => t.id === req.params.id);
  if (!trade) {
    return res.status(404).json({ error: "Trade not found." });
  }

  if (trade.status !== 'OPEN') {
    return res.status(400).json({ error: "Trade already closed." });
  }

  // Get current market prices
  const symbol = trade.pair.split('/')[0];
  const isSol = symbol === "SOL";
  
  // Simulated sell execution price
  const sellPrice = isSol ? 150.00 + (Math.random() - 0.5) * 2 : 3200.00 + (Math.random() - 0.5) * 10;
  const pnl = Number(((sellPrice - trade.entryPrice) * trade.amount).toFixed(2));
  const finalValue = Number((trade.amount * sellPrice).toFixed(2));

  trade.status = "CLOSED";
  trade.exitPrice = sellPrice;
  trade.pnlUsd = pnl;
  trade.pnlPercent = Number((((sellPrice - trade.entryPrice) / trade.entryPrice) * 100).toFixed(2));

  // Add USDC back
  const usdcBalance = db.portfolio.balances.find(b => b.symbol === "USDC");
  usdcBalance.balance = Number((usdcBalance.balance + finalValue).toFixed(2));
  usdcBalance.valueUsd = usdcBalance.balance;

  writeDB(db);
  res.json({ message: "Trade closed successfully", trade });
});

// 5. Integrations API
app.get('/api/integrations', (req, res) => {
  const db = readDB();
  if (!db) return res.status(500).json({ error: "Database error" });
  res.json(db.integrations);
});

app.post('/api/integrations', (req, res) => {
  const db = readDB();
  if (!db) return res.status(500).json({ error: "Database error" });

  db.integrations = {
    ...db.integrations,
    ...req.body
  };

  writeDB(db);
  res.json(db.integrations);
});

// 6. Bot Console logs streaming API
app.get('/api/console', (req, res) => {
  res.json(getConsoleLogs());
});

// Start background engines
runPriceSimulator();
runCopyTraderEngine();
runAlgoTradingEngine();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
