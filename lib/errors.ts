import { AxiosError } from 'axios';

type ApiErrorResponse = {
  message?: string | string[];
  error?: string;
  details?: Record<string, unknown>;
};

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof AxiosError)) {
    return fallback;
  }

  const data = error.response?.data as ApiErrorResponse | undefined;
  const message = data?.message;
  const details = data?.details;
  const detailText = details ? ` Details: ${JSON.stringify(details)}` : '';

  if (Array.isArray(message)) {
    return `${message.join('; ')}${detailText}`;
  }

  if (message) {
    return `${message}${detailText}`;
  }

  if (data?.error) {
    return `${data.error}${detailText}`;
  }

  return fallback;
}
