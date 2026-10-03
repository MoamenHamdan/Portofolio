import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
const mocks = vi.hoisted(() => ({ next: null, error: null, subscribe: vi.fn() }));
vi.mock('../src/firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  doc: (_, collection, name) => name,
  onSnapshot: (name, options, next, error) => {
    mocks.next = next; mocks.error = error; mocks.subscribe(name); return vi.fn();
  },
}));
import InitialContentGate from '../src/components/InitialContentGate';
import { useSiteSettings } from '../src/hooks/useSiteSettings';
function Content() { const { data } = useSiteSettings('homeContent'); return <h1>{data.title || 'Empty portfolio'}</h1>; }
const send = (data, cached = false) => act(() => mocks.next({ metadata: { fromCache: cached }, exists: () => data !== null, data: () => data }));
describe('initial loading screen', () => {
  it('waits for server content and reveals it immediately using the same subscription', () => {
    mocks.subscribe.mockClear();
    render(<InitialContentGate><Content /></InitialContentGate>);
    expect(screen.getByRole('status').textContent).toContain('Loading portfolio');
    send({ title: 'Old' }, true);
    expect(screen.queryByRole('heading')).toBeNull();
    send({ title: 'Current portfolio' });
    expect(screen.getByRole('heading').textContent).toBe('Current portfolio');
    expect(screen.queryByRole('status')).toBeNull();
    expect(mocks.subscribe).toHaveBeenCalledTimes(1);
    send({ title: 'Updated portfolio' });
    expect(screen.getByRole('heading').textContent).toBe('Updated portfolio');
  });
  it('offers retry after the timeout and recovers', () => {
    vi.useFakeTimers();
    render(<InitialContentGate><Content /></InitialContentGate>);
    act(() => vi.advanceTimersByTime(15000));
    expect(screen.getByRole('alert').textContent).toContain('Unable to load');
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.getByRole('status').textContent).toContain('Loading portfolio');
    send({ title: 'Recovered' });
    expect(screen.getByRole('heading').textContent).toBe('Recovered');
  });
  it('shows an error for failed reads and does not hang on missing settings', () => {
    render(<InitialContentGate><Content /></InitialContentGate>);
    act(() => mocks.error(new Error('denied')));
    expect(screen.getByRole('alert')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    send(null);
    expect(screen.getByRole('heading').textContent).toBe('Empty portfolio');
  });
});
