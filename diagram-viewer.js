(() => {
  let dialog;
  let viewport;
  let canvas;
  let output;
  let source;
  let size;
  let zoom = 1;
  let drag;
  let instance = 0;

  function setZoom(value, center = true) {
    const oldWidth = canvas.scrollWidth;
    const oldHeight = canvas.scrollHeight;
    const x = (viewport.scrollLeft + viewport.clientWidth / 2) / oldWidth;
    const y = (viewport.scrollTop + viewport.clientHeight / 2) / oldHeight;
    zoom = Math.max(0.05, Math.min(4, value));
    const svg = canvas.firstElementChild;
    svg.style.width = `${size.width * zoom}px`;
    svg.style.height = `${size.height * zoom}px`;
    canvas.style.width = `${size.width * zoom}px`;
    canvas.style.height = `${size.height * zoom}px`;
    output.value = `${Math.round(zoom * 100)}%`;
    dialog.querySelector('[data-action="out"]').disabled = zoom <= 0.05;
    dialog.querySelector('[data-action="in"]').disabled = zoom >= 4;
    if (center) {
      viewport.scrollLeft = x * canvas.scrollWidth - viewport.clientWidth / 2;
      viewport.scrollTop = y * canvas.scrollHeight - viewport.clientHeight / 2;
    }
  }

  function fit() {
    setZoom(Math.min(1, (viewport.clientWidth - 32) / size.width, (viewport.clientHeight - 32) / size.height), false);
    viewport.scrollTo(0, 0);
  }

  function createViewer() {
    dialog = document.createElement('dialog');
    dialog.className = 'diagram-viewer';
    dialog.setAttribute('aria-labelledby', 'diagram-viewer-title');
    dialog.innerHTML = `
      <div class="diagram-viewer__toolbar">
        <div class="diagram-viewer__heading">
          <span>Diagram</span>
          <h2 id="diagram-viewer-title">Diagram</h2>
        </div>
        <button type="button" data-action="close" aria-label="Close diagram" title="Close (Esc)">
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="m6 6 12 12M6 18 18 6"/></svg>
        </button>
      </div>
      <div class="diagram-viewer__stage">
      <div class="diagram-viewer__viewport" tabindex="0" role="region" aria-label="Diagram. Scroll or drag to pan; use the buttons to zoom.">
        <div class="diagram-viewer__canvas"></div>
      </div>
      <div class="diagram-viewer__controls" role="group" aria-label="Diagram zoom">
        <button type="button" data-action="out" aria-label="Zoom out" title="Zoom out">−</button>
        <output aria-live="polite" aria-label="Zoom level">100%</output>
        <button type="button" data-action="in" aria-label="Zoom in" title="Zoom in">+</button>
        <span class="diagram-viewer__separator" aria-hidden="true"></span>
        <button type="button" data-action="fit" title="Fit diagram to screen">Fit</button>
        <button type="button" data-action="actual" aria-label="Actual size (100%)" title="Actual size (100%)">1:1</button>
      </div>
      </div>`;
    document.body.append(dialog);
    viewport = dialog.querySelector('.diagram-viewer__viewport');
    canvas = dialog.querySelector('.diagram-viewer__canvas');
    output = dialog.querySelector('output');

    dialog.addEventListener('click', event => {
      const action = event.target.closest('[data-action]')?.dataset.action;
      if (action === 'out') setZoom(zoom / 1.25);
      if (action === 'in') setZoom(zoom * 1.25);
      if (action === 'fit') fit();
      if (action === 'actual') setZoom(1);
      if (action === 'close' || event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => {
      canvas.replaceChildren();
      document.documentElement.classList.remove('diagram-viewer-open');
      source?.focus({ preventScroll: true });
    });
    viewport.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      drag = { x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop };
      viewport.setPointerCapture(event.pointerId);
      viewport.classList.add('is-dragging');
      event.preventDefault();
      viewport.focus({ preventScroll: true });
    });
    viewport.addEventListener('pointermove', event => {
      if (!drag) return;
      viewport.scrollLeft = drag.left - (event.clientX - drag.x);
      viewport.scrollTop = drag.top - (event.clientY - drag.y);
    });
    viewport.addEventListener('lostpointercapture', () => {
      drag = null;
      viewport.classList.remove('is-dragging');
    });
  }

  function expand(button, diagram) {
    const original = diagram.querySelector('svg');
    if (!original) return;
    if (!dialog) createViewer();
    source = button;
    const pageTitle = document.querySelector('h1')?.textContent.trim() || 'Diagram';
    dialog.querySelector('h2').textContent = pageTitle;
    const svg = original.cloneNode(true);
    // Isolate the enlarged copy's CSS, markers, and accessibility references.
    const ids = new Map();
    const elements = [svg, ...svg.querySelectorAll('*')];
    instance += 1;
    elements.filter(element => element.id).forEach(element => {
      ids.set(element.id, `diagram-viewer-${instance}-${element.id}`);
    });
    const references = value => value.replace(/#([\w-]+)/g, (match, id) => ids.has(id) ? `#${ids.get(id)}` : match);
    elements.forEach(element => {
      if (element.id) element.id = ids.get(element.id);
      [...element.attributes].forEach(attribute => {
        if (attribute.name === 'aria-labelledby' || attribute.name === 'aria-describedby') {
          element.setAttribute(attribute.name, attribute.value.split(/\s+/).map(id => ids.get(id) || id).join(' '));
        } else if (attribute.name !== 'id') {
          element.setAttribute(attribute.name, references(attribute.value));
        }
      });
      if (element.tagName.toLowerCase() === 'style') element.textContent = references(element.textContent);
    });
    const viewBox = original.viewBox.baseVal;
    size = { width: viewBox.width, height: viewBox.height };
    canvas.replaceChildren(svg);
    dialog.showModal();
    document.documentElement.classList.add('diagram-viewer-open');
    fit();
    dialog.querySelector('[data-action="in"]').focus({ preventScroll: true });
  }

  function addExpandButtons() {
    document.querySelectorAll('.mermaid').forEach(diagram => {
      if (!diagram.querySelector('svg') || diagram.parentElement.classList.contains('diagram-block')) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'diagram-block';
      const toolbar = document.createElement('div');
      toolbar.className = 'diagram-toolbar';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'diagram-expand';
      button.setAttribute('aria-haspopup', 'dialog');
      button.innerHTML = '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H3v5M16 3h5v5M21 16v5h-5M3 16v5h5M3 3l6 6M21 3l-6 6M21 21l-6-6M3 21l6-6"/></svg><span>Expand diagram</span>';
      button.addEventListener('click', () => expand(button, diagram));
      toolbar.append(button);
      diagram.before(wrapper);
      wrapper.append(toolbar, diagram);
    });
  }

  window.addEventListener('diagramsRendered', addExpandButtons);
  window.addEventListener('themeChanged', () => { if (dialog?.open) dialog.close(); });
  window.addEventListener('resize', () => { if (dialog?.open) fit(); });
})();
