import { Github, Linkedin, Instagram, Twitter, Youtube, Globe, Shield, Terminal, ExternalLink } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { normalizeSocialLinks } from '../utils/siteContent';
import ContentState from './ContentState';
const icons = { github: Github, linkedin: Linkedin, instagram: Instagram, twitter: Twitter, youtube: Youtube, tryhackme: Shield, hackthebox: Terminal };
export default function SocialLinks() {
  const settings = useSiteSettings('socialLinks');
  const links = normalizeSocialLinks(settings.data);
  if (settings.loading || settings.error) return <ContentState {...settings} onRetry={settings.retry} />;
  if (!links.length) return null;
  return <div className="w-full rounded-2xl p-6 border border-white/10">
    <h3 className="text-xl font-semibold mb-6">Connect With Me</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {links.map((link, index) => { const Icon = icons[link.platform] || Globe; return <a key={link.id || index} href={link.url} target="_blank" rel="noopener noreferrer" className="min-w-0 flex items-center gap-3 rounded-xl p-4 bg-white/5 hover:bg-white/10 border border-white/10">
        <Icon className="w-5 h-5 shrink-0" /><span className="break-words min-w-0">{link.label || link.platform}</span><ExternalLink className="w-4 h-4 shrink-0 ml-auto" />
      </a>; })}
    </div>
  </div>;
}
