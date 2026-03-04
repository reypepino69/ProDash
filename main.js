/* ========================================
   PRO DASHBOARD - Main JavaScript (Fixed)
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  console.log('ProDash: Initializing...');

  // ========== Theme Toggle ==========
  const themeToggle = document.getElementById('themeToggle');
  const moonIcon = themeToggle.querySelector('.moon-icon');
  const sunIcon = themeToggle.querySelector('.sun-icon');

  themeToggle.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    document.documentElement.setAttribute('data-theme', isLight ? 'dark' : 'light');
    moonIcon.style.display = isLight ? 'block' : 'none';
    sunIcon.style.display = isLight ? 'none' : 'block';
    showToast(isLight ? '🌙 Dark mode enabled' : '☀️ Light mode enabled');
  });

  // ========== Toast Notifications ==========
  function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      background: rgba(108, 92, 231, 0.95); color: white;
      padding: 12px 24px; border-radius: 12px; font-size: 0.85rem;
      font-weight: 600; font-family: 'Inter', sans-serif;
      backdrop-filter: blur(10px); box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      transform: translateY(20px); opacity: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `;
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    });
    setTimeout(() => {
      toast.style.transform = 'translateY(20px)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  // ========== Sidebar Toggle (Mobile) ==========
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  menuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));

  // ========== Nav Items ==========
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      const pageName = item.querySelector('span').textContent;
      document.querySelector('.page-title').textContent = pageName;
      showToast(`📄 Switched to ${pageName}`);
    });
  });

  // ========== Wait for Chart.js ==========
  if (typeof Chart === 'undefined') {
    console.error('ProDash: Chart.js not loaded!');
    showToast('⚠️ Charts library failed to load. Please refresh.');
    return;
  }

  console.log('ProDash: Chart.js loaded ✓');

  // ========== Chart.js Defaults ==========
  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.color = '#8888aa';
  Chart.defaults.plugins.legend.display = false;
  Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(17, 17, 40, 0.95)';
  Chart.defaults.plugins.tooltip.titleFont = { size: 13, weight: 600 };
  Chart.defaults.plugins.tooltip.bodyFont = { size: 12 };
  Chart.defaults.plugins.tooltip.padding = 12;
  Chart.defaults.plugins.tooltip.cornerRadius = 10;
  Chart.defaults.plugins.tooltip.displayColors = false;

  // ========== Sparkline Charts ==========
  function createSparkline(canvasId, data, color) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    return new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map((_, i) => i),
        datasets: [{
          data,
          borderColor: color,
          borderWidth: 2,
          fill: true,
          backgroundColor: color.replace('1)', '0.1)'),
          pointRadius: 0,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { x: { display: false }, y: { display: false } },
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        elements: { line: { borderCapStyle: 'round' } }
      }
    });
  }

  createSparkline('sparkRevenue', [30, 45, 35, 50, 65, 55, 70, 60, 80, 75, 90, 85], 'rgba(108, 92, 231, 1)');
  createSparkline('sparkUsers', [20, 35, 25, 40, 30, 45, 55, 50, 60, 65, 55, 70], 'rgba(6, 182, 212, 1)');
  createSparkline('sparkOrders', [15, 25, 35, 30, 45, 40, 50, 55, 45, 60, 65, 70], 'rgba(16, 185, 129, 1)');
  createSparkline('sparkConversion', [40, 35, 45, 30, 38, 32, 36, 28, 34, 30, 26, 32], 'rgba(245, 158, 11, 1)');

  // ========== Revenue Chart ==========
  const revenueCanvas = document.getElementById('revenueChart');
  const revenueData = {
    '7d': {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      revenue: [4200, 5800, 4900, 7200, 6100, 8400, 7800],
      expenses: [2800, 3200, 2900, 3800, 3400, 4100, 3600]
    },
    '30d': {
      labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
      revenue: Array.from({ length: 30 }, () => Math.floor(Math.random() * 5000) + 3000),
      expenses: Array.from({ length: 30 }, () => Math.floor(Math.random() * 3000) + 1500)
    },
    '90d': {
      labels: Array.from({ length: 12 }, (_, i) => `Week ${i + 1}`),
      revenue: Array.from({ length: 12 }, () => Math.floor(Math.random() * 20000) + 15000),
      expenses: Array.from({ length: 12 }, () => Math.floor(Math.random() * 12000) + 8000)
    },
    '1y': {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      revenue: [32000, 38000, 35000, 42000, 48000, 44000, 52000, 58000, 55000, 62000, 68000, 72000],
      expenses: [18000, 21000, 19000, 24000, 27000, 25000, 29000, 32000, 30000, 34000, 37000, 39000]
    }
  };

  let revenueChart = null;

  function createRevenueChart(range) {
    const d = revenueData[range];
    if (!d) {
      console.error('ProDash: Invalid range:', range);
      return;
    }

    // Destroy existing chart
    if (revenueChart) {
      revenueChart.destroy();
      revenueChart = null;
    }

    revenueChart = new Chart(revenueCanvas, {
      type: 'line',
      data: {
        labels: d.labels,
        datasets: [
          {
            label: 'Revenue',
            data: d.revenue,
            borderColor: '#6c5ce7',
            backgroundColor: (context) => {
              const g = context.chart.ctx.createLinearGradient(0, 0, 0, 280);
              g.addColorStop(0, 'rgba(108, 92, 231, 0.3)');
              g.addColorStop(1, 'rgba(108, 92, 231, 0)');
              return g;
            },
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#6c5ce7',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2
          },
          {
            label: 'Expenses',
            data: d.expenses,
            borderColor: '#a855f7',
            backgroundColor: (context) => {
              const g = context.chart.ctx.createLinearGradient(0, 0, 0, 280);
              g.addColorStop(0, 'rgba(168, 85, 247, 0.15)');
              g.addColorStop(1, 'rgba(168, 85, 247, 0)');
              return g;
            },
            borderWidth: 2,
            borderDash: [6, 4],
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: '#a855f7',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        animation: { duration: 600, easing: 'easeInOutQuart' },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'end',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 20,
              font: { size: 12, weight: 500 }
            }
          },
          tooltip: {
            callbacks: {
              label: (c) => `${c.dataset.label}: $${c.parsed.y.toLocaleString()}`
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.04)', drawBorder: false },
            ticks: { font: { size: 11 }, maxTicksLimit: 10 }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.04)', drawBorder: false },
            ticks: {
              font: { size: 11 },
              callback: (v) => `$${(v / 1000).toFixed(0)}k`
            }
          }
        }
      }
    });

    console.log('ProDash: Revenue chart created for range:', range);
  }

  // Initialize with 7d
  createRevenueChart('7d');

  // ========== Chart Tab Switching (Event Delegation) ==========
  const chartTabsContainer = document.querySelector('.chart-tabs');
  if (chartTabsContainer) {
    chartTabsContainer.addEventListener('click', (e) => {
      const tab = e.target.closest('.chart-tab');
      if (!tab) return;

      const range = tab.getAttribute('data-range');
      console.log('ProDash: Tab clicked:', range);

      // Update active states
      chartTabsContainer.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Recreate chart
      createRevenueChart(range);
      showToast(`📈 Showing ${tab.textContent} data`);
    });
    console.log('ProDash: Chart tab listeners attached ✓');
  }

  // ========== Traffic Doughnut ==========
  const trafficSources = [
    { label: 'Direct', value: 8420, color: '#6c5ce7' },
    { label: 'Organic', value: 6350, color: '#06b6d4' },
    { label: 'Referral', value: 4280, color: '#10b981' },
    { label: 'Social', value: 3670, color: '#a855f7' },
    { label: 'Email', value: 2080, color: '#f59e0b' }
  ];

  new Chart(document.getElementById('trafficChart'), {
    type: 'doughnut',
    data: {
      labels: trafficSources.map(s => s.label),
      datasets: [{
        data: trafficSources.map(s => s.value),
        backgroundColor: trafficSources.map(s => s.color),
        borderWidth: 0,
        spacing: 3,
        borderRadius: 6,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      plugins: {
        tooltip: {
          callbacks: {
            label: (c) => {
              const total = c.dataset.data.reduce((a, b) => a + b, 0);
              const pct = ((c.parsed / total) * 100).toFixed(1);
              return `${c.label}: ${c.parsed.toLocaleString()} (${pct}%)`;
            }
          }
        }
      }
    }
  });

  // Traffic legend
  const legendEl = document.getElementById('trafficLegend');
  const totalTraffic = trafficSources.reduce((a, s) => a + s.value, 0);
  trafficSources.forEach(s => {
    const pct = ((s.value / totalTraffic) * 100).toFixed(1);
    legendEl.innerHTML += `
      <div class="legend-item">
        <span class="legend-dot" style="background:${s.color}"></span>
        ${s.label} <strong>${pct}%</strong>
      </div>`;
  });

  // ========== Activity Feed ==========
  const activities = [
    { name: 'Sarah Chen', action: 'completed purchase', amount: '+$249.00', color: '#6c5ce7', time: '2 min ago', initial: 'SC' },
    { name: 'Marcus Johnson', action: 'signed up for Pro plan', amount: '+$99/mo', color: '#06b6d4', time: '5 min ago', initial: 'MJ' },
    { name: 'Aria Patel', action: 'submitted a support ticket', amount: '', color: '#f59e0b', time: '12 min ago', initial: 'AP' },
    { name: 'Jake Rivera', action: 'upgraded subscription', amount: '+$149/mo', color: '#10b981', time: '18 min ago', initial: 'JR' },
    { name: 'Emily Watson', action: 'left a 5-star review', amount: '', color: '#a855f7', time: '23 min ago', initial: 'EW' },
    { name: 'Alex Kim', action: 'made a bulk order', amount: '+$1,200', color: '#ef4444', time: '35 min ago', initial: 'AK' }
  ];

  const activityList = document.getElementById('activityList');
  activities.forEach(a => {
    activityList.innerHTML += `
      <div class="activity-item">
        <div class="activity-avatar" style="background:${a.color}20; color:${a.color}">${a.initial}</div>
        <div class="activity-content">
          <div class="activity-text"><strong>${a.name}</strong> ${a.action}</div>
          <div class="activity-time">${a.time}</div>
        </div>
        ${a.amount ? `<div class="activity-amount" style="color:${a.color}">${a.amount}</div>` : ''}
      </div>`;
  });

  // ========== Live Visitors ==========
  let liveData = Array.from({ length: 20 }, () => Math.floor(Math.random() * 80) + 100);
  let liveChart;

  function createLiveChart() {
    const ctx = document.getElementById('liveChart');
    liveChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: liveData.map((_, i) => i),
        datasets: [{
          data: liveData,
          borderColor: '#10b981',
          backgroundColor: (context) => {
            const g = context.chart.ctx.createLinearGradient(0, 0, 0, 80);
            g.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
            g.addColorStop(1, 'rgba(16, 185, 129, 0)');
            return g;
          },
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 500, easing: 'easeInOutQuart' },
        scales: { x: { display: false }, y: { display: false } },
        plugins: { legend: { display: false }, tooltip: { enabled: false } }
      }
    });
  }

  createLiveChart();

  // Live locations
  const locations = [
    { flag: '🇺🇸', name: 'United States', count: 58 },
    { flag: '🇬🇧', name: 'United Kingdom', count: 24 },
    { flag: '🇩🇪', name: 'Germany', count: 18 },
    { flag: '🇯🇵', name: 'Japan', count: 15 },
    { flag: '🇧🇷', name: 'Brazil', count: 12 }
  ];

  const locationsEl = document.getElementById('liveLocations');
  const maxCount = Math.max(...locations.map(l => l.count));

  locations.forEach(l => {
    const pct = (l.count / maxCount * 100).toFixed(0);
    locationsEl.innerHTML += `
      <div>
        <div class="location-item">
          <span class="location-name">
            <span class="location-flag">${l.flag}</span>
            ${l.name}
          </span>
          <span class="location-count">${l.count}</span>
        </div>
        <div class="location-bar">
          <div class="location-bar-fill" style="width:${pct}%"></div>
        </div>
      </div>`;
  });

  // ========== Live Data Updates ==========
  function animateValue(el, start, end, duration) {
    const prefix = el.textContent.startsWith('$') ? '$' : '';
    const suffix = el.textContent.includes('%') ? '%' : '';
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;

      if (suffix === '%') {
        el.textContent = `${current.toFixed(2)}${suffix}`;
      } else {
        el.textContent = `${prefix}${Math.floor(current).toLocaleString()}`;
      }

      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  // Update live visitors every 2 seconds
  setInterval(() => {
    const newVal = Math.floor(Math.random() * 80) + 100;
    liveData.push(newVal);
    liveData.shift();

    liveChart.data.datasets[0].data = [...liveData];
    liveChart.update('none');

    const liveCountEl = document.getElementById('liveCount');
    const oldVal = parseInt(liveCountEl.textContent) || 142;
    animateValue(liveCountEl, oldVal, newVal, 800);
  }, 2000);

  // Update stat values every 5 seconds
  setInterval(() => {
    const revEl = document.getElementById('revenueValue');
    const rev = Math.floor(Math.random() * 10000) + 45000;
    const oldRev = parseInt(revEl.textContent.replace(/[$,]/g, '')) || 48295;
    animateValue(revEl, oldRev, rev, 1200);

    const usersEl = document.getElementById('usersValue');
    const users = Math.floor(Math.random() * 500) + 2500;
    const oldUsers = parseInt(usersEl.textContent.replace(/,/g, '')) || 2847;
    animateValue(usersEl, oldUsers, users, 1200);

    const ordersEl = document.getElementById('ordersValue');
    const orders = Math.floor(Math.random() * 300) + 1300;
    const oldOrders = parseInt(ordersEl.textContent.replace(/,/g, '')) || 1429;
    animateValue(ordersEl, oldOrders, orders, 1200);
  }, 5000);

  // ========== Notification Button ==========
  document.getElementById('notifBtn').addEventListener('click', () => {
    const badge = document.querySelector('.notification-badge');
    badge.style.display = badge.style.display === 'none' ? 'flex' : 'none';
    showToast(badge.style.display === 'none' ? '🔕 Notifications cleared' : '🔔 3 notifications');
  });

  // ========== Search ==========
  document.getElementById('searchInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      showToast(`🔍 Searching: "${e.target.value}"`);
      e.target.value = '';
    }
  });

  // ========== Done ==========
  console.log(
    '%c⚡ ProDash v1.1 %cAll systems operational',
    'background: linear-gradient(135deg, #6c5ce7, #a855f7); color: white; padding: 8px 16px; border-radius: 8px 0 0 8px; font-weight: bold; font-size: 14px;',
    'background: #111128; color: #10b981; padding: 8px 16px; border-radius: 0 8px 8px 0; font-size: 14px;'
  );
});
