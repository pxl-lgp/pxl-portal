import { clearAccessToken, getAccessToken, setAccessToken } from './auth';

describe('access token storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns null when no token is stored', () => {
    expect(getAccessToken()).toBeNull();
  });

  it('stores and reads back a token', () => {
    setAccessToken('jwt-123');
    expect(getAccessToken()).toBe('jwt-123');
  });

  it('clears a stored token', () => {
    setAccessToken('jwt-123');
    clearAccessToken();
    expect(getAccessToken()).toBeNull();
  });
});
