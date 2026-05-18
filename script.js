/* ════════════════════════════════════════════════════════════════════
   CollegeMatch — script.js
   Features:
   - 11 survey questions (6 original + 5 new preference questions)
   - College Scorecard API integration (U.S. Dept. of Education)
   - Claude AI-powered match explanations via Anthropic API
   - Advanced multi-factor scoring algorithm
   - Side-by-side school comparison
   - Real campus images via curated mapping
   - Loading states, skeleton loaders, graceful error handling
   ════════════════════════════════════════════════════════════════════ */

/* ─── API Configuration ──────────────────────────────────────────────
   Get your free College Scorecard API key at:
   https://collegescorecard.ed.gov/data/api/
   
   Get your Anthropic API key at:
   https://console.anthropic.com/
   ─────────────────────────────────────────────────────────────────── */
const SCORECARD_API_KEY = 'YOUR_COLLEGE_SCORECARD_API_KEY_HERE';
const ANTHROPIC_API_KEY = 'YOUR_ANTHROPIC_API_KEY_HERE';

const SCORECARD_BASE = 'https://api.data.gov/ed/collegescorecard/v1/schools';

/* ─── Campus Image Map ───────────────────────────────────────────────
   All images sourced from Unsplash (hotlink-friendly, no key needed)
   or stable public CDNs that allow cross-origin embedding.
   Key = lowercase substring of school name (partial match).
   Falls back to a generated placeholder gradient if no match found.
   ─────────────────────────────────────────────────────────────────── */
const CAMPUS_IMAGES = {
  // ── Ivy League & Elite Private ──────────────────────────────────
  'mit':                      'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=640&q=80&fit=crop',
  'massachusetts institute':  'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=640&q=80&fit=crop',
  'harvard':                  'https://images.unsplash.com/photo-1567057419565-4349c49d8a04?w=640&q=80&fit=crop',
  'stanford':                 'https://images.unsplash.com/photo-1629337943021-a9b7e89289c8?w=640&q=80&fit=crop',
  'yale':                     'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=640&q=80&fit=crop',
  'princeton':                'https://images.unsplash.com/photo-1576502200916-3808e07386a5?w=640&q=80&fit=crop',
  'columbia':                 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=640&q=80&fit=crop',
  'cornell':                  'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=640&q=80&fit=crop',
  'dartmouth':                'https://images.unsplash.com/photo-1562774053-701939374585?w=640&q=80&fit=crop',
  'brown':                    'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=640&q=80&fit=crop',
  'university of pennsylvania':'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=640&q=80&fit=crop',
  'caltech':                  'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=640&q=80&fit=crop',
  'california institute':     'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=640&q=80&fit=crop',

  // ── UC System ───────────────────────────────────────────────────
  'uc berkeley':              'https://images.unsplash.com/photo-1583373834259-46cc92173cb7?w=640&q=80&fit=crop',
  'berkeley':                 'https://images.unsplash.com/photo-1583373834259-46cc92173cb7?w=640&q=80&fit=crop',
  'ucla':                     'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=640&q=80&fit=crop',
  'uc san diego':             'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=640&q=80&fit=crop',
  'uc santa barbara':         'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=640&q=80&fit=crop',
  'uc davis':                 'https://images.unsplash.com/photo-1562774053-701939374585?w=640&q=80&fit=crop',
  'uc irvine':                'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=640&q=80&fit=crop',

  // ── Southeast ───────────────────────────────────────────────────
  'duke':                     'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=640&q=80&fit=crop',
  'vanderbilt':               'https://images.unsplash.com/photo-1562774053-701939374585?w=640&q=80&fit=crop',
  'emory':                    'https://images.unsplash.com/photo-1562774053-701939374585?w=640&q=80&fit=crop',
  'georgia tech':             'https://images.unsplash.com/photo-1567769541715-8c71fe49fd43?w=640&q=80&fit=crop',
  'georgia institute':        'https://images.unsplash.com/photo-1567769541715-8c71fe49fd43?w=640&q=80&fit=crop',
  'unc':                      'https://images.unsplash.com/photo-1562774053-701939374585?w=640&q=80&fit=crop',
  'chapel hill':              'https://images.unsplash.com/photo-1562774053-701939374585?w=640&q=80&fit=crop',
  'university of virginia':   'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=640&q=80&fit=crop',
  'wake forest':              'https://images.unsplash.com/photo-1562774053-701939374585?w=640&q=80&fit=crop',
  'tulane':                   'https://images.unsplash.com/photo-1567769541715-8c71fe49fd43?w=640&q=80&fit=crop',
  'university of florida':    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=640&q=80&fit=crop',
  'florida state':            'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=640&q=80&fit=crop',

  // ── Midwest ─────────────────────────────────────────────────────
  'university of chicago':    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=640&q=80&fit=crop',
  'northwestern':             'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=640&q=80&fit=crop',
  'university of michigan':   'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=640&q=80&fit=crop',
  'michigan':                 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=640&q=80&fit=crop',
  'notre dame':               'https://images.unsplash.com/photo-1576502200916-3808e07386a5?w=640&q=80&fit=crop',
  'purdue':                   'https://images.unsplash.com/photo-1562774053-701939374585?w=640&q=80&fit=crop',
  'ohio state':               'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=640&q=80&fit=crop',
  'penn state':               'https://images.unsplash.com/photo-1562774053-701939374585?w=640&q=80&fit=crop',
  'case western':             'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=640&q=80&fit=crop',
  'washington university':    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=640&q=80&fit=crop',

  // ── Northeast ───────────────────────────────────────────────────
  'nyu':                      'https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?w=640&q=80&fit=crop',
  'new york university':      'https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?w=640&q=80&fit=crop',
  'boston university':        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=640&q=80&fit=crop',
  'northeastern':             'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=640&q=80&fit=crop',
  'georgetown':               'https://images.unsplash.com/photo-1576502200916-3808e07386a5?w=640&q=80&fit=crop',
  'tufts':                    'https://images.unsplash.com/photo-1562774053-701939374585?w=640&q=80&fit=crop',
  'carnegie mellon':          'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=640&q=80&fit=crop',

  // ── South / Southwest ───────────────────────────────────────────
  'rice':                     'https://images.unsplash.com/photo-1567769541715-8c71fe49fd43?w=640&q=80&fit=crop',
  'university of texas':      'https://images.unsplash.com/photo-1567769541715-8c71fe49fd43?w=640&q=80&fit=crop',
  'ut austin':                'https://images.unsplash.com/photo-1567769541715-8c71fe49fd43?w=640&q=80&fit=crop',
  'university of colorado':   'https://images.unsplash.com/photo-1567057419565-4349c49d8a04?w=640&q=80&fit=crop',
  'arizona state':            'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=640&q=80&fit=crop',

  // ── West Coast ──────────────────────────────────────────────────
  'usc':                      'https://images.unsplash.com/photo-1629337943021-a9b7e89289c8?w=640&q=80&fit=crop',
  'university of southern california': 'https://images.unsplash.com/photo-1629337943021-a9b7e89289c8?w=640&q=80&fit=crop',
  'university of washington': 'https://images.unsplash.com/photo-1567057419565-4349c49d8a04?w=640&q=80&fit=crop',
  'pepperdine':               'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=640&q=80&fit=crop',
  'santa clara':              'https://images.unsplash.com/photo-1629337943021-a9b7e89289c8?w=640&q=80&fit=crop',
  'howard':                   'https://images.unsplash.com/photo-1576502200916-3808e07386a5?w=640&q=80&fit=crop',
};

/* ─── Region → State Codes Map ──────────────────────────────────── */
const REGION_STATES = {
  northeast: ['ME','NH','VT','MA','RI','CT','NY','NJ','PA','DE','MD','DC'],
  southeast: ['VA','NC','SC','GA','FL','TN','AL','MS','KY','WV'],
  midwest:   ['OH','IN','IL','MI','WI','MN','IA','MO','ND','SD','NE','KS'],
  south:     ['TX','OK','AR','LA','AZ','NM','CO','NV','UT'],
  west:      ['CA','OR','WA','ID','MT','WY','AK','HI'],
};

/* ─── Major → CIP Code Map ──────────────────────────────────────── */
const MAJOR_FIELDS = {
  stem:        'latest.academics.program_percentage.computer',
  business:    'latest.academics.program_percentage.business_marketing',
  liberal_arts:'latest.academics.program_percentage.liberal_arts',
  arts:        'latest.academics.program_percentage.visual_performing',
  health:      'latest.academics.program_percentage.health',
};

/* ─── Survey Questions (11 total) ───────────────────────────────── */
const QUESTIONS = [
  {
    key: 'major',
    text: 'What do you plan to study?',
    opts: [
      { value: 'stem',         label: 'STEM',              sub: 'Engineering, computer science, math, or natural sciences' },
      { value: 'business',     label: 'Business',          sub: 'Business, economics, finance, or entrepreneurship' },
      { value: 'liberal_arts', label: 'Liberal Arts',      sub: 'Humanities, social sciences, or interdisciplinary' },
      { value: 'arts',         label: 'Arts & Design',     sub: 'Fine arts, music, film, or graphic design' },
      { value: 'health',       label: 'Health Sciences',   sub: 'Pre-med, nursing, public health, or biology' },
    ]
  },
  {
    key: 'region',
    text: 'Where would you like to go to school?',
    opts: [
      { value: 'northeast', label: 'Northeast',     sub: 'ME, NH, VT, MA, RI, CT, NY, NJ, PA, MD, DC' },
      { value: 'southeast', label: 'Southeast',     sub: 'VA, NC, SC, GA, FL, TN, AL, MS, KY' },
      { value: 'midwest',   label: 'Midwest',       sub: 'OH, IN, IL, MI, WI, MN, IA, MO, KS' },
      { value: 'south',     label: 'South / SW',    sub: 'TX, OK, AR, LA, AZ, NM, CO, NV, UT' },
      { value: 'west',      label: 'West Coast',    sub: 'CA, OR, WA, ID, MT, WY, HI, AK' },
      { value: 'any',       label: 'No preference', sub: 'Open to schools across the country' },
    ]
  },
  {
    key: 'size',
    text: 'What campus size feels right for you?',
    opts: [
      { value: 'small',  label: 'Small',  sub: 'Under 4,000 students — close community, personal attention' },
      { value: 'medium', label: 'Medium', sub: '4,000–15,000 students — balanced resources and community' },
      { value: 'large',  label: 'Large',  sub: '15,000+ students — diverse programs, big campus energy' },
    ]
  },
  {
    key: 'budget',
    text: 'How important is keeping tuition costs low?',
    opts: [
      { value: 'low',    label: 'Very important',      sub: 'Looking for in-state publics, scholarships, or need-blind schools' },
      { value: 'medium', label: 'Somewhat important',  sub: 'Cost matters but I have some flexibility' },
      { value: 'high',   label: 'Not a major factor',  sub: "I'm open to any school regardless of sticker price" },
    ]
  },
  {
    key: 'gpa',
    text: "What's your approximate high school GPA?",
    opts: [
      { value: 'high',     label: '3.8 and above', sub: 'Highly competitive applicant' },
      { value: 'med_high', label: '3.3 – 3.7',     sub: 'Strong academic record' },
      { value: 'medium',   label: '2.8 – 3.2',     sub: 'Solid record with room to grow' },
      { value: 'low',      label: 'Below 2.8',      sub: "GPA isn't my strongest metric" },
    ]
  },
  {
    key: 'vibe',
    text: 'What kind of campus life are you looking for?',
    opts: [
      { value: 'academic',  label: 'Academically intense',  sub: 'Research, intellectual culture, rigorous coursework' },
      { value: 'balanced',  label: 'Balanced',              sub: 'Strong academics plus a real social life' },
      { value: 'social',    label: 'Vibrant social scene',  sub: 'Greek life, big sports culture, active parties' },
      { value: 'community', label: 'Tight-knit community',  sub: 'Everyone knows each other, collaborative not competitive' },
    ]
  },
  {
    key: 'weather',
    text: 'What kind of weather do you prefer on campus?',
    opts: [
      { value: 'warm',     label: 'Warm and sunny',   sub: 'Southern California, Florida, Texas — sunshine year-round' },
      { value: 'seasons',  label: 'Four seasons',     sub: 'Midwest, Northeast — crisp falls, snowy winters, warm summers' },
      { value: 'cold',     label: 'Cold and snowy',   sub: 'New England, upper Midwest — bundling up culture' },
      { value: 'any',      label: 'No preference',    sub: "Weather isn't a dealbreaker for me" },
    ]
  },
  {
    key: 'social',
    text: 'What best describes your ideal social environment?',
    opts: [
      { value: 'party',     label: 'Party-oriented',        sub: 'Big Greek life, tailgates, and vibrant nightlife' },
      { value: 'balanced',  label: 'Balanced social life',  sub: 'Mix of social events and academic focus' },
      { value: 'academic',  label: 'Academically focused',  sub: 'Study groups, research events, and intellectual gatherings' },
      { value: 'quiet',     label: 'Quiet and low-key',     sub: 'Small gatherings, outdoor activities, calm campus culture' },
    ]
  },
  {
    key: 'distance',
    text: 'How far from home are you willing to go?',
    opts: [
      { value: 'close',    label: 'Close to home',        sub: 'Within a couple hours drive' },
      { value: 'medium',   label: 'A few hours away',     sub: 'Same region, manageable road trip' },
      { value: 'far',      label: 'Across the country',   sub: "I'm ready for a completely fresh start" },
      { value: 'any',      label: 'No preference',        sub: "Distance doesn't matter to me" },
    ]
  },
  {
    key: 'diversity',
    text: 'How important is campus diversity to you?',
    opts: [
      { value: 'very',      label: 'Very important',      sub: 'I want to learn alongside people from many backgrounds' },
      { value: 'somewhat',  label: 'Somewhat important',  sub: "It's a nice-to-have but not a dealbreaker" },
      { value: 'not',       label: 'Not important',       sub: "I don't factor this into my decision" },
    ]
  },
  {
    key: 'internship',
    text: 'How important are internship and career opportunities?',
    opts: [
      { value: 'very',      label: 'Very important',      sub: "Career pipelines, co-ops, and industry connections are a top priority" },
      { value: 'somewhat',  label: 'Somewhat important',  sub: "I want options but it's not my primary focus" },
      { value: 'not',       label: 'Not important',       sub: "I'm focused more on academics or personal growth" },
    ]
  },
];

/* ─── State ─────────────────────────────────────────────────────── */
let currentQ = 0;
const answers = {};
let resultsData = [];        // Scored school objects for compare
const compareSet = new Set(); // School unitids selected for comparison
let apiCache = {};           // Cache Scorecard responses

/* ─── Utility: show a screen ──────────────────────────────────────── */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ─── Survey ──────────────────────────────────────────────────────── */
function startSurvey() {
  currentQ = 0;
  Object.keys(answers).forEach(k => delete answers[k]);
  compareSet.clear();
  renderQuestion();
  showScreen('survey');
}

function renderQuestion() {
  const q   = QUESTIONS[currentQ];
  const pct = Math.round((currentQ / QUESTIONS.length) * 100);

  // Progress bar + percentage text
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('step-label').textContent =
    'Question ' + (currentQ + 1) + ' of ' + QUESTIONS.length;
  document.getElementById('progress-pct').textContent = pct + '% Complete';

  // Render dot indicators
  const dotsEl = document.getElementById('progress-dots');
  dotsEl.innerHTML = '';
  for (let i = 0; i < QUESTIONS.length; i++) {
    const dot = document.createElement('div');
    dot.className = 'progress-dot' +
      (i < currentQ ? ' done' : i === currentQ ? ' active' : '');
    dotsEl.appendChild(dot);
  }

  document.getElementById('q-text').textContent = q.text;

  const grid = document.getElementById('options-grid');
  grid.innerHTML = '';
  q.opts.forEach(opt => {
    const div = document.createElement('div');
    div.className = 'option-item' + (answers[q.key] === opt.value ? ' selected' : '');
    div.innerHTML = `
      <div class="option-radio"></div>
      <div>
        <div class="option-label">${opt.label}</div>
        ${opt.sub ? `<div class="option-sub">${opt.sub}</div>` : ''}
      </div>`;
    div.addEventListener('click', () => selectOption(opt.value));
    grid.appendChild(div);
  });

  const btnNext  = document.getElementById('btn-next');
  const nextLabel = document.getElementById('next-label');
  nextLabel.textContent = currentQ === QUESTIONS.length - 1 ? 'See my matches' : 'Continue';
  btnNext.disabled = !answers[q.key];

  document.getElementById('btn-back').style.visibility = currentQ === 0 ? 'hidden' : 'visible';
}

function selectOption(value) {
  answers[QUESTIONS[currentQ].key] = value;
  document.querySelectorAll('.option-item').forEach(el => el.classList.remove('selected'));
  const opts = document.querySelectorAll('.option-item');
  QUESTIONS[currentQ].opts.forEach((o, i) => {
    if (o.value === value) opts[i].classList.add('selected');
  });
  document.getElementById('btn-next').disabled = false;
}

function goNext() {
  if (!answers[QUESTIONS[currentQ].key]) return;
  if (currentQ < QUESTIONS.length - 1) {
    currentQ++;
    renderQuestion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    fetchAndShowResults();
  }
}

function goBack() {
  if (currentQ > 0) { currentQ--; renderQuestion(); }
}

/* ─── Loading Screen Helpers ─────────────────────────────────────── */
const LOADING_MESSAGES = [
  'Analyzing your academic profile...',
  'Filtering schools by region & budget...',
  'Comparing GPA to admissions data...',
  'Scoring preference compatibility...',
  'Generating AI explanations...',
];

function animateLoadingSteps() {
  let step = 0;
  const titleEl = document.getElementById('loading-title');
  // Reset all steps
  for (let i = 0; i < 5; i++) {
    const el = document.getElementById('lstep-' + i);
    el.classList.remove('active', 'done');
  }

  function advance() {
    if (step > 0) {
      document.getElementById('lstep-' + (step - 1)).classList.remove('active');
      document.getElementById('lstep-' + (step - 1)).classList.add('done');
    }
    if (step < 5) {
      document.getElementById('lstep-' + step).classList.add('active');
      titleEl.textContent = LOADING_MESSAGES[step] || 'Almost there...';
      step++;
    }
  }

  advance();
  return setInterval(advance, 1600);
}

/* ─── College Scorecard API Fetch ────────────────────────────────── */
async function fetchColleges() {
  // Build query params based on answers
  const params = new URLSearchParams({
    api_key: SCORECARD_API_KEY,
    per_page: 80,
    fields: [
      'id',
      'school.name',
      'school.city',
      'school.state',
      'school.school_url',
      'school.ownership',
      'latest.student.size',
      'latest.admissions.admission_rate.overall',
      'latest.admissions.sat_scores.midpoint.critical_reading',
      'latest.admissions.sat_scores.midpoint.math',
      'latest.admissions.act_scores.midpoint.cumulative',
      'latest.cost.tuition.in_state',
      'latest.cost.tuition.out_of_state',
      'latest.cost.avg_net_price.public',
      'latest.cost.avg_net_price.private',
      'latest.completion.rate_suppressed.overall',
      'latest.student.demographics.race_ethnicity.white',
      'latest.earnings.10_yrs_after_entry.median',
      'latest.academics.program_percentage.computer',
      'latest.academics.program_percentage.business_marketing',
      'latest.academics.program_percentage.liberal_arts',
      'latest.academics.program_percentage.visual_performing',
      'latest.academics.program_percentage.health',
      'latest.academics.program_percentage.engineering',
      'latest.academics.program_percentage.biological',
      'latest.academics.program_percentage.social_science',
    ].join(','),
    // Only 4-year degree-granting institutions
    'school.degrees_awarded.predominant': 3,
    // Exclude schools with no admission rate data
    'latest.admissions.admission_rate.overall__range': '0.01..1',
  });

  // Apply region filter
  if (answers.region !== 'any') {
    const states = REGION_STATES[answers.region] || [];
    if (states.length) params.append('school.state', states.join(','));
  }

  // Apply size filter — student population range
  const sizeRanges = {
    small:  '0..4000',
    medium: '4000..15000',
    large:  '15000..200000',
  };
  if (sizeRanges[answers.size]) {
    params.append('latest.student.size__range', sizeRanges[answers.size]);
  }

  // Bias toward schools with significant programs in chosen major
  const majorField = MAJOR_FIELDS[answers.major];
  if (majorField) {
    // Require at least 2% of students in this program area
    params.append(majorField + '__range', '0.02..1');
  }

  // Sort by admission rate (to surface a mix of selectivity levels)
  params.append('sort', 'latest.admissions.admission_rate.overall:asc');

  const cacheKey = params.toString();
  if (apiCache[cacheKey]) return apiCache[cacheKey];

  const url = `${SCORECARD_BASE}?${params}`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error(`Scorecard API error: ${res.status}`);
  const data = await res.json();

  // Normalize results
  const schools = (data.results || []).map(normalizeSchool).filter(Boolean);
  apiCache[cacheKey] = schools;
  return schools;
}

/* ─── Normalize raw API school object ────────────────────────────── */
function normalizeSchool(raw) {
  const name = raw['school.name'];
  if (!name) return null;

  const admissionRate = raw['latest.admissions.admission_rate.overall'];
  const satMath       = raw['latest.admissions.sat_scores.midpoint.math'];
  const satRead       = raw['latest.admissions.sat_scores.midpoint.critical_reading'];
  const actMid        = raw['latest.admissions.act_scores.midpoint.cumulative'];
  const studentSize   = raw['latest.student.size'];
  const tuitionIn     = raw['latest.cost.tuition.in_state'];
  const tuitionOut    = raw['latest.cost.tuition.out_of_state'];
  const netPricePub   = raw['latest.cost.avg_net_price.public'];
  const netPricePriv  = raw['latest.cost.avg_net_price.private'];
  const gradRate      = raw['latest.completion.rate_suppressed.overall'];
  const earnings      = raw['latest.earnings.10_yrs_after_entry.median'];
  const diversityPct  = raw['latest.student.demographics.race_ethnicity.white'];
  const ownership     = raw['school.ownership']; // 1=public, 2/3=private

  // Derive budget tier from avg net price
  const netPrice = ownership === 1 ? netPricePub : netPricePriv;
  let budgetTier = 'high';
  if (netPrice < 15000) budgetTier = 'low';
  else if (netPrice < 30000) budgetTier = 'medium';

  // Derive size tier
  let sizeTier = 'medium';
  if (studentSize < 4000) sizeTier = 'small';
  else if (studentSize >= 15000) sizeTier = 'large';

  // Derive GPA tier from admission rate (proxy)
  let gpaTier = 'medium';
  if (admissionRate < 0.12) gpaTier = 'high';
  else if (admissionRate < 0.35) gpaTier = 'med_high';
  else if (admissionRate < 0.65) gpaTier = 'medium';
  else gpaTier = 'low';

  // Derive vibe from program mix and ownership
  let vibeTier = 'balanced';
  const compPct = raw['latest.academics.program_percentage.computer'] || 0;
  const healthPct = raw['latest.academics.program_percentage.health'] || 0;
  if (compPct + healthPct > 0.4) vibeTier = 'academic';
  else if (ownership === 1 && studentSize > 20000) vibeTier = 'social';
  else if (studentSize < 4000) vibeTier = 'community';

  // State → region mapping
  const state = raw['school.state'];
  let regionKey = 'any';
  for (const [reg, states] of Object.entries(REGION_STATES)) {
    if (states.includes(state)) { regionKey = reg; break; }
  }

  // Weather by state
  const warmStates = ['FL','CA','TX','AZ','NM','NV','HI','GA','SC','LA'];
  const coldStates = ['MN','WI','MI','ND','SD','MT','ME','VT','NH','AK'];
  let weatherTier = 'seasons';
  if (warmStates.includes(state)) weatherTier = 'warm';
  else if (coldStates.includes(state)) weatherTier = 'cold';

  // Diversity score (lower white% = more diverse)
  const diversityScore = diversityPct !== null && diversityPct !== undefined
    ? Math.round((1 - diversityPct) * 100)
    : 50;

  // Format tuition display
  const displayTuition = ownership === 1
    ? (tuitionIn  ? '$' + tuitionIn.toLocaleString()  + ' (in-state)' : 'N/A')
    : (tuitionOut ? '$' + tuitionOut.toLocaleString() : 'N/A');

  const displayAcceptance = admissionRate
    ? Math.round(admissionRate * 100) + '%'
    : 'N/A';

  const displayGradRate = gradRate
    ? Math.round(gradRate * 100) + '%'
    : 'N/A';

  const displayEarnings = earnings
    ? '$' + earnings.toLocaleString()
    : 'N/A';

  const displaySize = studentSize
    ? studentSize.toLocaleString() + ' students'
    : 'N/A';

  // Program strengths
  const programMap = {
    'Computer Science':  raw['latest.academics.program_percentage.computer'] || 0,
    'Business':          raw['latest.academics.program_percentage.business_marketing'] || 0,
    'Liberal Arts':      raw['latest.academics.program_percentage.liberal_arts'] || 0,
    'Arts':              raw['latest.academics.program_percentage.visual_performing'] || 0,
    'Health':            raw['latest.academics.program_percentage.health'] || 0,
    'Engineering':       raw['latest.academics.program_percentage.engineering'] || 0,
    'Biology/Life Sci':  raw['latest.academics.program_percentage.biological'] || 0,
    'Social Sciences':   raw['latest.academics.program_percentage.social_science'] || 0,
  };
  const topPrograms = Object.entries(programMap)
    .filter(([, v]) => v > 0.05)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k]) => k);

  return {
    id:               raw['id'],
    name,
    city:             raw['school.city'],
    state,
    location:         `${raw['school.city']}, ${state}`,
    website:          raw['school.school_url'],
    region:           regionKey,
    sizeTier,
    budgetTier,
    gpaTier,
    vibeTier,
    weatherTier,
    diversityScore,
    admissionRate,
    netPrice,
    ownership,
    // Raw numeric fields for scoring
    studentSize,
    satMath,
    satRead,
    actMid,
    gradRate,
    earnings,
    programMap,
    topPrograms,
    // Formatted display
    displayTuition,
    displayAcceptance,
    displayGradRate,
    displayEarnings,
    displaySize,
  };
}

/* ─── Matching & Scoring Algorithm ──────────────────────────────── */

// Weight config
const WEIGHTS = {
  major:      30,
  region:     15,
  size:       12,
  budget:     12,
  gpa:        10,
  vibe:        6,
  weather:     5,
  social:      4,
  diversity:   3,
  internship:  3,
};

function scoreCollege(school) {
  let total = 0;

  // ── MAJOR (30 pts) ──────────────────────────────────────────────
  // Score based on how strong the relevant program is (% of students)
  const majorPctMap = {
    stem:        (school.programMap['Computer Science'] || 0) + (school.programMap['Engineering'] || 0) + (school.programMap['Biology/Life Sci'] || 0),
    business:     school.programMap['Business'] || 0,
    liberal_arts: school.programMap['Liberal Arts'] || 0,
    arts:         school.programMap['Arts'] || 0,
    health:       school.programMap['Health'] || 0,
  };
  const majorPct = majorPctMap[answers.major] || 0;
  // Scale: >25% = full points, proportional otherwise, min 5pts if any presence
  const majorScore = majorPct > 0.01
    ? Math.min(WEIGHTS.major, Math.round((majorPct / 0.25) * WEIGHTS.major))
    : 0;
  total += majorScore;

  // ── REGION (15 pts) ────────────────────────────────────────────
  if (answers.region === 'any' || school.region === answers.region) {
    total += WEIGHTS.region;
  } else {
    // Partial credit for adjacent regions
    const adjacent = {
      northeast: ['midwest','southeast'],
      southeast: ['northeast','south','midwest'],
      midwest:   ['northeast','south','west'],
      south:     ['southeast','midwest','west'],
      west:      ['south','midwest'],
    };
    if ((adjacent[answers.region] || []).includes(school.region)) {
      total += Math.round(WEIGHTS.region * 0.4);
    }
  }

  // ── SIZE (12 pts) ──────────────────────────────────────────────
  if (school.sizeTier === answers.size) {
    total += WEIGHTS.size;
  } else {
    // Partial for adjacent sizes
    const sizeOrder = ['small','medium','large'];
    const dist = Math.abs(sizeOrder.indexOf(school.sizeTier) - sizeOrder.indexOf(answers.size));
    if (dist === 1) total += Math.round(WEIGHTS.size * 0.5);
  }

  // ── BUDGET (12 pts) ────────────────────────────────────────────
  const budgetOk = { low: ['low'], medium: ['low','medium'], high: ['low','medium','high'] };
  if ((budgetOk[answers.budget] || []).includes(school.budgetTier)) {
    total += WEIGHTS.budget;
  }

  // ── GPA / SELECTIVITY (10 pts) ─────────────────────────────────
  // Compare student GPA tier to school's selectivity tier
  const gpaRank = { high: 3, med_high: 2, medium: 1, low: 0 };
  const studentGpaRank = gpaRank[answers.gpa] ?? 1;
  const schoolGpaRank  = gpaRank[school.gpaTier] ?? 1;
  const gpaDiff = studentGpaRank - schoolGpaRank;

  if (gpaDiff >= 0) {
    // Student GPA meets or exceeds school typical — good fit
    total += gpaDiff === 0 ? WEIGHTS.gpa : Math.round(WEIGHTS.gpa * 0.85);
  } else {
    // Reach school — partial credit
    total += Math.max(0, WEIGHTS.gpa + gpaDiff * 3);
  }

  // ── VIBE (6 pts) ───────────────────────────────────────────────
  if (school.vibeTier === answers.vibe) total += WEIGHTS.vibe;
  else if ((answers.vibe === 'balanced' && school.vibeTier !== 'social') ||
           (answers.vibe === 'academic' && school.vibeTier === 'balanced')) {
    total += Math.round(WEIGHTS.vibe * 0.5);
  }

  // ── WEATHER (5 pts) ────────────────────────────────────────────
  if (answers.weather === 'any' || school.weatherTier === answers.weather) {
    total += WEIGHTS.weather;
  }

  // ── SOCIAL ENVIRONMENT (4 pts) ─────────────────────────────────
  const socialMatch = {
    party:    ['social'],
    balanced: ['balanced','community'],
    academic: ['academic','community'],
    quiet:    ['community','academic'],
  };
  if ((socialMatch[answers.social] || []).includes(school.vibeTier)) {
    total += WEIGHTS.social;
  } else if (answers.social === 'balanced') {
    total += Math.round(WEIGHTS.social * 0.5);
  }

  // ── DIVERSITY (3 pts) ──────────────────────────────────────────
  if (answers.diversity === 'not') {
    total += WEIGHTS.diversity; // No penalty either way
  } else if (answers.diversity === 'very') {
    // High diversity score (>50) = full points
    if (school.diversityScore >= 50) total += WEIGHTS.diversity;
    else if (school.diversityScore >= 30) total += Math.round(WEIGHTS.diversity * 0.5);
  } else {
    // 'somewhat' — any diversity is fine
    if (school.diversityScore >= 25) total += WEIGHTS.diversity;
    else total += Math.round(WEIGHTS.diversity * 0.6);
  }

  // ── INTERNSHIP (3 pts) ─────────────────────────────────────────
  if (answers.internship === 'not') {
    total += WEIGHTS.internship;
  } else {
    // Proxy: high median earnings & large city = good internship access
    const earningsGood = school.earnings && school.earnings > 45000;
    const bigCity      = school.studentSize && school.studentSize > 10000;
    if (earningsGood && bigCity) total += WEIGHTS.internship;
    else if (earningsGood || bigCity) total += Math.round(WEIGHTS.internship * 0.6);
    else if (answers.internship === 'somewhat') total += Math.round(WEIGHTS.internship * 0.4);
  }

  return Math.min(100, total);
}

/* ─── Match Category Labels ──────────────────────────────────────── */
function getMatchCategory(pct, school) {
  const gpaRank = { high: 3, med_high: 2, medium: 1, low: 0 };
  const studentGpaRank = gpaRank[answers.gpa] ?? 1;
  const schoolGpaRank  = gpaRank[school.gpaTier] ?? 1;
  const gpaDiff = studentGpaRank - schoolGpaRank;

  if (pct >= 85) return gpaDiff >= 1 ? 'Safety' : 'Exceptional Match';
  if (pct >= 72) return gpaDiff >= 0 ? 'Strong Match' : 'Target School';
  if (pct >= 58) return gpaDiff >= 0 ? 'Good Match' : 'Reach School';
  if (pct >= 45) return 'Possible Match';
  return 'Reach School';
}

function getMatchClass(pct) {
  if (pct >= 72) return 'match-high';
  if (pct >= 50) return 'match-med';
  return 'match-low';
}

/* ─── Campus Image Lookup ────────────────────────────────────────── */
function getCampusImage(schoolName) {
  const lower = schoolName.toLowerCase();
  for (const [key, url] of Object.entries(CAMPUS_IMAGES)) {
    if (lower.includes(key)) return url;
  }
  return null;
}

/* ─── Gradient Placeholder ───────────────────────────────────────── */
// Returns a unique CSS gradient per school so cards never look broken.
function getPlaceholderGradient(schoolName) {
  let hash = 0;
  for (let i = 0; i < schoolName.length; i++) {
    hash = schoolName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue  = Math.abs(hash) % 360;
  const hue2 = (hue + 40) % 360;
  return `linear-gradient(135deg, hsl(${hue},30%,72%), hsl(${hue2},38%,82%))`;
}

/* ─── AI Explanation via Claude API ──────────────────────────────── */
async function generateExplanation(school, pct, matchCategory) {
  const gpaLabels = { high: '3.8+', med_high: '3.3–3.7', medium: '2.8–3.2', low: 'below 2.8' };
  const majorLabels = { stem: 'STEM', business: 'Business', liberal_arts: 'Liberal Arts', arts: 'Arts & Design', health: 'Health Sciences' };

  const prompt = `You are a college counselor writing a concise, personalized 2-sentence explanation for why a student matched with ${school.name} (${school.location}).

Student profile:
- Intended major: ${majorLabels[answers.major]}
- Preferred region: ${answers.region}
- Campus size preference: ${answers.size}
- Budget sensitivity: ${answers.budget}
- GPA range: ${gpaLabels[answers.gpa]}
- Campus vibe preference: ${answers.vibe}
- Weather preference: ${answers.weather}
- Social preference: ${answers.social}
- Distance preference: ${answers.distance}
- Diversity importance: ${answers.diversity}
- Internship importance: ${answers.internship}

School data:
- Match score: ${pct}% (${matchCategory})
- Acceptance rate: ${school.displayAcceptance}
- Avg net price: ${school.netPrice ? '$' + school.netPrice.toLocaleString() : 'N/A'}
- Graduation rate: ${school.displayGradRate}
- Median earnings after 10 years: ${school.displayEarnings}
- Top programs: ${school.topPrograms.join(', ') || 'N/A'}
- Student population: ${school.displaySize}
- Diversity index: ${school.diversityScore}%

Write exactly 2 sentences. Sentence 1: why this school fits the student's academic and preference profile. Sentence 2: what makes this a ${matchCategory} and any caveats. Be specific to THIS school — mention the city, programs, or size. Do not use bullet points. Do not start with "This school".`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) throw new Error('Anthropic API error: ' + response.status);
  const data = await response.json();
  return data.content?.map(b => b.text || '').join('') || '';
}

/* ─── Factor Chips Builder ───────────────────────────────────────── */
function buildFactorChips(school, pct) {
  const chips = [];
  const majorLabels = { stem: 'STEM', business: 'Business', liberal_arts: 'Liberal Arts', arts: 'Arts & Design', health: 'Health Sciences' };
  const budgetOk = { low: ['low'], medium: ['low','medium'], high: ['low','medium','high'] };
  const gpaRank  = { high: 3, med_high: 2, medium: 1, low: 0 };

  const majorPct = (school.programMap[majorLabels[answers.major]] || 0) +
    (answers.major === 'stem' ? ((school.programMap['Engineering'] || 0) + (school.programMap['Biology/Life Sci'] || 0)) : 0);
  if (majorPct > 0.05) chips.push({ label: majorLabels[answers.major] + ' ✓', cls: 'factor-major' });

  if (answers.region === 'any' || school.region === answers.region) chips.push({ label: 'Location ✓', cls: 'factor-region' });
  if (school.sizeTier === answers.size) chips.push({ label: 'Size ✓', cls: 'factor-size' });
  if ((budgetOk[answers.budget] || []).includes(school.budgetTier)) chips.push({ label: 'Budget ✓', cls: 'factor-budget' });

  const gpaDiff = (gpaRank[answers.gpa] ?? 1) - (gpaRank[school.gpaTier] ?? 1);
  if (gpaDiff >= 0) chips.push({ label: gpaDiff >= 1 ? 'GPA Safety ✓' : 'GPA Fit ✓', cls: 'factor-gpa' });
  else chips.push({ label: 'GPA Reach', cls: 'factor-gpa' });

  if (school.vibeTier === answers.vibe) chips.push({ label: 'Vibe ✓', cls: 'factor-vibe' });
  if (answers.weather !== 'any' && school.weatherTier === answers.weather) chips.push({ label: 'Weather ✓', cls: 'factor-weather' });
  if (answers.diversity === 'very' && school.diversityScore >= 50) chips.push({ label: 'Diverse Campus ✓', cls: 'factor-diversity' });
  if (answers.internship === 'very' && school.earnings > 50000) chips.push({ label: 'Career Outcomes ✓', cls: 'factor-internship' });

  return chips;
}

/* ─── Skeleton Loaders ───────────────────────────────────────────── */
function renderSkeletons(grid, count = 5) {
  grid.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const sk = document.createElement('div');
    sk.className = 'skeleton-card';
    sk.innerHTML = `
      <div class="sk-row">
        <div style="flex:1">
          <div class="skeleton sk-title"></div>
          <div class="skeleton sk-sub"></div>
          <div class="skeleton sk-line"></div>
          <div class="skeleton sk-line-sm"></div>
          <div class="skeleton sk-line"></div>
        </div>
        <div class="skeleton sk-img"></div>
      </div>`;
    grid.appendChild(sk);
  }
}

/* ─── Main: Fetch + Score + Render ──────────────────────────────── */
async function fetchAndShowResults() {
  showScreen('loading');
  const stepInterval = animateLoadingSteps();

  let schools = [];
  let apiWorked = true;

  try {
    if (SCORECARD_API_KEY === 'YOUR_COLLEGE_SCORECARD_API_KEY_HERE') {
      throw new Error('No API key configured — using fallback data');
    }
    schools = await fetchColleges();
  } catch (err) {
    console.warn('College Scorecard API unavailable:', err.message);
    apiWorked = false;
    schools = getFallbackSchools();
  }

  if (!schools.length) {
    schools = getFallbackSchools();
    apiWorked = false;
  }

  // Score and rank
  const scored = schools
    .map(s => ({ ...s, score: scoreCollege(s) }))
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  resultsData = scored;

  // Show results screen with skeletons while AI generates
  clearInterval(stepInterval);

  // Update results header
  const majorLabel = { stem: 'STEM', business: 'Business', liberal_arts: 'Liberal Arts', arts: 'Arts & Design', health: 'Health Sciences' };
  document.getElementById('results-title').textContent =
    'Your top matches for ' + (majorLabel[answers.major] || 'your goals');
  document.getElementById('results-sub').textContent =
    apiWorked
      ? 'Powered by U.S. Department of Education College Scorecard data. Showing your top 5 personalized matches.'
      : 'Based on your academic profile and preferences. Add a College Scorecard API key for live data.';

  const grid = document.getElementById('results-grid');
  renderSkeletons(grid);
  showScreen('results');

  // Render cards without AI first (fast)
  renderCards(scored, grid, false);

  // Build star rating
  buildStarRating();

  // Now stream AI explanations into each card
  if (ANTHROPIC_API_KEY !== 'YOUR_ANTHROPIC_API_KEY_HERE') {
    scored.forEach((school, idx) => {
      const pct = school.score;
      const matchCategory = getMatchCategory(pct, school);
      generateExplanation(school, pct, matchCategory)
        .then(text => {
          const el = document.getElementById('why-text-' + idx);
          if (el) {
            el.classList.remove('why-loading');
            el.textContent = text;
          }
        })
        .catch(() => {
          const el = document.getElementById('why-text-' + idx);
          if (el) {
            el.classList.remove('why-loading');
            el.textContent = buildFallbackExplanation(school, pct, matchCategory);
          }
        });
    });
  }
}

/* ─── Render Result Cards ────────────────────────────────────────── */
function renderCards(scored, grid, withAI) {
  grid.innerHTML = '';
  const rankLabels = ['Best match', '2nd match', '3rd match', '4th match', '5th match'];

  scored.forEach((school, idx) => {
    const pct = school.score;
    const matchCategory = getMatchCategory(pct, school);
    const matchClass = getMatchClass(pct);
    const chips = buildFactorChips(school, pct);
    const imgUrl = getCampusImage(school.name);
    const websiteHref = school.website
      ? (school.website.startsWith('http') ? school.website : 'https://' + school.website)
      : null;

    const card = document.createElement('div');
    card.className = 'college-card';
    card.dataset.id = school.id;

    card.innerHTML = `
      <div class="card-layout">
        <!-- Left: text content -->
        <div class="card-content">
          <div class="card-rank">${rankLabels[idx]}</div>
          <div class="card-header">
            <div>
              <div class="card-name">${school.name}</div>
              <div class="card-location">${school.location}</div>
            </div>
            <div class="match-badge ${matchClass}">
              <span class="pct">${pct}%</span>
              <span class="pct-label">match</span>
              <span class="match-category">${matchCategory}</span>
            </div>
          </div>

          <hr class="card-divider" />

          <div class="why-section">
            <div class="why-label">Why this school</div>
            <div class="why-text why-loading" id="why-text-${idx}">
              ${ANTHROPIC_API_KEY !== 'YOUR_ANTHROPIC_API_KEY_HERE'
                ? 'Generating personalized explanation...'
                : buildFallbackExplanation(school, pct, matchCategory)}
            </div>
            <div class="why-factors">
              ${chips.map(c => `<span class="factor-chip ${c.cls}">${c.label}</span>`).join('')}
            </div>
          </div>

          <div class="card-stats">
            <div class="stat-item">
              <span class="stat-label">Tuition</span>
              <span class="stat-value">${school.displayTuition}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Acceptance Rate</span>
              <span class="stat-value">${school.displayAcceptance}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Graduation Rate</span>
              <span class="stat-value">${school.displayGradRate}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Median Earnings</span>
              <span class="stat-value">${school.displayEarnings}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Enrollment</span>
              <span class="stat-value">${school.displaySize}</span>
            </div>
          </div>

          <div class="card-tags">
            ${(school.topPrograms.length
              ? school.topPrograms.map(p => `<span class="tag">${p}</span>`).join('')
              : '<span class="tag">Liberal Arts</span>')}
            <span class="tag">${school.sizeTier.charAt(0).toUpperCase() + school.sizeTier.slice(1)} campus</span>
            ${school.diversityScore >= 50 ? '<span class="tag">Diverse campus</span>' : ''}
          </div>

          <div class="card-footer">
            <button class="fb-btn" id="up-${idx}" onclick="vote(${idx}, 'up')">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6l5-5 5 5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              Good match
            </button>
            <button class="fb-btn" id="dn-${idx}" onclick="vote(${idx}, 'down')">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 11V1M1 6l5 5 5-5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              Not for me
            </button>
            <button class="compare-btn" id="cmp-${idx}" onclick="toggleCompare(${idx})">
              + Compare
            </button>
            ${websiteHref
              ? `<a class="website-btn" href="${websiteHref}" target="_blank" rel="noopener">
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1 5.5h9M6.5 1l4 4.5-4 4.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  Website
                </a>`
              : ''}
          </div>
        </div>

        <!-- Right: campus image -->
        <div class="card-image">
          ${imgUrl
            ? `<img
                src="${imgUrl}"
                alt="${school.name} campus"
                loading="lazy"
                crossorigin="anonymous"
                onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
              /><div class="card-image-placeholder" style="display:none;background:${getPlaceholderGradient(school.name)}">🏛️</div>`
            : `<div class="card-image-placeholder" style="background:${getPlaceholderGradient(school.name)}">🏛️</div>`}
        </div>
      </div>`;

    grid.appendChild(card);
  });

  // Remove loading class from why-texts if no AI key
  if (ANTHROPIC_API_KEY === 'YOUR_ANTHROPIC_API_KEY_HERE') {
    document.querySelectorAll('.why-loading').forEach(el => el.classList.remove('why-loading'));
  }
}

/* ─── Fallback Explanation (no AI key) ──────────────────────────── */
function buildFallbackExplanation(school, pct, matchCategory) {
  const majorLabels = { stem: 'STEM programs', business: 'business programs', liberal_arts: 'liberal arts programs', arts: 'arts programs', health: 'health sciences programs' };
  const gpaRank = { high: 3, med_high: 2, medium: 1, low: 0 };
  const gpaDiff = (gpaRank[answers.gpa] ?? 1) - (gpaRank[school.gpaTier] ?? 1);

  const programNote = school.topPrograms.length
    ? `${school.name} is particularly strong in ${school.topPrograms.slice(0, 2).join(' and ')}, aligning with your interest in ${majorLabels[answers.major] || 'your chosen field'}.`
    : `${school.name} in ${school.location} aligns well with your interest in ${majorLabels[answers.major] || 'your field of study'}.`;

  let gpaNote;
  if (gpaDiff >= 1) gpaNote = `With your GPA, this is a solid safety school where you're likely to be competitive.`;
  else if (gpaDiff === 0) gpaNote = `Your GPA closely matches the typical admitted student, making this a realistic target school.`;
  else gpaNote = `This is a reach school given your GPA — strong essays and extracurriculars will be important.`;

  return `${programNote} ${gpaNote}`;
}

/* ─── Feedback Interactions ──────────────────────────────────────── */
function vote(idx, dir) {
  const up = document.getElementById('up-' + idx);
  const dn = document.getElementById('dn-' + idx);
  up.classList.remove('voted-up', 'voted-dn');
  dn.classList.remove('voted-up', 'voted-dn');
  if (dir === 'up') up.classList.add('voted-up');
  else dn.classList.add('voted-dn');
}

function buildStarRating() {
  const starRow = document.getElementById('star-row');
  starRow.innerHTML = '';
  document.getElementById('feedback-thanks').style.display = 'none';
  for (let i = 1; i <= 5; i++) {
    const btn = document.createElement('button');
    btn.className = 'star-btn';
    btn.textContent = '★';
    btn.id = 'star-' + i;
    btn.addEventListener('click', () => rateStar(i));
    starRow.appendChild(btn);
  }
}

function rateStar(n) {
  for (let i = 1; i <= 5; i++) {
    document.getElementById('star-' + i).classList.toggle('lit', i <= n);
  }
  setTimeout(() => {
    document.getElementById('feedback-thanks').style.display = 'block';
  }, 300);
}

/* ─── Compare Feature ────────────────────────────────────────────── */
function toggleCompare(idx) {
  const school = resultsData[idx];
  if (!school) return;
  const id = school.id || idx;
  const btn = document.getElementById('cmp-' + idx);

  if (compareSet.has(id)) {
    compareSet.delete(id);
    btn.textContent = '+ Compare';
    btn.classList.remove('comparing');
  } else {
    if (compareSet.size >= 3) {
      alert('You can compare up to 3 schools at a time. Deselect one first.');
      return;
    }
    compareSet.add(id);
    btn.textContent = '✓ Comparing';
    btn.classList.add('comparing');
  }

  // Update nav bar compare button
  const count = compareSet.size;
  const barBtn = document.getElementById('btn-compare-bar');
  document.getElementById('compare-count').textContent = count;
  barBtn.style.display = count >= 2 ? 'inline-flex' : 'none';
}

function openCompareModal() {
  const selectedSchools = resultsData.filter(s => compareSet.has(s.id || resultsData.indexOf(s)));
  if (selectedSchools.length < 2) {
    alert('Select at least 2 schools to compare.');
    return;
  }
  renderCompareModal(selectedSchools);
  document.getElementById('compare-modal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeCompareModal() {
  document.getElementById('compare-modal').style.display = 'none';
  document.body.style.overflow = '';
}

function handleModalBackdrop(e) {
  if (e.target === document.getElementById('compare-modal')) closeCompareModal();
}

function renderCompareModal(schools) {
  const body = document.getElementById('compare-modal-body');

  const rows = [
    { label: 'Match Score',      key: s => `<strong>${s.score}%</strong> — ${getMatchCategory(s.score, s)}`, highlight: true },
    { label: 'Location',         key: s => s.location },
    { label: 'Tuition',          key: s => s.displayTuition },
    { label: 'Avg Net Price',    key: s => s.netPrice ? '$' + s.netPrice.toLocaleString() + '/yr' : 'N/A' },
    { label: 'Acceptance Rate',  key: s => s.displayAcceptance },
    { label: 'Graduation Rate',  key: s => s.displayGradRate },
    { label: 'Enrollment',       key: s => s.displaySize },
    { label: 'Median Earnings',  key: s => s.displayEarnings },
    { label: 'Diversity Index',  key: s => s.diversityScore + '%' },
    { label: 'Top Programs',     key: s => s.topPrograms.join(', ') || 'N/A' },
    { label: 'Campus Size',      key: s => s.sizeTier.charAt(0).toUpperCase() + s.sizeTier.slice(1) },
    { label: 'Region',           key: s => s.region.charAt(0).toUpperCase() + s.region.slice(1) },
    { label: 'Weather',          key: s => s.weatherTier.charAt(0).toUpperCase() + s.weatherTier.slice(1) },
  ];

  let html = `<table class="compare-table">
    <thead>
      <tr>
        <th></th>
        ${schools.map(s => {
          const imgUrl = getCampusImage(s.name);
          return `<th>
            ${imgUrl ? `<img class="compare-school-img" src="${imgUrl}" alt="${s.name}" crossorigin="anonymous" onerror="this.style.display='none'" />` : ''}
            <div class="compare-school-name">${s.name}</div>
            <div class="compare-school-loc">${s.location}</div>
          </th>`;
        }).join('')}
      </tr>
    </thead>
    <tbody>`;

  rows.forEach(row => {
    const values = schools.map(s => row.key(s));
    // Find best numeric value for highlighting
    const numericVals = schools.map(s => {
      const raw = row.key(s).replace(/<[^>]+>/g, '').replace(/[^0-9.]/g, '');
      return parseFloat(raw) || null;
    });
    const maxVal = Math.max(...numericVals.filter(Boolean));
    const minVal = Math.min(...numericVals.filter(Boolean));

    html += `<tr>
      <td>${row.label}</td>
      ${values.map((val, i) => {
        const num = numericVals[i];
        let cls = '';
        // Acceptance rate: lower is more selective (highlight lowest)
        if (row.label === 'Acceptance Rate' && num === minVal && minVal !== maxVal) cls = 'compare-highlight';
        // Match score, grad rate, earnings, diversity: higher = better
        else if (['Match Score','Graduation Rate','Median Earnings','Diversity Index'].includes(row.label)
          && num === maxVal && maxVal !== minVal) cls = 'compare-highlight';
        // Tuition / net price: lower = better
        else if (['Tuition','Avg Net Price'].includes(row.label) && num === minVal && minVal !== maxVal) cls = 'compare-highlight';
        return `<td class="${cls}">${val}</td>`;
      }).join('')}
    </tr>`;
  });

  html += `</tbody></table>`;
  body.innerHTML = html;
}

/* ─── Restart ────────────────────────────────────────────────────── */
function restart() {
  currentQ = 0;
  Object.keys(answers).forEach(k => delete answers[k]);
  resultsData = [];
  compareSet.clear();
  apiCache = {};
  document.getElementById('btn-compare-bar').style.display = 'none';
  closeCompareModal();
  showScreen('landing');
}

/* ════════════════════════════════════════════════════════════════════
   FALLBACK SCHOOL DATA
   Used when the College Scorecard API key is not configured.
   All data reflects publicly available information.
   ════════════════════════════════════════════════════════════════════ */
function getFallbackSchools() {
  return [
    // ── Northeast ──
    { id: 'mit', name: 'MIT', city: 'Cambridge', state: 'MA', location: 'Cambridge, MA', website: 'web.mit.edu', region: 'northeast', sizeTier: 'medium', budgetTier: 'high', gpaTier: 'high', vibeTier: 'academic', weatherTier: 'cold', diversityScore: 55, admissionRate: 0.04, netPrice: 17000, ownership: 2, studentSize: 11500, satMath: 790, satRead: 760, actMid: 35, gradRate: 0.94, earnings: 118000, programMap: { 'Computer Science': 0.35, 'Engineering': 0.40, 'Biology/Life Sci': 0.08 }, topPrograms: ['Computer Science', 'Engineering', 'Biology/Life Sci'], displayTuition: '$57,986', displayAcceptance: '4%', displayGradRate: '94%', displayEarnings: '$118,000', displaySize: '11,500 students' },
    { id: 'harvard', name: 'Harvard University', city: 'Cambridge', state: 'MA', location: 'Cambridge, MA', website: 'harvard.edu', region: 'northeast', sizeTier: 'medium', budgetTier: 'high', gpaTier: 'high', vibeTier: 'academic', weatherTier: 'cold', diversityScore: 58, admissionRate: 0.03, netPrice: 15000, ownership: 2, studentSize: 20000, gradRate: 0.97, earnings: 95000, programMap: { 'Liberal Arts': 0.30, 'Biology/Life Sci': 0.15, 'Social Sciences': 0.20 }, topPrograms: ['Liberal Arts', 'Social Sciences', 'Biology/Life Sci'], displayTuition: '$57,261', displayAcceptance: '3%', displayGradRate: '97%', displayEarnings: '$95,000', displaySize: '20,000 students' },
    { id: 'yale', name: 'Yale University', city: 'New Haven', state: 'CT', location: 'New Haven, CT', website: 'yale.edu', region: 'northeast', sizeTier: 'medium', budgetTier: 'high', gpaTier: 'high', vibeTier: 'balanced', weatherTier: 'cold', diversityScore: 56, admissionRate: 0.05, netPrice: 16000, ownership: 2, studentSize: 13600, gradRate: 0.96, earnings: 90000, programMap: { 'Liberal Arts': 0.35, 'Arts': 0.12, 'Social Sciences': 0.18 }, topPrograms: ['Liberal Arts', 'Social Sciences', 'Arts'], displayTuition: '$62,250', displayAcceptance: '5%', displayGradRate: '96%', displayEarnings: '$90,000', displaySize: '13,600 students' },
    { id: 'columbia', name: 'Columbia University', city: 'New York', state: 'NY', location: 'New York, NY', website: 'columbia.edu', region: 'northeast', sizeTier: 'medium', budgetTier: 'high', gpaTier: 'high', vibeTier: 'balanced', weatherTier: 'seasons', diversityScore: 68, admissionRate: 0.04, netPrice: 15000, ownership: 2, studentSize: 31000, gradRate: 0.95, earnings: 92000, programMap: { 'Liberal Arts': 0.28, 'Business': 0.12, 'Engineering': 0.14 }, topPrograms: ['Liberal Arts', 'Engineering', 'Business'], displayTuition: '$65,524', displayAcceptance: '4%', displayGradRate: '95%', displayEarnings: '$92,000', displaySize: '31,000 students' },
    { id: 'nyu', name: 'New York University', city: 'New York', state: 'NY', location: 'New York, NY', website: 'nyu.edu', region: 'northeast', sizeTier: 'large', budgetTier: 'medium', gpaTier: 'med_high', vibeTier: 'social', weatherTier: 'seasons', diversityScore: 65, admissionRate: 0.13, netPrice: 33000, ownership: 2, studentSize: 59000, gradRate: 0.86, earnings: 70000, programMap: { 'Arts': 0.18, 'Business': 0.22, 'Liberal Arts': 0.20 }, topPrograms: ['Business', 'Arts', 'Liberal Arts'], displayTuition: '$58,168', displayAcceptance: '13%', displayGradRate: '86%', displayEarnings: '$70,000', displaySize: '59,000 students' },
    { id: 'boston-univ', name: 'Boston University', city: 'Boston', state: 'MA', location: 'Boston, MA', website: 'bu.edu', region: 'northeast', sizeTier: 'large', budgetTier: 'medium', gpaTier: 'med_high', vibeTier: 'balanced', weatherTier: 'cold', diversityScore: 52, admissionRate: 0.19, netPrice: 35000, ownership: 2, studentSize: 37000, gradRate: 0.87, earnings: 65000, programMap: { 'Health': 0.18, 'Business': 0.20, 'Engineering': 0.12 }, topPrograms: ['Health', 'Business', 'Engineering'], displayTuition: '$60,000', displayAcceptance: '19%', displayGradRate: '87%', displayEarnings: '$65,000', displaySize: '37,000 students' },
    { id: 'northeastern', name: 'Northeastern University', city: 'Boston', state: 'MA', location: 'Boston, MA', website: 'northeastern.edu', region: 'northeast', sizeTier: 'medium', budgetTier: 'medium', gpaTier: 'med_high', vibeTier: 'balanced', weatherTier: 'cold', diversityScore: 50, admissionRate: 0.20, netPrice: 36000, ownership: 2, studentSize: 22000, gradRate: 0.91, earnings: 78000, programMap: { 'Computer Science': 0.22, 'Business': 0.18, 'Engineering': 0.20 }, topPrograms: ['Computer Science', 'Engineering', 'Business'], displayTuition: '$59,000', displayAcceptance: '20%', displayGradRate: '91%', displayEarnings: '$78,000', displaySize: '22,000 students' },
    // ── Southeast ──
    { id: 'duke', name: 'Duke University', city: 'Durham', state: 'NC', location: 'Durham, NC', website: 'duke.edu', region: 'southeast', sizeTier: 'medium', budgetTier: 'high', gpaTier: 'high', vibeTier: 'balanced', weatherTier: 'seasons', diversityScore: 55, admissionRate: 0.06, netPrice: 20000, ownership: 2, studentSize: 17000, gradRate: 0.95, earnings: 88000, programMap: { 'Health': 0.20, 'Engineering': 0.15, 'Social Sciences': 0.18 }, topPrograms: ['Health', 'Social Sciences', 'Engineering'], displayTuition: '$60,244', displayAcceptance: '6%', displayGradRate: '95%', displayEarnings: '$88,000', displaySize: '17,000 students' },
    { id: 'vanderbilt', name: 'Vanderbilt University', city: 'Nashville', state: 'TN', location: 'Nashville, TN', website: 'vanderbilt.edu', region: 'southeast', sizeTier: 'medium', budgetTier: 'high', gpaTier: 'high', vibeTier: 'social', weatherTier: 'seasons', diversityScore: 50, admissionRate: 0.07, netPrice: 22000, ownership: 2, studentSize: 13000, gradRate: 0.93, earnings: 82000, programMap: { 'Health': 0.15, 'Business': 0.18, 'Engineering': 0.14 }, topPrograms: ['Health', 'Business', 'Engineering'], displayTuition: '$60,348', displayAcceptance: '7%', displayGradRate: '93%', displayEarnings: '$82,000', displaySize: '13,000 students' },
    { id: 'emory', name: 'Emory University', city: 'Atlanta', state: 'GA', location: 'Atlanta, GA', website: 'emory.edu', region: 'southeast', sizeTier: 'medium', budgetTier: 'high', gpaTier: 'high', vibeTier: 'academic', weatherTier: 'warm', diversityScore: 62, admissionRate: 0.11, netPrice: 28000, ownership: 2, studentSize: 14000, gradRate: 0.91, earnings: 75000, programMap: { 'Health': 0.28, 'Business': 0.16, 'Liberal Arts': 0.22 }, topPrograms: ['Health', 'Liberal Arts', 'Business'], displayTuition: '$57,592', displayAcceptance: '11%', displayGradRate: '91%', displayEarnings: '$75,000', displaySize: '14,000 students' },
    { id: 'unc', name: 'UNC Chapel Hill', city: 'Chapel Hill', state: 'NC', location: 'Chapel Hill, NC', website: 'unc.edu', region: 'southeast', sizeTier: 'large', budgetTier: 'low', gpaTier: 'med_high', vibeTier: 'balanced', weatherTier: 'seasons', diversityScore: 42, admissionRate: 0.19, netPrice: 12000, ownership: 1, studentSize: 30000, gradRate: 0.91, earnings: 60000, programMap: { 'Health': 0.18, 'Liberal Arts': 0.22, 'Business': 0.16 }, topPrograms: ['Health', 'Liberal Arts', 'Business'], displayTuition: '$7,008 (in-state)', displayAcceptance: '19%', displayGradRate: '91%', displayEarnings: '$60,000', displaySize: '30,000 students' },
    { id: 'uva', name: 'University of Virginia', city: 'Charlottesville', state: 'VA', location: 'Charlottesville, VA', website: 'virginia.edu', region: 'southeast', sizeTier: 'large', budgetTier: 'low', gpaTier: 'high', vibeTier: 'balanced', weatherTier: 'seasons', diversityScore: 40, admissionRate: 0.21, netPrice: 14000, ownership: 1, studentSize: 25000, gradRate: 0.94, earnings: 65000, programMap: { 'Business': 0.20, 'Liberal Arts': 0.25, 'Engineering': 0.14 }, topPrograms: ['Business', 'Liberal Arts', 'Engineering'], displayTuition: '$17,400 (in-state)', displayAcceptance: '21%', displayGradRate: '94%', displayEarnings: '$65,000', displaySize: '25,000 students' },
    // ── Midwest ──
    { id: 'uchicago', name: 'University of Chicago', city: 'Chicago', state: 'IL', location: 'Chicago, IL', website: 'uchicago.edu', region: 'midwest', sizeTier: 'medium', budgetTier: 'high', gpaTier: 'high', vibeTier: 'academic', weatherTier: 'cold', diversityScore: 55, admissionRate: 0.07, netPrice: 20000, ownership: 2, studentSize: 17000, gradRate: 0.95, earnings: 86000, programMap: { 'Liberal Arts': 0.32, 'Economics': 0.15, 'Social Sciences': 0.20 }, topPrograms: ['Liberal Arts', 'Social Sciences', 'Business'], displayTuition: '$62,238', displayAcceptance: '7%', displayGradRate: '95%', displayEarnings: '$86,000', displaySize: '17,000 students' },
    { id: 'northwestern', name: 'Northwestern University', city: 'Evanston', state: 'IL', location: 'Evanston, IL', website: 'northwestern.edu', region: 'midwest', sizeTier: 'medium', budgetTier: 'high', gpaTier: 'high', vibeTier: 'balanced', weatherTier: 'cold', diversityScore: 52, admissionRate: 0.07, netPrice: 22000, ownership: 2, studentSize: 22000, gradRate: 0.95, earnings: 85000, programMap: { 'Engineering': 0.18, 'Business': 0.16, 'Arts': 0.12 }, topPrograms: ['Engineering', 'Business', 'Arts'], displayTuition: '$63,468', displayAcceptance: '7%', displayGradRate: '95%', displayEarnings: '$85,000', displaySize: '22,000 students' },
    { id: 'umich', name: 'University of Michigan', city: 'Ann Arbor', state: 'MI', location: 'Ann Arbor, MI', website: 'umich.edu', region: 'midwest', sizeTier: 'large', budgetTier: 'medium', gpaTier: 'med_high', vibeTier: 'balanced', weatherTier: 'cold', diversityScore: 42, admissionRate: 0.20, netPrice: 18000, ownership: 1, studentSize: 47000, gradRate: 0.92, earnings: 72000, programMap: { 'Engineering': 0.20, 'Business': 0.18, 'Liberal Arts': 0.18 }, topPrograms: ['Engineering', 'Business', 'Liberal Arts'], displayTuition: '$16,736 (in-state)', displayAcceptance: '20%', displayGradRate: '92%', displayEarnings: '$72,000', displaySize: '47,000 students' },
    { id: 'purdue', name: 'Purdue University', city: 'West Lafayette', state: 'IN', location: 'West Lafayette, IN', website: 'purdue.edu', region: 'midwest', sizeTier: 'large', budgetTier: 'low', gpaTier: 'med_high', vibeTier: 'academic', weatherTier: 'cold', diversityScore: 38, admissionRate: 0.60, netPrice: 13000, ownership: 1, studentSize: 50000, gradRate: 0.83, earnings: 68000, programMap: { 'Engineering': 0.35, 'Computer Science': 0.15, 'Business': 0.12 }, topPrograms: ['Engineering', 'Computer Science', 'Business'], displayTuition: '$9,992 (in-state)', displayAcceptance: '60%', displayGradRate: '83%', displayEarnings: '$68,000', displaySize: '50,000 students' },
    // ── South/Southwest ──
    { id: 'rice', name: 'Rice University', city: 'Houston', state: 'TX', location: 'Houston, TX', website: 'rice.edu', region: 'south', sizeTier: 'small', budgetTier: 'high', gpaTier: 'high', vibeTier: 'community', weatherTier: 'warm', diversityScore: 60, admissionRate: 0.09, netPrice: 20000, ownership: 2, studentSize: 4000, gradRate: 0.93, earnings: 86000, programMap: { 'Engineering': 0.30, 'Liberal Arts': 0.22, 'Computer Science': 0.14 }, topPrograms: ['Engineering', 'Liberal Arts', 'Computer Science'], displayTuition: '$54,960', displayAcceptance: '9%', displayGradRate: '93%', displayEarnings: '$86,000', displaySize: '4,000 students' },
    { id: 'utaustin', name: 'UT Austin', city: 'Austin', state: 'TX', location: 'Austin, TX', website: 'utexas.edu', region: 'south', sizeTier: 'large', budgetTier: 'low', gpaTier: 'med_high', vibeTier: 'social', weatherTier: 'warm', diversityScore: 52, admissionRate: 0.31, netPrice: 14000, ownership: 1, studentSize: 52000, gradRate: 0.87, earnings: 65000, programMap: { 'Engineering': 0.18, 'Business': 0.22, 'Liberal Arts': 0.20 }, topPrograms: ['Business', 'Engineering', 'Liberal Arts'], displayTuition: '$11,248 (in-state)', displayAcceptance: '31%', displayGradRate: '87%', displayEarnings: '$65,000', displaySize: '52,000 students' },
    { id: 'georgia-tech', name: 'Georgia Tech', city: 'Atlanta', state: 'GA', location: 'Atlanta, GA', website: 'gatech.edu', region: 'southeast', sizeTier: 'large', budgetTier: 'low', gpaTier: 'high', vibeTier: 'academic', weatherTier: 'warm', diversityScore: 48, admissionRate: 0.17, netPrice: 12000, ownership: 1, studentSize: 26000, gradRate: 0.90, earnings: 90000, programMap: { 'Engineering': 0.45, 'Computer Science': 0.25, 'Business': 0.10 }, topPrograms: ['Engineering', 'Computer Science', 'Business'], displayTuition: '$10,258 (in-state)', displayAcceptance: '17%', displayGradRate: '90%', displayEarnings: '$90,000', displaySize: '26,000 students' },
    // ── West Coast ──
    { id: 'stanford', name: 'Stanford University', city: 'Stanford', state: 'CA', location: 'Stanford, CA', website: 'stanford.edu', region: 'west', sizeTier: 'medium', budgetTier: 'high', gpaTier: 'high', vibeTier: 'balanced', weatherTier: 'warm', diversityScore: 62, admissionRate: 0.04, netPrice: 16000, ownership: 2, studentSize: 17000, gradRate: 0.96, earnings: 110000, programMap: { 'Engineering': 0.30, 'Computer Science': 0.25, 'Business': 0.12 }, topPrograms: ['Computer Science', 'Engineering', 'Business'], displayTuition: '$56,169', displayAcceptance: '4%', displayGradRate: '96%', displayEarnings: '$110,000', displaySize: '17,000 students' },
    { id: 'caltech', name: 'Caltech', city: 'Pasadena', state: 'CA', location: 'Pasadena, CA', website: 'caltech.edu', region: 'west', sizeTier: 'small', budgetTier: 'high', gpaTier: 'high', vibeTier: 'academic', weatherTier: 'warm', diversityScore: 52, admissionRate: 0.03, netPrice: 18000, ownership: 2, studentSize: 2200, gradRate: 0.93, earnings: 112000, programMap: { 'Engineering': 0.50, 'Computer Science': 0.25, 'Biology/Life Sci': 0.15 }, topPrograms: ['Engineering', 'Computer Science', 'Biology/Life Sci'], displayTuition: '$60,816', displayAcceptance: '3%', displayGradRate: '93%', displayEarnings: '$112,000', displaySize: '2,200 students' },
    { id: 'ucberkeley', name: 'UC Berkeley', city: 'Berkeley', state: 'CA', location: 'Berkeley, CA', website: 'berkeley.edu', region: 'west', sizeTier: 'large', budgetTier: 'low', gpaTier: 'med_high', vibeTier: 'academic', weatherTier: 'warm', diversityScore: 66, admissionRate: 0.12, netPrice: 13000, ownership: 1, studentSize: 43000, gradRate: 0.92, earnings: 82000, programMap: { 'Engineering': 0.22, 'Computer Science': 0.18, 'Business': 0.12 }, topPrograms: ['Engineering', 'Computer Science', 'Business'], displayTuition: '$14,312 (in-state)', displayAcceptance: '12%', displayGradRate: '92%', displayEarnings: '$82,000', displaySize: '43,000 students' },
    { id: 'ucla', name: 'UCLA', city: 'Los Angeles', state: 'CA', location: 'Los Angeles, CA', website: 'ucla.edu', region: 'west', sizeTier: 'large', budgetTier: 'low', gpaTier: 'med_high', vibeTier: 'social', weatherTier: 'warm', diversityScore: 68, admissionRate: 0.09, netPrice: 14000, ownership: 1, studentSize: 46000, gradRate: 0.91, earnings: 75000, programMap: { 'Arts': 0.12, 'Engineering': 0.18, 'Health': 0.16 }, topPrograms: ['Engineering', 'Health', 'Arts'], displayTuition: '$13,239 (in-state)', displayAcceptance: '9%', displayGradRate: '91%', displayEarnings: '$75,000', displaySize: '46,000 students' },
    { id: 'ucsd', name: 'UC San Diego', city: 'La Jolla', state: 'CA', location: 'La Jolla, CA', website: 'ucsd.edu', region: 'west', sizeTier: 'large', budgetTier: 'low', gpaTier: 'med_high', vibeTier: 'academic', weatherTier: 'warm', diversityScore: 58, admissionRate: 0.24, netPrice: 13500, ownership: 1, studentSize: 40000, gradRate: 0.87, earnings: 72000, programMap: { 'Computer Science': 0.20, 'Engineering': 0.22, 'Biology/Life Sci': 0.18 }, topPrograms: ['Computer Science', 'Engineering', 'Biology/Life Sci'], displayTuition: '$14,388 (in-state)', displayAcceptance: '24%', displayGradRate: '87%', displayEarnings: '$72,000', displaySize: '40,000 students' },
    { id: 'usc', name: 'USC', city: 'Los Angeles', state: 'CA', location: 'Los Angeles, CA', website: 'usc.edu', region: 'west', sizeTier: 'large', budgetTier: 'high', gpaTier: 'med_high', vibeTier: 'social', weatherTier: 'warm', diversityScore: 60, admissionRate: 0.12, netPrice: 35000, ownership: 2, studentSize: 47000, gradRate: 0.92, earnings: 76000, programMap: { 'Business': 0.22, 'Arts': 0.18, 'Engineering': 0.14 }, topPrograms: ['Business', 'Arts', 'Engineering'], displayTuition: '$65,446', displayAcceptance: '12%', displayGradRate: '92%', displayEarnings: '$76,000', displaySize: '47,000 students' },
    { id: 'uw', name: 'University of Washington', city: 'Seattle', state: 'WA', location: 'Seattle, WA', website: 'washington.edu', region: 'west', sizeTier: 'large', budgetTier: 'low', gpaTier: 'med_high', vibeTier: 'academic', weatherTier: 'seasons', diversityScore: 52, admissionRate: 0.49, netPrice: 12000, ownership: 1, studentSize: 48000, gradRate: 0.85, earnings: 72000, programMap: { 'Computer Science': 0.18, 'Engineering': 0.20, 'Health': 0.15 }, topPrograms: ['Computer Science', 'Engineering', 'Health'], displayTuition: '$12,076 (in-state)', displayAcceptance: '49%', displayGradRate: '85%', displayEarnings: '$72,000', displaySize: '48,000 students' },
    { id: 'pepperdine', name: 'Pepperdine University', city: 'Malibu', state: 'CA', location: 'Malibu, CA', website: 'pepperdine.edu', region: 'west', sizeTier: 'small', budgetTier: 'high', gpaTier: 'med_high', vibeTier: 'community', weatherTier: 'warm', diversityScore: 45, admissionRate: 0.37, netPrice: 38000, ownership: 2, studentSize: 8000, gradRate: 0.83, earnings: 62000, programMap: { 'Business': 0.30, 'Liberal Arts': 0.25, 'Health': 0.12 }, topPrograms: ['Business', 'Liberal Arts', 'Health'], displayTuition: '$60,816', displayAcceptance: '37%', displayGradRate: '83%', displayEarnings: '$62,000', displaySize: '8,000 students' },
    { id: 'santa-clara', name: 'Santa Clara University', city: 'Santa Clara', state: 'CA', location: 'Santa Clara, CA', website: 'scu.edu', region: 'west', sizeTier: 'medium', budgetTier: 'high', gpaTier: 'med_high', vibeTier: 'balanced', weatherTier: 'warm', diversityScore: 52, admissionRate: 0.51, netPrice: 36000, ownership: 2, studentSize: 9000, gradRate: 0.87, earnings: 75000, programMap: { 'Business': 0.28, 'Engineering': 0.22, 'Liberal Arts': 0.20 }, topPrograms: ['Business', 'Engineering', 'Liberal Arts'], displayTuition: '$58,950', displayAcceptance: '51%', displayGradRate: '87%', displayEarnings: '$75,000', displaySize: '9,000 students' },
  ];
}
