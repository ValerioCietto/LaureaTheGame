// gameState.js

const STORAGE_KEY = 'laureaTheGameState';

/**
 * Stato iniziale del gioco.
 * Per popolare `exams`, il tuo codice dovrà inserire qui le chiavi snake_case
 * e i relativi CFU. Esempio:
 *   initialState.exams['reti_neurali_da_pesca'] = {
 *     cfu: 6,
 *     preparation: { unlocked: 0, total: 2 }, // total = cfu/3
 *     passed: false,
 *     score: null,
 *     passedAtCell: null,
 *     passedAtYear: null
 *   };
 */
const initialState = {
  currentCellIndex: 0,
  currentCellLabel: '',
  year: 1,
  exams: {}
};

// Stato in memoria
let state = loadFromLocalStorage();

/**
 * Carica lo stato da localStorage, o restituisce copia di initialState
 */
function loadFromLocalStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Stato non valido in localStorage, inizializzo da zero', e);
    }
  }
  // deep clone initialState
  return JSON.parse(JSON.stringify(initialState));
}

/**
 * Salva lo stato corrente in localStorage
 */
function saveToLocalStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * Restituisce lo stato di gioco corrente (riferimento diretto)
 */
function getGameState() {
  return state;
}

/**
 * Segna un esame come passato, con voto, cella e anno correnti.
 * @param {string} examKey
 * @param {number} score  — voto in trentesimi
 */
function passExam(examKey, score) {
  const exam = state.exams[examKey];
  if (!exam) throw new Error(`Esame "${examKey}" non trovato`);
  exam.passed = true;
  exam.score = score;
  exam.passedAtCell = state.currentCellLabel;
  exam.passedAtYear = state.year;
  saveToLocalStorage();
}

/**
 * Modifica i paragrafi sbloccati di un esame.
 * @param {string} examKey
 * @param {number} newUnlocked
 */
function changeExamPreparation(examKey, newUnlocked) {
  const exam = state.exams[examKey];
  if (!exam) throw new Error(`Esame "${examKey}" non trovato`);
  exam.preparation.unlocked = newUnlocked;
  saveToLocalStorage();
}

/**
 * Applica modifiche generiche a un esame.
 * Cambia le proprietà passate in `changes`.
 * @param {string} examKey
 * @param {Object} changes
 */
function changeExam(examKey, changes) {
  const exam = state.exams[examKey];
  if (!exam) throw new Error(`Esame "${examKey}" non trovato`);
  Object.assign(exam, changes);
  saveToLocalStorage();
}

/**
 * Cambia il numero di CFU di un esame e aggiorna i paragrafi totali.
 * @param {string} examKey
 * @param {number} newCFU
 */
function changeExamCFU(examKey, newCFU) {
  const exam = state.exams[examKey];
  if (!exam) throw new Error(`Esame "${examKey}" non trovato`);
  exam.cfu = newCFU;
  exam.preparation.total = newCFU / 3;
  saveToLocalStorage();
}

export {
  passExam,
  changeExamPreparation,
  changeExam,
  changeExamCFU,
  getGameState,
  saveToLocalStorage,
  loadFromLocalStorage
};
