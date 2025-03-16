const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Telegraf } = require('telegraf');
const WebSocket = require('ws');


const app = express();
const bot = new Telegraf('7310577457:AAEYEtPn88J-RWfyF-fbR-vvSm4FlM8fPYE'); // Replace with your actual bot token
app.use(cors());
app.use(bodyParser.json());

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
});

const sendMenuItemsToClients = () => {
  fs.readFile('txt.txt', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading txt.txt:', err);
      return;
    }

    const menuItems = data.split('\n').filter(Boolean).map(item => {
      const parts = item.split(',').map(part => part.trim());
      if (parts.length < 2) {
        return null;
      }
      const name = parts[0];
      const price = parseFloat(parts[1]);
      if (isNaN(price)) {
        return null;
      }
      return { name, price };
    }).filter(item => item !== null);

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(menuItems));
      }
    });
  });
};

fs.watch('txt.txt', (eventType) => {
  if (eventType === 'change') {
    sendMenuItemsToClients();
  }
});

bot.start((ctx) => {
  ctx.reply('Welcome to the Coffee Shop bot! Send menu items in the format "name,price" (e.g., "Espresso,2.5").');
});

bot.on('message', (ctx) => {
  const messageText = ctx.message.text;

  if (!messageText.includes(',')) {
    ctx.reply('Invalid format. Please send menu items in the format "name,price" (e.g., "Espresso,2.5").');
    return;
  }

  fs.appendFile('txt.txt', messageText + '\n', (err) => {
    if (err) {
      console.error('Error writing to file', err);
      ctx.reply('An error occurred while saving your text.');
      return;
    }
    ctx.reply('Your menu item has been saved and displayed on the website!');
  });
});

const sendOrderToTelegram = async (order, total) => {
  const message = `Order details:\n${order.map((item, index) => `${index + 1}.  ${item.name} ${item.count}x $${item.price}`).join('\n')}\nTotal: $${total.toFixed(2)}`;
  try {
    await bot.telegram.sendMessage('5580962565', message); // Replace with your actual chat ID
    return { status: 'Order sent to bot' };
  } catch (err) {
    console.error('Error sending order to bot:', err);
    throw new Error('Error sending order to bot');
  }
};

app.get('/menuItems', (req, res) => {
  fs.readFile('txt.txt', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading menu items');
    }

    const menuItems = data.split('\n').filter(Boolean).map(item => {
      const parts = item.split(',').map(part => part.trim());
      if (parts.length < 2) {
        return null;
      }
      const name = parts[0];
      const price = parseFloat(parts[1]);
      if (isNaN(price)) {
        return null;
      }
      return { name, price };
    }).filter(item => item !== null);

    res.json(menuItems);
  });
});

app.post('/menuItems', (req, res) => {
  const menuItems = req.body;
  if (!Array.isArray(menuItems) || menuItems.length === 0) {
    return res.status(400).send('Invalid menu items data');
  }
  const data = menuItems.map(item => `${item.name},${item.price}`).join('\n');
  fs.writeFile('txt.txt', data, 'utf8', (err) => {
    if (err) {
      return res.status(500).send('Error saving menu items');
    }
    res.send('Menu items saved');
  });
});

app.post('/sendOrder', async (req, res) => {
  const { order, total } = req.body;

  if (!order || !total) {
    return res.status(400).json({ status: 'Error', error: 'Invalid order data' });
  }

  try {
    const result = await sendOrderToTelegram(order, total);
    res.json(result);
  } catch (err) {
    res.status(500).json({ status: 'Error', error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
//   ConectDB();
  console.log(`Server is running on port ${PORT}`);
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

bot.launch();
