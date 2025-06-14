import React, { useEffect, useState } from 'react';
import { connect, send } from './services/bleService';

function App() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    connect('AMAZFIT_DEVICE_ID', (data) => {
      setTransactions(JSON.parse(data));
    });
  }, []);

  const syncData = async () => {
    const response = await fetch('/api/transactions');
    const data = await response.json();
    send(JSON.stringify(data));
  };

  return (
    <div className="container">
      <h1>Transaction History</h1>
      <button onClick={syncData}>Sync with Watch</button>
      <ul>
        {transactions.map((t, i) => (
          <li key={i}>
            {t.type}: ${t.amount}
          </li>
        ))}
      </ul>
    </div>
  );
}