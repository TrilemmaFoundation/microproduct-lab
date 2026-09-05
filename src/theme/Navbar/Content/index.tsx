import { useEffect, useRef } from 'react';
import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';
import { useNavbarMobileSidebar } from '@docusaurus/theme-common/internal';
import SearchBar from '@theme/SearchBar';

const links = [ ['Humans', '/docs/request-for-microproducts'], ['Agents', '/agents'], ['Templates', '/templates'], ['Showcase', '/showcase'] ];

export default function NavbarContent() {
  const { pathname } = useLocation();
  const sidebar = useNavbarMobileSidebar();
  const pageToggle = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = header.current;
    if (!node) return;
    const update = () => document.documentElement.style.setProperty('--foundation-shell-height', `${node.getBoundingClientRect().height}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => { observer.disconnect(); document.documentElement.style.removeProperty('--foundation-shell-height'); };
  }, []);
  const currentPath = useRef(pathname);
  currentPath.current = pathname;
  useEffect(() => {
    if (!sidebar.shown) return;
    const openedPath = currentPath.current;
    const covered = [...document.querySelectorAll<HTMLElement>('.playbook-header, .main-wrapper, footer, [class*=skipToContent]')];
    const previous = covered.map(node => node.inert);
    covered.forEach(node => { node.inert = true; });
    const frame = requestAnimationFrame(() => document.querySelector<HTMLElement>('.navbar-sidebar__close')?.focus());
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') { event.preventDefault(); sidebar.toggle(); }
      if (event.key !== 'Tab') return;
      const controls = [...document.querySelectorAll<HTMLElement>('.navbar-sidebar a[href], .navbar-sidebar button')]
        .filter(node => node.getClientRects().length && !node.closest('[inert]'));
      const first = controls[0]; const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKey);
      covered.forEach((node, index) => { node.inert = previous[index]; });
      if (currentPath.current === openedPath) pageToggle.current?.focus();
      else {
        const main = document.querySelector<HTMLElement>('main');
        if (main) { main.tabIndex = -1; main.focus({ preventScroll: true }); }
      }
    };
  }, [sidebar.shown, sidebar.toggle]);
  return <div ref={header} className="playbook-header foundation-local-nav">
    <nav className="foundation-local-inner playbook-tools" aria-label="Playbook navigation">
      <Link to="/" className="foundation-local-brand">Build Playbook</Link>
      {!sidebar.disabled && <button ref={pageToggle} type="button" className="playbook-page-toggle" aria-label="Open page navigation" aria-expanded={sidebar.shown} onClick={sidebar.toggle}>Pages</button>}
      <div className="playbook-links">{links.map(([label, to]) => <Link key={to} to={to} aria-current={pathname === to || pathname.startsWith(`${to}/`) || (label === 'Humans' && pathname.startsWith('/docs/')) ? 'page' : undefined}>{label}</Link>)}</div>
      <div className="playbook-search"
        onKeyDown={event => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            // Use browser geometry; the plugin overcounts the panel padding.
            event.currentTarget.querySelector('[role="option"][aria-selected="true"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
          }
          if (event.key !== 'Escape' || !(event.target instanceof HTMLInputElement)) return;
          // The plugin blurs on close and opens on native focus. Restore focus
          // without reopening; subsequent user focus keeps the native behavior.
          const input = event.target;
          const keepClosed = (focusEvent: FocusEvent) => focusEvent.stopImmediatePropagation();
          input.addEventListener('focus', keepClosed, true);
          input.focus({ preventScroll: true });
          input.removeEventListener('focus', keepClosed, true);
        }}><SearchBar /></div>
    </nav>
  </div>;
}
