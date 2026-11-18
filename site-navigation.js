(() => {
  const header = document.querySelector('.site-header');
  const toggle = header?.querySelector('.site-menu-toggle');
  const navigation = document.getElementById('primary-navigation');
  if (!toggle || !navigation) return;

  const mobile = window.matchMedia('(max-width: 800px)');
  header.classList.add('site-menu-ready');

  function sizeMenu() {
    const top = navigation.getBoundingClientRect().top;
    navigation.style.setProperty('--site-menu-top', `${Math.max(0, top)}px`);
  }

  function setOpen(open) {
    toggle.setAttribute('aria-expanded', String(open));
    header.classList.toggle('site-menu-open', open);
    if (open) sizeMenu();
  }

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (!header.contains(event.target)) setOpen(false);
  });

  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });

  header.addEventListener('focusout', (event) => {
    if (!header.contains(event.relatedTarget)) setOpen(false);
  });

  mobile.addEventListener('change', () => setOpen(false));
  window.addEventListener('resize', () => {
    if (mobile.matches && toggle.getAttribute('aria-expanded') === 'true') sizeMenu();
  });
})();
