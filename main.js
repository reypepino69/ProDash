/* ============================================================
   ProDash 2.0 — Complete Dashboard Engine
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // ==================== UTILITIES ====================
  function $(s, p = document) { return p.querySelector(s) }
  function $$(s, p = document) { return [...p.querySelectorAll(s)] }
  function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
  function randFloat(min, max) { return (Math.random() * (max - min) + min).toFixed(2) }

  // ==================== TOAST SYSTEM ====================
  function showToast(msg) {
    const existing = $('.toast');
    if (existing) existing.remove();
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    t.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:9999;background:rgba(108,92,231,0.95);color:white;padding:12px 24px;border-radius:12px;font-size:0.85rem;font-weight:600;font-family:'Inter',sans-serif;backdrop-filter:blur(10px);box-shadow:0 8px 32px rgba(0,0,0,0.3);transform:translateY(20px);opacity:0;transition:all 0.3s cubic-bezier(0.4,0,0.2,1)`;
    document.body.appendChild(t);
    requestAnimationFrame(() => { t.style.transform = 'translateY(0)'; t.style.opacity = '1' });
    setTimeout(() => { t.style.transform = 'translateY(20px)'; t.style.opacity = '0'; setTimeout(() => t.remove(), 300) }, 2000);
  }

  // ==================== LOAD SETTINGS ====================
  const settings = JSON.parse(localStorage.getItem('prodash_settings') || '{}');
  function saveSetting(k, v) { settings[k] = v; localStorage.setItem('prodash_settings', JSON.stringify(settings)) }

  // Apply saved theme
  if (settings.theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    $('.moon-icon').style.display = 'none';
    $('.sun-icon').style.display = 'block';
  }
  if (settings.accent) document.documentElement.style.setProperty('--accent-1', settings.accent);
  if (settings.name) { $('#userName').textContent = settings.name; $('#userAvatar').textContent = settings.name.charAt(0).toUpperCase() }
  if (settings.sidebarCollapsed) $('#sidebar').classList.add('collapsed');

  // ==================== SPA ROUTER ====================
  const pages = ['dashboard', 'analytics', 'users', 'revenue', 'settings'];
  const pageInits = {};
  let currentPage = 'dashboard';

  function navigateTo(page) {
    if (!pages.includes(page)) return;
    currentPage = page;
    $$('.page').forEach(p => p.classList.remove('active'));
    $(`#page-${page}`).classList.add('active');
    $$('.nav-item').forEach(n => n.classList.remove('active'));
    $(`.nav-item[data-page="${page}"]`).classList.add('active');
    $('#pageTitle').textContent = page.charAt(0).toUpperCase() + page.slice(1);
    if (pageInits[page]) { pageInits[page](); pageInits[page] = null }
  }

  $$('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      const page = item.dataset.page;
      navigateTo(page);
      showToast(`📄 ${page.charAt(0).toUpperCase() + page.slice(1)}`);
      if ($('#sidebar').classList.contains('open')) $('#sidebar').classList.remove('open');
    });
  });

  $$('[data-goto]').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); navigateTo(el.dataset.goto) });
  });

  // ==================== SIDEBAR COLLAPSE ====================
  $('#sidebarCollapseBtn').addEventListener('click', () => {
    const sb = $('#sidebar');
    sb.classList.toggle('collapsed');
    saveSetting('sidebarCollapsed', sb.classList.contains('collapsed'));
  });
  $('#menuToggle').addEventListener('click', () => $('#sidebar').classList.toggle('open'));

  // ==================== THEME TOGGLE ====================
  function toggleTheme() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    document.documentElement.setAttribute('data-theme', isLight ? 'dark' : 'light');
    $('.moon-icon').style.display = isLight ? 'block' : 'none';
    $('.sun-icon').style.display = isLight ? 'none' : 'block';
    saveSetting('theme', isLight ? 'dark' : 'light');
    const dmToggle = $('#darkModeToggle');
    if (dmToggle) dmToggle.checked = isLight;
    showToast(isLight ? '🌙 Dark mode' : '☀️ Light mode');
  }
  $('#themeToggle').addEventListener('click', toggleTheme);

  // ==================== SEARCH MODAL ====================
  const searchModal = $('#searchModal');
  const searchInput = $('#searchModalInput');
  const searchResults = $('#searchResults');

  function openSearch() { searchModal.classList.add('open'); searchInput.value = ''; searchInput.focus(); renderSearchResults('') }
  function closeSearch() { searchModal.classList.remove('open') }

  $('#searchTrigger').addEventListener('click', openSearch);
  $('.search-modal-backdrop').addEventListener('click', closeSearch);
  searchInput.addEventListener('input', () => renderSearchResults(searchInput.value));

  const searchableItems = [
    { label: 'Dashboard', icon: '📊', page: 'dashboard' },
    { label: 'Analytics', icon: '📈', page: 'analytics' },
    { label: 'Users', icon: '👥', page: 'users' },
    { label: 'Revenue', icon: '💰', page: 'revenue' },
    { label: 'Settings', icon: '⚙️', page: 'settings' },
    { label: 'Export Users CSV', icon: '⬇️', action: () => { navigateTo('users'); setTimeout(() => $('#exportUsers')?.click(), 100) } },
    { label: 'Toggle Dark Mode', icon: '🌙', action: toggleTheme },
    { label: 'View Revenue Chart', icon: '📈', page: 'revenue' },
    { label: 'User Growth', icon: '📊', page: 'users' },
    { label: 'Recent Transactions', icon: '💳', page: 'revenue' },
  ];

  function renderSearchResults(query) {
    const q = query.toLowerCase().trim();
    if (!q) { searchResults.innerHTML = '<div class="search-hint">Type to search pages, actions, or data...</div>'; return }
    const matches = searchableItems.filter(i => i.label.toLowerCase().includes(q));
    if (!matches.length) { searchResults.innerHTML = '<div class="search-hint">No results found</div>'; return }
    searchResults.innerHTML = matches.map(m => `<div class="search-result-item" data-page="${m.page || ''}" data-idx="${searchableItems.indexOf(m)}">${m.icon} ${m.label}</div>`).join('');
    $$('.search-result-item', searchResults).forEach(el => {
      el.addEventListener('click', () => {
        const item = searchableItems[parseInt(el.dataset.idx)];
        if (item.page) navigateTo(item.page);
        if (item.action) item.action();
        closeSearch();
      });
    });
  }

  // ==================== NOTIFICATIONS ====================
  const notifPanel = $('#notifPanel');
  const notifications = [
    { icon: '💰', bg: 'rgba(108,92,231,0.15)', text: '<strong>New sale!</strong> Sarah Chen purchased Pro Plan', time: '2 min ago', unread: true },
    { icon: '👤', bg: 'rgba(6,182,212,0.15)', text: '<strong>New user</strong> registered from United Kingdom', time: '8 min ago', unread: true },
    { icon: '⚠️', bg: 'rgba(245,158,11,0.15)', text: '<strong>Server alert:</strong> CPU usage at 85%', time: '15 min ago', unread: true },
    { icon: '🎉', bg: 'rgba(16,185,129,0.15)', text: '<strong>Milestone!</strong> 10,000 monthly active users', time: '1 hour ago', unread: false },
    { icon: '📊', bg: 'rgba(168,85,247,0.15)', text: '<strong>Weekly report</strong> is ready to download', time: '3 hours ago', unread: false },
  ];

  function renderNotifications() {
    const unread = notifications.filter(n => n.unread).length;
    const badge = $('#notifBadge');
    badge.textContent = unread; badge.style.display = unread ? 'flex' : 'none';
    $('#notifList').innerHTML = notifications.map(n => `
      <div class="notif-item${n.unread ? ' unread' : ''}">
        <div class="notif-icon" style="background:${n.bg}">${n.icon}</div>
        <div class="notif-body"><div class="notif-text">${n.text}</div><div class="notif-time">${n.time}</div></div>
      </div>`).join('');
  }
  renderNotifications();

  $('#notifBtn').addEventListener('click', e => {
    e.stopPropagation();
    notifPanel.classList.toggle('open');
    notifications.forEach(n => n.unread = false);
    renderNotifications();
  });
  $('#notifClear').addEventListener('click', () => { notifications.length = 0; renderNotifications(); notifPanel.classList.remove('open'); showToast('🔕 Notifications cleared') });
  document.addEventListener('click', e => { if (!notifPanel.contains(e.target) && !$('#notifBtn').contains(e.target)) notifPanel.classList.remove('open') });

  // ==================== KEYBOARD SHORTCUTS ====================
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); searchModal.classList.contains('open') ? closeSearch() : openSearch() }
    if (e.key === 'Escape') { closeSearch(); notifPanel.classList.remove('open') }
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') { e.preventDefault(); toggleTheme() }
    if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '5') { e.preventDefault(); navigateTo(pages[parseInt(e.key) - 1]) }
  });

  // ==================== CHART.JS SETUP ====================
  if (typeof Chart === 'undefined') { showToast('⚠️ Chart.js failed to load'); return }
  Chart.defaults.font.family = "'Inter',sans-serif";
  Chart.defaults.color = '#8888aa';
  Chart.defaults.plugins.legend.display = false;
  Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(17,17,40,0.95)';
  Chart.defaults.plugins.tooltip.padding = 12;
  Chart.defaults.plugins.tooltip.cornerRadius = 10;
  Chart.defaults.plugins.tooltip.displayColors = false;

  // ==================== CSV EXPORT UTILITY ====================
  function exportCSV(headers, rows, filename) {
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
    showToast(`⬇️ Downloaded ${filename}`);
  }

  // ==================== TABLE ENGINE ====================
  function createSortableTable({ bodyId, data, columns, paginationId, pageSize = 10, searchId }) {
    let sortCol = null, sortDir = 'asc', searchQuery = '', page = 1;
    const tbody = $(`#${bodyId}`);
    const pagination = paginationId ? $(`#${paginationId}`) : null;

    function render() {
      let filtered = searchQuery
        ? data.filter(r => columns.some(c => String(r[c.key]).toLowerCase().includes(searchQuery)))
        : [...data];

      if (sortCol) {
        filtered.sort((a, b) => {
          let va = a[sortCol], vb = b[sortCol];
          if (typeof va === 'string') va = va.toLowerCase();
          if (typeof vb === 'string') vb = vb.toLowerCase();
          if (va < vb) return sortDir === 'asc' ? -1 : 1;
          if (va > vb) return sortDir === 'asc' ? 1 : -1;
          return 0;
        });
      }

      const totalPages = Math.ceil(filtered.length / pageSize);
      if (page > totalPages) page = totalPages || 1;
      const start = (page - 1) * pageSize;
      const paged = filtered.slice(start, start + pageSize);

      tbody.innerHTML = paged.map(row =>
        '<tr>' + columns.map(c => `<td>${c.render ? c.render(row[c.key], row) : row[c.key]}</td>`).join('') + '</tr>'
      ).join('');

      if (pagination && totalPages > 1) {
        let btns = '';
        for (let i = 1; i <= totalPages; i++) btns += `<button class="page-btn${i === page ? ' active' : ''}" data-p="${i}">${i}</button>`;
        pagination.innerHTML = btns;
        $$('.page-btn', pagination).forEach(b => b.addEventListener('click', () => { page = parseInt(b.dataset.p); render() }));
      } else if (pagination) {
        pagination.innerHTML = '';
      }
    }

    // Sort headers
    const table = tbody.closest('table');
    $$('th[data-sort]', table).forEach(th => {
      th.addEventListener('click', () => {
        const col = th.dataset.sort;
        if (sortCol === col) { sortDir = sortDir === 'asc' ? 'desc' : 'asc' } else { sortCol = col; sortDir = 'asc' }
        $$('th', table).forEach(t => t.classList.remove('sort-asc', 'sort-desc'));
        th.classList.add(sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
        render();
      });
    });

    if (searchId) {
      $(`#${searchId}`).addEventListener('input', e => { searchQuery = e.target.value.toLowerCase(); page = 1; render() });
    }

    render();
    return { render, getData: () => data };
  }

  function statusBadge(val) {
    return `<span class="status-badge status-${val.toLowerCase()}">${val}</span>`;
  }

  // =======================================================================================
  // PAGE: DASHBOARD
  // =======================================================================================
  function createSparkline(id, data, color) {
    const ctx = $(`#${id}`); if (!ctx) return;
    return new Chart(ctx, { type: 'line', data: { labels: data.map((_, i) => i), datasets: [{ data, borderColor: color, borderWidth: 2, fill: true, backgroundColor: color.replace('1)', '0.1)'), pointRadius: 0, tension: 0.4 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { x: { display: false }, y: { display: false } }, plugins: { legend: { display: false }, tooltip: { enabled: false } } } });
  }
  createSparkline('sparkRevenue', [30,45,35,50,65,55,70,60,80,75,90,85], 'rgba(108,92,231,1)');
  createSparkline('sparkUsers', [20,35,25,40,30,45,55,50,60,65,55,70], 'rgba(6,182,212,1)');
  createSparkline('sparkOrders', [15,25,35,30,45,40,50,55,45,60,65,70], 'rgba(16,185,129,1)');
  createSparkline('sparkConversion', [40,35,45,30,38,32,36,28,34,30,26,32], 'rgba(245,158,11,1)');

  // Revenue Chart
  const revenueCanvas = $('#revenueChart');
  const revData = {
    '7d': { labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], revenue: [4200,5800,4900,7200,6100,8400,7800], expenses: [2800,3200,2900,3800,3400,4100,3600] },
    '30d': { labels: Array.from({length:30},(_,i)=>`Day ${i+1}`), revenue: Array.from({length:30},()=>rand(3000,8000)), expenses: Array.from({length:30},()=>rand(1500,4500)) },
    '90d': { labels: Array.from({length:12},(_,i)=>`Wk ${i+1}`), revenue: Array.from({length:12},()=>rand(15000,35000)), expenses: Array.from({length:12},()=>rand(8000,20000)) },
    '1y': { labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], revenue: [32000,38000,35000,42000,48000,44000,52000,58000,55000,62000,68000,72000], expenses: [18000,21000,19000,24000,27000,25000,29000,32000,30000,34000,37000,39000] }
  };
  let revChart = null;
  function makeRevenueChart(range) {
    const d = revData[range]; if (!d) return;
    if (revChart) { revChart.destroy(); revChart = null }
    revChart = new Chart(revenueCanvas, { type: 'line', data: { labels: d.labels, datasets: [
      { label:'Revenue', data:d.revenue, borderColor:'#6c5ce7', backgroundColor:c=>{const g=c.chart.ctx.createLinearGradient(0,0,0,280);g.addColorStop(0,'rgba(108,92,231,0.3)');g.addColorStop(1,'rgba(108,92,231,0)');return g}, borderWidth:3, fill:true, tension:.4, pointRadius:0, pointHoverRadius:6, pointHoverBackgroundColor:'#6c5ce7', pointHoverBorderColor:'#fff', pointHoverBorderWidth:2 },
      { label:'Expenses', data:d.expenses, borderColor:'#a855f7', backgroundColor:c=>{const g=c.chart.ctx.createLinearGradient(0,0,0,280);g.addColorStop(0,'rgba(168,85,247,0.15)');g.addColorStop(1,'rgba(168,85,247,0)');return g}, borderWidth:2, borderDash:[6,4], fill:true, tension:.4, pointRadius:0 }
    ] }, options: { responsive:true, maintainAspectRatio:false, interaction:{mode:'index',intersect:false}, animation:{duration:600}, plugins:{ legend:{display:true,position:'top',align:'end',labels:{usePointStyle:true,pointStyle:'circle',padding:20,font:{size:12,weight:500}}}, tooltip:{callbacks:{label:c=>`${c.dataset.label}: $${c.parsed.y.toLocaleString()}`}} }, scales:{ x:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{maxTicksLimit:10}}, y:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{callback:v=>`$${(v/1000).toFixed(0)}k`}} } } });
  }
  makeRevenueChart('7d');
  $('.chart-tabs').addEventListener('click', e => {
    const tab = e.target.closest('.chart-tab'); if (!tab) return;
    $$('.chart-tab').forEach(t => t.classList.remove('active')); tab.classList.add('active');
    makeRevenueChart(tab.dataset.range); showToast(`📈 ${tab.textContent} data`);
  });

  // Traffic Doughnut
  const trafficSources = [{label:'Direct',value:8420,color:'#6c5ce7'},{label:'Organic',value:6350,color:'#06b6d4'},{label:'Referral',value:4280,color:'#10b981'},{label:'Social',value:3670,color:'#a855f7'},{label:'Email',value:2080,color:'#f59e0b'}];
  new Chart($('#trafficChart'), { type:'doughnut', data:{ labels:trafficSources.map(s=>s.label), datasets:[{data:trafficSources.map(s=>s.value),backgroundColor:trafficSources.map(s=>s.color),borderWidth:0,spacing:3,borderRadius:6,hoverOffset:8}] }, options:{ responsive:true, maintainAspectRatio:false, cutout:'72%', plugins:{tooltip:{callbacks:{label:c=>{const t=c.dataset.data.reduce((a,b)=>a+b,0);return `${c.label}: ${c.parsed.toLocaleString()} (${((c.parsed/t)*100).toFixed(1)}%)`}}}} } });
  const totalTraffic = trafficSources.reduce((a,s)=>a+s.value,0);
  $('#trafficLegend').innerHTML = trafficSources.map(s=>`<div class="legend-item"><span class="legend-dot" style="background:${s.color}"></span>${s.label} <strong>${((s.value/totalTraffic)*100).toFixed(1)}%</strong></div>`).join('');

  // Activity Feed
  const activities = [
    {name:'Sarah Chen',action:'completed purchase',amount:'+$249.00',color:'#6c5ce7',time:'2 min ago',initial:'SC'},
    {name:'Marcus Johnson',action:'signed up for Pro plan',amount:'+$99/mo',color:'#06b6d4',time:'5 min ago',initial:'MJ'},
    {name:'Aria Patel',action:'submitted support ticket',amount:'',color:'#f59e0b',time:'12 min ago',initial:'AP'},
    {name:'Jake Rivera',action:'upgraded subscription',amount:'+$149/mo',color:'#10b981',time:'18 min ago',initial:'JR'},
    {name:'Emily Watson',action:'left a 5-star review',amount:'',color:'#a855f7',time:'23 min ago',initial:'EW'},
    {name:'Alex Kim',action:'made a bulk order',amount:'+$1,200',color:'#ef4444',time:'35 min ago',initial:'AK'}
  ];
  $('#activityList').innerHTML = activities.map(a=>`<div class="activity-item"><div class="activity-avatar" style="background:${a.color}20;color:${a.color}">${a.initial}</div><div class="activity-content"><div class="activity-text"><strong>${a.name}</strong> ${a.action}</div><div class="activity-time">${a.time}</div></div>${a.amount?`<div class="activity-amount" style="color:${a.color}">${a.amount}</div>`:''}</div>`).join('');

  // Live Visitors
  let liveData = Array.from({length:20},()=>rand(100,180));
  const liveChart = new Chart($('#liveChart'), { type:'line', data:{ labels:liveData.map((_,i)=>i), datasets:[{data:liveData,borderColor:'#10b981',backgroundColor:c=>{const g=c.chart.ctx.createLinearGradient(0,0,0,80);g.addColorStop(0,'rgba(16,185,129,0.3)');g.addColorStop(1,'rgba(16,185,129,0)');return g},borderWidth:2,fill:true,tension:.4,pointRadius:0}] }, options:{responsive:true,maintainAspectRatio:false,animation:{duration:500},scales:{x:{display:false},y:{display:false}},plugins:{legend:{display:false},tooltip:{enabled:false}}} });

  const locations = [{flag:'🇺🇸',name:'United States',count:58},{flag:'🇬🇧',name:'United Kingdom',count:24},{flag:'🇩🇪',name:'Germany',count:18},{flag:'🇯🇵',name:'Japan',count:15},{flag:'🇧🇷',name:'Brazil',count:12}];
  const maxC = Math.max(...locations.map(l=>l.count));
  $('#liveLocations').innerHTML = locations.map(l=>`<div><div class="location-item"><span class="location-name"><span class="location-flag">${l.flag}</span>${l.name}</span><span class="location-count">${l.count}</span></div><div class="location-bar"><div class="location-bar-fill" style="width:${(l.count/maxC*100).toFixed(0)}%"></div></div></div>`).join('');

  // Live updaters
  function animVal(el, start, end, dur) {
    const pre = el.textContent.startsWith('$') ? '$' : '', suf = el.textContent.includes('%') ? '%' : '';
    const st = performance.now();
    function upd(t) {
      const p = Math.min((t - st) / dur, 1), e = 1 - Math.pow(1 - p, 3), c = start + (end - start) * e;
      el.textContent = suf === '%' ? `${c.toFixed(2)}${suf}` : `${pre}${Math.floor(c).toLocaleString()}`;
      if (p < 1) requestAnimationFrame(upd);
    }
    requestAnimationFrame(upd);
  }
  setInterval(() => {
    const nv = rand(100,180); liveData.push(nv); liveData.shift();
    liveChart.data.datasets[0].data = [...liveData]; liveChart.update('none');
    const el = $('#liveCount'); animVal(el, parseInt(el.textContent)||142, nv, 800);
  }, 2000);
  setInterval(() => {
    const re=$('#revenueValue'),rv=rand(45000,55000),or=parseInt(re.textContent.replace(/[$,]/g,''))||48295; animVal(re,or,rv,1200);
    const ue=$('#usersValue'),uv=rand(2500,3000),uo=parseInt(ue.textContent.replace(/,/g,''))||2847; animVal(ue,uo,uv,1200);
    const oe=$('#ordersValue'),ov=rand(1300,1600),oo=parseInt(oe.textContent.replace(/,/g,''))||1429; animVal(oe,oo,ov,1200);
  }, 5000);

  // =======================================================================================
  // PAGE: ANALYTICS (lazy init)
  // =======================================================================================
  pageInits.analytics = () => {
    // Page Views & Sessions
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    new Chart($('#analyticsChart'), { type:'bar', data:{ labels:months, datasets:[
      {label:'Page Views',data:months.map(()=>rand(10000,25000)),backgroundColor:'rgba(108,92,231,0.7)',borderRadius:6,barPercentage:0.5},
      {label:'Sessions',data:months.map(()=>rand(3000,8000)),backgroundColor:'rgba(6,182,212,0.7)',borderRadius:6,barPercentage:0.5}
    ]}, options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:true,position:'top',align:'end',labels:{usePointStyle:true,pointStyle:'circle',padding:20}}},scales:{x:{grid:{display:false}},y:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{callback:v=>`${(v/1000).toFixed(0)}k`}}}} });

    // Device breakdown
    const devices = [{label:'Desktop',value:28400,color:'#6c5ce7'},{label:'Mobile',value:18200,color:'#06b6d4'},{label:'Tablet',value:6200,color:'#10b981'}];
    new Chart($('#deviceChart'), {type:'doughnut',data:{labels:devices.map(d=>d.label),datasets:[{data:devices.map(d=>d.value),backgroundColor:devices.map(d=>d.color),borderWidth:0,spacing:3,borderRadius:6}]},options:{responsive:true,maintainAspectRatio:false,cutout:'72%'}});
    const devTotal = devices.reduce((a,d)=>a+d.value,0);
    $('#deviceLegend').innerHTML = devices.map(d=>`<div class="legend-item"><span class="legend-dot" style="background:${d.color}"></span>${d.label} <strong>${((d.value/devTotal)*100).toFixed(1)}%</strong></div>`).join('');

    // Top Pages Table
    const topPages = [
      {page:'/dashboard',views:24893,uniques:18240,bounce:'28.3%',duration:'5m 12s'},
      {page:'/pricing',views:18472,uniques:14830,bounce:'35.1%',duration:'3m 48s'},
      {page:'/features',views:15329,uniques:12100,bounce:'31.7%',duration:'4m 22s'},
      {page:'/blog/ai-trends',views:12847,uniques:10920,bounce:'42.5%',duration:'6m 14s'},
      {page:'/signup',views:9831,uniques:8740,bounce:'22.8%',duration:'2m 35s'},
      {page:'/docs/api',views:8294,uniques:6830,bounce:'38.9%',duration:'7m 43s'},
      {page:'/contact',views:6742,uniques:5920,bounce:'45.2%',duration:'1m 58s'},
      {page:'/blog/startup-guide',views:5891,uniques:4730,bounce:'40.1%',duration:'5m 29s'},
    ];
    createSortableTable({bodyId:'topPagesBody',data:topPages,columns:[{key:'page'},{key:'views'},{key:'uniques'},{key:'bounce'},{key:'duration'}]});
    $('#exportTopPages').addEventListener('click', () => exportCSV(['Page','Views','Uniques','Bounce Rate','Duration'], topPages.map(p=>[p.page,p.views,p.uniques,p.bounce,p.duration]), 'top-pages.csv'));
  };

  // =======================================================================================
  // PAGE: USERS (lazy init)
  // =======================================================================================
  const firstNames = ['Emma','Liam','Olivia','Noah','Ava','Elijah','Sophia','James','Isabella','William','Mia','Oliver','Charlotte','Benjamin','Amelia','Lucas','Harper','Henry','Evelyn','Alexander','Luna','Daniel','Ella','Michael','Grace','Sebastian','Chloe','Jack','Penelope','Aiden','Layla','Owen','Riley','Samuel','Zoey','Ryan','Nora','Nathan','Lily','Caleb','Eleanor','Christian','Hannah','Dylan','Lillian','Isaac','Addison','Joshua','Aubrey','Andrew','Ellie'];
  const lastNames = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson','Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores','Green','Adams','Nelson','Baker','Hall','Rivera','Campbell','Mitchell','Carter','Roberts'];
  const roles = ['Admin','Editor','Viewer','Moderator'];
  const statuses = ['Active','Inactive','Pending'];

  const usersData = Array.from({length:50}, (_,i) => {
    const fn = firstNames[i % firstNames.length], ln = lastNames[rand(0,lastNames.length-1)];
    const d = new Date(2024, rand(0,11), rand(1,28));
    return { name:`${fn} ${ln}`, email:`${fn.toLowerCase()}.${ln.toLowerCase()}@email.com`, role:roles[rand(0,3)], status:statuses[rand(0,2)], joined:d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}), joinedTs:d.getTime(), spent:`$${rand(0,9999).toLocaleString()}` };
  });

  pageInits.users = () => {
    // User Growth Chart
    new Chart($('#userGrowthChart'), { type:'line', data:{ labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], datasets:[{label:'New Users',data:[420,580,640,720,810,950,880,1020,1180,1340,1500,1680],borderColor:'#6c5ce7',backgroundColor:c=>{const g=c.chart.ctx.createLinearGradient(0,0,0,280);g.addColorStop(0,'rgba(108,92,231,0.2)');g.addColorStop(1,'rgba(108,92,231,0)');return g},borderWidth:3,fill:true,tension:.4,pointRadius:0,pointHoverRadius:6}] }, options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'rgba(255,255,255,0.04)'}},y:{grid:{color:'rgba(255,255,255,0.04)'}}}} });

    // Users Table
    createSortableTable({
      bodyId: 'usersTableBody', data: usersData, searchId: 'userSearch', paginationId: 'usersPagination', pageSize: 8,
      columns: [
        { key:'name', render:(v,r)=>`<div style="display:flex;align-items:center;gap:10px"><div class="activity-avatar" style="background:rgba(108,92,231,0.15);color:#6c5ce7;width:32px;height:32px;border-radius:8px;font-size:0.7rem">${r.name.split(' ').map(w=>w[0]).join('')}</div>${v}</div>` },
        { key:'email' }, { key:'role' },
        { key:'status', render: statusBadge },
        { key:'joined' }, { key:'spent' }
      ]
    });

    $('#exportUsers').addEventListener('click', () => exportCSV(['Name','Email','Role','Status','Joined','Spent'], usersData.map(u=>[u.name,u.email,u.role,u.status,u.joined,u.spent]), 'users.csv'));
  };

  // =======================================================================================
  // PAGE: REVENUE (lazy init)
  // =======================================================================================
  pageInits.revenue = () => {
    // Revenue & Profit
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const rev = [32000,38000,35000,42000,48000,44000,52000,58000,55000,62000,68000,72000];
    const profit = rev.map(r => Math.floor(r * (rand(30,50)/100)));
    new Chart($('#revProfitChart'), { type:'bar', data:{ labels:months, datasets:[
      {label:'Revenue',data:rev,backgroundColor:'rgba(108,92,231,0.7)',borderRadius:6,barPercentage:0.6},
      {label:'Profit',data:profit,backgroundColor:'rgba(16,185,129,0.7)',borderRadius:6,barPercentage:0.6}
    ]}, options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:true,position:'top',align:'end',labels:{usePointStyle:true,pointStyle:'circle',padding:20}},tooltip:{callbacks:{label:c=>`${c.dataset.label}: $${c.parsed.y.toLocaleString()}`}}},scales:{x:{grid:{display:false}},y:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{callback:v=>`$${(v/1000).toFixed(0)}k`}}}} });

    // Channel Doughnut
    const channels = [{label:'Subscriptions',value:18200,color:'#6c5ce7'},{label:'One-time',value:9800,color:'#06b6d4'},{label:'Enterprise',value:7400,color:'#10b981'},{label:'Add-ons',value:3020,color:'#f59e0b'}];
    new Chart($('#channelChart'), {type:'doughnut',data:{labels:channels.map(c=>c.label),datasets:[{data:channels.map(c=>c.value),backgroundColor:channels.map(c=>c.color),borderWidth:0,spacing:3,borderRadius:6,hoverOffset:8}]},options:{responsive:true,maintainAspectRatio:false,cutout:'72%'}});
    const chTotal = channels.reduce((a,c)=>a+c.value,0);
    $('#channelLegend').innerHTML = channels.map(c=>`<div class="legend-item"><span class="legend-dot" style="background:${c.color}"></span>${c.label} <strong>${((c.value/chTotal)*100).toFixed(1)}%</strong></div>`).join('');

    // Transactions Table
    const products = ['Pro Plan','Enterprise','Starter','Add-on Pack','API Access','Custom Theme','Data Export','Team Plan'];
    const txStatuses = ['Completed','Completed','Completed','Pending','Refunded'];
    const transactions = Array.from({length:30}, (_,i) => {
      const fn = firstNames[rand(0,firstNames.length-1)], ln = lastNames[rand(0,lastNames.length-1)];
      const d = new Date(2026, 2, rand(1,3), rand(0,23), rand(0,59));
      return { id:`TXN-${String(1000+i).padStart(4,'0')}`, customer:`${fn} ${ln}`, product:products[rand(0,products.length-1)], amount:`$${rand(19,499)}.${String(rand(0,99)).padStart(2,'0')}`, status:txStatuses[rand(0,txStatuses.length-1)], date:d.toLocaleDateString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}) };
    });

    createSortableTable({
      bodyId:'transactionsBody', data:transactions, paginationId:'transactionsPagination', pageSize:8,
      columns: [
        {key:'id',render:v=>`<strong style="color:var(--accent-1)">${v}</strong>`},
        {key:'customer'},{key:'product'},
        {key:'amount',render:v=>`<strong>${v}</strong>`},
        {key:'status',render:statusBadge},{key:'date'}
      ]
    });

    $('#exportTransactions').addEventListener('click', () => exportCSV(['ID','Customer','Product','Amount','Status','Date'], transactions.map(t=>[t.id,t.customer,t.product,t.amount,t.status,t.date]), 'transactions.csv'));
  };

  // =======================================================================================
  // PAGE: SETTINGS
  // =======================================================================================
  pageInits.settings = () => {
    // Load saved settings into form
    if (settings.name) $('#settingName').value = settings.name;
    if (settings.email) $('#settingEmail').value = settings.email;
    if (settings.bio) $('#settingBio').value = settings.bio;
    if (settings.accent) {
      $$('.theme-option').forEach(o => { o.classList.toggle('active', o.dataset.accent === settings.accent) });
    }
    const dmToggle = $('#darkModeToggle');
    dmToggle.checked = document.documentElement.getAttribute('data-theme') !== 'light';
    $('#compactSidebar').checked = $('#sidebar').classList.contains('collapsed');
    if (settings.notifEmail !== undefined) $('#notifEmail').checked = settings.notifEmail;
    if (settings.notifPush !== undefined) $('#notifPush').checked = settings.notifPush;
    if (settings.notifWeekly !== undefined) $('#notifWeekly').checked = settings.notifWeekly;
    if (settings.notifMarketing !== undefined) $('#notifMarketing').checked = settings.notifMarketing;

    // Save profile
    $('#saveProfile').addEventListener('click', () => {
      const name = $('#settingName').value.trim();
      const email = $('#settingEmail').value.trim();
      const bio = $('#settingBio').value.trim();
      saveSetting('name', name); saveSetting('email', email); saveSetting('bio', bio);
      if (name) { $('#userName').textContent = name; $('#userAvatar').textContent = name.charAt(0).toUpperCase() }
      showToast('✅ Profile saved!');
    });

    // Theme picker
    $$('.theme-option').forEach(opt => {
      opt.addEventListener('click', () => {
        $$('.theme-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        const accent = opt.dataset.accent;
        document.documentElement.style.setProperty('--accent-1', accent);
        saveSetting('accent', accent);
        showToast('🎨 Accent color changed!');
      });
    });

    // Dark mode toggle
    dmToggle.addEventListener('change', () => {
      const isDark = dmToggle.checked;
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      $('.moon-icon').style.display = isDark ? 'block' : 'none';
      $('.sun-icon').style.display = isDark ? 'none' : 'block';
      saveSetting('theme', isDark ? 'dark' : 'light');
    });

    // Compact sidebar
    $('#compactSidebar').addEventListener('change', e => {
      $('#sidebar').classList.toggle('collapsed', e.target.checked);
      saveSetting('sidebarCollapsed', e.target.checked);
    });

    // Notification toggles
    ['notifEmail','notifPush','notifWeekly','notifMarketing'].forEach(id => {
      $(`#${id}`).addEventListener('change', e => { saveSetting(id, e.target.checked); showToast('🔔 Notification settings saved') });
    });
  };

  // =======================================================================================
  // INITIALIZATION COMPLETE
  // =======================================================================================
  console.log(
    '%c⚡ ProDash v2.0 %cAll systems operational',
    'background:linear-gradient(135deg,#6c5ce7,#a855f7);color:white;padding:8px 16px;border-radius:8px 0 0 8px;font-weight:bold;font-size:14px',
    'background:#111128;color:#10b981;padding:8px 16px;border-radius:0 8px 8px 0;font-size:14px'
  );
});
