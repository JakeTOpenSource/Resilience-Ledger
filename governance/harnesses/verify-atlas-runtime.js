#!/usr/bin/env node
'use strict';
const fs=require('fs'), path=require('path');
const root=path.resolve(__dirname,'../..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const fail=m=>{throw new Error(m);};
const contract=JSON.parse(read('governance/contracts/atlas-runtime-contract.v1.json'));
if(contract.type!=='delta-atlas-runtime-contract'||contract.version!==1) fail('contract identity');
const sw=read('sw.js');
if(!sw.includes("const CACHE='aaig-v91'")) fail('cache version');
if(/allSettled/.test(sw)) fail('install must not accept partial cache');
if(!/Promise\.all\(CORE\.map\(u=>c\.add\(u\)\)\)/.test(sw)) fail('install is not fail-closed');
const coreMatch=sw.match(/const CORE=\[([\s\S]*?)\];/); if(!coreMatch) fail('CORE not found');
const core=[...coreMatch[1].matchAll(/'([^']+)'/g)].map(m=>m[1]);
for(const asset of contract.offline.required_shared_engines) if(!core.includes(asset)) fail('shared engine omitted: '+asset);
for(const html of core.filter(p=>p.endsWith('.html'))){
  const source=read(html);
  for(const m of source.matchAll(/<script\s+src="([^"]+)"/g)){
    const asset=m[1];
    if(asset.includes('.local.')) continue;
    if(!core.includes(asset)) fail(html+' depends on uncached '+asset);
  }
}
const continuity=read('Delta-Atlas-ContinuityAudit.html');
for(const forbidden of ["fetch('continuity-overlay",'eval(']) if(continuity.includes(forbidden)) fail('forbidden overlay path: '+forbidden);
for(const required of ["const OVERLAY_FILE_LABEL='continuity-overlay.local.json'",'JSON.parse(raw)','literalPattern','OVERLAY_REL_TYPES',"type=\"file\"",'file.size>256*1024','file.text()']) if(!continuity.includes(required)) fail('missing overlay control: '+required);
// Replay the page's real parser from the HTML. These are deliberately hostile inputs:
// a duplicate ID, an unknown relation endpoint, a code-shaped flag, and regex metacharacters.
const inline=[...continuity.matchAll(/<script(?: src="([^"]+)")?>([\s\S]*?)<\/script>/g)].find(m=>!m[1]&&m[2].includes('BASE_KB'))[2];
const cut=inline.indexOf('// RUNTIME_BINDING_START'); if(cut<0) fail('runtime binding marker missing');
const parserScope={}, doc={getElementById:()=>({value:'',textContent:'',className:'',scrollIntoView(){}})};
new Function('document','LexiconEngine','CoherenceScoreEngine',inline.slice(0,cut)+'\nthis.parseOverlay=parseOverlay;').call(parserScope,doc,require(path.join(root,'lexicon-engine.js')),require(path.join(root,'coherence-score-engine.js')));
const valid={type:'delta-atlas-continuity-overlay',version:1,terms:[{id:'private-check',name:'Private check',purpose:'control',cluster:'Private',acct:'human',aliases:['private check']}],relations:[['private-check','single-point-of-failure','mitigates']],redFlags:[{t:'Literal check',d:'A literal pattern only.',phrases:['x.*y']}],bridge:{'single-point-of-failure':['single owner']}};
const parsed=parserScope.parseOverlay(JSON.stringify(valid)); if(!parsed||!parsed.redFlags[0].re.test('x.*y')||parsed.redFlags[0].re.test('xZZy')) fail('literal data overlay parsing');
if(!parserScope.parseOverlay(read('continuity-overlay.sample.json'))) fail('published overlay sample does not satisfy the data-only parser');
for(const mutant of [Object.assign({},valid,{terms:[Object.assign({},valid.terms[0],{id:'single-point-of-failure'})]}),Object.assign({},valid,{relations:[['missing','single-point-of-failure','mitigates']]}),Object.assign({},valid,{redFlags:[{t:'bad',d:'bad',re:'/.*/'}]})]) if(parserScope.parseOverlay(JSON.stringify(mutant))!==null) fail('overlay adversarial rejection');
const hostile=JSON.parse(JSON.stringify(valid));
hostile.redFlags=[{t:'<img src=x onerror=alert(1)>',d:'<svg onload=alert(2)>',phrases:['hostile marker']}];
const hostileParsed=parserScope.parseOverlay(JSON.stringify(hostile));
if(!hostileParsed || hostileParsed.redFlags[0].t!=='&lt;img src=x onerror=alert(1)&gt;' || hostileParsed.redFlags[0].d!=='&lt;svg onload=alert(2)&gt;') fail('overlay display fields are not escaped');
const hostileKb=JSON.parse(JSON.stringify(valid)); hostileKb.redFlags=hostileParsed.redFlags;
const hostileFinding=require(path.join(root,'lexicon-engine.js')).analyze('hostile marker',hostileKb).findings[0];
if(/<(?:img|svg)\b/i.test(hostileFinding.t+hostileFinding.dt)) fail('hostile overlay reaches the finding sink as markup');
const quick=read('Delta-Atlas-Quick.html');
for(const required of ["type:'delta-atlas-prefill'",'version:PREFILL_VERSION','expires_at:now+PREFILL_TTL_MS','one_use:true']) if(!quick.includes(required)) fail('missing prefill contract: '+required);
for(const receiver of ['Delta-Atlas-GapCheck.html','Coherence-Audit.html']){
  const source=read(receiver);
  for(const required of ["raw!==null)localStorage.removeItem(key)","type!=='delta-atlas-prefill'",'one_use!==true','expires_at<=now','lifetime>15*60*1000']) if(!source.includes(required)) fail(receiver+' missing one-use/expiry receiver gate: '+required);
}
const chat=read('Agentic-AI-Governance-Chat.html');
for(const required of ["type:'delta-atlas-ask-misses'",'MISS_TTL_MS=30*24*60*60*1000','expires_at:now+MISS_TTL_MS','localStorage.removeItem(MISSKEY)']) if(!chat.includes(required)) fail('missing miss-storage control: '+required);
const home=read('index.html');
for(const required of ["type:'delta-atlas-query'",'version:1,query:q','contentWindow.postMessage',"replaceFrameLocation(fr,'Agentic-AI-Governance-Chat.html#embed')", "['delta_prefill','deltaAtlasAskMisses','deltaAtlasVerifyChecked']"]) if(!home.includes(required)) fail('missing in-memory query or erase-all control: '+required);
if(/fr\.src\s*=\s*['"]Agentic-AI-Governance-Chat\.html#embed/.test(home)) fail('query child navigation adds a joint-session-history entry');
if(/Agentic-AI-Governance-Chat\.html\?q=|URLSearchParams\(location\.search\)/.test(home+'\n'+chat)) fail('submitted query can enter a request URL');
const headers=read('_headers');
const globalBlock=headers.match(/^\/\*\n((?:  .*\n)+)/m);
if(!globalBlock) fail('global header baseline missing');
for(const exact of [
  'Referrer-Policy: strict-origin-when-cross-origin',
  'X-Content-Type-Options: nosniff',
  'X-Frame-Options: SAMEORIGIN',
  'Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()'
]) if(!globalBlock[1].split('\n').map(line=>line.trim()).includes(exact)) fail('global header baseline mismatch: '+exact);
if(/Content-Security-Policy:/.test(globalBlock[1])) fail('untested broad CSP entered the global baseline');
for(const route of contract.headers.covered_routes){
  const block=headers.match(new RegExp('^'+route.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\n((?:  .*\\n)+)','m'));
  if(!block) fail('header block missing: '+route);
  for(const name of contract.headers.required) if(!block[1].includes(name+':')) fail(route+' missing '+name);
  if(contract.headers.iframe_routes.includes(route)&&!block[1].includes('X-Frame-Options: SAMEORIGIN')) fail(route+' iframe policy');
}
console.log('atlas-runtime PASS: contract, cache closure, fail-closed install, local data-only overlay, typed in-memory query handoff, bounded storage, and covered headers');
