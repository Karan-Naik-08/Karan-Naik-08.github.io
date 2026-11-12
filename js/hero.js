/* Liquid-type WebGL hero. window.startHero() -> Promise<boolean>. Falls back to the HTML <h1> if anything fails. */
window.startHero = async function () {
  const canvas = document.getElementById('hero-canvas');
  const hero = document.getElementById('hero');
  const meta = hero.querySelector('.hero-meta');
  let gl;
  try { gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false }); } catch (e) {}
  if (!gl) return false;

  const vs = 'attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
  const fs = `precision mediump float;
varying vec2 uv;uniform sampler2D t;uniform vec2 m,res,tilt;uniform float v,time;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
void main(){
  vec2 p=uv, c=p-.5;
  p=.5+c*(1.+c.x*tilt.x+c.y*tilt.y);            // fake perspective tilt
  vec2 d=p-m; d.x*=res.x/res.y; float r=length(d);
  float inf=exp(-r*r*10.)*(.25+v);
  vec2 fl=vec2(n(p*5.+time*.35),n(p*5.-time*.3+7.))-.5;
  vec2 dir=d/(r+1e-4); dir.x*=res.y/res.x;
  p+=fl*(.012+inf*.05)+dir*sin(r*34.-time*5.)*inf*.035;
  vec2 ca=dir*(.0012+inf*.008);
  float a=texture2D(t,p+ca).a, b=texture2D(t,p).a, g=texture2D(t,p-ca).a;
  vec3 base=mix(vec3(.925,.91,.875),vec3(1.,.29,.11),clamp(inf*2.2,0.,1.));
  vec3 col=base*vec3(a,b,g);
  gl_FragColor=vec4(col, max(a,max(b,g)));
}`;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link');
  } catch (e) { return false; }
  gl.useProgram(prog);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = {}; ['t','m','res','tilt','v','time'].forEach(k => U[k] = gl.getUniformLocation(prog, k));
  const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]].forEach(([a, b]) => gl.texParameteri(gl.TEXTURE_2D, a, b));
  gl.uniform1i(U.t, 0);

  try { await Promise.race([document.fonts.load('700 100px "Fraunces Variable"'), new Promise(r => setTimeout(r, 1500))]); } catch (e) {}

  const txt = document.createElement('canvas'), cx = txt.getContext('2d');
  const FONT = '"Fraunces Variable", Georgia, "Times New Roman", serif';
  function layout() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = Math.max(1, Math.round(hero.clientWidth * dpr)), H = Math.max(1, Math.round(hero.clientHeight * dpr));
    canvas.width = txt.width = W; canvas.height = txt.height = H;
    gl.viewport(0, 0, W, H);
    const gut = parseFloat(getComputedStyle(hero).paddingLeft) * dpr;
    const reserveB = (meta.offsetHeight + parseFloat(getComputedStyle(hero).paddingBottom) + 24) * dpr;
    cx.clearRect(0, 0, W, H);
    cx.fillStyle = '#fff'; cx.textBaseline = 'alphabetic'; cx.textAlign = 'left';
    cx.font = `700 100px ${FONT}`; try { cx.letterSpacing = '-4px'; } catch (e) {}
    const w100 = Math.max(cx.measureText('KARAN').width, cx.measureText('NAIK').width);
    const availH = H - reserveB - 70 * dpr;
    const portrait = H > W * 1.1;
    let s = (W - gut * 2) / w100 * 100 * 0.965;
    // portrait phones: tall-condensed lettering to fill the empty height
    const ys = portrait ? Math.min(2.1, Math.max(1, availH / (1.72 * s))) : 1;
    if (!portrait) s = Math.min(s, availH / 1.72);
    cx.font = `700 ${s}px ${FONT}`; try { cx.letterSpacing = (-0.04 * s) + 'px'; } catch (e) {}
    const base2 = (H - reserveB) / ys;
    cx.save(); cx.scale(1, ys);
    cx.fillText('KARAN', gut - s * 0.03, base2 - s * 0.78);
    cx.fillText('NAIK', gut - s * 0.03, base2);
    cx.restore();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, txt);
    gl.uniform2f(U.res, W, H);
  }
  layout();
  let rt; new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(layout, 120); }).observe(hero);

  const tgt = { x: .5, y: .4 }, cur = { x: .5, y: .4 }; let vel = 0, lastMove = -1e9, visible = true, raf = 0, last = performance.now();
  hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width, ny = 1 - (e.clientY - r.top) / r.height;
    vel = Math.min(1, vel + Math.hypot(nx - tgt.x, ny - tgt.y) * 6);
    tgt.x = nx; tgt.y = ny; lastMove = performance.now();
  });
  hero.addEventListener('pointerdown', e => { const r = hero.getBoundingClientRect(); tgt.x = (e.clientX - r.left) / r.width; tgt.y = 1 - (e.clientY - r.top) / r.height; vel = 1.6; lastMove = performance.now(); });
  function frame(now) {
    raf = 0;
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (now - lastMove > 2200) { tgt.x = .5 + .32 * Math.sin(now / 1900); tgt.y = .38 + .16 * Math.sin(now / 1300); vel = Math.max(vel, .22); }
    cur.x += (tgt.x - cur.x) * Math.min(1, dt * 7); cur.y += (tgt.y - cur.y) * Math.min(1, dt * 7);
    vel *= Math.pow(.04, dt);
    gl.uniform2f(U.m, cur.x, cur.y); gl.uniform1f(U.v, vel); gl.uniform1f(U.time, now / 1000);
    gl.uniform2f(U.tilt, (cur.y - .5) * .5, (cur.x - .5) * -.5);
    gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (visible && !document.hidden) raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!raf && visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  new IntersectionObserver(es => { visible = es[0].isIntersecting; kick(); }).observe(hero);
  document.addEventListener('visibilitychange', kick);
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); cancelAnimationFrame(raf); raf = 0; visible = false; document.documentElement.classList.remove('gl'); });
  kick();
  return true;
};
