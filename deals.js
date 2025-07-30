async function fetchDeals(query='') {
  const res = await fetch(`/api/deals?q=${encodeURIComponent(query)}`);
  return res.json();
}

async function fetchHistory(title) {
  const res = await fetch(`/api/history?title=${encodeURIComponent(title)}`);
  return res.json();
}

function renderDeals(deals) {
  const list = document.getElementById('deal-list');
  list.innerHTML = '';
  deals.forEach(d => {
    const li = document.createElement('li');
    li.className = 'deal-item';
    li.innerHTML = `<a href="${d.link}" target="_blank">${d.title}</a> - ${d.price}`;
    li.addEventListener('click', () => showHistory(d.title));
    list.appendChild(li);
  });
}

async function showHistory(title) {
  const data = await fetchHistory(title);
  const historyDiv = document.getElementById('history');
  document.getElementById('hist-title').textContent = title;
  const ctx = document.getElementById('history-chart').getContext('2d');
  const labels = data.map(d => new Date(d.timestamp).toLocaleString());
  const prices = data.map(d => d.price);
  if (window.chart) window.chart.destroy();
  window.chart = new Chart(ctx, {
    type:'line',
    data:{ labels, datasets:[{ label:'가격', data:prices, borderColor:'#4CAF50' }] },
    options:{ scales:{ x:{ ticks:{ color:'#fff' } }, y:{ ticks:{ color:'#fff' } } } }
  });
  historyDiv.style.display = 'block';
}

document.getElementById('search').addEventListener('input', async (e) => {
  const q = e.target.value;
  const deals = await fetchDeals(q);
  renderDeals(deals);
});

 document.getElementById('refresh').addEventListener('click', async () => {
  const searchVal = document.getElementById('search').value;
  const deals = await fetchDeals(searchVal);
  renderDeals(deals);
});

// Initial load
fetchDeals().then(renderDeals);
