(function(){
  /* mobile nav toggle */
  var toggle = document.getElementById('navToggle');
  var panel = document.getElementById('mobileNav');
  if(toggle && panel){
    toggle.addEventListener('click', function(){
      var isOpen = panel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    panel.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        panel.classList.remove('open');
        toggle.setAttribute('aria-expanded','false');
      });
    });
  }

  /* desktop dropdown (click-to-toggle; CSS handles hover) */
  document.querySelectorAll('.has-dropdown').forEach(function(item){
    var trigger = item.querySelector('.dropdown-trigger');
    if(!trigger) return;
    trigger.addEventListener('click', function(e){
      e.stopPropagation();
      var isOpen = item.classList.toggle('open');
      trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.querySelectorAll('.has-dropdown').forEach(function(other){
        if(other !== item){
          other.classList.remove('open');
          var t = other.querySelector('.dropdown-trigger');
          if(t) t.setAttribute('aria-expanded','false');
        }
      });
    });
  });
  document.addEventListener('click', function(){
    document.querySelectorAll('.has-dropdown.open').forEach(function(item){
      item.classList.remove('open');
      var t = item.querySelector('.dropdown-trigger');
      if(t) t.setAttribute('aria-expanded','false');
    });
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){
      document.querySelectorAll('.has-dropdown.open').forEach(function(item){
        item.classList.remove('open');
        var t = item.querySelector('.dropdown-trigger');
        if(t){ t.setAttribute('aria-expanded','false'); t.focus(); }
      });
    }
  });

  /* lightbox */
  var overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.setAttribute('role','dialog');
  overlay.setAttribute('aria-modal','true');
  overlay.setAttribute('aria-label','תצוגת תכשיט מוגדלת');
  overlay.innerHTML =
    '<button class="lb-close" type="button" aria-label="סגירה">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg>' +
    '</button>' +
    '<button class="lb-prev" type="button" aria-label="התכשיט הקודם">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>' +
    '</button>' +
    '<figure class="lb-figure"><img class="lb-img" alt=""><figcaption class="lb-caption"></figcaption></figure>' +
    '<button class="lb-next" type="button" aria-label="התכשיט הבא">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>' +
    '</button>' +
    '<div class="lb-counter"></div>';
  document.body.appendChild(overlay);

  var imgEl = overlay.querySelector('.lb-img');
  var capEl = overlay.querySelector('.lb-caption');
  var counterEl = overlay.querySelector('.lb-counter');
  var closeBtn = overlay.querySelector('.lb-close');
  var prevBtn = overlay.querySelector('.lb-prev');
  var nextBtn = overlay.querySelector('.lb-next');

  var currentSet = [];
  var currentIndex = 0;
  var lastFocused = null;

  function show(index){
    if(!currentSet.length) return;
    currentIndex = (index + currentSet.length) % currentSet.length;
    var item = currentSet[currentIndex];
    imgEl.src = item.src;
    imgEl.alt = item.alt;
    capEl.textContent = item.alt;
    counterEl.textContent = (currentIndex + 1) + ' / ' + currentSet.length;
  }

  function openLightbox(set, index, trigger){
    currentSet = set;
    lastFocused = trigger || document.activeElement;
    show(index);
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
    document.addEventListener('keydown', onKeydown);
  }

  function closeLightbox(){
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKeydown);
    if(lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  function onKeydown(e){
    if(e.key === 'Escape'){ closeLightbox(); }
    else if(e.key === 'ArrowLeft'){ show(currentIndex + 1); } /* RTL: left continues reading = next */
    else if(e.key === 'ArrowRight'){ show(currentIndex - 1); }
  }

  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', function(){ show(currentIndex - 1); });
  nextBtn.addEventListener('click', function(){ show(currentIndex + 1); });
  overlay.addEventListener('click', function(e){ if(e.target === overlay) closeLightbox(); });

  /* touch swipe (RTL: swipe left = next, swipe right = prev) */
  var touchStartX = 0, touchStartY = 0, touchActive = false;
  overlay.addEventListener('touchstart', function(e){
    if(e.touches.length !== 1) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchActive = true;
  }, {passive:true});
  overlay.addEventListener('touchend', function(e){
    if(!touchActive) return;
    touchActive = false;
    var dx = e.changedTouches[0].clientX - touchStartX;
    var dy = e.changedTouches[0].clientY - touchStartY;
    if(Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    if(dx < 0){ show(currentIndex + 1); } else { show(currentIndex - 1); }
  }, {passive:true});

  document.querySelectorAll('.gallery-grid, .feat-grid').forEach(function(grid){
    var thumbs = Array.prototype.slice.call(grid.querySelectorAll('.thumb'));
    if(!thumbs.length) return;
    var set = thumbs.map(function(btn){
      return { src: btn.getAttribute('data-full'), alt: btn.getAttribute('data-alt') || '' };
    });
    thumbs.forEach(function(btn, i){
      btn.addEventListener('click', function(){ openLightbox(set, i, btn); });
    });
  });
})();
