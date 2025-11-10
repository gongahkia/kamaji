import React, { useState, useEffect, useCallback } from 'react';
import { connect, send, subscribe, disconnect } from './services/bleService';
import './styles/main.css';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Divider
} from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import LinkOffIcon from '@mui/icons-material/LinkOff';

const demoSeed = [
  { type: 'income', amount: 1200, timestamp: Date.now() - 86400000 * 2, category: 'salary' },
  { type: 'expense', amount: 45.5, timestamp: Date.now() - 86400000 * 1, category: 'food' },
  { type: 'expense', amount: 19.9, timestamp: Date.now() - 3600000 * 5, category: 'transport' },
  { type: 'income', amount: 220, timestamp: Date.now() - 3600000 * 2, category: 'freelance' }
];

const App = () => {
  const [transactions, setTransactions] = useState(demoSeed);
  const [deviceStatus, setDeviceStatus] = useState('Disconnected');
  const [isConnecting, setIsConnecting] = useState(false);

  const totalBalance = transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);

  useEffect(() => () => subscribe(null), []);

  const handleWatchData = useCallback((data) => {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        setTransactions(prev => [...parsed, ...prev]);
      } else if (parsed?.type && parsed?.amount) {
        setTransactions(prev => [parsed, ...prev]);
      }
    } catch (e) {
      console.warn('Invalid transaction payload from watch', e, data);
    }
  }, []);

  const initiateConnection = async () => {
    setIsConnecting(true);
    try {
      await connect('Kamaji', {
        onData: handleWatchData,
        onStatusChange: (status) => setDeviceStatus(status)
      });
    } catch (e) {
      // Already logged in service
    } finally {
      setIsConnecting(false);
    }
  };

  const syncDemoData = async () => {
    // For now just send existing transactions to watch (if connected)
    await send(transactions.slice(0, 10));
  };

  const statusColor = deviceStatus === 'Connected' ? 'success' : deviceStatus === 'Connection Failed' ? 'error' : 'default';

  return (
    <Box className="app-container" sx={{ pb: 6 }}>
      <AppBar position="static" color="transparent" elevation={0} sx={{ backdropFilter: 'blur(6px)', background: 'linear-gradient(90deg,#1f1f1f,#2d2d2d)' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h5" fontWeight={700}>Kamaji</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label={deviceStatus} color={statusColor} icon={<BluetoothIcon />} variant="outlined" />
            {deviceStatus === 'Connected' ? (
              <Button size="small" variant="contained" color="secondary" onClick={disconnect} startIcon={<LinkOffIcon />}>Disconnect</Button>
            ) : (
              <Button size="small" variant="contained" disabled={isConnecting} onClick={initiateConnection} startIcon={<BluetoothIcon />}>{isConnecting ? 'Connecting…' : 'Connect'}</Button>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      <Box mt={4}>
        <Card sx={{ background: 'linear-gradient(135deg,#2e2e2e,#1c1c1c)', color: '#fff' }}>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>Your Portable Finance Manager</Typography>
            <Typography variant="h3" fontWeight={700} gutterBottom>${totalBalance.toFixed(2)}</Typography>
            <Stack direction="row" spacing={2}>
              <Button variant="outlined" color="info" startIcon={<SyncIcon />} onClick={syncDemoData}>Sync Demo Data</Button>
              <Button variant="outlined" color="inherit" onClick={() => setTransactions([])}>Clear</Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Box mt={4}>
        <Typography variant="h6" gutterBottom>Recent Transactions</Typography>
        <Divider sx={{ mb: 2, opacity: 0.2 }} />
        <Stack spacing={1}>
          {transactions.slice(0, 15).map((t, i) => (
            <Card key={i} className={`transaction-item ${t.type}`} sx={{ backgroundColor: '#262626', color: '#fff' }}>
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.2 }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} textTransform="capitalize">{t.type}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>{new Date(t.timestamp).toLocaleDateString()}</Typography>
                </Box>
                <Typography fontWeight={700} color={t.type === 'income' ? 'success.main' : 'error.main'}>
                  {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          ))}
          {transactions.length === 0 && (
            <Typography variant="body2" sx={{ opacity: 0.7 }}>No transactions yet. Connect your watch or use demo sync.</Typography>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default App;