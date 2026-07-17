/* ═══ GfredDream — repère glissant pour checklists ═══
   Pas de cases à cocher : un seul repère "tu es ici".
   Taper une étape la fait devenir le repère courant ; les étapes
   au-dessus s'estompent (implicitement faites). Rien n'est persisté :
   tout redémarre à zéro à chaque ouverture de page. */
(() => {
  'use strict';

  const list = document.getElementById('steps');
  if (!list) return;
  const items = Array.from(list.querySelectorAll('li.step'));
  const progressFill = document.getElementById('progressFill');
  const resetBtn = document.getElementById('resetBtn');

  function render(currentIndex){
    items.forEach((li, i) => {
      li.classList.remove('done', 'current');
      if (currentIndex === -1) return;
      if (i < currentIndex) li.classList.add('done');
      else if (i === currentIndex) li.classList.add('current');
    });
    if (progressFill){
      const pct = currentIndex === -1 ? 0 : Math.round(((currentIndex + 1) / items.length) * 100);
      progressFill.style.width = pct + '%';
    }
  }

  items.forEach((li, i) => {
    li.addEventListener('click', () => render(i));
  });

  if (resetBtn){
    resetBtn.addEventListener('click', () => render(-1));
  }

  render(-1); // toujours vierge à l'ouverture
})();
