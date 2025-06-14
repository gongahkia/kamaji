import React, { useState, useEffect } from 'react';
import { connect, send, subscribe } from './services/bleService';
import './styles/main.css';

const App = () => {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [deviceStatus, setDeviceStatus] = useState('Disconnected');

  useEffect(() => {
    const initBLE = async () => {
      try {
        await connect('KAMAJI_DEVICE', {
          onData: (data) => handleWatchData(data),
          onStatusChange: (status) => setDeviceStatus(status)
        });
      } catch (error) {
        console.error('BLE Connection Error:', error);
      }
    };
    
    initBLE();
    return () => subscribe(null);
  }, []);

  const handleWatchData = (data) => {
    const newTransactions = JSON.parse(data);
    setTransactions(prev => [...newTransactions, ...prev]);
    updateBalance(newTransactions);
  };

  const updateBalance = (transactions) => {
    const total = transactions.reduce((acc, t) => 
      t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
    setBalance(prev => prev + total);
  };

  const syncData = async () => {
    try {
      const response = await fetch('/api/transactions');
      const data = await response.json();
      send(JSON.stringify(data));
    } catch (error) {
      console.error('Sync Error:', error);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Kamaji</h1>
        <h3>Your Portable Finance Manager</h3>
        <div className="device-status">
          <span className={`status-indicator ${deviceStatus.toLowerCase()}`} />
          {deviceStatus}
        </div>
      </header>

      <div className="dashboard">
        <div className="balance-card">
          <h2>Total Balance</h2>
          <div className="balance-amount">${balance.toFixed(2)}</div>
        </div>

        <div className="controls">
          <button onClick={syncData} className="sync-button">
            🔄 Sync with Watch
          </button>
        </div>

        <TransactionList transactions={transactions} />
      </div>
    </div>
  );
};

const TransactionList = ({ transactions }) => (
  <div className="transaction-list">
    <h3>Recent Transactions</h3>
    {transactions.map((t, i) => (
      <div key={i} className={`transaction-item ${t.type}`}>
        <div className="transaction-info">
          <span className="transaction-type">{t.type}</span>
          <span className="transaction-date">
            {new Date(t.timestamp).toLocaleDateString()}
          </span>
        </div>
        <div className="transaction-amount">
          ${t.amount.toFixed(2)}
        </div>
      </div>
    ))}
  </div>
);

export default App;