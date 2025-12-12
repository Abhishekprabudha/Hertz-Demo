const state = {
  config: null,
  scenarios: null,
  activeScenario: 'normal',
  activeTab: null,
  dataCache: {},
};

async function loadJSON(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  return response.json();
}

function setScenarioPill() {
  const pill = document.getElementById('scenario-pill');
  const label = state.activeScenario.charAt(0).toUpperCase() + state.activeScenario.slice(1);
  pill.textContent = `Scenario: ${label}`;
}

function renderTabs() {
  const nav = document.getElementById('tab-nav');
  nav.innerHTML = '';
  state.config.tabs.forEach((tab, idx) => {
    const btn = document.createElement('button');
    btn.textContent = tab.label;
    btn.dataset.tab = tab.id;
    btn.className = idx === 0 ? 'active' : '';
    btn.addEventListener('click', () => switchTab(tab.id));
    nav.appendChild(btn);
  });
}

function renderScenario(scenarioKey) {
  const scenario = state.scenarios[scenarioKey];
  document.getElementById('narration').textContent = scenario.narration;
  const signalsList = document.getElementById('signals-list');
  signalsList.innerHTML = '';
  scenario.signals.forEach((signal) => {
    const li = document.createElement('li');
    li.textContent = signal;
    signalsList.appendChild(li);
  });
}

function applyScenarioTransforms(baseData) {
  const data = JSON.parse(JSON.stringify(baseData));
  if (state.activeScenario === 'normal') return data;

  const isDisrupt = state.activeScenario === 'disrupt';
  const scenarioBadge = isDisrupt ? 'Disruption detected' : 'Correction in progress';
  const recTag = isDisrupt ? 'Detect/Freeze' : 'Correct/Optimize';
  const recText = isDisrupt ? 'Isolate volatile corridors and throttle risky trips' : 'Stabilize lanes and optimize dwell times';
  const recWhy = isDisrupt ? 'Anomaly signatures triggered freeze protocols.' : 'Recovery phase active—optimize flows to restore margins.';

  data.mapBadges = [scenarioBadge, ...data.mapBadges];
  data.recommendations = [
    { tag: recTag, text: recText, why: recWhy },
    ...data.recommendations,
  ];

  if (data.kpis.length > 0) {
    data.kpis[0].tone = isDisrupt ? 'warn' : 'good';
  }
  return data;
}

function renderKPIs(kpis) {
  const grid = document.getElementById('kpi-grid');
  grid.innerHTML = '';
  kpis.forEach((kpi) => {
    const tile = document.createElement('div');
    tile.className = `kpi-tile ${kpi.tone}`;
    const label = document.createElement('p');
    label.className = 'kpi-label';
    label.textContent = kpi.label;

    const value = document.createElement('p');
    value.className = 'kpi-value';
    value.textContent = kpi.value;

    const delta = document.createElement('p');
    delta.className = 'kpi-delta';
    delta.textContent = kpi.delta;

    tile.append(label, value, delta);
    grid.appendChild(tile);
  });
}

function renderRecommendations(recs) {
  const list = document.getElementById('rec-list');
  list.innerHTML = '';
  recs.forEach((rec) => {
    const li = document.createElement('li');
    li.className = 'rec-item';

    const tag = document.createElement('div');
    tag.className = 'rec-tag';
    tag.textContent = rec.tag;

    const textWrapper = document.createElement('div');
    const text = document.createElement('p');
    text.className = 'rec-text';
    text.textContent = rec.text;

    const why = document.createElement('p');
    why.className = 'rec-why';
    why.textContent = rec.why;

    textWrapper.append(text, why);
    li.append(tag, textWrapper);
    list.appendChild(li);
  });
}

function renderMapBadges(badges) {
  const container = document.getElementById('map-badges');
  container.innerHTML = '';
  badges.forEach((badge) => {
    const span = document.createElement('span');
    span.className = 'badge';
    span.textContent = badge;
    container.appendChild(span);
  });
}

function renderContent(data) {
  document.getElementById('tab-title').textContent = state.config.tabs.find(t => t.id === state.activeTab)?.label || '';
  document.getElementById('map-badge-label').textContent = 'Live';
  document.getElementById('chart-text').textContent = data.chartText;
  document.getElementById('explain-text').textContent = data.explain;
  renderMapBadges(data.mapBadges);
  renderKPIs(data.kpis);
  renderRecommendations(data.recommendations);
}

async function fetchTabData(tabId) {
  if (state.dataCache[tabId]) return state.dataCache[tabId];
  const data = await loadJSON(`data/${tabId}.json`);
  state.dataCache[tabId] = data;
  return data;
}

async function switchTab(tabId) {
  state.activeTab = tabId;
  document.querySelectorAll('.tab-nav button').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  const baseData = await fetchTabData(tabId);
  const transformed = applyScenarioTransforms(baseData);
  renderContent(transformed);
}

async function handleScenarioChange(scenarioKey) {
  state.activeScenario = scenarioKey;
  setScenarioPill();
  document.querySelectorAll('.scenario-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.scenario === scenarioKey);
  });
  renderScenario(scenarioKey);
  if (state.activeTab) {
    const baseData = await fetchTabData(state.activeTab);
    const transformed = applyScenarioTransforms(baseData);
    renderContent(transformed);
  }
}

async function init() {
  try {
    state.config = await loadJSON('data/config.json');
    state.scenarios = await loadJSON('data/scenarios.json');
    renderTabs();
    renderScenario(state.activeScenario);
    setScenarioPill();
    state.config.tabs.forEach((tab, idx) => {
      if (idx === 0) {
        switchTab(tab.id);
      }
    });
    document.querySelectorAll('.scenario-btn').forEach((btn) => {
      btn.addEventListener('click', () => handleScenarioChange(btn.dataset.scenario));
    });
  } catch (err) {
    console.error(err);
    alert('Failed to load data. Ensure files are served via http.');
  }
}

window.addEventListener('DOMContentLoaded', init);
