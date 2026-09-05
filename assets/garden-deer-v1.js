/* Optional garden wildlife. One small WebGL1 canvas; sleep between short poses.
 * The water renderer owns motion state. This module never changes that state.
 * Source artwork uses a chroma matte, composited once into local alpha textures.
 * A Canvas2D upright fallback remains available independently of WebGL.
 */
(() => {
  'use strict';
  const M = window.GardenDeerPose;
  const layer = document.getElementById('garden-deer');
  const scene = document.getElementById('garden-scene');
  const water = document.getElementById('garden-water');
  if (!M || !layer || !scene || !water || layer.dataset.initialized) return;
  layer.dataset.initialized = 'true';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const box = { x: 760, y: 490, width: 280, height: 225 };
  const rig = { root: [900,550], head: [1070,235], neckAngle: 1.95, headAngle: -0.85 };
  const animals = [
    { src: 'assets/garden-deer-mother-v1.webp', x: 780, y: 509, scale: .16, duration: 2.5/8, pose: 0, look: 0, raiseWait: 0, rig },
    { src: 'assets/garden-deer-young-v1.webp', x: 856, y: 592, scale: .095, duration: 2.9/8, pose: 0, look: 0, raiseWait: 0, rig },
  ];
  const fallback = document.createElement('canvas');
  const canvas = document.createElement('canvas');
  fallback.setAttribute('aria-hidden','true'); canvas.setAttribute('aria-hidden','true');
  layer.append(fallback, canvas);
  canvas.hidden = true;
  let ready = false, gl = null, program = null, buffer = null, index = null, uniforms = null;
  let failed = false, lost = false, raf = 0, previous = 0, target = 0, dirty = true;
  let frameCount = 0, cycle = 'drink', holdTimer = 0, alertImage = null, alertTexture = null;
  const columns = 32, rows = 24, vertices = [], indices = [];
  for (let y=0;y<=rows;y++) for(let x=0;x<=columns;x++) vertices.push([x/columns*1536,y/rows*1024]);
  for (let y=0;y<rows;y++) for(let x=0;x<columns;x++) {
    const a=y*(columns+1)+x,b=a+1,c=a+columns+1,d=c+1;
    indices.push(a,b,c,b,d,c);
  }
  const mesh = new Float32Array(vertices.length*4);

  function hidden() { return document.hidden || scene.hidden; }
  function cancel() { if(raf) cancelAnimationFrame(raf); if(holdTimer)clearTimeout(holdTimer);raf=0;holdTimer=0;previous=0; }
  function fallbackOnly(reason) {
    cancel(); failed=true; canvas.hidden=true; fallback.hidden=false;
    for(const a of animals){a.pose=0;a.look=0;a.raiseWait=0;}
    layer.dataset.state=reason; layer.dataset.pose='upright';
  }
  function keyedImage(image) {
    const c=document.createElement('canvas'); c.width=image.naturalWidth; c.height=image.naturalHeight;
    const ctx=c.getContext('2d',{willReadFrequently:true});
    if(!ctx) throw new Error('No local sprite compositor');
    ctx.drawImage(image,0,0);
    const pixels=ctx.getImageData(0,0,c.width,c.height), d=pixels.data;
    for(let i=0;i<d.length;i+=4) {
      const r=d[i]/255,g=d[i+1]/255,b=d[i+2]/255;
      const key=M.smooth((g-Math.max(r,b)-.12)/.28)*M.smooth((g-.35)/.30);
      d[i+3]=Math.round(255*(1-key));
      if(key>0) d[i+1]=Math.min(d[i+1],Math.round((Math.max(r,b)+.03)*255));
    }
    ctx.putImageData(pixels,0,0);
    return c;
  }
  function load(src) {
    return new Promise((resolve,reject)=>{
      const image=new Image(); image.decoding='async';
      image.onload=()=>image.naturalWidth===1536 && image.naturalHeight===1024 ? resolve(image) : reject(new Error('Unexpected sprite size'));
      image.onerror=()=>reject(new Error('Sprite unavailable'));
      image.src=src;
    });
  }
  function resize() {
    const rect=scene.getBoundingClientRect();
    if(!rect.width || !rect.height) return false;
    const map=M.coverCentered(1672,941,rect.width,rect.height);
    const width=box.width*map.scale,height=box.height*map.scale;
    Object.assign(layer.style,{left:(map.left+box.x*map.scale)+'px',top:(map.top+box.y*map.scale)+'px',width:width+'px',height:height+'px'});
    const dpr=Math.min(devicePixelRatio||1,2,Math.sqrt(350000/(width*height)));
    const w=Math.max(1,Math.round(width*dpr)),h=Math.max(1,Math.round(height*dpr));
    for(const c of [fallback,canvas]) { if(c.width!==w)c.width=w;if(c.height!==h)c.height=h; }
    const ctx=fallback.getContext('2d');
    if(!ctx) throw new Error('No fallback canvas');
    ctx.setTransform(w/box.width,0,0,h/box.height,0,0); ctx.clearRect(0,0,box.width,box.height);
    for(const a of animals) ctx.drawImage(a.image,a.x-box.x,a.y-box.y,1536*a.scale,1024*a.scale);
    if(gl && !lost) gl.viewport(0,0,w,h);
    dirty=false; return true;
  }
  function shader(type,source) {
    const s=gl.createShader(type); if(!s)throw new Error('Shader unavailable');
    gl.shaderSource(s,source); gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){gl.deleteShader(s);throw new Error('Shader failed');}
    return s;
  }
  function build() {
    if(gl && !lost) {
      for(const a of animals)if(a.texture)gl.deleteTexture(a.texture);
      if(alertTexture)gl.deleteTexture(alertTexture);
      if(buffer)gl.deleteBuffer(buffer);if(index)gl.deleteBuffer(index);if(program)gl.deleteProgram(program);
    }
    gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:true,depth:false,stencil:false,preserveDrawingBuffer:true,powerPreference:'low-power'});
    if(!gl)throw new Error('WebGL unavailable');
    const vs=shader(gl.VERTEX_SHADER,'attribute vec2 a_position;attribute vec2 a_uv;varying vec2 v_uv;void main(){v_uv=a_uv;gl_Position=vec4(a_position,0.0,1.0);}');
    const fs=shader(gl.FRAGMENT_SHADER,'precision mediump float;varying vec2 v_uv;uniform sampler2D u_image;uniform sampler2D u_alert;uniform float u_look;void main(){vec4 c=texture2D(u_image,v_uv);float head=smoothstep(940.0,990.0,v_uv.x*1536.0)*(1.0-smoothstep(290.0,370.0,v_uv.y*1024.0));c=mix(c,texture2D(u_alert,v_uv),head*u_look);gl_FragColor=vec4(c.rgb*vec3(0.83,0.88,0.80),c.a);}');
    program=gl.createProgram();if(!program)throw new Error('Program unavailable');
    gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Link failed');
    gl.useProgram(program);buffer=gl.createBuffer();index=gl.createBuffer();
    if(!buffer||!index)throw new Error('Buffer unavailable');
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,mesh.byteLength,gl.DYNAMIC_DRAW);
    const pos=gl.getAttribLocation(program,'a_position'),uv=gl.getAttribLocation(program,'a_uv');
    gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,16,0);
    gl.enableVertexAttribArray(uv);gl.vertexAttribPointer(uv,2,gl.FLOAT,false,16,8);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,index);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);
    gl.activeTexture(gl.TEXTURE0);gl.uniform1i(gl.getUniformLocation(program,'u_image'),0);
    uniforms={look:gl.getUniformLocation(program,'u_look')};
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
    for(const a of [...animals,{image:alertImage}]) {
      a.texture=gl.createTexture();if(!a.texture)throw new Error('Texture unavailable');
      gl.bindTexture(gl.TEXTURE_2D,a.texture);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,a.image);
      if(a.image===alertImage)alertTexture=a.texture;
    }
    gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,alertTexture);gl.uniform1i(gl.getUniformLocation(program,'u_alert'),1);gl.activeTexture(gl.TEXTURE0);
    gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.disable(gl.DEPTH_TEST);
    if(gl.getError()!==gl.NO_ERROR)throw new Error('GPU preparation failed');
    failed=false;lost=false;dirty=true;
  }
  function draw() {
    if(dirty && !resize())return false;
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
    for(const a of animals) {
      vertices.forEach(([x,y],i)=>{
        const p=M.transformPoint(x,y,a.pose,a.rig),n=i*4;
        mesh[n]=((a.x+p[0]*a.scale-box.x)/box.width)*2-1;
        mesh[n+1]=1-((a.y+p[1]*a.scale-box.y)/box.height)*2;
        mesh[n+2]=x/1536;mesh[n+3]=y/1024;
      });
      gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferSubData(gl.ARRAY_BUFFER,0,mesh);
      gl.uniform1f(uniforms.look,M.smooth(a.look));
      gl.bindTexture(gl.TEXTURE_2D,a.texture);gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0);
    }
    if(gl.isContextLost())return false;
    if(gl.getError()!==gl.NO_ERROR)throw new Error('GPU draw failed');
    fallback.hidden=true;canvas.hidden=false;
    layer.dataset.frameCount=String(++frameCount);
    layer.dataset.pose=animals.every(a=>a.pose===0&&a.look===1)?'alert':animals.every(a=>a.pose===1&&a.look===0)?'drinking':animals.every(a=>a.pose===0&&a.look===0)?'upright':'transitioning';
    layer.dataset.cycle=cycle;
    layer.dataset.state='ready'; return true;
  }
  function tick(now) {
    raf=0;
    if(hidden()||failed||lost||!ready){previous=0;return;}
    if(previous && now-previous<1000/30-.5){raf=requestAnimationFrame(tick);return;}
    const dt=previous?Math.min((now-previous)/1000,.08):0;previous=now;
    let changing=false;
    for(const a of animals) {
      const looking=target===1&&cycle==='raising'&&a.pose<.20;
      const poseGoal=target===0||cycle==='raising'||(cycle==='lowering'&&a.look>.05)?0:1;
      const lookGoal=looking?1:0;
      let step=dt;
      if(poseGoal===0&&a.raiseWait>0&&!reduced.matches){const wait=Math.min(step,a.raiseWait);a.raiseWait-=wait;step-=wait;}
      // Raising is a quick alert reflex; lowering travels at 60% of that speed.
      const duration=poseGoal>a.pose?a.duration/.6:a.duration;
      a.pose=reduced.matches?target:M.advance(a.pose,poseGoal,step,duration);
      a.look=reduced.matches?0:M.advance(a.look,lookGoal,step,.65);
      const finalPose=target===0||cycle==='raising'?0:1;
      const finalLook=target===1&&cycle==='raising'?1:0;
      if(a.pose!==(reduced.matches?target:finalPose)||a.look!==(reduced.matches?0:finalLook))changing=true;
    }
    try {
      if(!draw()){previous=0;return;}
      if(changing){raf=requestAnimationFrame(tick);}else{
        previous=0;
        if(cycle==='lowering')cycle='drink';
        if(target===1&&!reduced.matches){
          holdTimer=setTimeout(()=>{holdTimer=0;cycle=cycle==='drink'?'raising':'lowering';animals[1].raiseWait=cycle==='raising'?.5:0;reconcile();},cycle==='drink'?9000:2300);
        }
      }
    } catch(error) { fallbackOnly('fallback'); }
  }
  function reconcile() {
    const oldTarget=target;
    cancel();target=M.stateTarget(water.dataset.state,target);
    if(oldTarget!==0&&target===0)animals[1].raiseWait=animals[1].pose>0?.5:0;
    if(target===0||reduced.matches)cycle='drink';
    if(!ready||hidden())return;
    if(failed||lost){if(dirty)try{resize();}catch(error){}return;}
    if(reduced.matches)for(const a of animals){a.pose=target;a.look=0;a.raiseWait=0;}
    raf=requestAnimationFrame(tick);
  }
  const resized=()=>{dirty=true;reconcile();};
  new MutationObserver(reconcile).observe(water,{attributes:true,attributeFilter:['data-state']});
  new MutationObserver(reconcile).observe(scene,{attributes:true,attributeFilter:['hidden']});
  document.addEventListener('visibilitychange',reconcile);
  window.addEventListener('resize',resized,{passive:true});
  if(window.ResizeObserver)new ResizeObserver(resized).observe(scene);
  if(reduced.addEventListener)reduced.addEventListener('change',reconcile);else reduced.addListener(reconcile);
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;fallbackOnly('context-lost');});
  canvas.addEventListener('webglcontextrestored',()=>{
    try{build();reconcile();}catch(error){fallbackOnly('fallback');}
  });
  Promise.all([...animals.map(async a=>{a.image=keyedImage(await load(a.src));}),load('assets/garden-deer-alert-v1.webp').then(image=>{alertImage=keyedImage(image);})]).then(()=>{
    ready=true;
    try { resize();build();reconcile(); }catch(error){fallbackOnly('fallback');}
  }).catch(()=>{cancel();layer.hidden=true;layer.dataset.state='unavailable';});
})();
