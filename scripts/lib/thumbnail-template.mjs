const escapeHtml = (value) => String(value || '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

export function thumbnailHtml({ title, organisation, highlight, badge = 'OFFICIAL UPDATE', language = 'en', monogramDataUrl }) {
  if (!title || !monogramDataUrl) throw new Error('Thumbnail title and exact monogram asset are required');
  const lang = ['en', 'bn', 'hi'].includes(language) ? language : 'en';
  return `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><style>
*{box-sizing:border-box}html,body{margin:0;width:1200px;height:675px;overflow:hidden}body{font-family:Arial,"Noto Sans Bengali","Noto Sans Devanagari",sans-serif;background:#0B1D3A;color:#FFFFFF}.canvas{position:relative;width:100%;height:100%;padding:78px 92px;display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:56px;align-items:center}.canvas:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 86% 12%,rgba(14,165,154,.38),transparent 32%),linear-gradient(135deg,transparent 56%,rgba(14,165,154,.15))}.content,.brand{position:relative;z-index:1}.badge{display:inline-flex;padding:11px 18px;border-radius:999px;background:#F5A623;color:#0B1D3A;font-size:19px;font-weight:900;letter-spacing:.04em}.organisation{margin:24px 0 10px;color:#86e0d9;font-size:25px;font-weight:800}.title{margin:0;max-width:760px;font-size:58px;line-height:1.1;letter-spacing:-.025em}.highlight{display:inline-block;margin-top:25px;padding-left:17px;border-left:6px solid #F5A623;font-size:29px;font-weight:850}.brand{display:grid;place-items:center;min-height:310px;padding:30px;background:#FFFFFF;border-radius:48px;box-shadow:0 30px 70px rgba(0,0,0,.25)}.brand img{display:block;width:220px;height:auto;max-height:240px;object-fit:contain}.footer{position:absolute;z-index:1;left:92px;right:92px;bottom:46px;display:flex;align-items:center;justify-content:space-between;color:#b8d6e8;font-size:18px}.footer strong{color:#FFFFFF}.rule{width:110px;height:5px;border-radius:9px;background:#0EA59A}
</style></head><body><main class="canvas"><section class="content"><span class="badge">${escapeHtml(badge)}</span>${organisation ? `<p class="organisation">${escapeHtml(organisation)}</p>` : ''}<h1 class="title">${escapeHtml(title)}</h1>${highlight ? `<p class="highlight">${escapeHtml(highlight)}</p>` : ''}</section><aside class="brand"><img src="${monogramDataUrl}" alt=""></aside><footer class="footer"><span><strong>Citizen Affairs</strong> · নাগরিকের প্রয়োজনীয় তথ্য</span><span class="rule"></span></footer></main></body></html>`;
}
