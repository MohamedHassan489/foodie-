/* ============================================================
   Foodie AI — SPA App
   Hash-based router · Auth state · All page renderers
   ============================================================ */

/* ── State ──────────────────────────────────────────────── */
const State = {
  user:      JSON.parse(localStorage.getItem('foodie_user') || 'null'),
  recipe:    null,   // current generated / viewed recipe
  mealPlan:  null,
};

function setUser(user, token) {
  State.user = user;
  if (user)  { localStorage.setItem('foodie_user', JSON.stringify(user)); localStorage.setItem('foodie_token', token); }
  else       { localStorage.removeItem('foodie_user'); localStorage.removeItem('foodie_token'); }
  renderNav();
}

/* ── Toast ───────────────────────────────────────────────── */
function toast(msg, type = '') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

/* ── Modal ───────────────────────────────────────────────── */
function openModal(html) {
  document.getElementById('modal-box').innerHTML = html;
  document.getElementById('modal-overlay').classList.remove('hidden');
}
function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}
document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});

/* ── Router ──────────────────────────────────────────────── */
const routes = {
  '/':          pageLanding,
  '/login':     pageAuth,
  '/register':  pageAuth,
  '/dashboard': pageDashboard,
  '/generate':  pageGenerate,
  '/scan':      pageScan,
  '/recipes':   pageRecipes,
  '/recipe':    pageRecipeDetail,
  '/mealplan':  pageMealPlan,
  '/profile':   pageProfile,
  '/create':    pageCreateRecipe,
};

function navigate(path) {
  window.location.hash = '#' + path;
}

function router() {
  const hash = window.location.hash.slice(1) || '/';
  const path = hash.split('?')[0];

  // Guard: redirect to login if protected route and not authed
  const protected_routes = ['/dashboard','/generate','/scan','/recipes','/recipe','/mealplan','/profile','/create'];
  if (protected_routes.includes(path) && !State.user) {
    navigate('/login');
    return;
  }
  // Redirect authed user away from auth pages
  if ((path === '/login' || path === '/register') && State.user) {
    navigate('/dashboard');
    return;
  }

  const render = routes[path] || pageLanding;
  render();
  scrollTo(0, 0);

  // Activate nav link
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.dataset.route === path);
  });
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);

/* ── Nav ─────────────────────────────────────────────────── */
function renderNav() {
  const links  = document.getElementById('app-nav-links');
  const actions = document.getElementById('nav-actions');

  if (State.user) {
    links.innerHTML = `
      <a href="#/dashboard" data-route="/dashboard">Home</a>
      <a href="#/generate"  data-route="/generate">Generate</a>
      <a href="#/scan"      data-route="/scan">Scan Fridge</a>
      <a href="#/recipes"   data-route="/recipes">My Recipes</a>
      <a href="#/create"    data-route="/create">Add Recipe</a>
      <a href="#/mealplan"  data-route="/mealplan">Meal Plan</a>`;
    actions.innerHTML = `
      <a href="#/profile" class="btn btn-ghost btn-sm">👤 ${State.user.name}</a>
      <button class="btn btn-primary btn-sm" onclick="logout()">Sign out</button>`;
  } else {
    links.innerHTML = `
      <a href="#/" data-route="/">Features</a>
      <a href="#/" data-route="/">How it works</a>`;
    actions.innerHTML = `
      <a href="#/login"    class="btn btn-ghost btn-sm">Login</a>
      <a href="#/register" class="btn btn-primary btn-sm">Get started</a>`;
  }
}

function logout() {
  setUser(null, null);
  navigate('/');
  toast('Signed out. See you next time! 👋');
}

/* ── Scroll reveal ───────────────────────────────────────── */
function initReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

/* ── Helpers ─────────────────────────────────────────────── */
const app = () => document.getElementById('app');

function setHTML(html) {
  app().innerHTML = html;
  initReveal();
}

function loading() {
  app().innerHTML = `<div class="page-loader"><div class="spinner"></div></div>`;
}

function difficultyColor(d) {
  return d === 'easy' ? 'chip-green' : d === 'hard' ? 'chip-accent' : 'chip-yellow';
}

function recipeEmoji(title = '') {
  const t = title.toLowerCase();
  if (t.includes('pasta') || t.includes('noodle')) return '🍝';
  if (t.includes('pizza'))  return '🍕';
  if (t.includes('salad'))  return '🥗';
  if (t.includes('soup') || t.includes('stew')) return '🍲';
  if (t.includes('chicken')) return '🍗';
  if (t.includes('fish') || t.includes('salmon') || t.includes('tuna')) return '🐟';
  if (t.includes('egg') || t.includes('omelette') || t.includes('frittata')) return '🍳';
  if (t.includes('burger')) return '🍔';
  if (t.includes('rice'))   return '🍚';
  if (t.includes('bread') || t.includes('toast')) return '🍞';
  if (t.includes('cake') || t.includes('dessert') || t.includes('cookie')) return '🎂';
  if (t.includes('smoothie') || t.includes('juice')) return '🥤';
  return '🍽️';
}

/* ================================================================
   PAGES
   ================================================================ */

/* ── Landing page ────────────────────────────────────────── */
function pageLanding() {
  setHTML(`
    <!-- HERO -->
    <header class="hero">
      <div class="container hero-grid">
        <div>
          <span class="eyebrow"><span class="dot"></span> Graduation Project · 2026</span>
          <h1>Cook smarter with<br><span class="gradient">Foodie AI</span> —<br>your personal chef.</h1>
          <p class="hero-sub">An AI-powered culinary companion that turns whatever's in your fridge into delicious, personalised recipes — adapting to your taste, diet, and skill level.</p>
          <div class="hero-cta">
            <a href="#/register" class="btn btn-accent btn-lg">Get started — it's free</a>
            <a href="#/login"    class="btn btn-ghost btn-lg">Sign in</a>
          </div>
          <div class="hero-meta">
            <div class="stat"><span class="num">10k+</span><span class="lbl">Recipes</span></div>
            <div class="stat"><span class="num">35+</span><span class="lbl">Cuisines</span></div>
            <div class="stat"><span class="num">98%</span><span class="lbl">Match accuracy</span></div>
          </div>
        </div>
        <div class="phone-wrap">
          <div class="phone" style="position:relative">
            <div class="phone-screen">
              <div class="phone-notch"></div>
              <div class="app-head">
                <div class="app-avatar"></div>
                <div class="app-greet">Hi, Mido<small>What are we cooking today?</small></div>
              </div>
              <div class="chip-row">
                <span class="mini-chip">Quick · 20 min</span>
                <span class="mini-chip">High protein</span>
                <span class="mini-chip">Vegetarian</span>
              </div>
              <div class="ai-bubble">I scanned your fridge — let's turn those tomatoes & basil into something amazing 🍅</div>
              <div class="r-card">
                <div class="r-thumb">🍝</div>
                <div class="r-body"><p class="r-title">Pasta al Pomodoro</p><p class="r-meta">22 min · 4 ingredients · ★ 4.9</p></div>
              </div>
              <div class="r-card">
                <div class="r-thumb" style="background:linear-gradient(135deg,#a8d77c,#4f9c3e)">🥗</div>
                <div class="r-body"><p class="r-title">Caprese Bowl</p><p class="r-meta">12 min · 5 ingredients · ★ 4.8</p></div>
              </div>
              <div class="r-card">
                <div class="r-thumb" style="background:linear-gradient(135deg,#ffd56b,#f0a738)">🍳</div>
                <div class="r-body"><p class="r-title">Tomato & Herb Frittata</p><p class="r-meta">18 min · 6 ingredients · ★ 4.7</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- FEATURES -->
    <section style="background:linear-gradient(180deg,var(--bg) 0%,var(--bg-2) 100%)">
      <div class="container">
        <div class="reveal" style="margin-bottom:40px">
          <div class="section-eyebrow">What it does</div>
          <h2>Six features that change how you cook.</h2>
        </div>
        <div class="features-grid">
          ${[
            ['📸','Fridge Scan','Snap a photo — our vision model identifies ingredients and suggests recipes instantly.'],
            ['🧠','Taste Profile','The more you cook, the smarter it gets. Learns your flavour preferences and restrictions.'],
            ['🎙️','Voice Chef','Hands-free step-by-step instructions — your sous chef while you cook.'],
            ['📅','Smart Meal Plan','Weekly plan based on your goals — fitness, budget, family — with a unified shopping list.'],
            ['🌍','Global Cuisines','From Cairo to Kyoto. 35+ cuisines with cultural context and authentic techniques.'],
            ['♻️','Zero Waste Mode','Prioritises ingredients about to expire — cut food waste by up to 40%.'],
          ].map(([ico, title, desc]) => `
            <div class="feature reveal">
              <div class="feature-ico">${ico}</div>
              <h3>${title}</h3>
              <p>${desc}</p>
            </div>`).join('')}
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section>
      <div class="container">
        <div class="reveal" style="margin-bottom:40px">
          <div class="section-eyebrow">How it works</div>
          <h2>From "what's in the fridge?" to dinner in four steps.</h2>
        </div>
        <div class="steps">
          ${[
            ['Tell us about you',  'Set your diet, allergies, skill level, and goals in under a minute.'],
            ['Scan or type',       'Photograph your fridge or list ingredients. Our model identifies everything.'],
            ['Get recipes',        'Foodie AI ranks matches by taste, nutrition, time, and zero-waste potential.'],
            ['Cook with AI',       'Follow voice guidance step-by-step. Rate the result — the model learns.'],
          ].map(([t, d]) => `<div class="step reveal"><h3>${t}</h3><p>${d}</p></div>`).join('')}
        </div>
      </div>
    </section>

    <!-- TECH STACK -->
    <section class="stack-section">
      <div class="container">
        <div class="reveal" style="margin-bottom:40px">
          <div class="section-eyebrow">Under the hood</div>
          <h2>Built on a modern AI & cloud stack.</h2>
          <p>Designed for scale, speed, and on-device privacy where it matters.</p>
        </div>
        <div class="stack-grid">
          ${[['⚛️','React Native'],['🐍','Python'],['🤗','PyTorch'],['🧩','YOLOv8'],['💬','Claude API'],['🔥','Firebase'],['☁️','AWS'],['🗄️','PostgreSQL'],['⚡','FastAPI'],['🎨','Figma'],['🐳','Docker'],['📈','TensorBoard']]
            .map(([i,n]) => `<div class="stack-item reveal"><span class="icon">${i}</span><span class="name">${n}</span></div>`).join('')}
        </div>
      </div>
    </section>

    <!-- TEAM -->
    <section>
      <div class="container">
        <div class="reveal" style="margin-bottom:40px">
          <div class="section-eyebrow">The team</div>
          <h2>Hungry minds behind Foodie AI.</h2>
        </div>
        <div class="team-grid">
          ${[['M','a1','Mido','Lead · AI & Product'],['A','a2','Member 2','Backend Engineer'],['S','a3','Member 3','Mobile Engineer'],['N','a4','Member 4','UI/UX Designer']]
            .map(([i,cls,name,role]) => `
              <div class="member reveal">
                <div class="avatar ${cls}">${i}</div>
                <div class="name">${name}</div>
                <div class="role">${role}</div>
              </div>`).join('')}
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section>
      <div class="container">
        <div class="cta-banner reveal">
          <h2>Ready to cook smarter?</h2>
          <p>Foodie AI turns "what's for dinner?" into the easiest question of your day.</p>
          <a href="#/register" class="btn btn-lg">Get started — it's free →</a>
        </div>
      </div>
    </section>

    <footer>
      <div class="container" style="display:flex;justify-content:space-between;align-items:center;width:100%">
        <div class="logo"><span class="logo-mark">F</span><span>Foodie<span class="accent">AI</span></span></div>
        <small>© 2026 Foodie AI · Graduation Project</small>
      </div>
    </footer>
  `);
}

/* ── Auth page (login / register) ────────────────────────── */
function pageAuth() {
  const isRegister = window.location.hash.includes('register');

  setHTML(`
    <div class="auth-wrap">
      <div class="auth-card">
        <h2>${isRegister ? 'Create your account' : 'Welcome back'}</h2>
        <p class="sub">${isRegister ? 'Join thousands of home cooks using AI' : 'Sign in to continue cooking smarter'}</p>

        <form id="auth-form">
          ${isRegister ? `<div class="form-group"><label>Your name</label><input class="form-control" id="f-name" placeholder="Mido" required /></div>` : ''}
          <div class="form-group"><label>Email</label><input class="form-control" id="f-email" type="email" placeholder="you@example.com" required /></div>
          <div class="form-group"><label>Password</label><input class="form-control" id="f-pass" type="password" placeholder="Min 6 characters" required /></div>
          <div id="auth-error" class="form-error" style="display:none"></div>
          <button class="btn btn-accent" type="submit" id="auth-btn">
            ${isRegister ? 'Create account →' : 'Sign in →'}
          </button>
        </form>

        <p class="auth-toggle">
          ${isRegister
            ? `Already have an account? <a onclick="navigate('/login')">Sign in</a>`
            : `No account yet? <a onclick="navigate('/register')">Create one free</a>`}
        </p>

        <div style="margin-top:20px;padding-top:20px;border-top:1px solid var(--line);text-align:center">
          <p style="font-size:.82rem;color:var(--muted);margin-bottom:8px">Demo account</p>
          <button class="btn btn-ghost btn-sm" onclick="demoLogin()">Use demo@foodie.ai / demo1234</button>
        </div>
      </div>
    </div>
  `);

  document.getElementById('auth-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('auth-btn');
    const err = document.getElementById('auth-error');
    err.style.display = 'none';
    btn.disabled = true;
    btn.textContent = 'Please wait…';

    try {
      const body = {
        email:    document.getElementById('f-email').value.trim(),
        password: document.getElementById('f-pass').value,
      };
      if (isRegister) body.name = document.getElementById('f-name').value.trim();

      const res = isRegister ? await API.auth.register(body) : await API.auth.login(body);
      setUser(res.user, res.token);
      toast(`Welcome${isRegister ? '' : ' back'}, ${res.user.name}! 🎉`, 'success');
      navigate('/dashboard');
    } catch (ex) {
      err.textContent = ex.message;
      err.style.display = 'block';
      btn.disabled = false;
      btn.textContent = isRegister ? 'Create account →' : 'Sign in →';
    }
  });
}

async function demoLogin() {
  try {
    const res = await API.auth.login({ email: 'demo@foodie.ai', password: 'demo1234' });
    setUser(res.user, res.token);
    toast(`Welcome back, ${res.user.name}! 🎉`, 'success');
    navigate('/dashboard');
  } catch {
    toast('Run "npm run db:seed" first to create the demo user.', 'error');
  }
}

/* ── Dashboard ───────────────────────────────────────────── */
async function pageDashboard() {
  loading();
  let recipeCount = 0;
  let favCount    = 0;
  try {
    const profile = await API.users.profile();
    recipeCount   = profile.recipeCount || 0;
    const favs    = await API.recipes.list({ favorites: 'true' });
    favCount      = favs.length;
  } catch { /* non-fatal */ }

  setHTML(`
    <div class="container dashboard-wrap">
      <div class="dash-header">
        <h2>Good ${greeting()}, ${State.user?.name} 👋</h2>
        <p>What are we cooking today?</p>
      </div>

      <div class="dash-grid">
        <div class="dash-stat">
          <div class="icon">🍽️</div>
          <div><div class="num">${recipeCount}</div><div class="lbl">Saved recipes</div></div>
        </div>
        <div class="dash-stat">
          <div class="icon">❤️</div>
          <div><div class="num">${favCount}</div><div class="lbl">Favourites</div></div>
        </div>
        <div class="dash-stat">
          <div class="icon">🔥</div>
          <div><div class="num">0</div><div class="lbl">Day streak</div></div>
        </div>
      </div>

      <h3 style="margin-bottom:16px">Quick actions</h3>
      <div class="quick-actions">
        <div class="qa-card" onclick="navigate('/generate')">
          <div class="qa-icon orange">✍️</div>
          <div class="qa-body">
            <h3>Generate a recipe</h3>
            <p>Type ingredients you have and let AI create the perfect recipe.</p>
          </div>
        </div>
        <div class="qa-card" onclick="navigate('/scan')">
          <div class="qa-icon green">📸</div>
          <div class="qa-body">
            <h3>Scan your fridge</h3>
            <p>Upload a photo and our vision AI will identify your ingredients.</p>
          </div>
        </div>
        <div class="qa-card" onclick="navigate('/mealplan')">
          <div class="qa-icon orange">📅</div>
          <div class="qa-body">
            <h3>Weekly meal plan</h3>
            <p>Generate a personalised 7-day plan with a shopping list.</p>
          </div>
        </div>
        <div class="qa-card" onclick="navigate('/recipes')">
          <div class="qa-icon green">📚</div>
          <div class="qa-body">
            <h3>My recipes</h3>
            <p>Browse, search, and revisit all your saved creations.</p>
          </div>
        </div>
        <div class="qa-card" onclick="navigate('/create')">
          <div class="qa-icon orange">📝</div>
          <div class="qa-body">
            <h3>Add recipe manually</h3>
            <p>Write your own recipe from scratch — ingredients, steps, and nutrition.</p>
          </div>
        </div>
      </div>
    </div>
  `);
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

/* ── Generate page ───────────────────────────────────────── */
function pageGenerate() {
  let ingredients = [];

  setHTML(`
    <div class="container gen-wrap">
      <div class="back-link" onclick="navigate('/dashboard')">← Dashboard</div>
      <h2>Generate a recipe</h2>
      <p>Add the ingredients you have and our AI will craft the perfect recipe for you.</p>

      <label class="form-group" style="margin-bottom:8px">
        <span style="font-weight:600;font-size:.9rem;color:var(--ink)">Ingredients</span>
      </label>
      <div class="tag-input-wrap" id="tag-wrap" onclick="document.getElementById('ing-input').focus()">
        <input id="ing-input" placeholder="Type an ingredient and press Enter…" />
      </div>
      <p class="form-hint" style="margin-top:6px">Press Enter or comma to add each ingredient</p>

      <div class="generate-actions">
        <button class="btn btn-accent btn-lg" id="gen-btn" onclick="runGenerate()">🤖 Generate recipe</button>
        <button class="btn btn-ghost" onclick="clearIngredients()">Clear all</button>
      </div>

      <div id="gen-result"></div>
    </div>
  `);

  const input = document.getElementById('ing-input');
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = input.value.trim().replace(/,$/, '');
      if (val) addIngredient(val);
      input.value = '';
    }
    if (e.key === 'Backspace' && !input.value && ingredients.length) {
      removeIngredient(ingredients[ingredients.length - 1]);
    }
  });

  function addIngredient(name) {
    if (ingredients.includes(name.toLowerCase())) return;
    ingredients.push(name.toLowerCase());
    renderTags();
  }

  function removeIngredient(name) {
    ingredients = ingredients.filter(i => i !== name);
    renderTags();
  }

  function renderTags() {
    const wrap  = document.getElementById('tag-wrap');
    const input = document.getElementById('ing-input');
    wrap.querySelectorAll('.ing-tag').forEach(t => t.remove());
    ingredients.forEach(ing => {
      const tag = document.createElement('span');
      tag.className = 'ing-tag';
      tag.innerHTML = `${ing} <button onclick="removeIngredient('${ing}')">×</button>`;
      wrap.insertBefore(tag, input);
    });
  }

  window.removeIngredient = removeIngredient;

  window.clearIngredients = () => {
    ingredients = [];
    renderTags();
    document.getElementById('gen-result').innerHTML = '';
  };

  window.runGenerate = async () => {
    if (!ingredients.length) { toast('Add at least one ingredient first.', 'error'); return; }
    const btn = document.getElementById('gen-btn');
    const out = document.getElementById('gen-result');
    btn.disabled = true;
    out.innerHTML = `<div class="ai-loading"><div class="spinner"></div> AI is crafting your recipe…</div>`;

    try {
      const recipe = await API.ai.generate({ ingredients });
      State.recipe  = recipe;
      out.innerHTML = renderRecipeResult(recipe);
      attachRecipeActions(recipe);
    } catch (err) {
      out.innerHTML = `<p class="form-error" style="margin-top:16px">Error: ${err.message}</p>`;
    } finally {
      btn.disabled = false;
    }
  };
}

/* ── Scan page ───────────────────────────────────────────── */
function pageScan() {
  let imageBase64 = null;
  let detected    = [];

  setHTML(`
    <div class="container gen-wrap">
      <div class="back-link" onclick="navigate('/dashboard')">← Dashboard</div>
      <h2>Scan your fridge</h2>
      <p>Upload a photo of your fridge or ingredients — our AI will identify everything and generate recipe ideas.</p>

      <div class="upload-zone" id="drop-zone" onclick="document.getElementById('file-input').click()">
        <div class="upload-icon">📸</div>
        <h3>Click or drag & drop a photo</h3>
        <p>JPG, PNG, WEBP — max 10 MB</p>
        <input type="file" id="file-input" accept="image/*" style="display:none" />
      </div>
      <img id="upload-preview" class="upload-preview" style="display:none" />

      <div id="scan-status"></div>
      <div id="detected-section" style="display:none">
        <div class="detected-ings">
          <h3>Detected ingredients</h3>
          <div class="det-tags" id="det-tags"></div>
        </div>
        <div class="generate-actions" style="margin-top:20px">
          <button class="btn btn-accent btn-lg" id="scan-gen-btn">🤖 Generate recipe from these</button>
          <button class="btn btn-ghost" onclick="navigate('/scan')">Re-scan</button>
        </div>
      </div>

      <div id="scan-recipe-result"></div>
    </div>
  `);

  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');

  fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

  dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    handleFile(e.dataTransfer.files[0]);
  });

  async function handleFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      imageBase64 = e.target.result;
      const preview = document.getElementById('upload-preview');
      preview.src = imageBase64;
      preview.style.display = 'block';

      document.getElementById('scan-status').innerHTML =
        `<div class="ai-loading" style="margin-top:16px"><div class="spinner"></div> Analysing your fridge…</div>`;

      try {
        const res = await API.ai.scan({ image: imageBase64 });
        detected  = res.ingredients || [];
        document.getElementById('scan-status').innerHTML = '';
        document.getElementById('detected-section').style.display = 'block';
        document.getElementById('det-tags').innerHTML =
          detected.map(i => `<span class="chip chip-accent">${i}</span>`).join('');

        document.getElementById('scan-gen-btn').addEventListener('click', async () => {
          const btn = document.getElementById('scan-gen-btn');
          const out = document.getElementById('scan-recipe-result');
          btn.disabled = true;
          out.innerHTML = `<div class="ai-loading" style="margin-top:20px"><div class="spinner"></div> Creating recipe…</div>`;
          try {
            const recipe = await API.ai.generate({ ingredients: detected });
            State.recipe  = recipe;
            out.innerHTML = renderRecipeResult(recipe);
            attachRecipeActions(recipe);
          } catch (err) {
            out.innerHTML = `<p class="form-error" style="margin-top:16px">Error: ${err.message}</p>`;
          } finally { btn.disabled = false; }
        });
      } catch (err) {
        document.getElementById('scan-status').innerHTML =
          `<p class="form-error" style="margin-top:12px">Scan failed: ${err.message}</p>`;
      }
    };
    reader.readAsDataURL(file);
  }
}

/* ── Recipe result renderer (shared) ────────────────────── */
function renderRecipeResult(r) {
  return `
    <div class="recipe-result">
      <div class="recipe-result-head">
        <h2>${recipeEmoji(r.title)} ${r.title}</h2>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
          <span class="chip">⏱ ${r.time} min</span>
          <span class="chip">👥 ${r.servings} servings</span>
          <span class="chip">${r.cuisine}</span>
          <span class="chip ${difficultyColor(r.difficulty)}">${r.difficulty}</span>
        </div>
      </div>
      <div class="recipe-result-body">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-bottom:24px">
          <div>
            <div class="section-title">Ingredients</div>
            <ul class="ing-list">
              ${(r.ingredients || []).map(i => `<li>${i}</li>`).join('')}
            </ul>
          </div>
          <div>
            <div class="section-title">Nutrition</div>
            <div class="nutrition-grid" style="grid-template-columns:1fr 1fr">
              <div class="nut-item"><div class="val">${r.nutrition?.calories ?? '—'}</div><div class="key">Calories</div></div>
              <div class="nut-item"><div class="val">${r.nutrition?.protein ?? '—'}</div><div class="key">Protein</div></div>
              <div class="nut-item"><div class="val">${r.nutrition?.carbs ?? '—'}</div><div class="key">Carbs</div></div>
              <div class="nut-item"><div class="val">${r.nutrition?.fat ?? '—'}</div><div class="key">Fat</div></div>
            </div>
          </div>
        </div>

        <div class="section-title">Steps</div>
        ${(r.steps || []).map((s, i) => `
          <div class="step-item">
            <div class="step-num">${i + 1}</div>
            <div>
              <div class="step-text">${s}</div>
              <button class="step-tip-btn" onclick="loadTip(this,'${r.title.replace(/'/g,"\\'")}','${s.replace(/'/g,"\\'").replace(/"/g,'&quot;')}')">💡 Get AI tip</button>
              <div class="step-tip-box"></div>
            </div>
          </div>`).join('')}

        ${r.tip ? `<div class="tip-box"><div class="tip-icon">👨‍🍳</div><p><strong>Chef's tip:</strong> ${r.tip}</p></div>` : ''}

        <div style="display:flex;gap:10px;margin-top:28px;flex-wrap:wrap">
          <button class="btn btn-accent" id="save-recipe-btn">💾 Save recipe</button>
          <button class="btn btn-ghost" onclick="shareRecipe()">📤 Share</button>
        </div>
      </div>
    </div>`;
}

function attachRecipeActions(recipe) {
  const btn = document.getElementById('save-recipe-btn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    btn.disabled = true;
    btn.textContent = 'Saving…';
    try {
      await API.recipes.save(recipe);
      toast('Recipe saved! 🎉', 'success');
      btn.textContent = '✅ Saved';
    } catch (err) {
      toast(err.message, 'error');
      btn.disabled = false;
      btn.textContent = '💾 Save recipe';
    }
  });
}

window.loadTip = async (btn, recipeName, step) => {
  const box = btn.nextElementSibling;
  if (box.style.display === 'block') { box.style.display = 'none'; return; }
  btn.textContent = '⏳ Loading tip…';
  try {
    const { tip } = await API.ai.tip({ recipe: recipeName, step });
    box.textContent = tip;
    box.style.display = 'block';
    btn.textContent = '💡 Hide tip';
  } catch {
    btn.textContent = '💡 Get AI tip';
  }
};

window.shareRecipe = () => {
  if (navigator.share && State.recipe) {
    navigator.share({ title: State.recipe.title, text: `Check out this recipe: ${State.recipe.title}` });
  } else {
    toast('Sharing not supported on this browser.', '');
  }
};

/* ── My Recipes page ─────────────────────────────────────── */
async function pageRecipes() {
  loading();
  try {
    const recipes = await API.recipes.list();
    setHTML(`
      <div class="container" style="padding:40px 24px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;flex-wrap:wrap;gap:12px">
          <div>
            <div class="back-link" onclick="navigate('/dashboard')">← Dashboard</div>
            <h2 style="margin-top:4px">My Recipes</h2>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <a href="#/create"   class="btn btn-ghost btn-sm">📝 Add manually</a>
            <a href="#/generate" class="btn btn-accent">🤖 Generate with AI</a>
          </div>
        </div>

        ${recipes.length === 0
          ? `<div class="empty-state">
               <div class="icon">🍽️</div>
               <h3>No recipes yet</h3>
               <p>Generate your first recipe from your ingredients.</p>
               <a href="#/generate" class="btn btn-accent">Generate now</a>
             </div>`
          : `<div class="recipes-grid">
               ${recipes.map(r => recipeCardHTML(r)).join('')}
             </div>`}
      </div>
    `);
    attachCardListeners();
  } catch (err) {
    setHTML(`<div class="container" style="padding:40px"><p class="form-error">${err.message}</p></div>`);
  }
}

function recipeCardHTML(r) {
  return `
    <div class="recipe-card-item" data-id="${r.id}" style="position:relative">
      <div class="recipe-thumb-big">${recipeEmoji(r.title)}</div>
      <button class="fav-btn" data-id="${r.id}" title="Toggle favourite">${r.isFavorite ? '❤️' : '🤍'}</button>
      <div class="recipe-card-body">
        <h3>${r.title}</h3>
        <p style="font-size:.88rem">${r.cuisine} · ${r.difficulty}</p>
        <div class="recipe-card-meta">
          <span class="chip">⏱ ${r.time} min</span>
          <span class="chip">👥 ${r.servings}</span>
          <span class="chip ${difficultyColor(r.difficulty)}">${r.difficulty}</span>
        </div>
      </div>
    </div>`;
}

function attachCardListeners() {
  document.querySelectorAll('.recipe-card-item').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('fav-btn') || e.target.closest('.fav-btn')) return;
      window.location.hash = `#/recipe?id=${card.dataset.id}`;
    });
  });
  document.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      try {
        const updated = await API.recipes.toggleFavorite(id);
        btn.textContent = updated.isFavorite ? '❤️' : '🤍';
        toast(updated.isFavorite ? 'Added to favourites ❤️' : 'Removed from favourites', '');
      } catch (err) { toast(err.message, 'error'); }
    });
  });
}

/* ── Recipe detail page ──────────────────────────────────── */
async function pageRecipeDetail() {
  const id = new URLSearchParams(window.location.hash.split('?')[1]).get('id');
  if (!id) { navigate('/recipes'); return; }

  loading();
  try {
    const r = await API.recipes.get(id);
    setHTML(`
      <div class="container recipe-detail-wrap">
        <a class="back-link" onclick="navigate('/recipes')">← My Recipes</a>
        <div class="recipe-detail-head">
          <h1>${recipeEmoji(r.title)} ${r.title}</h1>
          <div class="meta-row">
            <span class="chip">⏱ ${r.time} min</span>
            <span class="chip">👥 ${r.servings} servings</span>
            <span class="chip">${r.cuisine}</span>
            <span class="chip ${difficultyColor(r.difficulty)}">${r.difficulty}</span>
            ${r.isFavorite ? '<span class="chip chip-accent">❤️ Favourite</span>' : ''}
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-bottom:32px">
          <div>
            <div class="section-title">Ingredients</div>
            <ul class="ing-list">
              ${r.ingredients.map(i => `<li>${i}</li>`).join('')}
            </ul>
          </div>
          <div>
            <div class="section-title">Nutrition</div>
            <div class="nutrition-grid" style="grid-template-columns:1fr 1fr">
              <div class="nut-item"><div class="val">${r.nutrition?.calories ?? '—'}</div><div class="key">Calories</div></div>
              <div class="nut-item"><div class="val">${r.nutrition?.protein ?? '—'}</div><div class="key">Protein</div></div>
              <div class="nut-item"><div class="val">${r.nutrition?.carbs ?? '—'}</div><div class="key">Carbs</div></div>
              <div class="nut-item"><div class="val">${r.nutrition?.fat ?? '—'}</div><div class="key">Fat</div></div>
            </div>
          </div>
        </div>

        <div class="section-title">Steps</div>
        ${r.steps.map((s, i) => `
          <div class="step-item">
            <div class="step-num">${i + 1}</div>
            <div>
              <div class="step-text">${s}</div>
              <button class="step-tip-btn" onclick="loadTip(this,'${r.title.replace(/'/g,"\\'")}','${s.replace(/'/g,"\\'").replace(/"/g,'&quot;')}')">💡 Get AI tip</button>
              <div class="step-tip-box"></div>
            </div>
          </div>`).join('')}

        ${r.tip ? `<div class="tip-box" style="margin-top:20px"><div class="tip-icon">👨‍🍳</div><p><strong>Chef's tip:</strong> ${r.tip}</p></div>` : ''}

        <div style="display:flex;gap:10px;margin-top:32px;flex-wrap:wrap">
          <button class="btn btn-ghost" onclick="toggleFav('${r.id}',this)">${r.isFavorite ? '❤️ Unfavourite' : '🤍 Favourite'}</button>
          <button class="btn btn-danger btn-sm" onclick="deleteRecipe('${r.id}')">🗑 Delete</button>
        </div>
      </div>
    `);
  } catch (err) {
    setHTML(`<div class="container" style="padding:40px"><p class="form-error">${err.message}</p></div>`);
  }
}

window.toggleFav = async (id, btn) => {
  try {
    const updated = await API.recipes.toggleFavorite(id);
    btn.textContent = updated.isFavorite ? '❤️ Unfavourite' : '🤍 Favourite';
    toast(updated.isFavorite ? 'Added to favourites ❤️' : 'Removed', '');
  } catch (err) { toast(err.message, 'error'); }
};

window.deleteRecipe = (id) => {
  openModal(`
    <h3 style="margin-bottom:12px">Delete recipe?</h3>
    <p style="margin-bottom:24px">This can't be undone.</p>
    <div style="display:flex;gap:10px">
      <button class="btn btn-danger" onclick="confirmDelete('${id}')">Yes, delete</button>
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    </div>
  `);
};

window.confirmDelete = async (id) => {
  try {
    await API.recipes.delete(id);
    closeModal();
    toast('Recipe deleted.', '');
    navigate('/recipes');
  } catch (err) { toast(err.message, 'error'); }
};

/* ── Meal plan page ──────────────────────────────────────── */
async function pageMealPlan() {
  loading();
  try {
    const plans = await API.users.mealPlans();
    const latest = plans[0];

    setHTML(`
      <div class="container" style="padding:40px 24px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;flex-wrap:wrap;gap:16px">
          <div>
            <div class="back-link" onclick="navigate('/dashboard')">← Dashboard</div>
            <h2 style="margin-top:4px">Weekly Meal Plan</h2>
            <p>AI-generated 7-day plan tailored to your preferences.</p>
          </div>
          <button class="btn btn-accent" id="gen-plan-btn" onclick="generatePlan()">🤖 Generate new plan</button>
        </div>

        <div id="plan-area">
          ${latest ? renderPlan(latest.meals) : `
            <div class="empty-state">
              <div class="icon">📅</div>
              <h3>No meal plan yet</h3>
              <p>Generate your first AI-powered weekly plan.</p>
            </div>`}
        </div>
      </div>
    `);
  } catch (err) {
    setHTML(`<div class="container" style="padding:40px"><p class="form-error">${err.message}</p></div>`);
  }
}

window.generatePlan = async () => {
  const btn  = document.getElementById('gen-plan-btn');
  const area = document.getElementById('plan-area');
  btn.disabled = true;
  area.innerHTML = `<div class="ai-loading"><div class="spinner"></div> Building your 7-day plan…</div>`;

  try {
    const plan = await API.ai.mealPlan();
    State.mealPlan = plan;
    area.innerHTML = renderPlan(plan);
    toast('Meal plan ready! 🎉', 'success');
  } catch (err) {
    area.innerHTML = `<p class="form-error">${err.message}</p>`;
  } finally { btn.disabled = false; }
};

function renderPlan(plan) {
  if (!plan?.days) return `<p class="form-error">Invalid plan data.</p>`;
  return `
    <div class="meal-plan-grid">
      ${plan.days.map(d => `
        <div class="meal-day-card">
          <div class="meal-day-head">${d.day}</div>
          <div class="meal-day-body">
            ${['breakfast','lunch','dinner'].map(meal => `
              <div class="meal-slot">
                <div class="label">${meal}</div>
                <div class="title">${d[meal]?.title || '—'}</div>
                <div class="time">⏱ ${d[meal]?.time || '?'} min</div>
              </div>`).join('')}
          </div>
        </div>`).join('')}
    </div>

    ${plan.shoppingList?.length ? `
      <div style="margin-top:36px">
        <h3 style="margin-bottom:14px">🛒 Shopping list</h3>
        <div class="shopping-list">
          ${plan.shoppingList.map(i => `<span class="chip">${i}</span>`).join('')}
        </div>
      </div>` : ''}

    ${plan.totalCalories ? `<p style="margin-top:16px;color:var(--muted)">~${plan.totalCalories} total calories / week</p>` : ''}
  `;
}

/* ── Profile page ────────────────────────────────────────── */
async function pageProfile() {
  loading();
  try {
    const user = await API.users.profile();

    setHTML(`
      <div class="container profile-wrap">
        <div class="back-link" onclick="navigate('/dashboard')">← Dashboard</div>
        <h2 style="margin-bottom:28px">My Profile</h2>

        <div class="profile-avatar-row">
          <div class="profile-avatar-big">${(user.name || 'U')[0].toUpperCase()}</div>
          <div>
            <h3>${user.name}</h3>
            <p>${user.email}</p>
            <p style="margin-top:4px;font-size:.85rem">${user.recipeCount} saved recipes</p>
          </div>
        </div>

        <div class="card card-pad">
          <h3 style="margin-bottom:20px">Cooking preferences</h3>
          <form id="profile-form">
            <div class="form-group" style="margin-bottom:16px">
              <label>Your name</label>
              <input class="form-control" id="p-name" value="${user.name}" />
            </div>
            <div class="form-row" style="margin-bottom:16px">
              <div class="form-group">
                <label>Diet</label>
                <select class="form-control" id="p-diet">
                  ${['none','vegetarian','vegan','keto','paleo','gluten-free','dairy-free'].map(d =>
                    `<option value="${d}" ${user.diet === d ? 'selected' : ''}>${d.charAt(0).toUpperCase() + d.slice(1)}</option>`
                  ).join('')}
                </select>
              </div>
              <div class="form-group">
                <label>Skill level</label>
                <select class="form-control" id="p-skill">
                  ${['beginner','intermediate','advanced','professional'].map(s =>
                    `<option value="${s}" ${user.skillLevel === s ? 'selected' : ''}>${s.charAt(0).toUpperCase() + s.slice(1)}</option>`
                  ).join('')}
                </select>
              </div>
            </div>
            <div class="form-group" style="margin-bottom:20px">
              <label>Allergies / restrictions</label>
              <input class="form-control" id="p-allergies" value="${user.allergies}" placeholder="e.g. nuts, shellfish" />
            </div>
            <button class="btn btn-accent" type="submit" id="profile-save-btn">Save changes</button>
          </form>
        </div>

        <div style="margin-top:28px;padding-top:28px;border-top:1px solid var(--line);display:flex;justify-content:space-between;align-items:center">
          <div>
            <h3>Sign out</h3>
            <p style="font-size:.88rem">You'll need to sign in again next time.</p>
          </div>
          <button class="btn btn-ghost" onclick="logout()">Sign out</button>
        </div>
      </div>
    `);

    document.getElementById('profile-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('profile-save-btn');
      btn.disabled = true; btn.textContent = 'Saving…';
      try {
        const updated = await API.users.updateProfile({
          name:       document.getElementById('p-name').value.trim(),
          diet:       document.getElementById('p-diet').value,
          skillLevel: document.getElementById('p-skill').value,
          allergies:  document.getElementById('p-allergies').value.trim(),
        });
        State.user.name = updated.name;
        localStorage.setItem('foodie_user', JSON.stringify(State.user));
        renderNav();
        toast('Profile updated! ✅', 'success');
      } catch (err) { toast(err.message, 'error'); }
      finally { btn.disabled = false; btn.textContent = 'Save changes'; }
    });
  } catch (err) {
    setHTML(`<div class="container" style="padding:40px"><p class="form-error">${err.message}</p></div>`);
  }
}

/* ── Manual recipe creation ──────────────────────────────── */
function pageCreateRecipe() {
  const editId = new URLSearchParams(window.location.hash.split('?')[1]).get('edit');

  setHTML(`
    <div class="container gen-wrap" style="max-width:780px">
      <div class="back-link" onclick="history.back()">← Back</div>
      <h2 style="margin-bottom:6px">${editId ? 'Edit recipe' : 'Add a recipe'}</h2>
      <p style="margin-bottom:28px">Fill in the details below — every field except the title is optional.</p>

      <form id="manual-form" autocomplete="off">

        <!-- ── Basic info ── -->
        <div class="card card-pad" style="margin-bottom:20px">
          <h3 style="margin-bottom:18px">Basic info</h3>
          <div class="form-group" style="margin-bottom:14px">
            <label>Recipe title *</label>
            <input class="form-control" id="m-title" placeholder="e.g. Grandma's Chicken Soup" required />
          </div>
          <div class="form-row-4">
            <div class="form-group">
              <label>Cuisine</label>
              <select class="form-control" id="m-cuisine">
                ${['international','italian','egyptian','japanese','mexican','indian','french','thai','chinese','american','mediterranean','other']
                  .map(c => `<option value="${c}">${c.charAt(0).toUpperCase()+c.slice(1)}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Difficulty</label>
              <select class="form-control" id="m-difficulty">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div class="form-group">
              <label>Time (minutes)</label>
              <input class="form-control" id="m-time" type="number" min="1" placeholder="30" />
            </div>
            <div class="form-group">
              <label>Servings</label>
              <input class="form-control" id="m-servings" type="number" min="1" placeholder="2" />
            </div>
          </div>
        </div>

        <!-- ── Ingredients ── -->
        <div class="card card-pad" style="margin-bottom:20px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
            <h3>Ingredients</h3>
            <button type="button" class="btn btn-ghost btn-sm" onclick="addIngRow()">+ Add</button>
          </div>
          <div id="ing-rows">
            <div class="ing-row" style="display:flex;gap:8px;margin-bottom:8px">
              <input class="form-control" placeholder="e.g. 2 cups flour" style="flex:1" />
              <button type="button" class="btn btn-ghost btn-sm" onclick="removeRow(this)">×</button>
            </div>
          </div>
          <button type="button" class="btn btn-ghost btn-sm" style="margin-top:4px" onclick="addIngRow()">+ Add ingredient</button>
        </div>

        <!-- ── Steps ── -->
        <div class="card card-pad" style="margin-bottom:20px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
            <h3>Steps</h3>
            <button type="button" class="btn btn-ghost btn-sm" onclick="addStepRow()">+ Add</button>
          </div>
          <div id="step-rows">
            <div class="step-row" style="display:flex;gap:8px;margin-bottom:8px;align-items:flex-start">
              <span class="step-num" style="flex-shrink:0;margin-top:8px">1</span>
              <textarea class="form-control" rows="2" placeholder="Describe this step…" style="flex:1;resize:vertical"></textarea>
              <button type="button" class="btn btn-ghost btn-sm" style="margin-top:4px" onclick="removeRow(this)">×</button>
            </div>
          </div>
          <button type="button" class="btn btn-ghost btn-sm" style="margin-top:4px" onclick="addStepRow()">+ Add step</button>
        </div>

        <!-- ── Nutrition (optional) ── -->
        <div class="card card-pad" style="margin-bottom:20px">
          <h3 style="margin-bottom:6px">Nutrition <span style="font-size:.8rem;font-weight:400;color:var(--muted)">(optional)</span></h3>
          <div class="form-row" style="margin-top:14px">
            <div class="form-group">
              <label>Calories</label>
              <input class="form-control" id="m-cal" type="number" placeholder="450" />
            </div>
            <div class="form-group">
              <label>Protein</label>
              <input class="form-control" id="m-protein" placeholder="28g" />
            </div>
            <div class="form-group">
              <label>Carbs</label>
              <input class="form-control" id="m-carbs" placeholder="55g" />
            </div>
            <div class="form-group">
              <label>Fat</label>
              <input class="form-control" id="m-fat" placeholder="12g" />
            </div>
          </div>
        </div>

        <!-- ── Chef's tip ── -->
        <div class="card card-pad" style="margin-bottom:28px">
          <h3 style="margin-bottom:14px">Chef's tip <span style="font-size:.8rem;font-weight:400;color:var(--muted)">(optional)</span></h3>
          <textarea class="form-control" id="m-tip" rows="2" placeholder="Any extra advice for this recipe…"></textarea>
        </div>

        <div id="manual-error" class="form-error" style="display:none;margin-bottom:12px"></div>

        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <button type="submit" class="btn btn-accent btn-lg" id="manual-save-btn">💾 Save recipe</button>
          <button type="button" class="btn btn-ghost btn-lg" onclick="history.back()">Cancel</button>
        </div>
      </form>
    </div>
  `);

  // ── Row helpers ──────────────────────────────────────────
  window.addIngRow = () => {
    const container = document.getElementById('ing-rows');
    const row = document.createElement('div');
    row.className = 'ing-row';
    row.style.cssText = 'display:flex;gap:8px;margin-bottom:8px';
    row.innerHTML = `<input class="form-control" placeholder="e.g. 1 tsp salt" style="flex:1" /><button type="button" class="btn btn-ghost btn-sm" onclick="removeRow(this)">×</button>`;
    container.appendChild(row);
    row.querySelector('input').focus();
  };

  window.addStepRow = () => {
    const container = document.getElementById('step-rows');
    const num = container.querySelectorAll('.step-row').length + 1;
    const row = document.createElement('div');
    row.className = 'step-row';
    row.style.cssText = 'display:flex;gap:8px;margin-bottom:8px;align-items:flex-start';
    row.innerHTML = `<span class="step-num" style="flex-shrink:0;margin-top:8px">${num}</span><textarea class="form-control" rows="2" placeholder="Describe this step…" style="flex:1;resize:vertical"></textarea><button type="button" class="btn btn-ghost btn-sm" style="margin-top:4px" onclick="removeRow(this)">×</button>`;
    container.appendChild(row);
    row.querySelector('textarea').focus();
    renumberSteps();
  };

  window.removeRow = (btn) => {
    btn.closest('.ing-row, .step-row').remove();
    renumberSteps();
  };

  function renumberSteps() {
    document.querySelectorAll('#step-rows .step-row').forEach((row, i) => {
      const num = row.querySelector('.step-num');
      if (num) num.textContent = i + 1;
    });
  }

  // ── Submit ────────────────────────────────────────────────
  document.getElementById('manual-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('manual-save-btn');
    const err = document.getElementById('manual-error');
    err.style.display = 'none';

    const title = document.getElementById('m-title').value.trim();
    if (!title) { err.textContent = 'Title is required.'; err.style.display = 'block'; return; }

    const ingredients = [...document.querySelectorAll('#ing-rows .ing-row input')]
      .map(i => i.value.trim()).filter(Boolean);
    const steps = [...document.querySelectorAll('#step-rows .step-row textarea')]
      .map(t => t.value.trim()).filter(Boolean);

    if (!ingredients.length) { err.textContent = 'Add at least one ingredient.'; err.style.display = 'block'; return; }
    if (!steps.length)       { err.textContent = 'Add at least one step.'; err.style.display = 'block'; return; }

    const payload = {
      title,
      cuisine:    document.getElementById('m-cuisine').value,
      difficulty: document.getElementById('m-difficulty').value,
      time:       parseInt(document.getElementById('m-time').value)    || 30,
      servings:   parseInt(document.getElementById('m-servings').value) || 2,
      ingredients,
      steps,
      nutrition: {
        calories: parseInt(document.getElementById('m-cal').value)  || null,
        protein:  document.getElementById('m-protein').value.trim() || null,
        carbs:    document.getElementById('m-carbs').value.trim()   || null,
        fat:      document.getElementById('m-fat').value.trim()     || null,
      },
      tip: document.getElementById('m-tip').value.trim(),
    };

    btn.disabled = true;
    btn.textContent = 'Saving…';
    try {
      await API.recipes.save(payload);
      toast('Recipe saved! 🎉', 'success');
      navigate('/recipes');
    } catch (ex) {
      err.textContent = ex.message;
      err.style.display = 'block';
      btn.disabled = false;
      btn.textContent = '💾 Save recipe';
    }
  });
}

/* ── Boot ────────────────────────────────────────────────── */
renderNav();
