// ═══════════════════════════════════════════════════════════════════════
//  THE CONTENT
//
//  This file is the only place the steps live. Ada's progress is stored
//  against the ID of each step, never its wording — so the titles and
//  descriptions below can be rewritten, reordered, added to or deleted
//  without touching anything she has already ticked off.
//
//  Changing a step is a code push. Both phones pick it up automatically.
// ═══════════════════════════════════════════════════════════════════════

export const APP_NAME = "Ada's Road";

export const PHASES = [
  {
    id: 'p1',
    title: 'Get earning',
    blurb: 'Substitute teaching pays while everything else waits on other people.',
    steps: [
      { id: 't1', title: 'Email ERES about your documents', owner: 'you',
        detail: 'Ask whether what you already hold is enough, whether they need certified English translations, and who can attest a true copy.' },
      { id: 't2', title: 'Order the general ERES report', owner: 'you',
        detail: 'The cheaper general report is all the substitute permit needs. This is the shortcut into paid work.' },
      { id: 't3', title: 'Register for the CBEST', owner: 'you',
        detail: 'You can sit it right now. Nothing else has to be finished first.' },
      { id: 't4', title: 'Pass the CBEST', owner: 'you', detail: '' },
      { id: 't5', title: 'Apply for Certificate of Clearance + Live Scan', owner: 'you',
        detail: 'Fingerprinting through CTC. It counts for subbing and for the district applications later, so it does double duty.' },
      { id: 't6', title: 'ERES general report arrives', owner: 'them',
        detail: 'Ask them for a turnaround time so you know what you are waiting on.' },
      { id: 't7', title: 'Apply for the Emergency 30-Day Substitute Permit', owner: 'you',
        detail: 'Goes to CTC once the CBEST, the Certificate of Clearance and the evaluation are all in hand.' },
      { id: 't8', title: 'Apply to substitute pools', owner: 'you',
        detail: 'Modesto City Schools, Ceres, Sylvan Union, Ripon, Stanislaus COE, San Joaquin COE. Apply broadly.' },
    ],
  },
  {
    id: 'p2',
    title: 'Build the file',
    blurb: 'All of this counts toward either route, so none of it is wasted.',
    steps: [
      { id: 't9', title: 'Order the course-by-course ERES report', owner: 'you',
        detail: 'Required for any credential. Ask whether they will credit what you already paid for the general report.' },
      { id: 't10', title: 'Register for CSET Multiple Subject', owner: 'you',
        detail: 'Three subtests. No degree verification needed to sit it, so it can run alongside the evaluation.' },
      { id: 't11', title: 'Pass all three CSET subtests', owner: 'you', detail: '' },
      { id: 't12', title: 'Enroll at Modesto Junior College for ECE units', owner: 'you',
        detail: '24 units in early childhood education are required to teach TK. Ask about the California College Promise Grant.' },
      { id: 't13', title: 'Submit the Ripon USD interest form', owner: 'you',
        detail: 'Start here. Ripon is on the high-needs grant list and 20 minutes away. You apply to the district first, not to TCSJ.' },
      { id: 't14', title: 'Submit the Modesto City Schools interest form', owner: 'you',
        detail: 'Separate pool, separate decision. Applying to several costs nothing.' },
      { id: 't15', title: 'Submit the Denair USD interest form', owner: 'you',
        detail: 'Third shot in the same cycle.' },
      { id: 't16', title: 'Course-by-course evaluation arrives', owner: 'them', detail: '' },
      { id: 't17', title: 'Districts respond about selection', owner: 'them',
        detail: 'Follow up if you have not heard in a few weeks. These are small offices.' },
    ],
  },
  {
    id: 'p3',
    title: 'Decide and commit',
    blurb: 'Nothing gets decided before this point, because before this point it would be guessing.',
    steps: [
      { id: 't18', title: 'Decide: residency or IMPACT', owner: 'you',
        detail: 'Once the evaluation has cleared and CSET is passed, compare what you actually know by then.' },
      { id: 't19', title: 'District interview', owner: 'them',
        detail: 'Each partner district runs its own interview and selection.' },
      { id: 't20', title: 'Apply to TCSJ, only if a district sends you there', owner: 'you',
        detail: '$75 application fee plus a $400 enrollment deposit that goes toward tuition.' },
      { id: 't21', title: 'If IMPACT instead: Pre-Service program and job search', owner: 'you',
        detail: 'IMPACT needs a signed teaching contract before you enroll, plus a 9-unit Pre-Service semester. Vacancies are on EdJoin.' },
    ],
  },
];

export const COSTS = {
  out: [
    { id: 'c1', label: 'ERES general report', amt: 195, note: 'Enough to start subbing' },
    { id: 'c2', label: 'ERES course-by-course', amt: 295, note: 'Required for the credential' },
    { id: 'c3', label: 'CBEST', amt: 105, note: 'Verify at ctcexams.nesinc.com' },
    { id: 'c4', label: 'CSET Multiple Subject', amt: 300, note: 'Three subtests' },
    { id: 'c5', label: 'Certificate of Clearance + Live Scan', amt: 120, note: '' },
    { id: 'c6', label: '24 ECE units at MJC', amt: 1104, note: 'Could be $0 with the Promise Grant' },
    { id: 'c7', label: 'TCSJ application fee', amt: 75, note: '' },
    { id: 'c8', label: 'TCSJ enrollment deposit', amt: 400, note: 'Applies toward tuition' },
    { id: 'c9', label: 'Residency tuition, dual credential', amt: 13730, note: '$12,500 for a single credential' },
    { id: 'c10', label: 'CalTPA, CPR, textbooks', amt: 800, note: 'Rough estimate' },
  ],
  in: [
    { id: 'i1', label: 'Ripon high-needs grant', amt: 33000, note: 'A ceiling, not a promise' },
    { id: 'i2', label: 'Special education stipend', amt: 5000, note: 'Four-year SpEd commitment' },
    { id: 'i3', label: 'SpEd tuition assistance', amt: 2500, note: '' },
    { id: 'i4', label: 'SpEd testing fee reimbursement', amt: 300, note: '' },
    { id: 'i5', label: 'Golden State Teacher Grant', amt: 0, note: 'Apply through CSAC' },
  ],
};

// ── What Ottis says ────────────────────────────────────────────────────
// Nicaraguan Spanish, voseo. He is only ever reassuring. He never nags,
// never mentions a streak, and never says good morning — she opens this
// at any hour. Rotates so he isn't a recording.
export const SAYS = {
  greet: [
    '¡Ideay, Ada! Aquí andamos.',
    'Hola, Ada. Aquí estoy.',
    '¡Ey! Ya llegaste.',
  ],
  one: [
    'Una sola cosa hoy. Vos podés.',
    'Mirá, solo esto. Nada más.',
    'Paso a paso, pues.',
    'Tranquila. Una cosita y ya.',
  ],
  proud: [
    '¡Eso, Adamar! Qué tuani.',
    '¡Ya! Lo hiciste.',
    '¡Qué bien, Adamar! Eso costó.',
    'Vaya pues. Bien hecho.',
  ],
  waiting: [
    'Hoy no depende de vos. Descansá.',
    'Nada que hacer hoy. En serio.',
    'Ahorita les toca a ellos. Sentate.',
  ],
  finished: [
    'Ya terminaste todo, Adamar. Todo.',
    'Lo lograste. De verdad.',
  ],
};
