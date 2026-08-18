(function(){
  var STORE_SCALE = 'pda_a11y_scale';
  var STORE_CONTRAST = 'pda_a11y_contrast';
  var SCALES = [0.9, 1, 1.15, 1.3];
  var SCALE_LABELS = ['90%', '100%', '115%', '130%'];

  var css = ''
    + '#a11y-btn{position:fixed;left:16px;bottom:16px;width:48px;height:48px;border-radius:50%;'
    + 'background:#16243f;color:#fff;border:none;box-shadow:0 4px 14px rgba(0,0,0,.28);'
    + 'font-size:22px;cursor:pointer;z-index:9999;display:flex;align-items:center;justify-content:center}'
    + '#a11y-btn:hover{background:#233a63}'
    + '#a11y-panel{position:fixed;left:16px;bottom:72px;width:240px;background:#fff;color:#1a2330;'
    + 'border-radius:14px;box-shadow:0 10px 32px rgba(0,0,0,.28);padding:16px;z-index:9999;'
    + 'font-family:"Segoe UI",system-ui,sans-serif;display:none}'
    + '#a11y-panel.open{display:block}'
    + '#a11y-panel h3{font-size:13px;font-weight:800;margin:0 0 10px;color:#16243f}'
    + '.a11y-row{margin-bottom:12px}'
    + '.a11y-row label{display:block;font-size:11px;font-weight:700;color:#68788f;text-transform:uppercase;'
    + 'letter-spacing:.4px;margin-bottom:6px}'
    + '.a11y-fontctl{display:flex;align-items:center;gap:6px}'
    + '.a11y-fontctl button{flex:1;padding:8px 0;border:1.5px solid #e3e8f0;background:#fff;border-radius:8px;'
    + 'font-size:15px;font-weight:700;cursor:pointer;color:#16243f}'
    + '.a11y-fontctl button:hover{border-color:#16243f}'
    + '.a11y-fontctl span{font-size:11px;color:#68788f;min-width:36px;text-align:center}'
    + '#a11y-contrast-btn{width:100%;padding:9px 0;border:1.5px solid #e3e8f0;background:#fff;border-radius:8px;'
    + 'font-size:13px;font-weight:700;cursor:pointer;color:#16243f}'
    + '#a11y-contrast-btn:hover{border-color:#16243f}'
    + '#a11y-contrast-btn.active{background:#16243f;color:#fff;border-color:#16243f}'
    + '#a11y-reset{width:100%;padding:7px 0;border:none;background:none;font-size:11px;color:#68788f;'
    + 'text-decoration:underline;cursor:pointer}'
    + 'html.a11y-contrast, html.a11y-contrast body{background:#fff !important;color:#000 !important}'
    + 'html.a11y-contrast *{background-color:transparent !important;background-image:none !important;'
    + 'color:#000 !important;border-color:#000 !important;box-shadow:none !important;text-shadow:none !important}'
    + 'html.a11y-contrast *::before, html.a11y-contrast *::after{background-image:none !important}'
    + 'html.a11y-contrast body, html.a11y-contrast div, html.a11y-contrast section, html.a11y-contrast header,'
    + 'html.a11y-contrast footer, html.a11y-contrast nav, html.a11y-contrast main, html.a11y-contrast article{'
    + 'background-color:#fff !important;color:#000 !important}'
    + 'html.a11y-contrast a{color:#0645ad !important;text-decoration:underline !important}'
    + 'html.a11y-contrast button, html.a11y-contrast input, html.a11y-contrast select, html.a11y-contrast textarea{'
    + 'background-color:#fff !important;color:#000 !important;border:2px solid #000 !important}'
    + 'html.a11y-contrast #pbar, html.a11y-contrast #pb, html.a11y-contrast .progress-bar,'
    + 'html.a11y-contrast .pbar, html.a11y-contrast .pbar-fill, html.a11y-contrast .ov-pbar{'
    + 'background:#0645ad !important}'
    + 'html.a11y-contrast .progress, html.a11y-contrast .pbar-wrap,'
    + 'html.a11y-contrast .pbar-bg, html.a11y-contrast .ov-pbar-wrap{'
    + 'background:rgba(0,0,0,.15) !important}'
    + 'html.a11y-contrast .a11y-btnish{border:2px solid #000 !important;border-radius:8px !important}'
    + 'html.a11y-contrast #a11y-btn{background:#16243f !important;color:#fff !important;border:2px solid #16243f !important}'
    + 'html.a11y-contrast #a11y-panel{background:#fff !important;color:#000 !important;border:2px solid #000 !important}'
    + 'html.a11y-contrast #a11y-panel h3, html.a11y-contrast .a11y-row label{color:#000 !important}'
    + 'html.a11y-contrast .a11y-fontctl button, html.a11y-contrast #a11y-contrast-btn{'
    + 'background:#fff !important;color:#000 !important;border:1.5px solid #000 !important}'
  ;

  function injectStyle(){
    var s = document.createElement('style');
    s.textContent = css;
    document.head.appendChild(s);
  }

  function applyScale(idx){
    document.documentElement.style.zoom = SCALES[idx];
    var lbl = document.getElementById('a11y-scale-label');
    if(lbl) lbl.textContent = SCALE_LABELS[idx];
    localStorage.setItem(STORE_SCALE, idx);
  }

  function applyContrast(on){
    document.documentElement.classList.toggle('a11y-contrast', on);
    var btn = document.getElementById('a11y-contrast-btn');
    if(btn){
      btn.classList.toggle('active', on);
      btn.textContent = on ? '✓ Hoher Kontrast an' : 'Hoher Kontrast';
    }
    localStorage.setItem(STORE_CONTRAST, on ? '1' : '0');
  }

  function markButtonLinks(root){
    (root || document).querySelectorAll('a, button').forEach(function(el){
      if(el.id === 'a11y-btn' || el.classList.contains('a11y-btnish')) return;
      var cs = getComputedStyle(el);
      var isBlockish = cs.display !== 'inline';
      var hasPadding = parseFloat(cs.paddingTop) > 2 || parseFloat(cs.paddingLeft) > 4;
      if(isBlockish || hasPadding) el.classList.add('a11y-btnish');
    });
  }

  function watchForNewButtons(){
    var pending = false;
    var observer = new MutationObserver(function(){
      if(pending) return;
      pending = true;
      setTimeout(function(){ pending = false; markButtonLinks(); }, 150);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function build(){
    var savedScaleIdx = parseInt(localStorage.getItem(STORE_SCALE), 10);
    if(isNaN(savedScaleIdx) || savedScaleIdx < 0 || savedScaleIdx >= SCALES.length) savedScaleIdx = 1;
    var savedContrast = localStorage.getItem(STORE_CONTRAST) === '1';

    applyScale(savedScaleIdx);
    if(savedContrast) document.documentElement.classList.add('a11y-contrast');

    var btn = document.createElement('button');
    btn.id = 'a11y-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Barrierefreiheits-Einstellungen öffnen');
    btn.textContent = '♿';

    var panel = document.createElement('div');
    panel.id = 'a11y-panel';
    panel.innerHTML =
      '<h3>Anzeige anpassen</h3>' +
      '<div class="a11y-row">' +
        '<label>Schriftgröße</label>' +
        '<div class="a11y-fontctl">' +
          '<button type="button" id="a11y-font-minus" aria-label="Schrift verkleinern">A−</button>' +
          '<span id="a11y-scale-label">' + SCALE_LABELS[savedScaleIdx] + '</span>' +
          '<button type="button" id="a11y-font-plus" aria-label="Schrift vergrößern">A+</button>' +
        '</div>' +
      '</div>' +
      '<div class="a11y-row">' +
        '<label>Kontrast</label>' +
        '<button type="button" id="a11y-contrast-btn">' + (savedContrast ? '✓ Hoher Kontrast an' : 'Hoher Kontrast') + '</button>' +
      '</div>' +
      '<button type="button" id="a11y-reset">Zurücksetzen</button>';
    if(savedContrast) panel.querySelector('#a11y-contrast-btn').classList.add('active');

    document.body.appendChild(btn);
    document.body.appendChild(panel);

    var scaleIdx = savedScaleIdx;

    btn.addEventListener('click', function(){
      panel.classList.toggle('open');
    });
    document.addEventListener('click', function(e){
      if(!panel.contains(e.target) && e.target !== btn) panel.classList.remove('open');
    });
    document.getElementById('a11y-font-minus').addEventListener('click', function(){
      scaleIdx = Math.max(0, scaleIdx - 1);
      applyScale(scaleIdx);
    });
    document.getElementById('a11y-font-plus').addEventListener('click', function(){
      scaleIdx = Math.min(SCALES.length - 1, scaleIdx + 1);
      applyScale(scaleIdx);
    });
    document.getElementById('a11y-contrast-btn').addEventListener('click', function(){
      applyContrast(!document.documentElement.classList.contains('a11y-contrast'));
    });
    document.getElementById('a11y-reset').addEventListener('click', function(){
      scaleIdx = 1;
      applyScale(scaleIdx);
      applyContrast(false);
    });

    markButtonLinks();
    watchForNewButtons();
  }

  injectStyle();
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
