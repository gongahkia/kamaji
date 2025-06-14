import { createStorage, getStorage } from '@zos/storage';
import { prompt } from '@zos/interaction';
import { showToast } from '@zos/interaction';
import { Window, Button, Text, Image, List, ScrollView } from '@zos/ui';
import { getText } from '@zos/i18n';
import { getDeviceInfo } from '@zos/device';

const storage = createStorage();
const TRANSACTION_KEY = 'kamaji_transactions';
const DEVICE = getDeviceInfo();

class FinanceApp {
  constructor() {
    this.window = new Window();
    this.transactions = [];
    this.filter = 'all';
    this.initUI();
    this.loadTransactions();
  }

  initUI() {
    this.header = new Image({
      x: DEVICE.width - 60,
      y: 10,
      src: 'images/income.png',
      width: 50,
      height: 50
    });

    this.balanceText = new Text({
      text: getText('balance') + ': $0.00',
      x: 20,
      y: 20,
      color: 0xFFFFFF,
      fontSize: 28,
      fontFamily: 'Roboto-Bold'
    });

    this.chartContainer = new ScrollView({
      x: 10,
      y: 70,
      width: DEVICE.width - 20,
      height: 100,
      color: 0x1A1A1A
    });

    this.actionsRow = new ScrollView({
      x: 0,
      y: 180,
      width: DEVICE.width,
      height: 60,
      scroll: 'horizontal'
    });

    new Button({
      parent: this.actionsRow,
      text: getText('add_income'),
      width: 120,
      color: 0x00FF00,
      onClick: () => this.addTransaction('income')
    });

    new Button({
      parent: this.actionsRow,
      text: getText('add_expense'),
      width: 120,
      color: 0xFF0000,
      onClick: () => this.addTransaction('expense')
    });

    this.transactionList = new List({
      x: 0,
      y: 250,
      width: DEVICE.width,
      height: DEVICE.height - 250,
      itemConfig: {
        height: 60,
        color: 0x333333,
        highlightColor: 0x444444
      },
      onTouch: (index) => this.showTransactionDetails(index)
    });

    this.window.render();
    this.updateChart();
  }

  async addTransaction(type) {
    const amount = await prompt({
      title: getText(type === 'income' ? 'enter_income' : 'enter_expense'),
      text: getText('amount'),
      buttons: [getText('confirm'), getText('cancel')]
    });

    if (amount && !isNaN(amount)) {
      const transactions = await this.getTransactions();
      const newTransaction = {
        type,
        amount: parseFloat(amount),
        timestamp: Date.now(),
        category: type === 'income' ? 'salary' : 'food'
      };
      
      transactions.unshift(newTransaction);
      await storage.setItem(TRANSACTION_KEY, JSON.stringify(transactions));
      this.transactions = transactions;
      this.updateUI();
      showToast({ text: `${type} ${getText('added')}!` });
    }
  }

  async getTransactions() {
    return JSON.parse(await storage.getItem(TRANSACTION_KEY) || '[]');
  }

  updateUI() {
    const balance = this.transactions.reduce((acc, t) => 
      t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
    
    this.balanceText.setProperty('text', 
      `${getText('balance')}: $${balance.toFixed(2)}`);
    
    this.transactionList.setProperty('data', 
      this.transactions.slice(0, 10).map(t => ({
        text: `${t.type === 'income' ? '+' : '-'} $${t.amount.toFixed(2)}`,
        color: t.type === 'income' ? 0x00FF00 : 0xFF0000,
        rightText: new Date(t.timestamp).toLocaleDateString()
      }))
    );
    
    this.updateChart();
  }

  updateChart() {
    this.chartContainer.destroyChildren();
    
    const weekData = Array(7).fill(0).map((_, i) => 
      this.transactions.filter(t => 
        new Date(t.timestamp).getDay() === i && 
        t.type === 'expense'
      ).reduce((a, b) => a + b.amount, 0)
    );
    
    const maxAmount = Math.max(...weekData, 1);
    const barWidth = (DEVICE.width - 40) / 7;
    
    weekData.forEach((amount, index) => {
      new Button({
        parent: this.chartContainer,
        x: 20 + (index * barWidth),
        y: 80 - (amount/maxAmount * 60),
        width: barWidth - 4,
        height: (amount/maxAmount * 60),
        color: 0xFFA500,
        radius: 3
      });
    });
  }

  async showTransactionDetails(index) {
    const transaction = this.transactions[index];
    const detailWindow = new Window();
    
    new Text({
      parent: detailWindow,
      text: `${transaction.type.toUpperCase()}`,
      x: 20,
      y: 20,
      color: transaction.type === 'income' ? 0x00FF00 : 0xFF0000,
      fontSize: 24
    });
    
    new Text({
      parent: detailWindow,
      text: `Amount: $${transaction.amount.toFixed(2)}`,
      x: 20,
      y: 60,
      color: 0xFFFFFF
    });
    
    new Text({
      parent: detailWindow,
      text: new Date(transaction.timestamp).toLocaleString(),
      x: 20,
      y: 100,
      color: 0xCCCCCC
    });
    
    detailWindow.render();
  }
}

export default FinanceApp;