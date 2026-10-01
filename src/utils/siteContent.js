const text = (value) => typeof value === 'string' ? value : '';
const strings = (value) => Array.isArray(value) ? value.filter(item => typeof item === 'string' && item.trim()) : [];
export function safeUrl(value, image = false) {
  if (typeof value !== 'string') return '';
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  if (image && /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(value)) return value;
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? value : ''; } catch { return ''; }
}
export function normalizeHomeContent(data = {}) {
  data = data || {};
  return {
    displayName: text(data.displayName ?? 'Moamen Hamdan'),
    heroTitlePart1: text(data.heroTitlePart1), heroTitlePart2: text(data.heroTitlePart2),
    heroDescription: text(data.heroDescription), aboutMeText: text(data.aboutMeText),
    aboutSubtitle: text(data.aboutSubtitle),
    heroImageUrl: safeUrl(data.heroImageUrl, true),
    aboutImageUrl: safeUrl(data.aboutImageUrl ?? data.heroImageUrl, true),
    cvUrl: safeUrl(data.cvUrl),
    typingWords: strings(data.typingWords), techStack: strings(data.techStack),
    yearsOfExperience: data.yearsOfExperience != null && data.yearsOfExperience !== '' && Number.isFinite(Number(data.yearsOfExperience)) ? Math.max(0, Number(data.yearsOfExperience)) : null,
  };
}
export function normalizeSocialLinks(data) {
  return (Array.isArray(data?.links) ? data.links : []).filter(link => link && safeUrl(link.url)).map(link => ({...link, url: safeUrl(link.url)}));
}
