import { AxiosError, AxiosHeaders } from 'axios';
import { getApiErrorMessage } from './errors';

function axiosErrorWith(data: unknown): AxiosError {
  const error = new AxiosError('Request failed');
  error.response = {
    data,
    status: 400,
    statusText: 'Bad Request',
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
  return error;
}

describe('getApiErrorMessage', () => {
  it('returns the fallback for non-Axios errors', () => {
    expect(getApiErrorMessage(new Error('boom'), 'fallback')).toBe('fallback');
    expect(getApiErrorMessage('nope', 'fallback')).toBe('fallback');
  });

  it('joins an array message', () => {
    const error = axiosErrorWith({ message: ['email is required', 'name is required'] });
    expect(getApiErrorMessage(error, 'fallback')).toBe('email is required; name is required');
  });

  it('returns a string message', () => {
    const error = axiosErrorWith({ message: 'Client not found.' });
    expect(getApiErrorMessage(error, 'fallback')).toBe('Client not found.');
  });

  it('falls back to the error field when there is no message', () => {
    const error = axiosErrorWith({ error: 'Unauthorized' });
    expect(getApiErrorMessage(error, 'fallback')).toBe('Unauthorized');
  });

  it('appends details when present', () => {
    const error = axiosErrorWith({ message: 'Bad input', details: { field: 'email' } });
    expect(getApiErrorMessage(error, 'fallback')).toBe('Bad input Details: {"field":"email"}');
  });

  it('returns the fallback when the response has no usable fields', () => {
    const error = axiosErrorWith({});
    expect(getApiErrorMessage(error, 'fallback')).toBe('fallback');
  });
});
