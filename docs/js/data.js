// ═══════════════════════════════════════════════════════════════════════
//  THE CONTENT
//
//  Ada's progress is stored against each step's ID, never its wording —
//  so titles, details, order and the steps themselves can be rewritten
//  without her losing a tick.
//
//  Changing a step is a code push. Both phones pick it up automatically.
//
//  There is deliberately NO CBEST here. SB 153 (June 2024) makes a
//  bachelor's degree satisfy the Basic Skills Requirement, and that
//  extends to a foreign degree once ERES rules it equivalent.
// ═══════════════════════════════════════════════════════════════════════

export const APP_NAME = "Ada's Road";

export const PHASES = [
  {
    id: 'p1',
    title: 'Papers',
    blurb: 'The most time-sensitive part of the whole road.',
    steps: [
      { id: 't1', title: 'Order 3–4 certified copies of your documents', owner: 'you',
        detail: 'Your Título or Grado, the university Certificado de Estudios, and the Bachiller. Nicaraguan universities have been closing and being confiscated since 2021 — get copies now, while you still can. This is the one step where waiting has a real cost.',
        link: 'https://eres.com/document-requirements/nicaragua', linkLabel: 'ERES document requirements',
        tel: '+17077592866', telLabel: 'Call ERES' },
      { id: 't2', title: 'Get certified English translations', owner: 'you',
        detail: 'ERES needs a word-for-word translation of every document that is not in English. They offer the service themselves.',
        link: 'https://eres.com', linkLabel: 'ERES translations',
        tel: '+17077592866', telLabel: 'Call ERES' },
      { id: 't3', title: 'Call ERES about closed-university records', owner: 'you',
        detail: 'If your university has been confiscated they may not be able to verify electronically. Ask how they handle it before you apply, not after.',
        link: 'https://eres.com', linkLabel: 'ERES',
        tel: '+17077592866', telLabel: 'Call ERES' },
      { id: 't4', title: 'Submit the course-by-course evaluation', owner: 'you',
        detail: 'Course-by-course, not the cheaper general report — it covers both the substitute permit now and the credential later. About $195.',
        link: 'https://eres.com/pricing-fees/', linkLabel: 'ERES fees and application',
        tel: '+17077592866', telLabel: 'Call ERES' },
      { id: 't5', title: 'The evaluation arrives', owner: 'them',
        detail: 'Three to four weeks. Check that it states U.S. bachelor degree equivalency in so many words — that sentence is what satisfies the Basic Skills Requirement.',
        link: 'https://eres.com', linkLabel: 'ERES',
        tel: '+17077592866', telLabel: 'Call ERES' },
    ],
  },
  {
    id: 'p2',
    title: 'Permission to work',
    blurb: 'Everything you need before a district can pay you.',
    steps: [
      { id: 't6', title: 'Create a CTC Online account', owner: 'you',
        detail: 'Use your exact legal name, as it appears on your ITIN or SSN. No citizenship is required for any California credential.',
        link: 'https://www.ctc.ca.gov', linkLabel: 'CTC Online' },
      { id: 't7', title: 'Live Scan fingerprinting', owner: 'you',
        detail: 'Form 41-LS — bring three copies to the site. Roughly $50–90 including the rolling fee.',
        link: 'https://www.ctc.ca.gov/docs/default-source/leaflets/41-ls.pdf', linkLabel: 'Form 41-LS' },
      { id: 't8', title: 'Apply for the Certificate of Clearance', owner: 'you',
        detail: 'Online through CTC, about $50. It does double duty later for the district residency applications.',
        link: 'https://www.ctc.ca.gov', linkLabel: 'CTC Online' },
      { id: 't9', title: 'TB clearance', owner: 'you',
        detail: 'Districts need this to employ you; CTC does not. A negative test or risk assessment within the last four years.' },
      { id: 't10', title: 'Apply for the 30-Day Substitute Permit', owner: 'you',
        detail: 'Apply through Stanislaus COE or a hiring district, not straight to CTC — direct submissions can take fifty days.',
        link: 'https://www.stancoe.org', linkLabel: 'Stanislaus COE',
        tel: '+12092381611', telLabel: 'SCOE credentials' },
      { id: 't11', title: 'The permit arrives', owner: 'them',
        detail: '10–60 business days. Renew it every year even when you are not working; it keeps you employable without a gap.',
        link: 'https://www.ctc.ca.gov', linkLabel: 'CTC Online' },
    ],
  },
  {
    id: 'p3',
    title: 'Start earning',
    blurb: 'Paid work, while everything else waits on other people.',
    steps: [
      { id: 't12', title: 'Build your EdJoin profile', owner: 'you',
        detail: 'Every district hires substitutes through EdJoin. Upload the permit; they contact you by the email on your profile.',
        link: 'https://www.edjoin.org', linkLabel: 'EdJoin' },
      { id: 't13', title: 'Apply to the substitute pools', owner: 'you',
        detail: 'Modesto City, Sylvan Union, Ceres, Ripon, Stanislaus COE, San Joaquin COE. Scoot Education can place you quickly while the district pools process you.',
        link: 'https://www.edjoin.org', linkLabel: 'EdJoin' },
      { id: 't14', title: 'First day subbing', owner: 'you',
        detail: 'Say yes to TK, kindergarten and special ed — highest demand, and the TK time counts toward the comparable-experience option later.',
        link: 'https://www.edjoin.org', linkLabel: 'EdJoin' },
    ],
  },
  {
    id: 'p4',
    title: 'Build the file',
    blurb: 'All of this counts toward either route, so none of it is wasted.',
    steps: [
      { id: 't15', title: 'Enroll at Modesto Junior College', owner: 'you',
        detail: 'Child Development courses toward the 24 ECE units that teaching TK requires. About $46 a unit.',
        link: 'https://www.mjc.edu', linkLabel: 'Modesto Junior College' },
      { id: 't16', title: 'Apply for the College Promise Grant', owner: 'you',
        detail: 'Through MJC financial aid or the California Dream Act application. If you qualify it waives the enrolment fees entirely.',
        link: 'https://www.mjc.edu/studentservices/finaid/', linkLabel: 'MJC financial aid' },
      { id: 't17', title: 'Register for the CSET', owner: 'you',
        detail: 'Multiple Subjects, three subtests, $247 for all three in one sitting. Ask TCSJ first whether your ERES report can waive any of them.',
        link: 'https://www.ctcexams.nesinc.com', linkLabel: 'CSET registration' },
      { id: 't18', title: 'Pass all three CSET subtests', owner: 'you',
        detail: 'Computer-based, year-round by appointment. Results in about five weeks.',
        link: 'https://www.ctcexams.nesinc.com', linkLabel: 'CSET' },
      { id: 't19', title: 'Finish the 24 ECE units', owner: 'you',
        detail: 'This is what allows you to be assigned to a TK classroom at all.',
        link: 'https://www.mjc.edu', linkLabel: 'Modesto Junior College' },
    ],
  },
  {
    id: 'p5',
    title: 'Choose the programme',
    blurb: 'Nothing gets decided before this point, because before this point it would be guessing.',
    steps: [
      { id: 't20', title: 'Ripon USD interest form', owner: 'you',
        detail: 'Start here. Ripon is a Residency@TCSJ partner AND on the high-needs grant list, twenty minutes from Modesto. You apply to the district first, never to TCSJ.',
        link: 'https://teacherscollegesj.edu/residencytcsjpartners', linkLabel: 'Residency partners' },
      { id: 't21', title: 'Modesto City Schools interest form', owner: 'you',
        detail: 'Local backup. Separate pool, separate decision — applying to several costs you nothing.',
        link: 'https://teacherscollegesj.edu/residencytcsjpartners', linkLabel: 'Residency partners' },
      { id: 't22', title: 'Denair USD interest form', owner: 'you',
        detail: 'Third shot in the same cycle.',
        link: 'https://teacherscollegesj.edu/residencytcsjpartners', linkLabel: 'Residency partners' },
      { id: 't23', title: 'Ask TCSJ the four questions', owner: 'you',
        detail: 'Do they offer the PK-3 ECE Specialist credential? Can your ERES report meet subject-matter competency? What grants are available for your cohort? And does your EAD affect grant eligibility?',
        link: 'https://teacherscollegesj.edu', linkLabel: 'TCSJ',
        tel: '+12094684926', telLabel: 'Call TCSJ admissions' },
      { id: 't24', title: 'District interview', owner: 'them',
        detail: 'Each partner district runs its own interview and selection.' },
      { id: 't25', title: 'Districts decide', owner: 'them',
        detail: 'Follow up if it goes quiet for a few weeks. These are small offices and applications fall through cracks.' },
      { id: 't26', title: 'Apply to TCSJ', owner: 'you',
        detail: 'Only once a district sends you there. $75 application fee plus a $400 deposit that goes toward tuition.',
        link: 'https://teacherscollegesj.edu', linkLabel: 'TCSJ admissions',
        tel: '+12094684926', telLabel: 'Call TCSJ' },
      { id: 't27', title: 'Apply for the residency grant', owner: 'you',
        detail: 'Up to $33,000 through the district, for a high-needs area — TK and kindergarten both qualify. Four-year service commitment.',
        link: 'https://teacherscollegesj.edu', linkLabel: 'TCSJ',
        tel: '+12094684926', telLabel: 'Call TCSJ' },
      { id: 't28', title: 'Apply for the Golden State Teacher Grant', owner: 'you',
        detail: 'Up to $10,000 through CSAC, with a two-year commitment at a priority school. Residency students qualify; interns no longer do. Check it is still funded for your year.',
        link: 'https://www.csac.ca.gov/golden-state-teacher-grant-program', linkLabel: 'Golden State Teacher Grant' },
    ],
  },
  {
    id: 'p6',
    title: 'Into the classroom',
    blurb: 'The last stretch.',
    steps: [
      { id: 't29', title: 'Pass the CalTPA', owner: 'you',
        detail: 'During the programme. The Literacy Cycle replaced the old RICA in October 2025.',
        link: 'https://www.ctcexams.nesinc.com', linkLabel: 'CalTPA' },
      { id: 't30', title: 'Apply for your credential', owner: 'you',
        detail: 'Your programme recommends you to CTC; you apply online, about $100.',
        link: 'https://www.ctc.ca.gov', linkLabel: 'CTC Online' },
      { id: 't31', title: 'Get hired', owner: 'them',
        detail: 'Through EdJoin again. Residents get priority consideration at their residency district, and TK demand across Stanislaus is strong.',
        link: 'https://www.edjoin.org', linkLabel: 'EdJoin' },
      { id: 't32', title: 'Finish Induction', owner: 'you',
        detail: 'Two years, job-embedded, usually run by your district. Then the credential is cleared for good.' },
    ],
  },
];

export const COSTS = {
  out: [
    { id: 'c1', label: 'ERES course-by-course evaluation', amt: 195, note: 'Covers the permit and the credential' },
    { id: 'c2', label: 'Certified translations', amt: 150, note: 'Estimate — ERES quote it per document' },
    { id: 'c3', label: 'Live Scan fingerprinting', amt: 70, note: 'Varies by site' },
    { id: 'c4', label: 'Certificate of Clearance', amt: 50, note: '' },
    { id: 'c5', label: '30-Day Substitute Permit', amt: 53, note: 'Through a county office' },
    { id: 'c6', label: 'TB clearance', amt: 30, note: '' },
    { id: 'c7', label: 'CSET Multiple Subjects', amt: 247, note: 'All three subtests in one sitting' },
    { id: 'c8', label: '24 ECE units at MJC', amt: 1104, note: 'Could be $0 with the Promise Grant' },
    { id: 'c9', label: 'TCSJ application fee', amt: 75, note: '' },
    { id: 'c10', label: 'TCSJ enrollment deposit', amt: 400, note: 'Applies toward tuition' },
    { id: 'c11', label: 'Residency tuition, dual credential', amt: 13730, note: '$12,500 for a single credential' },
    { id: 'c12', label: 'CalTPA, CPR, textbooks', amt: 800, note: 'Rough estimate' },
  ],
  in: [
    { id: 'i1', label: 'Ripon high-needs residency grant', amt: 33000, note: 'A ceiling, not a promise. Four-year commitment' },
    { id: 'i2', label: 'Golden State Teacher Grant', amt: 10000, note: 'Cut from $20,000 in 2024. Two-year commitment' },
    { id: 'i3', label: 'Special education stipend', amt: 5000, note: 'If you add the SpEd credential' },
    { id: 'i4', label: 'SpEd tuition assistance', amt: 2500, note: '' },
    { id: 'i5', label: 'College Promise Grant', amt: 1104, note: 'Waives the MJC enrolment fees' },
    { id: 'i6', label: 'SpEd testing fee reimbursement', amt: 300, note: '' },
  ],
};

// ── What Ottis says ────────────────────────────────────────────────────
// Nicaraguan Spanish, voseo. Only ever reassuring. He never nags, never
// mentions a streak, and never says good morning — she opens this at any
// hour. Rotates so he isn't a recording.
export const SAYS = {
  greet: ['¡Ideay, Ada! Aquí andamos.', 'Hola, Ada. Aquí estoy.', '¡Ey! Ya llegaste.'],
  one: ['Una sola cosa hoy. Vos podés.', 'Mirá, solo esto. Nada más.', 'Paso a paso, pues.', 'Tranquila. Una cosita y ya.'],
  proud: ['¡Eso, Adamar! Qué tuani.', '¡Ya! Lo hiciste.', '¡Qué bien, Adamar! Eso costó.', 'Vaya pues. Bien hecho.'],
  waiting: ['Hoy no depende de vos. Descansá.', 'Nada que hacer hoy. En serio.', 'Ahorita les toca a ellos. Sentate.'],
  finished: ['Ya terminaste todo, Adamar. Todo.', 'Lo lograste. De verdad.'],
};

// ── The questions ─────────────────────────────────────────────────────
// From the original research. Every answer here removes a guess from the
// plan. They live at the top of El camino; her answers are saved and
// shared like everything else.
export const QUESTIONS = [
  { id: 'q-eres', who: 'ERES', tel: '+17077592866', items: [
    { id: 'qa', q: 'Are my three documents enough, or do you also need the secondary Certificado de Estudios?' },
    { id: 'qb', q: 'Do you require certified English translations of Spanish documents?' },
    { id: 'qc', q: 'Who can attest a certified true copy \u2014 the institution, a notary, or a Nicaraguan consulate?' },
    { id: 'qd', q: 'Will a general report credit toward the course-by-course later?' },
    { id: 'qe', q: 'What is your current turnaround time?' },
    { id: 'qu', q: 'How do you handle records from a university that has been closed or confiscated?' },
  ]},
  { id: 'q-ripon', who: 'Ripon USD', tel: '', items: [
    { id: 'qf', q: 'How many resident slots do you expect this cohort? How many last year?' },
    { id: 'qg', q: 'Do you have Teacher Residency Grant funding, and for which credential areas?' },
    { id: 'qh', q: 'How much of the award reaches me as a living stipend versus tuition?' },
    { id: 'qi', q: 'Is resident funding paid through payroll, or applied as a scholarship?' },
    { id: 'qj', q: 'What does the four-year service agreement say about repayment if I cannot complete it?' },
    { id: 'qk', q: 'Do you have TK or kindergarten mentor teachers available?' },
  ]},
  { id: 'q-tcsj', who: 'TCSJ admissions', tel: '+12094684926', items: [
    { id: 'ql', q: 'Is the high-needs grant district list still current for this cycle?' },
    { id: 'qm', q: 'Can IMPACT interns be placed in TK classrooms?' },
    { id: 'qn', q: 'Do you offer the PK-3 ECE Specialist credential?' },
    { id: 'qo', q: 'How far past programme completion can the payment plan run?' },
    { id: 'qp', q: 'Is outside work permitted during the residency year?' },
    { id: 'qq', q: 'Does the residency grant have eligibility criteria beyond the published ones?' },
    { id: 'qv', q: 'Can my ERES report meet subject-matter competency instead of the CSET?' },
    { id: 'qw', q: 'Does my work authorisation affect grant eligibility?' },
  ]},
  { id: 'q-mjc', who: 'Modesto Junior College', tel: '', items: [
    { id: 'qr', q: 'Which specific courses count toward the 24 ECE units?' },
    { id: 'qs', q: 'Do I qualify for the California College Promise Grant?' },
  ]},
  { id: 'q-other', who: 'Modesto City Schools / Denair', tel: '', items: [
    { id: 'qt', q: 'Same slot count, funding and mentor availability questions as Ripon.' },
  ]},
];

// Substitute work is what pays for the gap year, so the money screen says
// so out loud rather than leaving her to work it out.
export const SUB_RATE = 225;      // Modesto City Schools, from a recent posting
export const SUB_DAYS_PER_WEEK = 4;
export const SUB_WEEKS = 40;
