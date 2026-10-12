import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import { useWebsite } from "../data/WebsiteContent";
import { Icon } from "./Icon";
import { SmartLink } from "./ui";
import { SearchForm } from "../pages/Search";

type MenuItem = { label: string; to?: string; children?: MenuItem[] };

function useMenu(): MenuItem[] {
  const { copy: c } = useWebsite();
  const partner = (name: string, url?: string) => ({ label: name, to: url });
  return [
    { label: c["shared.nav-home"], to: "/" },
    {
      label: c["shared.nav-about-us"],
      children: [
        { label: c["shared.nav-about"], to: "/about-us/" },
        { label: c["shared.nav-history"], to: "/history/" },
        { label: c["shared.nav-faq"], to: "/faq/" },
      ],
    },
    {
      label: c["shared.nav-team"],
      children: [
        { label: c["shared.nav-board"], to: "/board-of-directors/" },
        { label: c["shared.nav-staff"], to: "/staff/" },
      ],
    },
    {
      label: c["shared.nav-services"],
      children: [
        { label: c["shared.nav-loans"], to: "/loan-services/" },
        { label: c["shared.nav-saving"], to: "/saving/" },
        { label: c["shared.nav-downloads"], to: "/downloads/" },
        { label: c["shared.nav-member-login"], to: c["shared.member-login-url"] },
      ],
    },
    { label: c["shared.nav-blog"], to: "/blog/" },
    {
      label: c["shared.nav-partners"],
      children: [
        partner(c["shared.partner-1"], c["shared.partner-1-url"]),
        partner(c["shared.partner-2"], c["shared.partner-2-url"]),
        partner(c["shared.partner-3"], c["shared.partner-3-url"]),
        partner(c["shared.partner-4"], c["shared.partner-4-url"]),
        partner(c["shared.partner-5"]),
        partner(c["shared.partner-6"]),
        partner(c["shared.partner-7"], c["shared.partner-7-url"]),
      ],
    },
    {
      label: c["shared.nav-forms"],
      children: [
        { label: c["shared.nav-registration-form"], to: "/registration-form/" },
        { label: c["shared.nav-membership-form"], to: "/membership-application-form/" },
        { label: c["shared.nav-kafo-form"], to: "/kafo-application-form/" },
        { label: c["shared.nav-loan-form"], to: "/loan-application-form/" },
      ],
    },
    {
      label: c["shared.nav-gallery"],
      children: [
        { label: c["shared.nav-photos"], to: "/photo-gallery/" },
        { label: c["shared.nav-videos"], to: "/youtube-gallery/" },
      ],
    },
    { label: c["shared.nav-contact"], to: "/contact-us/" },
  ];
}

const samePage = (a: string, b: string) =>
  a.replace(/\/+$/, "") === b.replace(/\/+$/, "");

function Header() {
  const { copy: c } = useWebsite();
  const menu = useMenu();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const searchToggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    setOpen(false);
    setExpanded(null);
  }, [pathname]);

  return (
    <>
      <div className="top-bar">
        <div className="container">{c["shared.topbar"]}</div>
      </div>
      <header
        className="site-header"
        onKeyDown={(event) => {
          if (event.key !== "Escape") return;
          if (searching) {
            setSearching(false);
            searchToggle.current?.focus();
          } else if (expanded) setExpanded(null);
          else if (open) {
            setOpen(false);
            toggle.current?.focus();
          }
        }}
      >
        <div className="container header-inner">
          <Link to="/" className="logo" aria-label={c["shared.name"]}>
            <img src={c["shared.logo"]} alt={c["shared.name"]} width="66" height="66" />
          </Link>
          <button
            ref={toggle}
            className="menu-toggle"
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="navigation"
            onClick={() => setOpen(!open)}
          >
            <Icon name={open ? "close" : "menu"} />
          </button>
          <nav
            id="navigation"
            className={`navigation${open ? " is-open" : ""}`}
            aria-label="Main menu"
          >
            <ul>
              {menu.map((item) => {
                const active = item.children
                  ? item.children.some((child) => child.to && samePage(child.to, pathname))
                  : item.to !== undefined && samePage(item.to, pathname);
                if (!item.children)
                  return (
                    <li key={item.label}>
                      <NavLink to={item.to!} end className={active ? "active" : ""}>
                        {item.label}
                      </NavLink>
                    </li>
                  );
                const isExpanded = expanded === item.label;
                return (
                  <li
                    key={item.label}
                    className={`has-sub${isExpanded ? " is-expanded" : ""}`}
                    onMouseLeave={() => setExpanded(null)}
                  >
                    <button
                      type="button"
                      className={active ? "active" : ""}
                      aria-expanded={isExpanded}
                      onClick={() => setExpanded(isExpanded ? null : item.label)}
                    >
                      {item.label}
                      <Icon name="chevronDown" />
                    </button>
                    <ul>
                      {item.children.map((child) => (
                        <li key={child.label}>
                          {child.to ? (
                            <SmartLink to={child.to}>{child.label}</SmartLink>
                          ) : (
                            <span>{child.label}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </nav>
          <button
            ref={searchToggle}
            className="search-toggle"
            type="button"
            aria-label={c["shared.search-button"]}
            aria-expanded={searching}
            aria-controls="header-search-panel"
            onClick={() => setSearching(!searching)}
          >
            <Icon name={searching ? "close" : "search"} />
          </button>
        </div>
        {searching ? (
          <div className="header-search" id="header-search-panel">
            <div className="container">
              <SearchForm autoFocus onSearch={() => setSearching(false)} />
            </div>
          </div>
        ) : null}
      </header>
    </>
  );
}

function Footer() {
  const { copy: c } = useWebsite();
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <Link to="/" aria-label={c["shared.name"]}>
          <img src={c["shared.footer-logo"]} alt={c["shared.name"]} width="66" height="66" />
        </Link>
        <a className="footer-social" href={c["shared.twitter-url"]} target="_blank" rel="noreferrer">
          <Icon name="twitter" />
          {c["shared.twitter-label"]}
        </a>
      </div>
      <div className="footer-bottom">
        <div className="container">
          Copyright {new Date().getFullYear()} | {c["shared.copyright"]}
        </div>
      </div>
    </footer>
  );
}

export function Layout() {
  const { copy: c } = useWebsite();
  const { pathname, hash } = useLocation();
  const previousPath = useRef(pathname);
  useEffect(() => {
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", c["shared.description"]);
    const frame = requestAnimationFrame(() => {
      const target = hash ? document.getElementById(hash.slice(1)) : null;
      if (target) target.scrollIntoView();
      else window.scrollTo(0, 0);
      if (previousPath.current !== pathname)
        document.getElementById("main-content")?.focus({ preventScroll: true });
      previousPath.current = pathname;
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash, c]);

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
