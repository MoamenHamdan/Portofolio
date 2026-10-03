import PropTypes from "prop-types";
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { normalizeHomeContent, normalizeSocialLinks, safeUrl } from '../src/utils/siteContent';
const mocks = vi.hoisted(() => ({ subscriptions: [], getDoc: vi.fn() }));
vi.mock('../src/firebase', () => ({ db: {}, doc: (...parts) => parts.at(-1), getDoc: mocks.getDoc, collection: vi.fn(), getCountFromServer: () => Promise.resolve({data: () => ({count: 0})}) }));
vi.mock('firebase/firestore', () => ({ doc: (...parts) => parts.at(-1), onSnapshot: (name, options, next, error) => { const stop = vi.fn(); mocks.subscriptions.push({name,next,error,stop}); return stop; } }));
vi.mock('aos', () => ({default: { init: vi.fn() }}));
import { useSiteSettings } from '../src/hooks/useSiteSettings';
import ContentImage from '../src/components/ContentImage';
import Home from '../src/Pages/Home';
import About from '../src/Pages/About';
import Navbar from '../src/components/Navbar';
import SocialLinks from '../src/components/SocialLinks';
import ProjectDetails from '../src/components/ProjectDetail';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
const send = (name, data, fromCache = false) => {
 const sub = mocks.subscriptions.filter(s => s.name === name).at(-1);
 act(() => sub.next({metadata:{fromCache}, exists: () => data !== null, data: () => data}));
};
const Probe = ({name}) => { const s = useSiteSettings(name); return <div><span>{s.loading ? 'pending' : s.error ? 'error' : s.data.title || 'empty'}</span><button onClick={s.retry}>retry</button></div>; };
describe('authoritative content', () => {
 it('keeps cleared fields, empty arrays, and zero experience', () => {
  const data = normalizeHomeContent({heroTitlePart1:'',typingWords:[],techStack:[],heroImageUrl:'',cvUrl:'',yearsOfExperience:0});
  expect(data.heroTitlePart1).toBe(''); expect(data.typingWords).toEqual([]); expect(data.heroImageUrl).toBe(''); expect(data.cvUrl).toBe(''); expect(data.yearsOfExperience).toBe(0);
 });
 it('does not supply sample professional content when settings are missing', () => { const data = normalizeHomeContent(null); expect(data.heroDescription).toBe(''); expect(data.heroTitlePart1).toBe(''); expect(data.aboutMeText).toBe(''); });
 it('rejects malformed arrays and unsafe URLs', () => { expect(normalizeHomeContent({typingWords:[null,5,'SOC'],techStack:'bad'}).typingWords).toEqual(['SOC']); expect(safeUrl('javascript:alert(1)')).toBe(''); expect(safeUrl('//evil.test')).toBe(''); expect(normalizeSocialLinks({links:[null,{url:'javascript:alert(1)'}]})).toEqual([]); });
 it('shares a subscription and cleans it up only after the last consumer', () => {
  const before=mocks.subscriptions.length; const a=render(<Probe name="shared-test"/>); const b=render(<Probe name="shared-test"/>);
  expect(mocks.subscriptions.length).toBe(before+1); send('shared-test',{title:'Current'}); expect(screen.getAllByText('Current')).toHaveLength(2);
  a.unmount(); expect(mocks.subscriptions.at(-1).stop).not.toHaveBeenCalled(); b.unmount(); expect(mocks.subscriptions.at(-1).stop).toHaveBeenCalledOnce();
 });
 it('ignores stale cache, then accepts server content and live updates', () => { render(<Probe name="cache-test"/>); send('cache-test',{title:'Old'},true); expect(screen.getByText('pending')).toBeTruthy(); send('cache-test',{title:'Current'}); expect(screen.getByText('Current')).toBeTruthy(); send('cache-test',{title:'Edited'}); expect(screen.getByText('Edited')).toBeTruthy(); });
 it('handles missing documents without fabricated content', () => { render(<Probe name="missing-test"/>); send('missing-test',null); expect(screen.getByText('empty')).toBeTruthy(); });
 it('times out, retries, and recovers', () => { vi.useFakeTimers(); render(<Probe name="timeout-test"/>); act(()=>vi.advanceTimersByTime(15000)); expect(screen.getByText('error')).toBeTruthy(); fireEvent.click(screen.getByText('retry')); expect(screen.getByText('pending')).toBeTruthy(); send('timeout-test',{title:'Recovered'}); expect(screen.getByText('Recovered')).toBeTruthy(); });
 it('reports permission/network errors', () => { render(<Probe name="error-test"/>); act(()=>mocks.subscriptions.at(-1).error(new Error('denied'))); expect(screen.getByText('error')).toBeTruthy(); });
 it('never renders old hero/about text or images before loading and reflects subsequent edits', async () => {
  const {container}=render(<><Home/><About/></>);
  expect(container.textContent).not.toMatch(/Back-End|Developer|backend developer/); expect(container.querySelector('img')).toBeNull();
  send('homeContent',{heroTitlePart1:'SOC Level 1',heroTitlePart2:'Analyst',heroDescription:'Saved description',aboutMeText:'Saved biography',heroImageUrl:'https://example.com/current.jpg',aboutImageUrl:'https://example.com/about.jpg',typingWords:[],displayName:'Updated Name'});
  expect(screen.getByRole('heading',{level:1}).textContent).toContain('SOC Level 1'); expect(screen.getByText('Saved description')).toBeTruthy(); expect(screen.getByText('Saved biography')).toBeTruthy(); expect(container.querySelector('img').src).toBe('https://example.com/current.jpg');
  send('homeContent',{heroTitlePart1:'Security Engineer',typingWords:[],heroImageUrl:'https://example.com/new.jpg'});
  expect(screen.getByRole('heading',{level:1}).textContent).toContain('Security Engineer'); expect(container.querySelector('img').src).toBe('https://example.com/new.jpg');
 });
 it('does not restore a default photo when an image fails', () => { const {rerender}=render(<ContentImage src="https://example.com/fail.jpg" alt="Profile"/>); fireEvent.error(screen.getByRole('img')); expect(screen.getByRole('img').tagName).toBe('DIV'); rerender(<ContentImage src="https://example.com/new.jpg" alt="Profile"/>); expect(screen.getByRole('img').tagName).toBe('IMG'); });
 it('uses saved links in the contact area and respects clearing them', () => { render(<SocialLinks/>); send('socialLinks',{links:[{id:'one',platform:'github',label:'My Code',url:'https://github.com/example'}]}); expect(screen.getByRole('link',{name:'My Code'}).href).toBe('https://github.com/example'); send('socialLinks',{links:[]}); expect(screen.queryByRole('link')).toBeNull(); });
});
describe('navigation and direct project links', () => {
 it('opens and closes the mobile menu with Escape and section selection', () => {
  render(<Navbar/>); const toggle=screen.getByRole('button',{name:'Open navigation menu'});
  fireEvent.click(toggle); expect(toggle.getAttribute('aria-expanded')).toBe('true');
  fireEvent.keyDown(document,{key:'Escape'}); expect(toggle.getAttribute('aria-expanded')).toBe('false'); expect(document.activeElement).toBe(toggle);
  fireEvent.click(toggle); fireEvent.click(screen.getAllByRole('link',{name:'About'}).at(-1)); expect(toggle.getAttribute('aria-expanded')).toBe('false'); expect(document.body.style.overflow).not.toBe('hidden');
 });
 it('loads a project directly without localStorage', async () => {
  expect(window.localStorage).toBeUndefined(); mocks.getDoc.mockResolvedValue({exists:()=>true,id:'direct',data:()=>({Title:'Direct Project',Description:'Loaded from database',Features:[],TechStack:[]})});
  render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={['/project/direct']}><Routes><Route path="/project/:id" element={<ProjectDetails/>}/></Routes></MemoryRouter>);
  expect((await screen.findAllByText('Direct Project')).length).toBeGreaterThan(0); expect(mocks.getDoc).toHaveBeenCalledWith('direct'); expect(screen.queryByText('Loading content…')).toBeNull();
 });
 it.each([['', ''], ['javascript:alert(1)', 'Private']])('omits missing or unsafe project action URLs (%s, %s)', async (Link, Github) => {
  mocks.getDoc.mockResolvedValue({exists:()=>true,id:'links',data:()=>({Title:'Links project',Link,Github})});
  render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={['/project/links']}><Routes><Route path="/project/:id" element={<ProjectDetails/>}/></Routes></MemoryRouter>);
  await screen.findByRole('heading',{name:'Links project'});
  expect(screen.queryByRole('link',{name:'Live Demo'})).toBeNull(); expect(screen.queryByRole('link',{name:'Github'})).toBeNull();
  if (Github === 'Private') expect(screen.getByText('Source code is private.')).toBeTruthy();
 });
 it('preserves valid project action links', async () => {
  mocks.getDoc.mockResolvedValue({exists:()=>true,id:'links',data:()=>({Title:'Links project',Link:'https://example.com/demo',Github:'https://github.com/example/repo'})});
  render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={['/project/links']}><Routes><Route path="/project/:id" element={<ProjectDetails/>}/></Routes></MemoryRouter>);
  expect((await screen.findByRole('link',{name:'Live Demo'})).href).toBe('https://example.com/demo'); expect(screen.getByRole('link',{name:'Github'}).href).toBe('https://github.com/example/repo');
 });
 it('shows a missing-project state', async () => { mocks.getDoc.mockResolvedValue({exists:()=>false}); render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={['/project/missing']}><Routes><Route path="/project/:id" element={<ProjectDetails/>}/></Routes></MemoryRouter>); expect(await screen.findByText('Project not found')).toBeTruthy(); });
 it('offers retry after a project read fails', async () => { mocks.getDoc.mockRejectedValue(new Error('offline')); render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={['/project/fail']}><Routes><Route path="/project/:id" element={<ProjectDetails/>}/></Routes></MemoryRouter>); expect(await screen.findByRole('button',{name:'Try again'})).toBeTruthy(); });
});

Probe.propTypes = { name: PropTypes.string };
