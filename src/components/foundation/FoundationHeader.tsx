"use client";

import { useEffect, useRef, useState, type AnchorHTMLAttributes, type ComponentType, type ReactNode } from "react";
import navigation from "../../design/navigation.json";

type Destination = { id: string; label: string; href: string; newTab?: boolean; description?: string; activePaths?: string[] };
type Group = { id: string; label: string; items: Destination[] };
type LocalLink = ComponentType<AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }>;
interface Props {
  app: "data" | "playbook";
  pathname: string;
  LinkComponent: LocalLink;
  children: ReactNode;
  onBeforeOpen?: () => void;
}

export default function FoundationHeader({ app, pathname, LinkComponent, children, onBeforeOpen }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState<string | null>(null);
  const [mobileGroup, setMobileGroup] = useState<string | null>(null);
  const header = useRef<HTMLElement>(null);
  const drawer = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const triggers = useRef<Record<string, HTMLButtonElement | null>>({});
  const pointerWasOpen = useRef(false);
  const hoverOpened = useRef(false);
  const suppressFocus = useRef(false);

  function close(restore = true) {
    setMobileOpen(false);
    setMobileGroup(null);
    if (restore) toggle.current?.focus();
  }

  useEffect(() => {
    const node = header.current;
    if (!node) return;
    const previous = document.documentElement.style.getPropertyValue("--foundation-shell-height");
    const update = () => document.documentElement.style.setProperty("--foundation-shell-height", `${node.getBoundingClientRect().height}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => { observer.disconnect(); document.documentElement.style.setProperty("--foundation-shell-height", previous); };
  }, []);

  // Keep background controls out of keyboard and assistive-technology navigation.
  useEffect(() => {
    if (!mobileOpen) return;
    const nodes = [...document.querySelectorAll<HTMLElement>("main, footer, [data-foundation-background], .main-wrapper, .skip-link, [class*=skipToContent], .foundation-local-nav")];
    const previous = nodes.map(node => node.inert);
    nodes.forEach(node => { node.inert = true; });
    const y = window.scrollY;
    const body = document.body;
    const saved = { position: body.style.position, top: body.style.top, width: body.style.width, overflow: body.style.overflow };
    Object.assign(body.style, { position: "fixed", top: `-${y}px`, width: "100%", overflow: "hidden" });
    drawer.current?.querySelector<HTMLElement>("a,button")?.focus();
    return () => {
      nodes.forEach((node, i) => { node.inert = previous[i]; });
      Object.assign(body.style, saved);
      window.scrollTo({ top: y, behavior: "instant" });
    };
  }, [mobileOpen]);

  useEffect(() => {
    function keydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (mobileOpen) { event.preventDefault(); close(); }
        else if (groupOpen) { setGroupOpen(null); suppressFocus.current = true; triggers.current[groupOpen]?.focus(); suppressFocus.current = false; }
      }
      if (event.key !== "Tab" || !mobileOpen) return;
      const items = [toggle.current, ...Array.from(drawer.current?.querySelectorAll<HTMLElement>("a[href],button") ?? [])].filter((node): node is HTMLElement => !!node);
      const first = items[0]; const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    function outside(event: PointerEvent) {
      if (!header.current?.contains(event.target as Node)) setGroupOpen(null);
    }
    document.addEventListener("keydown", keydown);
    document.addEventListener("pointerdown", outside);
    return () => { document.removeEventListener("keydown", keydown); document.removeEventListener("pointerdown", outside); };
  }, [mobileOpen, groupOpen]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    function reset() {
      const wasInMenu = drawer.current?.contains(document.activeElement) || document.activeElement === toggle.current;
      setMobileOpen(false); setMobileGroup(null); setGroupOpen(null);
      if (wasInMenu && desktop.matches) header.current?.querySelector<HTMLElement>(".foundation-logo")?.focus();
    }
    desktop.addEventListener("change", reset);
    window.addEventListener("foundation-close-menu", reset);
    return () => { desktop.removeEventListener("change", reset); window.removeEventListener("foundation-close-menu", reset); };
  }, []);

  const [previousPath, setPreviousPath] = useState(pathname);
  if (previousPath !== pathname) {
    setPreviousPath(pathname);
    setMobileOpen(false);
    setMobileGroup(null);
    setGroupOpen(null);
  }

  function link(item: Destination, mobile = false) {
    const url = new URL(item.href, navigation.foundationOrigin);
    const local = url.origin === navigation.origins[app];
    const href = local ? `${url.pathname}${url.search}${url.hash}` : url.href;
    const current = local && (url.pathname === "/" || pathname === url.pathname || pathname.startsWith(`${url.pathname}/`));
    const newTab = !local && item.newTab;
    const content = <><span>{item.label}</span>{item.description && !mobile && <span className="foundation-nav-description">{item.description}</span>}{newTab && <span className="foundation-sr-only"> (opens in a new tab)</span>}</>;
    const props = { href, className: "foundation-nav-link", "aria-current": current ? "page" as const : undefined, onClick: () => { setGroupOpen(null); if (mobile) close(!!newTab || (local && url.pathname === pathname)); } };
    return local ? <LinkComponent key={item.id} {...props}>{content}</LinkComponent> : <a key={item.id} {...props} target={newTab ? "_blank" : undefined} rel={newTab ? "noopener noreferrer" : undefined}>{content}</a>;
  }

  function disclosure(group: Group, mobile = false) {
    const open = mobile ? mobileGroup === group.id : groupOpen === group.id;
    const id = `${mobile ? "mobile" : "desktop"}-${group.id}-panel`;
    return <div key={group.id} className="foundation-disclosure"
      onMouseEnter={mobile ? undefined : () => { hoverOpened.current = groupOpen !== group.id; setGroupOpen(group.id); }}
      onMouseLeave={mobile ? undefined : event => { if (!event.currentTarget.contains(document.activeElement)) setGroupOpen(null); }}
      onFocusCapture={mobile ? undefined : () => { if (!suppressFocus.current) setGroupOpen(group.id); }}
      onBlur={mobile ? undefined : event => { if (!event.currentTarget.contains(event.relatedTarget)) setGroupOpen(null); }}>
      <button type="button" className="foundation-nav-trigger" aria-expanded={open} aria-controls={id}
        ref={node => { if (!mobile) triggers.current[group.id] = node; }}
        onPointerDown={() => { pointerWasOpen.current = open && !hoverOpened.current; hoverOpened.current = false; }}
        onClick={event => { if (mobile) setMobileGroup(open ? null : group.id); else setGroupOpen((event.detail === 0 ? open : pointerWasOpen.current) ? null : group.id); }}
        onKeyDown={event => { if (event.key === "ArrowDown") { event.preventDefault(); setGroupOpen(group.id); } }}>
        {group.label}<span aria-hidden="true">⌄</span>
      </button>
      {open && <div id={id} className={mobile ? "foundation-mobile-group" : "foundation-dropdown"}><div className={mobile ? undefined : "foundation-dropdown-inner"}>{group.items.map(item => link(item, mobile))}</div></div>}
    </div>;
  }

  return <header className="foundation-header" ref={header}>
    <div className="foundation-header-bar">
      <nav className="foundation-desktop foundation-desktop--left" aria-label="Primary">
        {navigation.header.filter(item => item.placement === "left").map(item => item.items ? disclosure(item as Group) : link(item as Destination))}
      </nav>
      <a href={navigation.foundationOrigin} className="foundation-logo" aria-label="Trilemma Foundation home" inert={mobileOpen}>
        <img src="/foundation/symbol.svg" width="40" height="40" alt="" />
      </a>
      <nav className="foundation-desktop foundation-desktop--right" aria-label="Primary actions">
        {navigation.header.filter(item => item.placement === "right").map(item => item.items ? disclosure(item as Group) : link(item as Destination))}
      </nav>
      <button type="button" ref={toggle} className="foundation-menu-toggle" aria-label={mobileOpen ? "Close site menu" : "Open site menu"} aria-expanded={mobileOpen} aria-controls="foundation-mobile-navigation" onClick={() => { if (mobileOpen) close(); else { onBeforeOpen?.(); setMobileOpen(true); } }}><span aria-hidden="true">{mobileOpen ? "✕" : "☰"}</span></button>
    </div>
    {mobileOpen && <nav ref={drawer} className="foundation-mobile" id="foundation-mobile-navigation" aria-label="Mobile site navigation">{navigation.header.map(item => item.items ? disclosure(item as Group, true) : link(item as Destination, true))}</nav>}
    <div className="foundation-local-nav">{children}</div>
  </header>;
}
