/* Give every circular label the same spacing, including the closing separator. */
(function () {
  function ring() {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 200 200');
    svg.setAttribute('aria-hidden', 'true');
    svg.classList.add('dewford-brand-ring');
    const label = 'DEWFORD · LEARN · THINK · EXPRESS · ';
    Array.from(label).forEach((letter, index) => {
      if (letter === ' ') return;
      const text = document.createElementNS(ns, 'text');
      text.setAttribute('x', '100');text.setAttribute('y', '30');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('transform', 'rotate(' + index * 360 / label.length + ' 100 100)');
      text.textContent = letter;svg.append(text);
    });
    return svg;
  }
  function setup() {
    document.querySelectorAll('.dewford-subpage-emblem-ring').forEach(el => el.replaceWith(ring()));
    document.querySelectorAll('.dewford-circle-label').forEach(el => {
      if (el.textContent.replace(/\s/g, '').includes('DEWFORD')) el.replaceChildren(ring());
    });
    const photo = document.querySelector('#dewford-photo-break-2 .elementor-element-b96ac9f');
    if (photo) {
      const overlay = document.createElement('div');
      overlay.id = 'color';overlay.setAttribute('aria-hidden', 'true');photo.append(overlay);
      const emblem = document.createElement('div');emblem.className = 'dewford-photo-emblem';
      emblem.setAttribute('role', 'img');emblem.setAttribute('aria-label', 'Dewford');
      emblem.append(ring());
      const symbol = document.createElement('img');symbol.src = 'assets/images/dewford/symbol_3.png';symbol.alt = '';
      emblem.append(symbol);photo.append(emblem);
    }
  }
  // Run after the theme's circular-text plugin has finished splitting letters.
  if (document.readyState === 'complete') setup();else window.addEventListener('load', setup, {once:true});
})();
