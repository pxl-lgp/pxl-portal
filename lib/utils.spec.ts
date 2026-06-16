import { cn } from './utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-2', 'text-sm')).toBe('px-2 text-sm');
  });

  it('drops falsy values', () => {
    expect(cn('px-2', false, null, undefined, 'text-sm')).toBe('px-2 text-sm');
  });

  it('lets later Tailwind classes win conflicts', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('supports conditional object syntax', () => {
    expect(cn('base', { active: true, disabled: false })).toBe('base active');
  });
});
