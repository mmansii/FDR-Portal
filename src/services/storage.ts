const STORAGE_KEY = 'aicte_smart_fdr_state_v2';

export function loadStoredState<T>(defaultState: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return { ...defaultState, ...parsed };
  } catch (e) {
    console.warn('Failed to load stored state from localStorage, using initial dataset:', e);
    return defaultState;
  }
}

export function saveStoredState<T>(state: T): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to persist state to localStorage:', e);
  }
}

export function clearStoredState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear state from localStorage:', e);
  }
}
