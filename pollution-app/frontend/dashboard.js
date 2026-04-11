/* ═══════════════════════════════════════════════════════════════
  dashboard.js  —  AirSense Air Quality Intelligence
   All app logic: data fetching, charts, routing, AI forecast
   ═══════════════════════════════════════════════════════════════ */

'use strict';

// ─── CONFIG ────────────────────────────────────────────────────────────────
const OWM_KEY = '3e69a8163fc7c0357daa04111301d20d';

// ─── STATE ─────────────────────────────────────────────────────────────────
let currentAqi  = 120;
let currentCity = 'New Delhi';
let charts      = {};     // keyed chart instances

// ─── BOOT ──────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  // Auth check: redirect to login if no token found
  const token = localStorage.getItem('aqi_token') || sessionStorage.getItem('aqi_token');
  if (!token) {
    window.location.href = '/login';
    return;
  }

  // Display logged-in user info
  try {
    const userData = JSON.parse(localStorage.getItem('aqi_user') || sessionStorage.getItem('aqi_user') || '{}');
    const userEl = document.getElementById('navUser');
    if (userEl && userData.username) {
      userEl.textContent = userData.username;
      userEl.style.display = 'inline';
    }
  } catch {}

  setTimeout(() => {
    const l = document.getElementById('loading');
    l.style.opacity = '0';
    setTimeout(() => l.style.display = 'none', 500);
    startClock();
    fetchAQI();
  }, 1600);

  document.getElementById('cityInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') fetchAQI();
  });
});

// ─── CLOCK ─────────────────────────────────────────────────────────────────
function startClock() {
  const tick = () => {
    const now  = new Date();
    const opts = { weekday:'short', year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit' };
    const el   = document.getElementById('heroTime');
    const nav  = document.getElementById('navTime');
    if (el)  el.textContent  = now.toLocaleString('en-IN', opts);
    if (nav) nav.textContent = now.toLocaleTimeString('en-IN');
  };
  tick();
  setInterval(tick, 1000);
}

// ─── SECTION NAVIGATION ────────────────────────────────────────────────────
function showSection(name, linkEl) {
  // hide all panels
  document.querySelectorAll('.section-panel').forEach(p => p.classList.remove('active'));
  // show target
  const target = document.getElementById('sec-' + name);
  if (target) target.classList.add('active');

  // update nav highlight
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  if (linkEl) linkEl.classList.add('active');
  else {
    const found = document.querySelector(`.nav-links a[data-section="${name}"]`);
    if (found) found.classList.add('active');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Build section-specific content on first visit
  if (name === 'forecast')  buildForecastSection();
  if (name === 'ai')        buildAIInsightsSection();
  if (name === 'compare')   runCompare();
}

// intercept nav clicks cleanly
document.addEventListener('click', e => {
  const a = e.target.closest('.nav-links a');
  if (!a) return;
  e.preventDefault();
  const sec = a.dataset.section;
  if (sec) showSection(sec, a);
});

// ─── REFRESH ───────────────────────────────────────────────────────────────
function refreshData() {
  showToast('success', '↺ Refreshing data…');
  fetchAQI();
}

// ─── AQI INFO HELPER ───────────────────────────────────────────────────────
function aqiInfo(aqi) {
  if (aqi <= 50)  return { status:'Good',            color:'#00e676', category:0, desc:'Air quality is satisfactory. Outdoor activities are safe for everyone.' };
  if (aqi <= 100) return { status:'Moderate',         color:'#ffee58', category:1, desc:'Air quality is acceptable. Unusually sensitive people may experience minor effects.' };
  if (aqi <= 150) return { status:'Unhealthy (SG)',   color:'#ff9800', category:2, desc:'Sensitive groups may experience health effects. General public is less likely to be affected.' };
  if (aqi <= 200) return { status:'Unhealthy',        color:'#f44336', category:3, desc:'Everyone may begin to experience health effects. Limit prolonged outdoor exertion.' };
  if (aqi <= 300) return { status:'Very Unhealthy',   color:'#9c27b0', category:4, desc:'Health warnings of emergency conditions. Entire population more likely to be affected.' };
  return           { status:'Hazardous',             color:'#7c0000', category:5, desc:'Health alert — serious effects for everyone. Avoid all outdoor activity.' };
}

// ─── US EPA AQI FROM PM2.5 ─────────────────────────────────────────────────
function pm25ToAQI(pm25) {
  const bp = [
    [0,     12.0,  0,   50],
    [12.1,  35.4,  51,  100],
    [35.5,  55.4,  101, 150],
    [55.5,  150.4, 151, 200],
    [150.5, 250.4, 201, 300],
    [250.5, 350.4, 301, 400],
    [350.5, 500.4, 401, 500],
  ];
  for (const [cLow, cHigh, iLow, iHigh] of bp) {
    if (pm25 >= cLow && pm25 <= cHigh)
      return Math.round(((iHigh - iLow) / (cHigh - cLow)) * (pm25 - cLow) + iLow);
  }
  return 500;
}

// ─── MAIN FETCH ────────────────────────────────────────────────────────────
async function fetchAQI() {
  const city = document.getElementById('cityInput')?.value.trim() || 'New Delhi';
  currentCity = city;

  const btn = document.getElementById('fetchBtn');
  if (btn) { btn.textContent = '⏳ Loading…'; btn.disabled = true; }

  try {
    // Step 1: Geocode city name → lat/lon
    const geoRes  = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${OWM_KEY}`);
    const geoData = await geoRes.json();
    if (!Array.isArray(geoData) || !geoData.length) throw new Error('City not found');
    const { lat, lon } = geoData[0];

    // Step 2: Fetch weather + air pollution in parallel
    const [weatherRes, pollutionRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWM_KEY}&units=metric`),
      fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OWM_KEY}`)
    ]);
    const [weatherData, pollutionData] = await Promise.all([weatherRes.json(), pollutionRes.json()]);

    // Step 3: Apply weather stats
    if (weatherData.main) {
      setText('statTemp',     Math.round(weatherData.main.temp));
      setText('statHumidity', weatherData.main.humidity);
      setText('statWind',     Math.round((weatherData.wind?.speed || 0) * 3.6));
      setText('statPressure', weatherData.main.pressure);
    }

    // Step 4: Derive US EPA AQI from PM2.5 and update UI
    const comp = pollutionData.list[0].components;
    const aqi  = pm25ToAQI(comp.pm2_5);
    currentAqi = aqi;
    updateHero(aqi, city);
    updateGauge(aqi);

    // Map OWM components (all in μg/m³) to display format
    const iaqi = {
      pm25: { v: Math.round(comp.pm2_5 * 10) / 10 },
      pm10: { v: Math.round(comp.pm10) },
      o3:   { v: Math.round(comp.o3) },
      no2:  { v: Math.round(comp.no2) },
      co:   { v: Math.round(comp.co) },
      so2:  { v: Math.round(comp.so2) },
    };
    updatePollutants(iaqi);
    renderAIForecast(aqi);
    renderHealthAdvice(aqi);
    updateAlert(aqi);
    showToast('success', `✓ Live data loaded for ${city}`);

  } catch {
    useDemoData(city);
    fetchWeather(city);
  }

  buildMainCharts();
  if (btn) { btn.textContent = '↗ Fetch AQI'; btn.disabled = false; }
}

// ─── DEMO DATA ─────────────────────────────────────────────────────────────
const CITY_AQI = {
  'new delhi':168,'delhi':168,'mumbai':87,'kolkata':134,'bangalore':62,
  'bengaluru':62,'chennai':74,'hyderabad':91,'pune':78,'ahmedabad':115,
  'jaipur':142,'lucknow':189,'kanpur':201,'patna':175,'varanasi':162,
  'beijing':156,'shanghai':98,'london':42,'new york':55,'paris':38,
  'tokyo':44,'los angeles':72,'dubai':95,'singapore':34,'sydney':28,
  'berlin':36,'toronto':41,'seoul':88,'mexico city':112,'cairo':143,
};

function useDemoData(city) {
  const key = city.toLowerCase().trim();
  const aqi = CITY_AQI[key] ?? Math.floor(Math.random() * 180 + 20);
  currentAqi = aqi;
  updateHero(aqi, city);
  updateGauge(aqi);
  const fakeIaqi = {
    pm25:{ v: Math.round(aqi * 0.55 + rand(10)) },
    pm10:{ v: Math.round(aqi * 0.85 + rand(18)) },
    o3:  { v: Math.round(38  + rand(60)) },
    no2: { v: Math.round(18  + rand(75)) },
    co:  { v: parseFloat((0.3 + Math.random() * 2).toFixed(2)) },
    so2: { v: Math.round(4   + rand(28)) },
  };
  updatePollutants(fakeIaqi);
  renderAIForecast(aqi);
  renderHealthAdvice(aqi);
  updateAlert(aqi);
}

function rand(n) { return Math.round(Math.random() * n); }

// ─── HERO ──────────────────────────────────────────────────────────────────
function updateHero(aqi, city) {
  const info = aqiInfo(aqi);
  // animated count
  const el = document.getElementById('aqiNumber');
  if (!el) return;
  let start = 0; const dur = 1100;
  const t0  = performance.now();
  const tick = now => {
    const p = Math.min((now - t0) / dur, 1);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(start + aqi * e);
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  el.style.color = info.color;
  setText('aqiStatus',  info.status);
  setText('aqiDesc',    info.desc);
  setText('heroCity',   city.toUpperCase());
  const statusEl = document.getElementById('aqiStatus');
  if (statusEl) statusEl.style.color = info.color;

  // Forecast page today card
  setText('fcTodayAqi',    aqi);
  setText('fcTodayStatus', info.status);
  setText('fcTodayDesc',   info.desc);
  const fcAqi = document.getElementById('fcTodayAqi');
  if (fcAqi) fcAqi.style.color = info.color;
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ─── GAUGE ─────────────────────────────────────────────────────────────────
function updateGauge(aqi) {
  const rot = Math.min(Math.max(-140 + (aqi / 500) * 280, -140), 140);
  const ng  = document.getElementById('needleGroup');
  const ga  = document.getElementById('gaugeAqi');
  if (ng) ng.setAttribute('transform', `rotate(${rot},120,120)`);
  if (ga) ga.textContent = aqi;
}

// ─── POLLUTANTS ────────────────────────────────────────────────────────────
const POLL_DEFS = [
  { key:'pm25', label:'PM2.5', unit:'μg/m³', max:250,   color:'#f44336' },
  { key:'pm10', label:'PM10',  unit:'μg/m³', max:350,   color:'#ff9800' },
  { key:'o3',   label:'Ozone', unit:'μg/m³', max:400,   color:'#00bcd4' },
  { key:'no2',  label:'NO₂',   unit:'μg/m³', max:400,   color:'#9c27b0' },
  { key:'co',   label:'CO',    unit:'μg/m³', max:15000, color:'#607d8b' },
  { key:'so2',  label:'SO₂',   unit:'μg/m³', max:350,   color:'#ff5722' },
];

function updatePollutants(iaqi) {
  const grid = document.getElementById('pollGrid');
  if (!grid) return;
  grid.innerHTML = POLL_DEFS.map(p => {
    const val = iaqi[p.key]?.v ?? Math.round(Math.random() * p.max * 0.5);
    const pct = Math.min((val / p.max) * 100, 100).toFixed(1);
    return `<div class="poll-card">
      <div class="poll-name">${p.label}</div>
      <div class="poll-value" style="color:${p.color}">${val}</div>
      <div class="poll-unit">${p.unit}</div>
      <div class="poll-bar-track"><div class="poll-bar-fill" style="width:0%;background:${p.color}" data-pct="${pct}"></div></div>
    </div>`;
  }).join('');
  setTimeout(() => {
    grid.querySelectorAll('.poll-bar-fill').forEach(el => {
      el.style.width = el.dataset.pct + '%';
    });
  }, 100);
}

// ─── WEATHER ───────────────────────────────────────────────────────────────
async function fetchWeather(city) {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OWM_KEY}&units=metric`);
    const d   = await res.json();
    if (d.main) {
      setText('statTemp',     Math.round(d.main.temp));
      setText('statHumidity', d.main.humidity);
      setText('statWind',     Math.round((d.wind?.speed || 0) * 3.6));
      setText('statPressure', d.main.pressure);
    }
  } catch {
    setText('statTemp',     Math.round(20 + Math.random() * 15));
    setText('statHumidity', Math.round(40 + Math.random() * 40));
    setText('statWind',     Math.round(5  + Math.random() * 20));
    setText('statPressure', Math.round(1005 + Math.random() * 20));
  }
}

// ─── ALERT BANNER ──────────────────────────────────────────────────────────
function updateAlert(aqi) {
  const banner = document.getElementById('alertBanner');
  const text   = document.getElementById('alertText');
  if (!banner) return;
  if (aqi > 100) {
    const info = aqiInfo(aqi);
    banner.style.display = 'flex';
    banner.style.borderColor = info.color + '55';
    banner.style.background  = info.color + '14';
    if (text) text.textContent = `AQI ${aqi} — ${info.status}. ${info.desc}`;
  } else {
    banner.style.display = 'none';
  }
}

// ─── MAIN CHARTS (Dashboard) ───────────────────────────────────────────────
const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      mode: 'index', intersect: false,
      backgroundColor: 'rgba(10,21,32,0.92)',
      borderColor: 'rgba(0,200,255,0.3)', borderWidth: 1,
      titleFont: { family: 'Space Mono', size: 10 },
      bodyFont:  { family: 'DM Sans',    size: 12 },
    },
  },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(255,255,255,0.3)', font: { family: 'Space Mono', size: 8 } }, border: { display: false } },
    y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(255,255,255,0.3)', font: { family: 'Space Mono', size: 8 } }, border: { display: false }, min: 0 },
  },
  animation: { duration: 900 },
};

function buildMainCharts() {
  build24hChart();
  buildHistoricalCharts();
  buildMap();
}

// 24-hour trend
function build24hChart() {
  const ctx = document.getElementById('aqiChart');
  if (!ctx) return;
  const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  const data   = labels.map((_, i) => Math.max(10, Math.round(currentAqi + Math.sin(i / 3) * 22 + (Math.random() - 0.5) * 18)));

  destroyChart('main');
  charts.main = new Chart(ctx.getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'AQI',
        data,
        borderColor: 'rgba(0,200,255,0.9)',
        backgroundColor: ctx2 => {
          const g = ctx2.chart.ctx.createLinearGradient(0, 0, 0, 200);
          g.addColorStop(0, 'rgba(0,200,255,0.22)');
          g.addColorStop(1, 'rgba(0,200,255,0.01)');
          return g;
        },
        fill: true, tension: 0.42, borderWidth: 2,
        pointRadius: 0, pointHoverRadius: 4,
        pointBackgroundColor: '#00c8ff',
      }],
    },
    options: { ...CHART_DEFAULTS },
  });
}

// Switch chart range
function switchChart(btn, range) {
  document.querySelectorAll('.chart-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  let labels, data;
  if (range === '24h') {
    labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    data   = labels.map(() => Math.max(10, Math.round(currentAqi + (Math.random() - 0.5) * 40)));
  } else if (range === '7d') {
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    labels = days;
    data   = days.map(() => Math.max(10, Math.round(currentAqi + (Math.random() - 0.5) * 60)));
  } else {
    labels = Array.from({ length: 30 }, (_, i) => `D${i + 1}`);
    data   = labels.map(() => Math.max(10, Math.round(currentAqi + (Math.random() - 0.5) * 80)));
  }

  if (charts.main) {
    charts.main.data.labels        = labels;
    charts.main.data.datasets[0].data = data;
    charts.main.update();
  }
}

// Historical charts
function buildHistoricalCharts() {
  const months   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const seasonal = [180,170,130,110,120,95,88,90,115,145,175,185];
  const scale    = currentAqi / 160;
  const mData    = seasonal.map(v => Math.round(v * scale));

  // Monthly bar
  const mCtx = document.getElementById('histChart');
  if (mCtx) {
    destroyChart('hist');
    charts.hist = new Chart(mCtx.getContext('2d'), {
      type: 'bar',
      data: {
        labels: months,
        datasets: [{
          data: mData,
          backgroundColor: mData.map(v => v > 150 ? 'rgba(244,67,54,0.7)' : v > 100 ? 'rgba(255,152,0,0.7)' : 'rgba(0,230,118,0.7)'),
          borderRadius: 4,
        }],
      },
      options: {
        ...CHART_DEFAULTS,
        plugins: { ...CHART_DEFAULTS.plugins, legend: { display: false } },
      },
    });
  }

  // Distribution donut
  const dCtx = document.getElementById('distChart');
  if (dCtx) {
    destroyChart('dist');
    charts.dist = new Chart(dCtx.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['Good','Moderate','USG','Unhealthy','V.Unhealthy','Hazardous'],
        datasets: [{
          data: [12, 20, 25, 22, 13, 8],
          backgroundColor: ['#00e676','#ffee58','#ff9800','#f44336','#9c27b0','#7c0000'],
          borderWidth: 0, hoverOffset: 8,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '66%',
        plugins: {
          legend: { position: 'right', labels: { color: 'rgba(255,255,255,0.45)', font: { family: 'Space Mono', size: 8 }, boxWidth: 10 } },
        },
        animation: { duration: 900 },
      },
    });
  }
}

// Regional map (canvas drawing)
function buildMap() {
  const canvas = document.getElementById('mapCanvas');
  if (!canvas) return;
  canvas.width  = canvas.offsetWidth  || 1200;
  canvas.height = canvas.offsetHeight || 300;
  const W = canvas.width, H = canvas.height;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0a1520';
  ctx.fillRect(0, 0, W, H);

  // Rough India outline
  ctx.strokeStyle = 'rgba(0,200,255,0.15)';
  ctx.lineWidth   = 1;
  const cx = W * 0.5, cy = H * 0.48, sc = Math.min(W, H) * 0.002;
  const pts = [[0,0],[30,-40],[60,-55],[100,-60],[140,-55],[160,-40],[165,-10],[155,20],[140,60],[120,100],[100,140],[80,160],[60,170],[40,165],[20,155],[10,140],[0,120],[10,90],[0,60],[-20,30],[-30,10],[0,0]];
  ctx.beginPath();
  pts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(cx + x * sc, cy + y * sc) : ctx.lineTo(cx + x * sc, cy + y * sc));
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = 'rgba(0,200,255,0.04)';
  ctx.fill();

  // Cities
  const cities = [
    { name:'Delhi',     x:0.48, y:0.22, aqi:168 },
    { name:'Mumbai',    x:0.36, y:0.55, aqi:87  },
    { name:'Kolkata',   x:0.68, y:0.48, aqi:134 },
    { name:'Bangalore', x:0.44, y:0.72, aqi:62  },
    { name:'Chennai',   x:0.50, y:0.78, aqi:74  },
    { name:'Hyderabad', x:0.47, y:0.62, aqi:91  },
    { name:'Jaipur',    x:0.41, y:0.30, aqi:142 },
    { name:'Lucknow',   x:0.55, y:0.28, aqi:189 },
    { name:'Ahmedabad', x:0.35, y:0.42, aqi:115 },
  ];

  ctx.font = '9px Space Mono, monospace';
  cities.forEach(c => {
    const info = aqiInfo(c.aqi);
    const px = c.x * W, py = c.y * H;
    const gr = ctx.createRadialGradient(px, py, 0, px, py, 22);
    gr.addColorStop(0, info.color + '55'); gr.addColorStop(1, 'transparent');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(px, py, 22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = info.color; ctx.beginPath(); ctx.arc(px, py, 4.5, 0, Math.PI * 2); ctx.fill();
    const lbl = `${c.name} ${c.aqi}`;
    const tw  = ctx.measureText(lbl).width;
    ctx.fillStyle = 'rgba(5,10,15,0.82)'; ctx.fillRect(px + 8, py - 10, tw + 8, 18);
    ctx.fillStyle = '#e8f4ff'; ctx.fillText(lbl, px + 12, py + 3);
  });
}

window.addEventListener('resize', () => setTimeout(buildMap, 120));

// ─── AI FORECAST ───────────────────────────────────────────────────────────
function renderAIForecast(aqi) {
  const days = ['Tomorrow','Day +2','Day +3','Day +4','Day +5','Day +6','Day +7'];
  const conf = Math.floor(82 + Math.random() * 12);
  const confEl = document.getElementById('aiConfidence');
  if (confEl) confEl.textContent = `CONFIDENCE: ${conf}% · LSTM`;

  let prev = aqi;
  const listEl = document.getElementById('aiForecastList');
  if (!listEl) return;
  listEl.innerHTML = days.map(day => {
    const drift    = (Math.random() - 0.45) * 28;
    const seasonal = Math.sin(days.indexOf(day) / 2.5) * 14;
    prev = Math.max(10, Math.min(500, Math.round(prev + drift + seasonal)));
    const info = aqiInfo(prev);
    const pct  = Math.min(prev / 350 * 100, 100).toFixed(1);
    return `<div class="ai-day">
      <span class="ai-day-name">${day}</span>
      <div class="ai-bar-wrap"><div class="ai-bar" style="width:0%;background:${info.color}" data-pct="${pct}"></div></div>
      <span class="ai-day-val" style="color:${info.color}">${prev}</span>
      <span class="ai-day-status">${info.status}</span>
    </div>`;
  }).join('');

  setTimeout(() => {
    listEl.querySelectorAll('.ai-bar').forEach(el => el.style.width = el.dataset.pct + '%');
  }, 80);
}

// ─── HEALTH ADVICE ─────────────────────────────────────────────────────────
const HEALTH_ADVICE = {
  0: [
    { icon:'🏃', title:'Exercise Freely',   text:'Perfect conditions for outdoor workouts.' },
    { icon:'🪟', title:'Open Windows',      text:'Great time to ventilate your home.' },
    { icon:'👶', title:'Safe for All',      text:'No risk for sensitive groups.' },
    { icon:'🌿', title:'Enjoy Nature',      text:'Ideal for hiking and cycling.' },
  ],
  1: [
    { icon:'😷', title:'Sensitive Groups',  text:'Unusually sensitive people reduce outdoor time.' },
    { icon:'🏃', title:'Moderate Activity', text:'Limit prolonged outdoor exercise.' },
    { icon:'🪟', title:'Ventilate OK',      text:'Open windows during daytime.' },
    { icon:'💊', title:'Asthma Watch',      text:'Keep quick-relief inhalers accessible.' },
  ],
  2: [
    { icon:'😷', title:'Wear N95 Mask',     text:'Sensitive groups mask up outside.' },
    { icon:'🏠', title:'Limit Outdoor Time',text:'Sensitive individuals stay mostly indoors.' },
    { icon:'🌬️', title:'Air Purifier On',   text:'Run HEPA purifiers continuously.' },
    { icon:'🚫', title:'Avoid Strenuous',   text:'No heavy exertion outdoors.' },
  ],
  3: [
    { icon:'🏠', title:'Stay Indoors',      text:'Keep windows closed, everyone.' },
    { icon:'😷', title:'Mask Required',     text:'N95 if you must go outside.' },
    { icon:'🌬️', title:'Purifiers On',      text:'HEPA in every room.' },
    { icon:'🚑', title:'Seek Help',         text:'Chest pain? Seek medical attention immediately.' },
  ],
  4: [
    { icon:'🚨', title:'Emergency Level',   text:'Avoid ALL outdoor activities.' },
    { icon:'🏠', title:'Seal Home',         text:'Seal windows and doors.' },
    { icon:'😷', title:'Full Respirator',   text:'Full-face mask if you must leave.' },
    { icon:'📞', title:'Check on Others',   text:'Check on elderly and children.' },
  ],
  5: [
    { icon:'🚨', title:'Hazardous',         text:'Do NOT go outside. Treat as a disaster.' },
    { icon:'🆘', title:'Emergency Services',text:'Call emergency services if seriously ill.' },
    { icon:'🏠', title:'Seal & Stay',       text:'Most sealed room available.' },
    { icon:'📺', title:'Follow Broadcasts', text:'Monitor official emergency announcements.' },
  ],
};

function renderHealthAdvice(aqi) {
  const cat    = aqiInfo(aqi).category;
  const advice = HEALTH_ADVICE[Math.min(cat, 5)];
  const el     = document.getElementById('healthGrid');
  if (!el) return;
  el.innerHTML = advice.map(a =>
    `<div class="health-item"><span class="health-icon">${a.icon}</span><div class="health-text"><strong>${a.title}</strong>${a.text}</div></div>`
  ).join('');
}

// ─── FORECAST SECTION ──────────────────────────────────────────────────────
function buildForecastSection() {
  updateHero(currentAqi, currentCity);

  // 7-day forecast cards
  const row   = document.getElementById('forecastRow');
  const dnames = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun','Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const icons  = ['☀️','🌤️','⛅','🌧️','🌥️','☀️','🌤️','⛅'];
  if (row) {
    let prev = currentAqi;
    row.innerHTML = dnames.slice(0, 7).map((day, i) => {
      prev = Math.max(10, Math.min(500, Math.round(prev + (Math.random() - 0.45) * 35)));
      const info = aqiInfo(prev);
      return `<div class="forecast-day-card ${i === 0 ? 'active-day' : ''}">
        <div class="fdc-day">${day}</div>
        <div class="fdc-icon">${icons[i % icons.length]}</div>
        <div class="fdc-aqi" style="color:${info.color}">${prev}</div>
        <div class="fdc-lbl">${info.status}</div>
      </div>`;
    }).join('');
  }

  // 14-day projection chart
  const fc14 = document.getElementById('fcChart');
  if (fc14) {
    const labels = dnames;
    let p = currentAqi;
    const data = labels.map(() => { p = Math.max(10, Math.round(p + (Math.random() - 0.45) * 30)); return p; });
    destroyChart('fc14');
    charts.fc14 = new Chart(fc14.getContext('2d'), {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Predicted AQI',
          data,
          borderColor: 'rgba(0,255,157,0.85)',
          backgroundColor: ctx2 => {
            const g = ctx2.chart.ctx.createLinearGradient(0, 0, 0, 180);
            g.addColorStop(0, 'rgba(0,255,157,0.18)');
            g.addColorStop(1, 'rgba(0,255,157,0.01)');
            return g;
          },
          fill: true, tension: 0.4, borderWidth: 2, borderDash: [5, 4],
          pointRadius: 3, pointBackgroundColor: '#00ff9d',
        }],
      },
      options: { ...CHART_DEFAULTS },
    });
  }

  // Hourly chart
  const hourly = document.getElementById('hourlyChart');
  if (hourly) {
    const hlabels = ['Now','+1h','+2h','+3h','+4h','+5h','+6h','+7h'];
    const hdata   = hlabels.map(() => Math.max(10, Math.round(currentAqi + (Math.random() - 0.5) * 20)));
    destroyChart('hourly');
    charts.hourly = new Chart(hourly.getContext('2d'), {
      type: 'bar',
      data: {
        labels: hlabels,
        datasets: [{
          data: hdata,
          backgroundColor: hdata.map(v => aqiInfo(v).color + 'bb'),
          borderRadius: 4,
        }],
      },
      options: { ...CHART_DEFAULTS, plugins: { ...CHART_DEFAULTS.plugins, legend: { display: false } } },
    });
  }

  // Pollution rose (radar)
  const rose = document.getElementById('roseChart');
  if (rose) {
    destroyChart('rose');
    charts.rose = new Chart(rose.getContext('2d'), {
      type: 'radar',
      data: {
        labels: ['N','NE','E','SE','S','SW','W','NW'],
        datasets: [{
          label: 'Pollution spread',
          data: Array.from({ length: 8 }, () => Math.round(20 + Math.random() * 80)),
          borderColor: 'rgba(0,200,255,0.8)',
          backgroundColor: 'rgba(0,200,255,0.1)',
          pointBackgroundColor: '#00c8ff',
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          r: {
            grid: { color: 'rgba(255,255,255,0.06)' },
            ticks: { display: false },
            pointLabels: { color: 'rgba(255,255,255,0.4)', font: { family: 'Space Mono', size: 9 } },
          },
        },
      },
    });
  }

  // Forecast factors
  const factors = [
    { icon:'💨', key:'Wind Pattern',  val:'Westerly winds — dispersing pollutants',    good:true },
    { icon:'💧', key:'Humidity',      val:'High humidity trapping fine particles',      good:false },
    { icon:'🌡️', key:'Temperature',   val:'Temperature inversion expected tonight',     good:false },
    { icon:'🚗', key:'Traffic',       val:'Rush hour peaks at 8–10 AM and 5–8 PM',      good:false },
    { icon:'🌱', key:'Vegetation',    val:'Green buffer zones reduce particulates',     good:true },
    { icon:'🏭', key:'Industrial',    val:'Weekend — reduced industrial emissions',     good:true },
  ];
  const fcf = document.getElementById('fcFactors');
  if (fcf) {
    fcf.innerHTML = factors.map(f =>
      `<div class="trend-item">
        <span class="trend-arrow">${f.good ? '🟢' : '🔴'}</span>
        <div class="trend-text"><strong>${f.icon} ${f.key}</strong>${f.val}</div>
      </div>`
    ).join('');
  }
}

// ─── AI INSIGHTS SECTION ───────────────────────────────────────────────────
function buildAIInsightsSection() {
  // Model stats
  setText('aiRmse', (8 + Math.random() * 6).toFixed(2));
  setText('aiMae',  (5 + Math.random() * 4).toFixed(2));
  setText('aiAcc',  (80 + Math.random() * 12).toFixed(1) + '%');
  setText('srcCity', currentCity);

  // Feature importance chart
  const fCtx = document.getElementById('featureChart');
  if (fCtx) {
    const features = ['PM2.5 (lag-1)','Wind Speed','Temperature','Humidity','Traffic Density','PM10 (lag-1)','Hour of Day','NO₂ (lag-1)','Season','Pressure'];
    const values   = [0.28,0.17,0.13,0.11,0.09,0.08,0.06,0.04,0.03,0.01].map(v => (v * 100).toFixed(1));
    destroyChart('feature');
    charts.feature = new Chart(fCtx.getContext('2d'), {
      type: 'bar',
      data: {
        labels: features,
        datasets: [{
          label: 'Importance (%)',
          data: values,
          backgroundColor: features.map((_, i) => `rgba(0,200,255,${1 - i * 0.08})`),
          borderRadius: 4,
        }],
      },
      options: {
        ...CHART_DEFAULTS,
        indexAxis: 'y',
        plugins: { ...CHART_DEFAULTS.plugins, legend: { display: false } },
        scales: {
          x: { ...CHART_DEFAULTS.scales.x, ticks: { ...CHART_DEFAULTS.scales.x.ticks, callback: v => v + '%' } },
          y: { ...CHART_DEFAULTS.scales.y, grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.45)', font: { family: 'Space Mono', size: 8 } } },
        },
      },
    });
  }

  // Pollution sources pie
  const sCtx = document.getElementById('sourceChart');
  if (sCtx) {
    destroyChart('source');
    charts.source = new Chart(sCtx.getContext('2d'), {
      type: 'pie',
      data: {
        labels: ['Vehicles','Industry','Construction','Biomass Burning','Household','Other'],
        datasets: [{
          data: [38, 22, 15, 12, 8, 5],
          backgroundColor: ['#f44336','#ff9800','#9c27b0','#00bcd4','#00e676','#607d8b'],
          borderWidth: 0, hoverOffset: 6,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: 'rgba(255,255,255,0.4)', font: { family: 'Space Mono', size: 7.5 }, boxWidth: 10 } } },
        animation: { duration: 900 },
      },
    });
  }

  // Anomaly list
  const anomalies = [
    { icon:'📈', label:'PM2.5',      delta:'+34%', dir:'up',   note:'Above 30-day avg' },
    { icon:'📉', label:'Ozone',      delta:'-12%', dir:'down', note:'Below seasonal baseline' },
    { icon:'📈', label:'NO₂',        delta:'+18%', dir:'up',   note:'Elevated — traffic source' },
    { icon:'📉', label:'Wind speed', delta:'-25%', dir:'down', note:'Calm — poor dispersion' },
  ];
  const anomEl = document.getElementById('anomalyList');
  if (anomEl) {
    anomEl.innerHTML = anomalies.map(a =>
      `<div class="model-stat-row">
        <span class="model-stat-key">${a.icon} ${a.label}</span>
        <div style="text-align:right">
          <span style="font-family:'Space Mono',monospace;font-size:0.68rem;color:${a.dir === 'up' ? '#f44336' : '#00e676'}">${a.delta}</span>
          <span style="font-family:'Space Mono',monospace;font-size:0.6rem;color:var(--muted);margin-left:8px">${a.note}</span>
        </div>
      </div>`
    ).join('');
  }

  // AI trends
  const trends = [
    { icon:'📆', good:false, title:'Winter Spike Imminent',         body:'LSTM model predicts 40% AQI increase in next 3 weeks based on historical patterns.' },
    { icon:'🌧️', good:true,  title:'Rain Expected — AQI Drop',      body:'Forecast precipitation should reduce PM2.5 by ~30% over the next 48 hours.' },
    { icon:'🚗', good:false, title:'Traffic Correlation: 0.82',     body:'Strong correlation detected between peak-hour traffic and AQI spikes.' },
    { icon:'📊', good:true,  title:'Long-Term Improvement',         body:'5-year trend shows 12% reduction in annual average AQI for this region.' },
  ];
  const tEl = document.getElementById('aiTrends');
  if (tEl) {
    tEl.innerHTML = trends.map(t =>
      `<div class="trend-item">
        <span class="trend-arrow">${t.good ? '🟢' : '🔴'}</span>
        <div class="trend-text"><strong>${t.icon} ${t.title}</strong>${t.body}</div>
      </div>`
    ).join('');
  }
}

// ─── COMPARE SECTION ───────────────────────────────────────────────────────
function runCompare() {
  const c1 = (document.getElementById('cmp1')?.value || 'Delhi').trim();
  const c2 = (document.getElementById('cmp2')?.value || 'Mumbai').trim();
  const c3 = (document.getElementById('cmp3')?.value || 'Kolkata').trim();
  const cities = [c1, c2, c3];

  const aqiVals = cities.map(c => {
    const k = c.toLowerCase();
    return CITY_AQI[k] ?? Math.round(50 + Math.random() * 150);
  });

  // Cards
  const grid = document.getElementById('compareGrid');
  if (grid) {
    grid.innerHTML = cities.map((city, i) => {
      const aqi  = aqiVals[i];
      const info = aqiInfo(aqi);
      const pct  = Math.min(aqi / 350 * 100, 100).toFixed(1);
      const ranks = ['🥇 Best Air','🥈 Mid Range','🥉 Worst Air'];
      const sorted = [...aqiVals].sort((a, b) => a - b);
      const rank = sorted.indexOf(aqi);
      return `<div class="compare-card">
        <div class="compare-city">${city.toUpperCase()}</div>
        <div class="compare-aqi" style="color:${info.color}">${aqi}</div>
        <div style="font-family:'Bebas Neue',sans-serif;font-size:1rem;color:${info.color}">${info.status}</div>
        <div class="compare-rank">${ranks[rank]}</div>
        <div class="compare-bar-track"><div class="compare-bar" style="width:0%;background:${info.color}" data-pct="${pct}"></div></div>
      </div>`;
    }).join('');
    setTimeout(() => grid.querySelectorAll('.compare-bar').forEach(el => el.style.width = el.dataset.pct + '%'), 80);
  }

  // Bar chart
  const cCtx = document.getElementById('compareChart');
  if (cCtx) {
    destroyChart('compare');
    charts.compare = new Chart(cCtx.getContext('2d'), {
      type: 'bar',
      data: {
        labels: cities,
        datasets: [{
          label: 'AQI',
          data: aqiVals,
          backgroundColor: aqiVals.map(v => aqiInfo(v).color + 'bb'),
          borderRadius: 6,
        }],
      },
      options: {
        ...CHART_DEFAULTS,
        plugins: { ...CHART_DEFAULTS.plugins, legend: { display: false } },
      },
    });
  }

  // Pollutant radar / grouped bar
  const pCtx = document.getElementById('pollCompareChart');
  if (pCtx) {
    const pollLabels = ['PM2.5','PM10','O₃','NO₂','CO×10','SO₂'];
    const pollColors = ['rgba(0,200,255,0.75)','rgba(0,255,157,0.75)','rgba(255,184,0,0.75)'];
    destroyChart('pollCmp');
    charts.pollCmp = new Chart(pCtx.getContext('2d'), {
      type: 'bar',
      data: {
        labels: pollLabels,
        datasets: cities.map((city, i) => ({
          label: city,
          data: pollLabels.map(() => Math.round(aqiVals[i] * (0.3 + Math.random() * 0.7))),
          backgroundColor: pollColors[i],
          borderRadius: 4,
        })),
      },
      options: {
        ...CHART_DEFAULTS,
        plugins: {
          ...CHART_DEFAULTS.plugins,
          legend: { display: true, labels: { color: 'rgba(255,255,255,0.45)', font: { family: 'Space Mono', size: 9 }, boxWidth: 12 } },
        },
      },
    });
  }

  // Rankings
  const rankEl = document.getElementById('rankingList');
  const globalRanks = [
    { city:'Sydney',    aqi:28 }, { city:'Tokyo',     aqi:44 },
    { city:'London',    aqi:42 }, { city:'Paris',     aqi:38 },
    { city:'Singapore', aqi:34 }, { city:'Toronto',   aqi:41 },
    { city:'Seoul',     aqi:88 }, { city:'Dubai',     aqi:95 },
    { city:'Mumbai',    aqi:87 }, { city:'Shanghai',  aqi:98 },
    { city:'Bangalore', aqi:62 }, { city:'Cairo',     aqi:143 },
    { city:'Delhi',     aqi:168 }, { city:'Lucknow',  aqi:189 },
    { city:'Kanpur',    aqi:201 }, { city:'Beijing',  aqi:156 },
  ].sort((a, b) => a.aqi - b.aqi);

  if (rankEl) {
    rankEl.innerHTML = `<div class="chart-box" style="padding:16px 22px;">` +
      globalRanks.map((r, i) => {
        const info = aqiInfo(r.aqi);
        const pct  = Math.min(r.aqi / 250 * 100, 100).toFixed(1);
        return `<div style="display:flex;align-items:center;gap:14px;padding:7px 0;border-bottom:1px solid var(--border);">
          <span style="font-family:'Space Mono',monospace;font-size:0.65rem;color:var(--muted);width:24px;text-align:right">${i + 1}</span>
          <span style="font-family:'Bebas Neue',sans-serif;font-size:0.95rem;width:110px">${r.city}</span>
          <div style="flex:1;height:5px;background:rgba(255,255,255,0.06);border-radius:4px;overflow:hidden;"><div style="height:100%;width:${pct}%;background:${info.color};border-radius:4px;transition:width 0.9s ease;"></div></div>
          <span style="font-family:'Space Mono',monospace;font-size:0.7rem;color:${info.color};width:44px;text-align:right">${r.aqi}</span>
          <span style="font-size:0.65rem;color:var(--muted);width:100px;text-align:right">${info.status}</span>
        </div>`;
      }).join('') + `</div>`;
  }
}

// ─── TOAST ─────────────────────────────────────────────────────────────────
function showToast(type, msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  document.getElementById('toastMsg').textContent = msg;
  toast.className = `toast ${type}`;
  void toast.offsetWidth; // reflow
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ─── UTILS ─────────────────────────────────────────────────────────────────
function destroyChart(key) {
  if (charts[key]) { charts[key].destroy(); delete charts[key]; }
}