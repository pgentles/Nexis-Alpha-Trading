import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'db.json');

// Memory logs that we stream to client
let consoleLogs = [
  { timestamp: new Date().toISOString(), message: "System initialized. Loading database settings..." },
  { timestamp: new Date().toISOString(), message: "Copy-trading module listening on RPC endpoints." },
  { timestamp: new Date().toISOString(), message: "Algorithmic strategy module ready." }
];

function logToConsole(message) {
  const log = { timestamp: new Date().toISOString(), message };
  consoleLogs.unshift(log);
  if (consoleLogs.length > 100) consoleLogs.pop(); // keep last 100
  console.log(`[BOT ENGINE] ${message}`);
}

export function getConsoleLogs() {
  return consoleLogs;
}

// Read database
function readDB() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading database:", err);
    return null;
  }
}

// Write database
function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing database:", err);
  }
}

// Generate random mock price data for active charting
let tokenPrices = {
  "SOL": 150.00,
  "ETH": 3200.00
};

// Simulate wallet updates based on current price changes
export function runPriceSimulator() {
  setInterval(() => {
    // Small price walk
    const solDelta = (Math.random() - 0.5) * 1.5;
    const ethDelta = (Math.random() - 0.5) * 20.0;
    
    tokenPrices["SOL"] = Math.max(10, tokenPrices["SOL"] + solDelta);
    tokenPrices["ETH"] = Math.max(100, tokenPrices["ETH"] + ethDelta);
    
    // Update total portfolio valuation based on live prices
    const data = readDB();
    if (!data) return;
    
    let totalUsd = 0;
    data.portfolio.balances.forEach(b => {
      if (b.symbol === "SOL") {
        b.valueUsd = Number((b.balance * tokenPrices["SOL"]).toFixed(2));
      } else if (b.symbol === "ETH") {
        b.valueUsd = Number((b.balance * tokenPrices["ETH"]).toFixed(2));
      }
      totalUsd += b.valueUsd;
    });
    
    // Calculate PnL updates on OPEN positions
    let openPnL = 0;
    data.trades.forEach(t => {
      if (t.status === "OPEN") {
        const currentPrice = t.pair.startsWith("SOL") ? tokenPrices["SOL"] : tokenPrices["ETH"];
        t.pnlUsd = Number(((currentPrice - t.entryPrice) * t.amount).toFixed(2));
        t.pnlPercent = Number((((currentPrice - t.entryPrice) / t.entryPrice) * 100).toFixed(2));
        openPnL += t.pnlUsd;
      }
    });

    data.portfolio.totalValueUsd = Number((totalUsd + openPnL).toFixed(2));
    // Simulate daily PnL progression
    data.portfolio.pnl24hUsd = Number((openPnL + solDelta * 10 + ethDelta * 0.5).toFixed(2));
    data.portfolio.pnl24hPercent = Number(((data.portfolio.pnl24hUsd / data.portfolio.totalValueUsd) * 100).toFixed(2));
    
    writeDB(data);
  }, 3000);
}

// Background copy trader simulation loop
export function runCopyTraderEngine() {
  // Check for updates every 12 seconds
  setInterval(() => {
    const data = readDB();
    if (!data) return;

    // Filter active copy traders
    const activeTraders = data.traders.filter(t => t.status === 'active');
    if (activeTraders.length === 0) return;

    // Pick a random active copy trader to trigger a trade
    if (Math.random() > 0.4) {
      const trader = activeTraders[Math.floor(Math.random() * activeTraders.length)];
      triggerCopyTrade(data, trader);
    }
  }, 12000);
}

// Trigger simulated whale transaction and copy it if parameters fit
function triggerCopyTrade(data, trader) {
  const isSol = trader.chain === "Solana";
  const symbol = isSol ? "SOL" : "ETH";
  const currentPrice = tokenPrices[symbol];
  const pair = `${symbol}/USDC`;
  const isBuy = Math.random() > 0.4; // 60% chance to buy, 40% sell (take profit)
  
  const whaleQuantity = isSol ? (Math.random() * 50 + 10).toFixed(2) : (Math.random() * 5 + 1).toFixed(2);
  const whaleValue = (whaleQuantity * currentPrice).toFixed(2);
  
  logToConsole(`On-chain Alert: [${trader.name}] (${trader.address}) executed ${isBuy ? 'BUY' : 'SELL'} ${whaleQuantity} ${symbol} (~$${whaleValue})`);
  
  // Decide whether to copy
  const copyMultiplier = trader.multiplier;
  const userOrderAmount = Number((whaleQuantity * copyMultiplier).toFixed(4));
  const orderValueUsd = Number((userOrderAmount * currentPrice).toFixed(2));

  // Check budget limits
  if (orderValueUsd > trader.maxTradeUsd) {
    logToConsole(`Copy skipped: Estimated value $${orderValueUsd} exceeds max trade limit of $${trader.maxTradeUsd} for ${trader.name}.`);
    return;
  }

  // Get user USDC balance to see if they can buy
  const usdcBalanceObj = data.portfolio.balances.find(b => b.symbol === "USDC");
  const assetBalanceObj = data.portfolio.balances.find(b => b.symbol === symbol);

  if (isBuy) {
    if (usdcBalanceObj.balance < orderValueUsd) {
      logToConsole(`Copy failed: Insufficient USDC balance ($${usdcBalanceObj.balance.toFixed(2)} vs required $${orderValueUsd.toFixed(2)}) to copy ${trader.name}.`);
      return;
    }

    // Deduct USDC, add order to open trades
    usdcBalanceObj.balance = Number((usdcBalanceObj.balance - orderValueUsd).toFixed(2));
    usdcBalanceObj.valueUsd = usdcBalanceObj.balance;

    const newTrade = {
      id: "trade_" + Math.floor(Math.random() * 100000),
      timestamp: new Date().toISOString(),
      type: "COPY",
      traderName: trader.name,
      pair: pair,
      direction: "BUY",
      amount: userOrderAmount,
      entryPrice: currentPrice,
      exitPrice: null,
      valueUsd: orderValueUsd,
      status: "OPEN",
      pnlUsd: 0,
      pnlPercent: 0,
      chain: trader.chain,
      hash: isSol ? `5tWzR${Math.random().toString(36).substring(7)}` : `0x${Math.random().toString(16).substring(2, 10)}`
    };

    data.trades.unshift(newTrade);
    logToConsole(`Copy Executed: BUY ${userOrderAmount} ${symbol} at $${currentPrice.toFixed(2)} (Value: $${orderValueUsd.toFixed(2)}) copying [${trader.name}]`);
  } else {
    // Sell target: Look for open copy positions from this trader
    const openTrade = data.trades.find(t => t.status === "OPEN" && t.traderName === trader.name && t.pair === pair);
    if (!openTrade) {
      logToConsole(`Copy skipped: Whale sold ${symbol}, but we have no open ${symbol} positions copying ${trader.name}.`);
      return;
    }

    // Close the trade
    const pnl = Number(((currentPrice - openTrade.entryPrice) * openTrade.amount).toFixed(2));
    const finalValue = Number((openTrade.amount * currentPrice).toFixed(2));

    openTrade.status = "CLOSED";
    openTrade.exitPrice = currentPrice;
    openTrade.pnlUsd = pnl;
    openTrade.pnlPercent = Number((((currentPrice - openTrade.entryPrice) / openTrade.entryPrice) * 100).toFixed(2));
    
    // Add funds back to USDC balance
    usdcBalanceObj.balance = Number((usdcBalanceObj.balance + finalValue).toFixed(2));
    usdcBalanceObj.valueUsd = usdcBalanceObj.balance;

    logToConsole(`Copy Executed: SELL/CLOSE ${openTrade.amount} ${symbol} at $${currentPrice.toFixed(2)} (PnL: $${pnl > 0 ? '+' : ''}${pnl} / ${openTrade.pnlPercent}%)`);
  }

  writeDB(data);
}

// Algorithmic Strategy Loop
let mockIndicatorRsi = 50;

export function runAlgoTradingEngine() {
  setInterval(() => {
    const data = readDB();
    if (!data) return;

    if (data.algoSettings.status !== 'active') return;

    // Simulate technical indicator swing
    mockIndicatorRsi = Math.max(10, Math.min(90, mockIndicatorRsi + (Math.random() - 0.5) * 8));
    
    logToConsole(`Algorithmic Tick: Scanning indicators... RSI: ${mockIndicatorRsi.toFixed(1)}`);

    const sizeUsd = data.algoSettings.tradeSizeUsd;
    const usdcBalanceObj = data.portfolio.balances.find(b => b.symbol === "USDC");
    const solBalanceObj = data.portfolio.balances.find(b => b.symbol === "SOL");

    // Buy trigger: RSI is oversold
    if (mockIndicatorRsi < data.algoSettings.rsiOversold) {
      // Check if we already have an open algo position to avoid over-exposure
      const hasOpenAlgo = data.trades.some(t => t.status === "OPEN" && t.type === "ALGO");
      if (hasOpenAlgo) {
        logToConsole(`Algo Signal: RSI is oversold (${mockIndicatorRsi.toFixed(1)}), but we already have an open Algorithmic position. Skipping.`);
        return;
      }

      if (usdcBalanceObj.balance < sizeUsd) {
        logToConsole(`Algo Signal: RSI oversold (${mockIndicatorRsi.toFixed(1)}), but insufficient balance for $${sizeUsd} size.`);
        return;
      }

      const currentPrice = tokenPrices["SOL"];
      const amount = Number((sizeUsd / currentPrice).toFixed(4));
      
      usdcBalanceObj.balance = Number((usdcBalanceObj.balance - sizeUsd).toFixed(2));
      usdcBalanceObj.valueUsd = usdcBalanceObj.balance;

      const newTrade = {
        id: "trade_" + Math.floor(Math.random() * 100000),
        timestamp: new Date().toISOString(),
        type: "ALGO",
        traderName: "Algorithmic Bot",
        pair: "SOL/USDC",
        direction: "BUY",
        amount: amount,
        entryPrice: currentPrice,
        exitPrice: null,
        valueUsd: sizeUsd,
        status: "OPEN",
        pnlUsd: 0,
        pnlPercent: 0,
        chain: "Solana",
        hash: `5tWzR_algo_${Math.random().toString(36).substring(7)}`
      };

      data.trades.unshift(newTrade);
      logToConsole(`Algo Trade Triggered (RSI Oversold @ ${mockIndicatorRsi.toFixed(1)}): BUY ${amount} SOL at $${currentPrice.toFixed(2)}`);
      
      // Push RSI up slightly due to buying pressure simulation
      mockIndicatorRsi += 10;
      writeDB(data);
    }
    
    // Sell trigger: RSI is overbought, or StopLoss/TakeProfit hit
    else if (mockIndicatorRsi > data.algoSettings.rsiOverbought) {
      const openAlgo = data.trades.find(t => t.status === "OPEN" && t.type === "ALGO");
      if (!openAlgo) return;

      const currentPrice = tokenPrices["SOL"];
      const pnl = Number(((currentPrice - openAlgo.entryPrice) * openAlgo.amount).toFixed(2));
      const finalValue = Number((openAlgo.amount * currentPrice).toFixed(2));

      openAlgo.status = "CLOSED";
      openAlgo.exitPrice = currentPrice;
      openAlgo.pnlUsd = pnl;
      openAlgo.pnlPercent = Number((((currentPrice - openAlgo.entryPrice) / openAlgo.entryPrice) * 100).toFixed(2));

      usdcBalanceObj.balance = Number((usdcBalanceObj.balance + finalValue).toFixed(2));
      usdcBalanceObj.valueUsd = usdcBalanceObj.balance;

      logToConsole(`Algo Trade Triggered (RSI Overbought @ ${mockIndicatorRsi.toFixed(1)}): SELL/CLOSE ${openAlgo.amount} SOL at $${currentPrice.toFixed(2)} (PnL: $${pnl > 0 ? '+' : ''}${pnl})`);
      
      // Pull RSI down slightly
      mockIndicatorRsi -= 10;
      writeDB(data);
    }

    // Check Stop Loss & Take Profit for open algo trades
    else {
      const openAlgo = data.trades.find(t => t.status === "OPEN" && t.type === "ALGO");
      if (!openAlgo) return;

      const currentPrice = tokenPrices["SOL"];
      const pnlPercent = (((currentPrice - openAlgo.entryPrice) / openAlgo.entryPrice) * 100);

      // Stop Loss Check
      if (pnlPercent <= -data.algoSettings.stopLossPercent) {
        closeAlgoTrade(data, openAlgo, currentPrice, "STOP LOSS");
      }
      // Take Profit Check
      else if (pnlPercent >= data.algoSettings.takeProfitPercent) {
        closeAlgoTrade(data, openAlgo, currentPrice, "TAKE PROFIT");
      }
    }
  }, 10000);
}

function closeAlgoTrade(data, openAlgo, currentPrice, reason) {
  const usdcBalanceObj = data.portfolio.balances.find(b => b.symbol === "USDC");
  const pnl = Number(((currentPrice - openAlgo.entryPrice) * openAlgo.amount).toFixed(2));
  const finalValue = Number((openAlgo.amount * currentPrice).toFixed(2));

  openAlgo.status = "CLOSED";
  openAlgo.exitPrice = currentPrice;
  openAlgo.pnlUsd = pnl;
  openAlgo.pnlPercent = Number((((currentPrice - openAlgo.entryPrice) / openAlgo.entryPrice) * 100).toFixed(2));

  usdcBalanceObj.balance = Number((usdcBalanceObj.balance + finalValue).toFixed(2));
  usdcBalanceObj.valueUsd = usdcBalanceObj.balance;

  logToConsole(`Algo Trade Triggered (${reason}): SELL/CLOSE ${openAlgo.amount} SOL at $${currentPrice.toFixed(2)} (PnL: $${pnl > 0 ? '+' : ''}${pnl} / ${openAlgo.pnlPercent.toFixed(2)}%)`);
  writeDB(data);
}
