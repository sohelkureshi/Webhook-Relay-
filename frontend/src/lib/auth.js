const KEY = 'ADMIN_API_KEY';

export function getAdminKey() {
  return localStorage.getItem(KEY) || '';
}

export function setAdminKey(val) {
  if (val) localStorage.setItem(KEY, val);
}

export function clearAdminKey() {
  localStorage.removeItem(KEY);
}
