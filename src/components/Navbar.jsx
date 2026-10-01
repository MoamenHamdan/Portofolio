import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { normalizeHomeContent } from '../utils/siteContent';
const items = [['Home','Home'],['About','About'],['Portofolio','Portfolio'],['Cyber','Cyber'],['Blog','Blog'],['Testimonials','Reviews'],['Contact','Contact']];
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('Home');
  const button = useRef(null);
  const nav = useRef(null);
  const settings = useSiteSettings('homeContent');
  const name = settings.data ? normalizeHomeContent(settings.data).displayName : '';
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1280px)');
    const close = () => setOpen(false);
    const escape = e => { if (e.key === 'Escape') { setOpen(false); button.current?.focus(); } };
    const outside = e => { if (!nav.current?.contains(e.target)) setOpen(false); };
    media.addEventListener('change', close);
    document.addEventListener('keydown', escape);
    document.addEventListener('pointerdown', outside);
    return () => { media.removeEventListener('change', close); document.removeEventListener('keydown', escape); document.removeEventListener('pointerdown', outside); };
  }, []);
  useEffect(() => {
    let frame;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        let current = 'Home';
        for (const [id] of items) if (document.getElementById(id)?.getBoundingClientRect().top <= 110) current = id;
        setActive(current);
      });
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => { window.removeEventListener('scroll', update); cancelAnimationFrame(frame); };
  }, []);
  const go = () => { setOpen(false); };
  const link = ([id, label]) => <a key={id} href={`#${id}`} onClick={go} aria-current={active === id ? 'location' : undefined} className={`block rounded-lg px-3 py-3 text-sm font-mono focus-visible:outline focus-visible:outline-red-400 ${active === id ? 'text-red-300 bg-red-500/10' : 'text-gray-300 hover:bg-white/5'}`}>{label}</a>;
  return <nav ref={nav} aria-label="Main navigation" className="fixed top-0 inset-x-0 z-50 border-b border-red-500/20 bg-black/95 backdrop-blur-md">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 flex h-16 items-center gap-3 justify-between">
      <a href="#Home" onClick={go} aria-label={name ? `${name} — Home` : 'Home'} className="min-w-0 break-words text-sm sm:text-lg leading-tight font-bold font-mono tracking-wide text-red-400">{name || <span aria-hidden="true" className="block h-5 w-36 bg-white/10 rounded" />}</a>
      <div className="hidden xl:flex shrink-0 items-center gap-1">{items.map(link)}</div>
      <button ref={button} type="button" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? 'Close navigation menu' : 'Open navigation menu'} onClick={() => setOpen(v => !v)} className="xl:hidden shrink-0 min-w-11 min-h-11 grid place-items-center rounded-lg text-red-400 hover:bg-white/10">{open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
    </div>
    <div id="mobile-navigation" hidden={!open} className="xl:hidden max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-white/10 p-3 bg-black">{items.map(link)}</div>
  </nav>;
}
