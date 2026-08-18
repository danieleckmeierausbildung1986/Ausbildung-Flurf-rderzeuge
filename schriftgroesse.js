(function(){
  var STORE_KEY = 'pda_font_scale';
  var SCALES = [0.9, 1, 1.15, 1.3];

  var css = ''
    + '#fs-ctl{position:fixed;left:16px;bottom:16px;display:flex;align-items:center;gap:4px;'
    + 'background:#16243f;border-radius:24px;padding:6px;box-shadow:0 4px 14px rgba(0,0,0,.28);z-index:9999}'
    + '#fs-ctl button{width:32px;height:32px;border-radius:50%;border:none;background:transparent;color:#fff;'
    + 'font-size:14px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;'
    + 'font-family:"Segoe UI",system-ui,sans-serif}'
    + '#fs-ctl button:hover{background:rgba(255,255,255,.15)}'
    + '#fs-ctl span{color:#fff;font-size:10px;font-weight:700;min-width:28px;text-align:center;'
    + 'font-family:"Segoe UI",system-ui,sans-serif}'
  ;

  function injectStyle(){
    var s = document.createElement('style');
    s.textContent = css;
    document.head.appendChild(s);
  }

  function applyScale(idx){
    document.documentElement.style.zoom = SCALES[idx];
    var lbl = document.getElementById('fs-label');
    if(lbl) lbl.textContent = Math.round(SCALES[idx]*100) + '%';
    localStorage.setItem(STORE_KEY, idx);
  }

  function build(){
    var idx = parseInt(localStorage.getItem(STORE_KEY), 10);
    if(isNaN(idx) || idx < 0 || idx >= SCALES.length) idx = 1;
    applyScale(idx);

    var wrap = document.createElement('div');
    wrap.id = 'fs-ctl';
    wrap.innerHTML =
      '<button type="button" id="fs-minus" aria-label="Schrift verkleinern">A−</button>' +
      '<span id="fs-label">' + Math.round(SCALES[idx]*100) + '%</span>' +
      '<button type="button" id="fs-plus" aria-label="Schrift vergrößern">A+</button>';
    document.body.appendChild(wrap);

    document.getElementById('fs-minus').addEventListener('click', function(){
      idx = Math.max(0, idx - 1);
      applyScale(idx);
    });
    document.getElementById('fs-plus').addEventListener('click', function(){
      idx = Math.min(SCALES.length - 1, idx + 1);
      applyScale(idx);
    });
  }

  injectStyle();
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
