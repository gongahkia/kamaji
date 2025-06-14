import { createStorage, getStorage } from '@zos/storage';
import { prompt } from '@zos/interaction';
import { showToast } from '@zos/interaction';
import { Window, Button, Text, Image } from '@zos/ui';

const storage = createStorage();
const TRANSACTION_KEY = 'transactions';

class FinanceApp {
  constructor() {
    this.window = new Window();
    this.initUI();
    this.loadTransactions();
  }

  initUI() {
    this.balanceText = new Text({
      text: 'Total Balance: $0',
      x: 20,
      y: 40,
      color: 0xFFFFFF,
      fontSize: 24
    });

    new Button({
      text: 'Add Income',
      x: 20,
      y: 100,
      width: 200,
      onClick: () => this.addTransaction('income')
    });

    new Button({
      text: 'Add Expense',
      x: 20,
      y: 160,
      width: 200,
      onClick: () => this.addTransaction('expense')
    });

    this.window.render();
  }

  async addTransaction(type) {
    const amount = await prompt({
      title: `Enter ${type} amount`,
      text: 'Amount:',
      buttons: ['OK', 'Cancel']
    });

    if (amount) {
      const transactions = await this.getTransactions();
      transactions.push({
        type,
        amount: parseFloat(amount),
        timestamp: Date.now()
      });
      
      storage.setItem(TRANSACTION_KEY, JSON.stringify(transactions));
      this.updateBalance();
      showToast({ text: `${type} added!` });
    }
  }

  async getTransactions() {
    return JSON.parse(await storage.getItem(TRANSACTION_KEY) || '[]');
  }

  async updateBalance() {
    const transactions = await this.getTransactions();
    const balance = transactions.reduce((acc, t) => 
      t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
    
    this.balanceText.setProperty('text', `Total Balance: $${balance.toFixed(2)}`);
  }
}

export default FinanceApp;