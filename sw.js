// Service worker: enables install + offline. Network-first so fresh deploys show immediately;
// falls back to cache when offline. This worker performs read-only static caching
// and does not collect application inputs.
// Installation is all-or-nothing: a claimed offline shell must have every
// declared core dependency, not a silently partial cache.
const CACHE='aaig-v88';
const CORE=[
 'index.html','manifest.webmanifest','evaluate.html','404.html','terms.enriched.json',
 'Agentic-AI-Governance-Chat.html','Agentic-AI-Governance-GroundTruth.html','Delta-Atlas-Start.html','Delta-Atlas-Field.html',
 'Agentic-AI-Governance-Query.html','Delta-Atlas-GapCheck.html','Delta-Atlas-Quick.html','Delta-Atlas-Tracer.html','primitives.json','Delta-Atlas-Primitives.html','Delta-Atlas-Canon.md',
 'Coherence-Audit.html','White-Paper.html','Six-Signal-Method.html',
 'lexicon-engine.js','coherence-score-engine.js',
 'Agentic-AI-Governance-Glossary.md','README-Portability.md','Translator-Framework-Design.md','Red-Team-Report.md','Coherence-Ledger-Method.md','LICENSE.txt',
 'icon-192.png','icon-512.png','icon-maskable-512.png','favicon.png'
];
self.addEventListener('install',e=>{ e.waitUntil(
  caches.open(CACHE).then(c=>Promise.all(CORE.map(u=>c.add(u)))).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(
  caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const sameOrigin = new URL(req.url).origin===location.origin;
  e.respondWith(
    fetch(req).then(r=>{
      if(sameOrigin && r && r.status===200){ const cp=r.clone(); caches.open(CACHE).then(c=>c.put(req,cp)); }
      return r;
    }).catch(()=> caches.match(req,{ignoreSearch:true}).then(m=> m || (req.mode==='navigate'? caches.match('index.html'): new Response('offline',{status:504,statusText:'offline'}))))
  );
});
