/* ════════════════════════════════════════════════════════════════
   CollegeMatch — script.js
   Survey flow, matching algorithm, and results rendering
   ════════════════════════════════════════════════════════════════ */

/* ─── Survey Questions ─────────────────────────────────────────── */
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
      { value: 'northeast', label: 'Northeast',   sub: 'ME, NH, VT, MA, RI, CT, NY, NJ, PA' },
      { value: 'southeast', label: 'Southeast',   sub: 'MD, VA, NC, SC, GA, FL, TN, AL, MS' },
      { value: 'midwest',   label: 'Midwest',     sub: 'OH, IN, IL, MI, WI, MN, IA, MO, KS' },
      { value: 'south',     label: 'South / SW',  sub: 'TX, OK, AR, LA, AZ, NM, CO' },
      { value: 'west',      label: 'West Coast',  sub: 'CA, OR, WA, NV, UT, ID, MT, WY' },
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
      { value: 'low',    label: 'Very important',   sub: 'Looking for in-state publics, scholarships, or need-blind schools' },
      { value: 'medium', label: 'Somewhat important', sub: 'Cost matters but I have some flexibility' },
      { value: 'high',   label: 'Not a major factor', sub: 'I\'m open to any school regardless of sticker price' },
    ]
  },
  {
    key: 'gpa',
    text: 'What\'s your approximate high school GPA?',
    opts: [
      { value: 'high',     label: '3.8 and above',  sub: 'Highly competitive applicant' },
      { value: 'med_high', label: '3.3 – 3.7',      sub: 'Strong academic record' },
      { value: 'medium',   label: '2.8 – 3.2',      sub: 'Solid record with room to grow' },
      { value: 'low',      label: 'Below 2.8',       sub: 'GPA isn\'t my strongest metric' },
    ]
  },
  {
    key: 'vibe',
    text: 'What kind of campus life are you looking for?',
    opts: [
      { value: 'academic',  label: 'Academically intense',   sub: 'Research, intellectual culture, rigorous coursework' },
      { value: 'balanced',  label: 'Balanced',               sub: 'Strong academics plus a real social life' },
      { value: 'social',    label: 'Vibrant social scene',   sub: 'Greek life, big sports culture, active parties' },
      { value: 'community', label: 'Tight-knit community',   sub: 'Everyone knows each other, collaborative not competitive' },
    ]
  }
];

/* ─── College Database (80+ schools) ───────────────────────────── */
const COLLEGES = [
  // ── Northeast ──
  { name: 'MIT', location: 'Cambridge, MA', region: 'northeast', size: 'medium', majors: ['stem'], budget: 'high', gpa: 'high', vibe: 'academic', tuition: '$57,986', acceptance: '4%', tags: ['Research powerhouse', 'STEM-only feel', 'Urban', 'Need-blind'] },
  { name: 'Harvard University', location: 'Cambridge, MA', region: 'northeast', size: 'medium', majors: ['liberal_arts', 'stem', 'health'], budget: 'high', gpa: 'high', vibe: 'academic', tuition: '$57,261', acceptance: '3%', tags: ['Ivy League', 'Need-blind', 'Historic campus'] },
  { name: 'Yale University', location: 'New Haven, CT', region: 'northeast', size: 'medium', majors: ['liberal_arts', 'arts', 'health'], budget: 'high', gpa: 'high', vibe: 'balanced', tuition: '$62,250', acceptance: '5%', tags: ['Ivy League', 'Strong arts scene', 'Residential colleges'] },
  { name: 'Princeton University', location: 'Princeton, NJ', region: 'northeast', size: 'medium', majors: ['liberal_arts', 'stem'], budget: 'high', gpa: 'high', vibe: 'academic', tuition: '$57,690', acceptance: '4%', tags: ['Ivy League', 'No grad student TAs', 'No loans'] },
  { name: 'Columbia University', location: 'New York, NY', region: 'northeast', size: 'medium', majors: ['liberal_arts', 'stem', 'business'], budget: 'high', gpa: 'high', vibe: 'balanced', tuition: '$65,524', acceptance: '4%', tags: ['Ivy League', 'NYC immersion', 'Core curriculum'] },
  { name: 'Cornell University', location: 'Ithaca, NY', region: 'northeast', size: 'large', majors: ['stem', 'business', 'liberal_arts', 'arts'], budget: 'high', gpa: 'high', vibe: 'balanced', tuition: '$61,015', acceptance: '9%', tags: ['Ivy League', 'Gorges & waterfalls', 'Hotel school'] },
  { name: 'Dartmouth College', location: 'Hanover, NH', region: 'northeast', size: 'small', majors: ['liberal_arts', 'business'], budget: 'high', gpa: 'high', vibe: 'community', tuition: '$61,947', acceptance: '6%', tags: ['Ivy League', 'Rural campus', 'D-Plan (4 terms)'] },
  { name: 'Brown University', location: 'Providence, RI', region: 'northeast', size: 'medium', majors: ['liberal_arts', 'stem', 'arts'], budget: 'high', gpa: 'high', vibe: 'balanced', tuition: '$65,146', acceptance: '5%', tags: ['Ivy League', 'Open curriculum', 'Collaborative culture'] },
  { name: 'University of Pennsylvania', location: 'Philadelphia, PA', region: 'northeast', size: 'medium', majors: ['business', 'health', 'stem'], budget: 'high', gpa: 'high', vibe: 'academic', tuition: '$63,452', acceptance: '7%', tags: ['Ivy League', 'Wharton', 'Pre-professional focus'] },
  { name: 'Williams College', location: 'Williamstown, MA', region: 'northeast', size: 'small', majors: ['liberal_arts'], budget: 'high', gpa: 'high', vibe: 'community', tuition: '$60,680', acceptance: '9%', tags: ['#1 liberal arts', 'Rural & stunning', 'No loans'] },
  { name: 'Amherst College', location: 'Amherst, MA', region: 'northeast', size: 'small', majors: ['liberal_arts'], budget: 'high', gpa: 'high', vibe: 'academic', tuition: '$63,012', acceptance: '11%', tags: ['Open curriculum', 'Five Colleges', 'Need-blind'] },
  { name: 'Swarthmore College', location: 'Swarthmore, PA', region: 'northeast', size: 'small', majors: ['liberal_arts', 'stem'], budget: 'high', gpa: 'high', vibe: 'academic', tuition: '$60,712', acceptance: '9%', tags: ['Honor code', 'Quaker values', 'Near Philadelphia'] },
  { name: 'Wellesley College', location: 'Wellesley, MA', region: 'northeast', size: 'small', majors: ['liberal_arts', 'stem'], budget: 'high', gpa: 'high', vibe: 'community', tuition: '$60,576', acceptance: '20%', tags: ["Women's college", 'Near Boston', 'Strong alumnae network'] },
  { name: 'Vassar College', location: 'Poughkeepsie, NY', region: 'northeast', size: 'small', majors: ['liberal_arts', 'arts'], budget: 'medium', gpa: 'high', vibe: 'community', tuition: '$62,990', acceptance: '22%', tags: ['Coed liberal arts', 'Progressive culture', 'Arts-forward'] },
  { name: 'Boston University', location: 'Boston, MA', region: 'northeast', size: 'large', majors: ['health', 'business', 'arts', 'stem'], budget: 'medium', gpa: 'med_high', vibe: 'balanced', tuition: '$60,000', acceptance: '19%', tags: ['Urban campus', 'Pre-med pipeline', 'Charles River'] },
  { name: 'Northeastern University', location: 'Boston, MA', region: 'northeast', size: 'medium', majors: ['stem', 'business'], budget: 'medium', gpa: 'med_high', vibe: 'balanced', tuition: '$59,000', acceptance: '20%', tags: ['Co-op program', 'Career-focused', 'Urban'] },
  { name: 'Tufts University', location: 'Medford, MA', region: 'northeast', size: 'medium', majors: ['liberal_arts', 'stem', 'health'], budget: 'high', gpa: 'high', vibe: 'balanced', tuition: '$65,222', acceptance: '11%', tags: ['NESCAC adjacent', 'Civic engagement', 'Near Boston'] },
  { name: 'NYU', location: 'New York, NY', region: 'northeast', size: 'large', majors: ['arts', 'business', 'liberal_arts', 'health'], budget: 'medium', gpa: 'med_high', vibe: 'social', tuition: '$58,168', acceptance: '13%', tags: ['No traditional campus', 'NYC immersion', 'Tisch arts'] },
  { name: 'Georgetown University', location: 'Washington, DC', region: 'northeast', size: 'medium', majors: ['liberal_arts', 'business', 'health'], budget: 'high', gpa: 'high', vibe: 'balanced', tuition: '$61,872', acceptance: '13%', tags: ['DC access', 'Policy & law focus', 'Jesuit values'] },
  { name: 'George Washington University', location: 'Washington, DC', region: 'northeast', size: 'medium', majors: ['liberal_arts', 'business', 'health'], budget: 'medium', gpa: 'med_high', vibe: 'social', tuition: '$60,865', acceptance: '41%', tags: ['DC access', 'Political scene', 'Foggy Bottom'] },
  { name: 'American University', location: 'Washington, DC', region: 'northeast', size: 'medium', majors: ['liberal_arts', 'business'], budget: 'medium', gpa: 'med_high', vibe: 'balanced', tuition: '$53,072', acceptance: '35%', tags: ['Policy & advocacy', 'DC internships', 'Diverse campus'] },
  { name: 'Rochester Institute of Technology', location: 'Rochester, NY', region: 'northeast', size: 'medium', majors: ['stem', 'arts', 'business'], budget: 'medium', gpa: 'med_high', vibe: 'academic', tuition: '$55,878', acceptance: '63%', tags: ['Co-op program', 'Tech + design', 'Deaf-friendly'] },
  { name: 'RISD', location: 'Providence, RI', region: 'northeast', size: 'small', majors: ['arts'], budget: 'medium', gpa: 'med_high', vibe: 'academic', tuition: '$55,166', acceptance: '22%', tags: ['Top art school', 'Brown cross-reg', 'Studio-intensive'] },
  { name: 'Berklee College of Music', location: 'Boston, MA', region: 'northeast', size: 'small', majors: ['arts'], budget: 'medium', gpa: 'medium', vibe: 'community', tuition: '$47,440', acceptance: '51%', tags: ['Music-only', 'Industry connections', 'Performance focus'] },
  { name: 'University of Vermont', location: 'Burlington, VT', region: 'northeast', size: 'medium', majors: ['health', 'liberal_arts', 'stem'], budget: 'low', gpa: 'medium', vibe: 'balanced', tuition: '$19,392 (in-state)', acceptance: '68%', tags: ['Outdoorsy culture', 'Skiing nearby', 'Farm to table'] },
  { name: 'University of Connecticut', location: 'Storrs, CT', region: 'northeast', size: 'large', majors: ['business', 'health', 'stem'], budget: 'low', gpa: 'medium', vibe: 'social', tuition: '$16,380 (in-state)', acceptance: '56%', tags: ['Big basketball culture', 'State flagship', 'Affordable'] },
  { name: 'Penn State University', location: 'State College, PA', region: 'northeast', size: 'large', majors: ['business', 'stem', 'liberal_arts'], budget: 'low', gpa: 'medium', vibe: 'social', tuition: '$18,450 (in-state)', acceptance: '54%', tags: ['Nittany Lions', 'Huge alumni network', 'College town'] },
  { name: 'Rutgers University', location: 'New Brunswick, NJ', region: 'northeast', size: 'large', majors: ['stem', 'business', 'liberal_arts', 'health'], budget: 'low', gpa: 'medium', vibe: 'balanced', tuition: '$14,638 (in-state)', acceptance: '67%', tags: ['NJ flagship', 'Research university', 'Diverse student body'] },

  // ── Southeast ──
  { name: 'Duke University', location: 'Durham, NC', region: 'southeast', size: 'medium', majors: ['health', 'stem', 'liberal_arts', 'business'], budget: 'high', gpa: 'high', vibe: 'balanced', tuition: '$60,244', acceptance: '6%', tags: ['Basketball culture', 'Gothic architecture', 'Duke Forest'] },
  { name: 'Vanderbilt University', location: 'Nashville, TN', region: 'southeast', size: 'medium', majors: ['health', 'liberal_arts', 'business', 'stem'], budget: 'high', gpa: 'high', vibe: 'social', tuition: '$60,348', acceptance: '7%', tags: ['Nashville access', 'Greek life heavy', 'Strong med school'] },
  { name: 'Emory University', location: 'Atlanta, GA', region: 'southeast', size: 'medium', majors: ['health', 'business', 'liberal_arts'], budget: 'high', gpa: 'high', vibe: 'academic', tuition: '$57,592', acceptance: '11%', tags: ['CDC/WHO proximity', 'Pre-med powerhouse', 'Atlanta access'] },
  { name: 'Wake Forest University', location: 'Winston-Salem, NC', region: 'southeast', size: 'medium', majors: ['business', 'liberal_arts', 'health'], budget: 'high', gpa: 'high', vibe: 'balanced', tuition: '$61,440', acceptance: '20%', tags: ['Pro humanitate', 'Strong Greek life', 'Business school'] },
  { name: 'University of Miami', location: 'Coral Gables, FL', region: 'southeast', size: 'medium', majors: ['business', 'health', 'arts', 'stem'], budget: 'high', gpa: 'med_high', vibe: 'social', tuition: '$58,664', acceptance: '27%', tags: ['South Florida lifestyle', 'Music school', 'Near Miami'] },
  { name: 'UNC Chapel Hill', location: 'Chapel Hill, NC', region: 'southeast', size: 'large', majors: ['health', 'business', 'liberal_arts', 'stem'], budget: 'low', gpa: 'med_high', vibe: 'balanced', tuition: '$7,008 (in-state)', acceptance: '19%', tags: ['ACC sports', 'Research Triangle', 'Public ivy'] },
  { name: 'University of Virginia', location: 'Charlottesville, VA', region: 'southeast', size: 'large', majors: ['business', 'liberal_arts', 'health', 'stem'], budget: 'low', gpa: 'high', vibe: 'balanced', tuition: '$17,400 (in-state)', acceptance: '21%', tags: ['Grounds not campus', 'Honor tradition', 'Public ivy'] },
  { name: 'University of Florida', location: 'Gainesville, FL', region: 'southeast', size: 'large', majors: ['stem', 'business', 'health'], budget: 'low', gpa: 'med_high', vibe: 'social', tuition: '$6,381 (in-state)', acceptance: '31%', tags: ['Gators', 'Top public', 'Very affordable'] },
  { name: 'University of Georgia', location: 'Athens, GA', region: 'southeast', size: 'large', majors: ['business', 'liberal_arts', 'health'], budget: 'low', gpa: 'medium', vibe: 'social', tuition: '$9,790 (in-state)', acceptance: '45%', tags: ['SEC sports', 'Athens music scene', 'College town'] },
  { name: 'Georgia Tech', location: 'Atlanta, GA', region: 'southeast', size: 'large', majors: ['stem', 'business'], budget: 'low', gpa: 'high', vibe: 'academic', tuition: '$10,258 (in-state)', acceptance: '17%', tags: ['STEM powerhouse', 'Co-op program', 'Atlanta access'] },
  { name: 'Florida State University', location: 'Tallahassee, FL', region: 'southeast', size: 'large', majors: ['business', 'liberal_arts', 'arts'], budget: 'low', gpa: 'medium', vibe: 'social', tuition: '$5,656 (in-state)', acceptance: '36%', tags: ['ACC sports', 'Affordable', 'Film program'] },
  { name: 'Howard University', location: 'Washington, DC', region: 'southeast', size: 'medium', majors: ['health', 'business', 'liberal_arts', 'stem'], budget: 'medium', gpa: 'medium', vibe: 'community', tuition: '$29,564', acceptance: '37%', tags: ['Prestigious HBCU', 'DC access', 'Strong alumni network'] },
  { name: 'Spelman College', location: 'Atlanta, GA', region: 'southeast', size: 'small', majors: ['health', 'liberal_arts', 'stem'], budget: 'medium', gpa: 'med_high', vibe: 'community', tuition: '$28,722', acceptance: '34%', tags: ["HBCU women's college", 'AUC consortium', 'High grad school rate'] },
  { name: 'Morehouse College', location: 'Atlanta, GA', region: 'southeast', size: 'small', majors: ['liberal_arts', 'business', 'stem'], budget: 'medium', gpa: 'medium', vibe: 'community', tuition: '$30,000', acceptance: '58%', tags: ["HBCU men's college", 'Leadership focus', 'MLK legacy'] },
  { name: 'Tulane University', location: 'New Orleans, LA', region: 'southeast', size: 'medium', majors: ['health', 'liberal_arts', 'business'], budget: 'high', gpa: 'med_high', vibe: 'social', tuition: '$60,264', acceptance: '13%', tags: ['New Orleans culture', 'Service learning', 'Strong Greek life'] },

  // ── Midwest ──
  { name: 'University of Chicago', location: 'Chicago, IL', region: 'midwest', size: 'medium', majors: ['liberal_arts', 'stem', 'business'], budget: 'high', gpa: 'high', vibe: 'academic', tuition: '$62,238', acceptance: '7%', tags: ['Core curriculum', 'Intellectual rigor', 'Hyde Park'] },
  { name: 'Northwestern University', location: 'Evanston, IL', region: 'midwest', size: 'medium', majors: ['liberal_arts', 'stem', 'business', 'arts'], budget: 'high', gpa: 'high', vibe: 'balanced', tuition: '$63,468', acceptance: '7%', tags: ['Medill journalism', 'Near Chicago', 'Lake Michigan'] },
  { name: 'University of Notre Dame', location: 'Notre Dame, IN', region: 'midwest', size: 'medium', majors: ['business', 'liberal_arts', 'stem', 'health'], budget: 'high', gpa: 'high', vibe: 'community', tuition: '$59,794', acceptance: '13%', tags: ['Catholic tradition', 'Fighting Irish football', 'Loyal alumni'] },
  { name: 'University of Michigan', location: 'Ann Arbor, MI', region: 'midwest', size: 'large', majors: ['stem', 'business', 'health', 'liberal_arts'], budget: 'medium', gpa: 'med_high', vibe: 'balanced', tuition: '$16,736 (in-state)', acceptance: '20%', tags: ['Big Ten', 'Ross School of Business', 'Ann Arbor culture'] },
  { name: 'Washington University in St. Louis', location: 'St. Louis, MO', region: 'midwest', size: 'medium', majors: ['health', 'stem', 'liberal_arts', 'arts'], budget: 'high', gpa: 'high', vibe: 'balanced', tuition: '$60,590', acceptance: '13%', tags: ['WashU', 'Near Forest Park', 'Architecture school'] },
  { name: 'Case Western Reserve', location: 'Cleveland, OH', region: 'midwest', size: 'medium', majors: ['stem', 'health', 'business'], budget: 'medium', gpa: 'high', vibe: 'academic', tuition: '$56,856', acceptance: '30%', tags: ['Strong pre-med', 'Cleveland Clinic partnership', 'Research'] },
  { name: 'University of Wisconsin–Madison', location: 'Madison, WI', region: 'midwest', size: 'large', majors: ['liberal_arts', 'stem', 'business'], budget: 'low', gpa: 'med_high', vibe: 'social', tuition: '$10,728 (in-state)', acceptance: '51%', tags: ['Party reputation', 'Research university', 'State Street'] },
  { name: 'Ohio State University', location: 'Columbus, OH', region: 'midwest', size: 'large', majors: ['business', 'health', 'stem', 'liberal_arts'], budget: 'low', gpa: 'medium', vibe: 'social', tuition: '$11,518 (in-state)', acceptance: '54%', tags: ['Big Ten sports', 'Buckeye nation', 'Affordable'] },
  { name: 'Purdue University', location: 'West Lafayette, IN', region: 'midwest', size: 'large', majors: ['stem', 'business'], budget: 'low', gpa: 'med_high', vibe: 'academic', tuition: '$9,992 (in-state)', acceptance: '60%', tags: ['Engineering powerhouse', 'Affordable STEM', 'Big Ten'] },
  { name: 'University of Illinois Urbana-Champaign', location: 'Champaign, IL', region: 'midwest', size: 'large', majors: ['stem', 'business', 'liberal_arts'], budget: 'low', gpa: 'med_high', vibe: 'balanced', tuition: '$15,054 (in-state)', acceptance: '45%', tags: ['Top CS program', 'Big Ten', 'College town'] },
  { name: 'Grinnell College', location: 'Grinnell, IA', region: 'midwest', size: 'small', majors: ['liberal_arts'], budget: 'medium', gpa: 'high', vibe: 'community', tuition: '$58,718', acceptance: '16%', tags: ['Need-blind', 'Open curriculum', 'Quirky & progressive'] },
  { name: 'Carleton College', location: 'Northfield, MN', region: 'midwest', size: 'small', majors: ['liberal_arts', 'stem'], budget: 'medium', gpa: 'high', vibe: 'community', tuition: '$62,112', acceptance: '18%', tags: ['Strong STEM for liberal arts', 'Arboretum', 'Friendly culture'] },
  { name: 'Macalester College', location: 'St. Paul, MN', region: 'midwest', size: 'small', majors: ['liberal_arts'], budget: 'medium', gpa: 'high', vibe: 'community', tuition: '$62,604', acceptance: '31%', tags: ['International focus', 'Urban setting', 'Social justice'] },

  // ── South & Southwest ──
  { name: 'Rice University', location: 'Houston, TX', region: 'south', size: 'small', majors: ['stem', 'liberal_arts', 'arts', 'business'], budget: 'high', gpa: 'high', vibe: 'community', tuition: '$54,960', acceptance: '9%', tags: ['Residential college system', 'Need-blind', 'No-loan'] },
  { name: 'UT Austin', location: 'Austin, TX', region: 'south', size: 'large', majors: ['stem', 'business', 'liberal_arts', 'arts'], budget: 'low', gpa: 'med_high', vibe: 'social', tuition: '$11,248 (in-state)', acceptance: '31%', tags: ['Austin tech scene', 'Longhorns', 'Top 40 honors'] },
  { name: 'Texas A&M University', location: 'College Station, TX', region: 'south', size: 'large', majors: ['stem', 'business', 'health'], budget: 'low', gpa: 'medium', vibe: 'community', tuition: '$8,875 (in-state)', acceptance: '63%', tags: ['Aggie traditions', 'Strong engineering', 'Affordable'] },
  { name: 'Southern Methodist University', location: 'Dallas, TX', region: 'south', size: 'medium', majors: ['business', 'liberal_arts', 'arts'], budget: 'high', gpa: 'med_high', vibe: 'social', tuition: '$58,500', acceptance: '50%', tags: ['Dallas access', 'Meadows arts', 'Business focus'] },
  { name: 'Baylor University', location: 'Waco, TX', region: 'south', size: 'large', majors: ['health', 'business', 'liberal_arts'], budget: 'medium', gpa: 'medium', vibe: 'community', tuition: '$52,942', acceptance: '61%', tags: ['Christian tradition', 'Bears sports', 'Health programs'] },
  { name: 'University of Arizona', location: 'Tucson, AZ', region: 'south', size: 'large', majors: ['stem', 'business', 'health', 'liberal_arts'], budget: 'low', gpa: 'medium', vibe: 'social', tuition: '$12,467 (in-state)', acceptance: '85%', tags: ['Desert campus', 'Astronomy program', 'Wildcat sports'] },
  { name: 'Arizona State University', location: 'Tempe, AZ', region: 'south', size: 'large', majors: ['stem', 'business', 'liberal_arts', 'arts'], budget: 'low', gpa: 'low', vibe: 'social', tuition: '$11,800 (in-state)', acceptance: '88%', tags: ['Innovation focus', 'Sun Devils', 'Very large campus'] },
  { name: 'University of Colorado Boulder', location: 'Boulder, CO', region: 'south', size: 'large', majors: ['stem', 'business', 'liberal_arts'], budget: 'low', gpa: 'medium', vibe: 'balanced', tuition: '$11,374 (in-state)', acceptance: '84%', tags: ['Outdoor lifestyle', 'Buffs athletics', 'Boulder culture'] },
  { name: 'Colorado College', location: 'Colorado Springs, CO', region: 'south', size: 'small', majors: ['liberal_arts'], budget: 'medium', gpa: 'med_high', vibe: 'community', tuition: '$62,844', acceptance: '18%', tags: ['Block plan (one class at a time)', 'Outdoorsy', 'Unique academic model'] },

  // ── West Coast ──
  { name: 'Stanford University', location: 'Stanford, CA', region: 'west', size: 'medium', majors: ['stem', 'business', 'liberal_arts'], budget: 'high', gpa: 'high', vibe: 'balanced', tuition: '$56,169', acceptance: '4%', tags: ['Silicon Valley hub', 'Entrepreneurship culture', 'Need-blind'] },
  { name: 'Caltech', location: 'Pasadena, CA', region: 'west', size: 'small', majors: ['stem'], budget: 'high', gpa: 'high', vibe: 'academic', tuition: '$60,816', acceptance: '3%', tags: ['STEM only', 'Small cohort', 'Research-intensive'] },
  { name: 'Harvey Mudd College', location: 'Claremont, CA', region: 'west', size: 'small', majors: ['stem'], budget: 'high', gpa: 'high', vibe: 'community', tuition: '$62,648', acceptance: '13%', tags: ['STEM + humanities', 'Collaborative culture', '5C Consortium'] },
  { name: 'Pomona College', location: 'Claremont, CA', region: 'west', size: 'small', majors: ['liberal_arts'], budget: 'high', gpa: 'high', vibe: 'community', tuition: '$59,880', acceptance: '9%', tags: ['Top liberal arts west', '5C Consortium', 'Need-blind'] },
  { name: 'Claremont McKenna College', location: 'Claremont, CA', region: 'west', size: 'small', majors: ['business', 'liberal_arts'], budget: 'high', gpa: 'high', vibe: 'balanced', tuition: '$60,375', acceptance: '10%', tags: ['Policy & government', '5C Consortium', 'Leadership focus'] },
  { name: 'UC Berkeley', location: 'Berkeley, CA', region: 'west', size: 'large', majors: ['stem', 'business', 'liberal_arts'], budget: 'low', gpa: 'med_high', vibe: 'academic', tuition: '$14,312 (in-state)', acceptance: '12%', tags: ['Public ivy', 'Activist culture', '#1 public university'] },
  { name: 'UCLA', location: 'Los Angeles, CA', region: 'west', size: 'large', majors: ['stem', 'arts', 'business', 'health'], budget: 'low', gpa: 'med_high', vibe: 'social', tuition: '$13,239 (in-state)', acceptance: '9%', tags: ['LA access', 'Film industry', 'Bruins athletics'] },
  { name: 'UC San Diego', location: 'La Jolla, CA', region: 'west', size: 'large', majors: ['stem', 'health', 'liberal_arts'], budget: 'low', gpa: 'med_high', vibe: 'academic', tuition: '$14,388 (in-state)', acceptance: '24%', tags: ['Oceanfront campus', 'Research powerhouse', 'STEM-heavy'] },
  { name: 'USC', location: 'Los Angeles, CA', region: 'west', size: 'large', majors: ['business', 'arts', 'stem', 'liberal_arts'], budget: 'high', gpa: 'med_high', vibe: 'social', tuition: '$65,446', acceptance: '12%', tags: ['Trojan network', 'Film school', 'LA connections'] },
  { name: 'UC Santa Barbara', location: 'Santa Barbara, CA', region: 'west', size: 'large', majors: ['stem', 'liberal_arts', 'business'], budget: 'low', gpa: 'medium', vibe: 'social', tuition: '$14,313 (in-state)', acceptance: '37%', tags: ['Beach campus', 'Party reputation', 'Strong research'] },
  { name: 'University of Washington', location: 'Seattle, WA', region: 'west', size: 'large', majors: ['stem', 'health', 'business'], budget: 'low', gpa: 'med_high', vibe: 'academic', tuition: '$12,076 (in-state)', acceptance: '49%', tags: ['Seattle tech scene', 'Amazon/Microsoft proximity', 'Huskies'] },
  { name: 'Oregon State University', location: 'Corvallis, OR', region: 'west', size: 'large', majors: ['stem', 'health', 'business'], budget: 'low', gpa: 'medium', vibe: 'balanced', tuition: '$12,960 (in-state)', acceptance: '83%', tags: ['Outdoorsy', 'Engineering programs', 'Affordable'] },
  { name: 'University of Oregon', location: 'Eugene, OR', region: 'west', size: 'large', majors: ['business', 'arts', 'liberal_arts'], budget: 'low', gpa: 'medium', vibe: 'balanced', tuition: '$12,720 (in-state)', acceptance: '83%', tags: ['Nike founder alma mater', 'Pac-12', 'Eugene outdoors'] },
  { name: 'Reed College', location: 'Portland, OR', region: 'west', size: 'small', majors: ['liberal_arts'], budget: 'medium', gpa: 'high', vibe: 'academic', tuition: '$61,830', acceptance: '31%', tags: ['Thesis required', 'Nonconformist culture', 'Intellectual intensity'] },
  { name: 'Gonzaga University', location: 'Spokane, WA', region: 'west', size: 'medium', majors: ['business', 'liberal_arts', 'health'], budget: 'medium', gpa: 'medium', vibe: 'community', tuition: '$49,900', acceptance: '71%', tags: ['Basketball culture', 'Jesuit values', 'Pacific Northwest'] },
  { name: 'Pepperdine University', location: 'Malibu, CA', region: 'west', size: 'small', majors: ['business', 'liberal_arts', 'health'], budget: 'high', gpa: 'med_high', vibe: 'community', tuition: '$60,816', acceptance: '37%', tags: ['Oceanfront campus', 'Christian values', 'Strong business school'] },
  { name: 'Santa Clara University', location: 'Santa Clara, CA', region: 'west', size: 'medium', majors: ['business', 'stem', 'liberal_arts'], budget: 'high', gpa: 'med_high', vibe: 'balanced', tuition: '$58,950', acceptance: '51%', tags: ['Silicon Valley location', 'Jesuit', 'Business & tech'] },
];

/* ─── State ──────────────────────────────────────────────────────── */
let currentQ = 0;
const answers = {};

/* ─── Utility: show a screen ──────────────────────────────────────── */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ─── Survey ─────────────────────────────────────────────────────── */
function startSurvey() {
  currentQ = 0;
  Object.keys(answers).forEach(k => delete answers[k]);
  renderQuestion();
  showScreen('survey');
}

function renderQuestion() {
  const q = QUESTIONS[currentQ];
  const pct = (currentQ / QUESTIONS.length) * 100;

  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('step-label').textContent =
    'Question ' + (currentQ + 1) + ' of ' + QUESTIONS.length;
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

  const btnNext = document.getElementById('btn-next');
  const nextLabel = document.getElementById('next-label');
  nextLabel.textContent = currentQ === QUESTIONS.length - 1 ? 'See my matches' : 'Continue';
  btnNext.disabled = !answers[q.key];

  const btnBack = document.getElementById('btn-back');
  btnBack.style.visibility = currentQ === 0 ? 'hidden' : 'visible';
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
    showResults();
  }
}

function goBack() {
  if (currentQ > 0) {
    currentQ--;
    renderQuestion();
  }
}

/* ─── Matching Algorithm ─────────────────────────────────────────── */
const WEIGHTS = {
  major:  35,
  region: 20,
  size:   15,
  budget: 15,
  gpa:    10,
  vibe:   5,
};

function scoreCollege(col) {
  let total = 0;

  // Major — hard filter first, then score
  if (col.majors.includes(answers.major)) total += WEIGHTS.major;

  // Region — full points if match or no preference
  if (answers.region === 'any' || col.region === answers.region) total += WEIGHTS.region;

  // Size
  if (col.size === answers.size) total += WEIGHTS.size;

  // Budget (cost sensitivity)
  const budgetOk = {
    low:    ['low'],
    medium: ['low', 'medium'],
    high:   ['low', 'medium', 'high'],
  };
  if (budgetOk[answers.budget]?.includes(col.budget)) total += WEIGHTS.budget;

  // GPA — permissive downward (school accepts gpa or below)
  const gpaRank = { high: 3, med_high: 2, medium: 1, low: 0 };
  if (gpaRank[col.gpa] <= gpaRank[answers.gpa]) total += WEIGHTS.gpa;

  // Vibe
  if (col.vibe === answers.vibe) total += WEIGHTS.vibe;

  return total;
}

function buildWhyText(col) {
  const factors = [];
  const majorLabels = { stem: 'STEM', business: 'business', liberal_arts: 'liberal arts', arts: 'arts & design', health: 'health sciences' };
  const vibeLabels  = { academic: 'academically rigorous culture', balanced: 'balanced campus life', social: 'active social scene', community: 'tight-knit community' };
  const sizeLabels  = { small: 'small campus size', medium: 'medium-sized campus', large: 'large campus' };

  if (col.majors.includes(answers.major)) factors.push(majorLabels[answers.major] || 'your major');
  if (col.size === answers.size) factors.push(sizeLabels[col.size]);
  if (col.vibe === answers.vibe) factors.push(vibeLabels[col.vibe]);

  const budgetOk = { low: ['low'], medium: ['low','medium'], high: ['low','medium','high'] };
  if (budgetOk[answers.budget]?.includes(col.budget)) factors.push('your budget range');

  if (!factors.length) return 'Aligns with several of your preferences.';
  const listed = factors.length === 1 ? factors[0]
    : factors.slice(0, -1).join(', ') + ', and ' + factors[factors.length - 1];
  return `Matches your interest in ${listed}.`;
}

function buildFactorChips(col) {
  const chips = [];
  const majorLabels = { stem: 'STEM', business: 'Business', liberal_arts: 'Liberal Arts', arts: 'Arts & Design', health: 'Health' };
  const budgetOk = { low: ['low'], medium: ['low','medium'], high: ['low','medium','high'] };
  const gpaRank  = { high: 3, med_high: 2, medium: 1, low: 0 };

  if (col.majors.includes(answers.major))                          chips.push({ label: majorLabels[answers.major], cls: 'factor-major' });
  if (answers.region === 'any' || col.region === answers.region)   chips.push({ label: 'Location ✓', cls: 'factor-region' });
  if (col.size === answers.size)                                    chips.push({ label: 'Size ✓', cls: 'factor-size' });
  if (budgetOk[answers.budget]?.includes(col.budget))             chips.push({ label: 'Budget ✓', cls: 'factor-budget' });
  if (gpaRank[col.gpa] <= gpaRank[answers.gpa])                   chips.push({ label: 'GPA fit ✓', cls: 'factor-gpa' });
  if (col.vibe === answers.vibe)                                    chips.push({ label: 'Vibe ✓', cls: 'factor-vibe' });

  return chips;
}

/* ─── Results Rendering ──────────────────────────────────────────── */
function showResults() {
  const scored = COLLEGES
    .map(col => ({ ...col, score: scoreCollege(col) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  // Update title
  const majorLabel = {
    stem: 'STEM', business: 'Business', liberal_arts: 'Liberal Arts',
    arts: 'Arts & Design', health: 'Health Sciences'
  };
  document.getElementById('results-title').textContent =
    'Your top matches for ' + (majorLabel[answers.major] || 'your goals');

  const grid = document.getElementById('results-grid');
  grid.innerHTML = '';

  const rankLabels = ['Best match', '2nd match', '3rd match', '4th match', '5th match'];

  scored.forEach((col, idx) => {
    const pct = Math.round((col.score / 100) * 100);
    const matchClass = pct >= 70 ? 'match-high' : pct >= 45 ? 'match-med' : 'match-low';
    const chips = buildFactorChips(col);
    const why   = buildWhyText(col);

    const card = document.createElement('div');
    card.className = 'college-card';
    card.innerHTML = `
      <div class="card-rank">${rankLabels[idx]}</div>
      <div class="card-header">
        <div>
          <div class="card-name">${col.name}</div>
          <div class="card-location">${col.location}</div>
        </div>
        <div class="match-badge ${matchClass}">
          <span class="pct">${pct}%</span>
          <span class="pct-label">fit</span>
        </div>
      </div>

      <hr class="card-divider" />

      <div class="why-section">
        <div class="why-label">Why this school</div>
        <div class="why-text">${why}</div>
        <div class="why-factors">
          ${chips.map(c => `<span class="factor-chip ${c.cls}">${c.label}</span>`).join('')}
        </div>
      </div>

      <div class="card-stats">
        <div class="stat-item">
          <span class="stat-label">Tuition</span>
          <span class="stat-value">${col.tuition}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Acceptance rate</span>
          <span class="stat-value">${col.acceptance}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Campus size</span>
          <span class="stat-value">${col.size.charAt(0).toUpperCase() + col.size.slice(1)}</span>
        </div>
      </div>

      <div class="card-tags">
        ${col.tags.map(t => `<span class="tag">${t}</span>`).join('')}
      </div>

      <div class="card-feedback">
        <button class="fb-btn" id="up-${idx}" onclick="vote(${idx}, 'up')">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6l5-5 5 5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Good match
        </button>
        <button class="fb-btn" id="dn-${idx}" onclick="vote(${idx}, 'down')">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 11V1M1 6l5 5 5-5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Not for me
        </button>
      </div>`;

    grid.appendChild(card);
  });

  // Build star rating
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

  showScreen('results');
}

/* ─── Feedback Interactions ──────────────────────────────────────── */
function vote(idx, dir) {
  const up = document.getElementById('up-' + idx);
  const dn = document.getElementById('dn-' + idx);
  up.classList.remove('voted-up', 'voted-dn');
  dn.classList.remove('voted-up', 'voted-dn');
  if (dir === 'up') up.classList.add('voted-up');
  else              dn.classList.add('voted-dn');
}

function rateStar(n) {
  for (let i = 1; i <= 5; i++) {
    const s = document.getElementById('star-' + i);
    s.classList.toggle('lit', i <= n);
  }
  setTimeout(() => {
    document.getElementById('feedback-thanks').style.display = 'block';
  }, 300);
}

/* ─── Restart ────────────────────────────────────────────────────── */
function restart() {
  currentQ = 0;
  Object.keys(answers).forEach(k => delete answers[k]);
  showScreen('landing');
}
