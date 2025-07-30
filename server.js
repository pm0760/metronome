const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// In-memory store for deals and price history
let deals = [];
let priceHistory = {};

// Example target website
const SOURCES = [
  {
    name: 'SlickDeals',
    url: 'https://slickdeals.net/',
    parse: ($) => {
      const list = [];
      $('.fpItem').each((i, el) => {
        const title = $(el).find('.itemTitle a').text().trim();
        const price = $(el).find('.itemPrice').text().trim();
        const link = 'https://slickdeals.net' + $(el).find('.itemTitle a').attr('href');
        if (title) list.push({ title, price, link });
      });
      return list;
    }
  }
];

async function fetchDeals() {
  const newDeals = [];
  for (const source of SOURCES) {
    try {
      const resp = await axios.get(source.url);
      const $ = cheerio.load(resp.data);
      const items = source.parse($);
      items.forEach(item => {
        newDeals.push(item);
        // Track price history by title
        if (!priceHistory[item.title]) priceHistory[item.title] = [];
        const priceVal = parseFloat(item.price.replace(/[^0-9.]/g, ''));
        const timestamp = new Date();
      priceHistory[item.title].push({ price: priceVal, timestamp });
    });
    } catch (err) {
      console.error('Error fetching', source.name, err.message);
      // Provide sample data when fetch fails so the front-end still works
      newDeals.push({
        title: `${source.name} 예시 상품`,
        price: '$0.00',
        link: source.url
      });
    }
  }
  deals = newDeals;
}

// Initial fetch
fetchDeals();
// Periodic update every 10 minutes
setInterval(fetchDeals, 10 * 60 * 1000);

app.get('/api/deals', (req, res) => {
  const query = (req.query.q || '').toLowerCase();
  const filtered = query ? deals.filter(d => d.title.toLowerCase().includes(query)) : deals;
  res.json(filtered);
});

app.get('/api/history', (req, res) => {
  const title = req.query.title;
  if (!title || !priceHistory[title]) {
    return res.json([]);
  }
  res.json(priceHistory[title]);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
