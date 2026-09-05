import navigation from "../../design/navigation.json";

const icons: Record<string, string> = { Discord: "discord", X: "x", LinkedIn: "linkedin", YouTube: "youtube", GitHub: "github", Email: "mail" };
export default function FoundationFooter() {
  return <footer className="foundation-footer"><div className="foundation-footer-inner">
    <div className="foundation-footer-top">
      <img className="foundation-footer-logo" src="/foundation/wordmark.webp" width="1500" height="303" alt="Trilemma Foundation" loading="lazy" />
      <nav className="foundation-social" aria-label="Social links">{navigation.social.map(item => <a key={item.name} href={item.href} target="_blank" rel="noopener noreferrer" aria-label={`${item.fullName} (opens in a new tab)`}><span aria-hidden="true" style={{ display: "block", width: 20, height: 20, backgroundColor: "currentColor", mask: `url(/foundation/${icons[item.name]}.svg) center / contain no-repeat`, WebkitMask: `url(/foundation/${icons[item.name]}.svg) center / contain no-repeat` }} /></a>)}</nav>
    </div>
    <div className="foundation-footer-bottom"><p>© {new Date().getFullYear()} Trilemma Foundation. All rights reserved.</p><nav className="foundation-legal" aria-label="Legal links">{navigation.legal.map(item => <a key={item.href} href={`${navigation.foundationOrigin}${item.href}`}>{item.label}</a>)}</nav></div>
  </div></footer>;
}
