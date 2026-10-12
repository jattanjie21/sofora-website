import { useWebsite } from "../data/WebsiteContent";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import { Icon } from "./Icon";

function Brand({ footer = false }: { footer?: boolean }) {
  const { copy: c } = useWebsite();
  return (
    <Link
      to="/"
      className={`brand ${footer ? "brand-footer" : ""}`}
      aria-label={c["shared.sofora-cooperative-credit-union-home"]}
    >
      <img
        src={c["shared.imagessoforalogopng"]}
        alt={c["shared.image"]}
        width="65"
        height="64"
      />
      <span>
        <strong>
          {c["shared.sofora"]}
          <span className="brand-period">.</span>
        </strong>
        <small>{c["shared.cooperative-credit-union"]}</small>
      </span>
    </Link>
  );
}

function Header() {
  const { copy: c, contact } = useWebsite();
  const navigation = [
    ["/", c["shared.home"]],
    ["/about", c["shared.about-us"]],
    ["/savings", c["shared.savings"]],
    ["/loans", c["shared.loans"]],
    ["/community", c["shared.community"]],
  ] as const;

  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);

  return (
    <>
      <div className="utility-bar">
        <div className="container utility-content">
          <span>{c["shared.people-helping-people-since-2011"]}</span>
          <a href={`tel:${contact.phones[0]?.replace(/\s/g, "") ?? ""}`}>
            <Icon name="phone" />
            {contact.phones[0]}
            <span className="utility-contact">
              {c["shared.lets-talk-2"]}
              <Icon name="northeast" />
            </span>
          </a>
        </div>
      </div>
      <header
        className="site-header"
        onKeyDown={(event) => {
          if (event.key === "Escape" && open) {
            setOpen(false);
            toggle.current?.focus();
          }
        }}
      >
        <div className="container header-content">
          <Brand />
          <button
            ref={toggle}
            className="menu-toggle"
            type="button"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="main-navigation"
            onClick={() => setOpen(!open)}
          >
            <Icon name={open ? "close" : "menu"} />
          </button>
          <nav
            id="main-navigation"
            className={`main-navigation ${open ? "is-open" : ""}`}
            aria-label={c["shared.main-navigation"]}
            onClick={(event) => {
              if ((event.target as HTMLElement).closest("a")) setOpen(false);
            }}
          >
            <div className="nav-links">
              {navigation.map(([to, label]) => (
                <NavLink key={to} to={to} end={to === "/"}>
                  {label}
                </NavLink>
              ))}
            </div>
            <div className="nav-actions">
              <NavLink to="/contact" className="nav-contact">
                {c["shared.contact-us"]}
              </NavLink>
              <Link
                to="/membership"
                className="button button-primary button-small"
              >
                {c["shared.join-sofora"]}
                <Icon name="northeast" />
              </Link>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}

function Footer() {
  const { copy: c, contact } = useWebsite();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-about">
            <Brand footer />
            <p>
              {c["shared.small-steps-shared-dreams"]}
              <br />
              {c["shared.a-stronger-future-together"]}
            </p>
            <span className="location-label">
              <Icon name="pin" />
              {c["shared.rooted-in-the-gambia"]}
            </span>
          </div>
          <div>
            <h2>{c["shared.explore-sofora"]}</h2>
            <Link to="/about">{c["shared.our-story"]}</Link>
            <Link to="/about#our-people">{c["shared.our-people"]}</Link>
            <Link to="/community">{c["shared.our-community"]}</Link>
            <Link to="/membership">{c["shared.become-a-member-2"]}</Link>
          </div>
          <div>
            <h2>{c["shared.for-your-future"]}</h2>
            <Link to="/savings">{c["shared.savings-2"]}</Link>
            <Link to="/loans">{c["shared.loans-2"]}</Link>
            <Link to="/loans#calculator">{c["shared.loan-calculator"]}</Link>
            <Link to="/membership#faq">{c["shared.common-questions"]}</Link>
          </div>
          <div className="footer-contact">
            <h2>{c["shared.lets-talk-3"]}</h2>
            <a href={`tel:${contact.phones[0]?.replace(/\s/g, "") ?? ""}`}>
              {contact.phones[0]}
            </a>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
            <p>{contact.address}</p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()}
            {c["shared.sofora-cooperative-credit-union"]}
          </span>
          <span>{c["shared.memberowned-communityfocused"]}</span>
          <a href="#top" aria-label={c["shared.back-to-top"]}>
            {c["shared.back-to-top-2"]}
            <Icon name="arrow" />
          </a>
        </div>
      </div>
    </footer>
  );
}

export function Layout() {
  const { copy: c } = useWebsite();
  const pageMetadata: Record<string, [string, string]> = {
    "/": [
      c["shared.growing-together"],
      c["shared.people-helping-people-discover-savings-loans-and"],
    ],
    "/about": [
      c["shared.about-us-2"],
      c["shared.discover-the-story-values-and-people-behind"],
    ],
    "/savings": [
      c["shared.savings-3"],
      c["shared.explore-personal-group-business-and-childrens-savings"],
    ],
    "/loans": [
      c["shared.loans-3"],
      c["shared.explore-soforas-loan-options-and-use-our"],
    ],
    "/membership": [
      c["shared.become-a-member-3"],
      c["shared.find-out-how-to-join-sofora-cooperative"],
    ],
    "/community": [
      c["shared.our-community-2"],
      c["shared.discover-the-people-and-shared-saving-culture"],
    ],
    "/contact": [
      c["shared.contact-us-2"],
      c["shared.call-email-or-visit-sofora-cooperative-credit"],
    ],
  };
  const { pathname, hash } = useLocation();
  const previousPath = useRef(pathname);

  const pagePath = pathname.replace(/\/+$/, "") || "/";
  const [title, description] = pageMetadata[pagePath] ?? [
    c["shared.page-not-found"],
    c["shared.find-your-way-back-to-sofora-cooperative"],
  ];
  useEffect(() => {
    document.title = `Sofora Cooperative Credit Union — ${title}`;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", description);
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute("content", document.title);
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute("content", description);
    const frame = requestAnimationFrame(() => {
      const target = hash ? document.getElementById(hash.slice(1)) : null;
      if (target) target.scrollIntoView();
      else window.scrollTo(0, 0);
      if (previousPath.current !== pathname) {
        document.getElementById("main-content")?.focus({ preventScroll: true });
      }
      previousPath.current = pathname;
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash, title, description]);

  return (
    <div id="top">
      <a href="#main-content" className="skip-link">
        {c["shared.skip-to-content"]}
      </a>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
