'use client';

const TOKEN_KEY = 'pxl_access_token';
export const AUTH_TOKEN_CHANGED_EVENT = 'pxl-auth-token-changed';

function notifyTokenChanged() {
  window.dispatchEvent(new Event(AUTH_TOKEN_CHANGED_EVENT));
}

export function getAccessToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
  notifyTokenChanged();
}

export function clearAccessToken() {
  window.localStorage.removeItem(TOKEN_KEY);
  notifyTokenChanged();
}
