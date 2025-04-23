// gameState.js

const STORAGE_KEY = 'laureaTheGameState';

/** Definizione dello stato iniziale */
const initialState = {
  currentCellIndex: 0,
  currentCellLabel: '',
  year: 1,
  exams: {
    // Qui dovrai inserire le chiavi snake_case dei tuoi esami, es:
    // "reti_neurali_da_pesca": {
    //   cfu: 6,
    //   preparation: { unlocked: 0, total: 2 },
    //   passed: false,
    //   score: null,
    //   passedAtCell: null,
    //   passedAtYear: null,
    //   // attributi aggiuntivi:
    //   alla_cieca: false,
    //   hint: false,
    //   bonus_voto: 0,
    //   copia_da: ""
    // },
  }
};

/** Carica stato da localStorage o, in mancanza, inizializza da initialState */
function loadFromLocalStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  let loaded;
  if (raw) {
    try {
      loaded = JSON.parse(raw);
    } catch (e) {
      console.warn('Stato locale corrotto, torno a initialState', e);
    }
  }
  const state = loaded || JSON.parse(JSON.stringify(initialState));

  // Assicura che ogni esame abbia i campi extra
  for (const key in state.exams) {
    const exam = state.exams[key];
    if (typeof exam.alla_cieca !== 'boolean') exam.alla_cieca = false;
    if (typeof exam.hint      !== 'boolean') exam.hint      = false;
    if (typeof exam.bonus_voto !== 'number')  exam.bonus_voto = 0;
    if (typeof exam.copia_da   !== 'string')  exam.copia_da   = "";
  }

  return state;
}

/** Salva lo stato corrente in localStorage */
function saveToLocalStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/** Restituisce il riferimento allo stato corrente */
function getGameState() {
  return state;
}

/** Segna un esame come superato con voto */
function passExam(examKey, score) {
  const exam = state.exams[examKey];
  if (!exam) throw new Error(`Esame "${examKey}" non trovato`);
  exam.passed = true;
  exam.score = score;
  exam.passedAtCell = state.currentCellLabel;
  exam.passedAtYear = state.year;
  saveToLocalStorage();
}

/** Cambia il numero di paragrafi sbloccati di un esame */
function changeExamPreparation(examKey, newUnlocked) {
  const exam = state.exams[examKey];
  if (!exam) throw new Error(`Esame "${examKey}" non trovato`);
  exam.preparation.unlocked = newUnlocked;
  saveToLocalStorage();
}

/** Cambia proprietà generiche di un esame */
function changeExam(examKey, changes) {
  const exam = state.exams[examKey];
  if (!exam) throw new Error(`Esame "${examKey}" non trovato`);
  Object.assign(exam, changes);
  saveToLocalStorage();
}

/** Cambia i CFU di un esame (e aggiorna paragrafi totali) */
function changeExamCFU(examKey, newCFU) {
  const exam = state.exams[examKey];
  if (!exam) throw new Error(`Esame "${examKey}" non trovato`);
  exam.cfu = newCFU;
  exam.preparation.total = newCFU / 3;
  saveToLocalStorage();
}

/**
 * Applica un effetto a un esame.
 * effectName può essere:
 *   - "alla_cieca"        (abilita alla cieca)
 *   - "hint"              (abilita hint)
 *   - "bonus_voto:+N"     (aggiunge +N al bonus_voto)
 *   - "bonus_voto:-N"     (sottrae N dal bonus_voto)
 *   - "copia_da:TIPO"     (TIPO = "esperto"|"mediocre"|"scarso")
 */
function applyEffectToExam(effectName, examKey) {
  const exam = state.exams[examKey];
  if (!exam) throw new Error(`Esame "${examKey}" non trovato`);

  if (effectName === 'alla_cieca') {
    exam.alla_cieca = true;
  } else if (effectName === 'hint') {
    exam.hint = true;
  } else if (effectName.startsWith('bonus_voto:')) {
    const delta = parseInt(effectName.split(':')[1], 10);
    if (!isNaN(delta)) {
      exam.bonus_voto = (exam.bonus_voto || 0) + delta;
    }
  } else if (effectName.startsWith('copia_da:')) {
    const mode = effectName.split(':')[1];
    if (['esperto','mediocre','scarso'].includes(mode)) {
      exam.copia_da = mode;
    }
  } else {
    throw new Error(`Effetto "${effectName}" non riconosciuto`);
  }

  saveToLocalStorage();
}

/** Rimuove tutti gli effetti su un esame, resetta i 4 attributi extra */
function removeAllEffectToExam(examKey) {
  const exam = state.exams[examKey];
  if (!exam) throw new Error(`Esame "${examKey}" non trovato`);
  exam.alla_cieca  = false;
  exam.hint        = false;
  exam.bonus_voto  = 0;
  exam.copia_da    = "";
  saveToLocalStorage();
}

// Stato in memoria
let state = loadFromLocalStorage();

// Export delle funzioni
export {
  passExam,
  changeExamPreparation,
  changeExam,
  changeExamCFU,
  applyEffectToExam,
  removeAllEffectToExam,
  getGameState,
  saveToLocalStorage,
  loadFromLocalStorage
};
