import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { useWebsite } from "../data/WebsiteContent";
import { applyPath, isLoan, servicePath, type Person, type Product } from "../data/content";
import { Icon, ServiceIcon } from "./Icon";

const external = /^(https?:|mailto:|tel:)/i;

// A link that works for both internal page paths and full web addresses.
export function SmartLink({
  to,
  className,
  children,
}: {
  to: string;
  className?: string;
  children: ReactNode;
}) {
  if (external.test(to))
    return (
      <a
        className={className}
        href={to}
        {...(/^https?:/i.test(to) ? { target: "_blank", rel: "noreferrer" } : {})}
      >
        {children}
      </a>
    );
  return (
    <Link className={className} to={to}>
      {children}
    </Link>
  );
}

// Photo header with a navy wash, used by the about, history, FAQ, team, gallery, contact, partners, downloads and application form pages. `children` sits in the bottom row.
export function HeroBanner({
  title,
  intro,
  image,
  children,
}: {
  title: string;
  intro: string;
  image: string;
  children?: ReactNode;
}) {
  return (
    <section className="hero-banner" style={{ backgroundImage: `url("${image}")` }}>
      <div className="container">
        <h1>{title}</h1>
        <p>{intro}</p>
        {children ? <div className="hero-banner-foot">{children}</div> : null}
      </div>
    </section>
  );
}

// Closing call to action shown just above the footer.
export function CtaBanner({
  heading,
  text,
  primary,
  secondary,
}: {
  heading: string;
  text: string;
  primary: [label: string, to: string];
  secondary: [label: string, to: string];
}) {
  return (
    <div className="container">
      <section className="cta-banner">
        <div>
          <h2>{heading}</h2>
          <p>{text}</p>
        </div>
        <div className="cta-banner-actions">
          <Link className="btn cta-banner-primary" to={primary[1]}>
            {primary[0]}
            <Icon name="arrow" />
          </Link>
          <Link className="btn cta-banner-secondary" to={secondary[1]}>
            {secondary[0]}
          </Link>
        </div>
      </section>
    </div>
  );
}

export function PageHeader({
  title,
  crumbs = [],
}: {
  title: string;
  crumbs?: [label: string, to: string][];
}) {
  const { copy: c } = useWebsite();
  usePageTitle(title);
  return (
    <section
      className="page-header"
      style={{ backgroundImage: `url("${c["shared.header-image"]}")` }}
    >
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">{c["shared.name"]}</Link>
          {crumbs.map(([label, to]) => (
            <span key={to}>
              <span aria-hidden="true">&gt;</span>
              <Link to={to}>{label}</Link>
            </span>
          ))}
          <span aria-hidden="true">&gt;</span>
          <span aria-current="page">{title}</span>
        </nav>
        <div className="page-title">
          <h1>{title}</h1>
        </div>
      </div>
    </section>
  );
}

export type Slide = {
  image: string;
  title: string;
  text?: string;
  button: string;
  link: string;
};

export function Slider({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;
  useEffect(() => {
    if (paused || count < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => window.clearInterval(timer);
  }, [paused, count]);
  const go = (step: number) => setIndex((i) => (i + step + count) % count);
  return (
    <section
      className="slider"
      aria-roledescription="carousel"
      aria-label="Highlights"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`slide${i === index ? " is-active" : ""}`}
          style={{ backgroundImage: `url("${slide.image}")` }}
          aria-roledescription="slide"
          aria-label={`${i + 1} of ${count}`}
          aria-hidden={i !== index}
        >
          <div className="container slide-content">
            <h2>{slide.title}</h2>
            {slide.text ? <p>{slide.text}</p> : null}
            <SmartLink to={slide.link} className="btn">
              {slide.button}
            </SmartLink>
          </div>
        </div>
      ))}
      {count > 1 ? (
        <>
          <button
            type="button"
            className="slider-arrow slider-prev"
            aria-label="Previous slide"
            onClick={() => go(-1)}
          >
            <Icon name="chevronLeft" />
          </button>
          <button
            type="button"
            className="slider-arrow slider-next"
            aria-label="Next slide"
            onClick={() => go(1)}
          >
            <Icon name="chevronRight" />
          </button>
          <div className="slider-dots">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Show slide ${i + 1}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}

// A loan or savings product card: the whole card opens the product page.
export function ProductCard({ product, showApply = true }: { product: Product; showApply?: boolean }) {
  const { copy: c } = useWebsite();
  return (
    <article className="product-card">
      <span className="product-card-icon">
        <ServiceIcon id={product.id} />
      </span>
      <h3>
        <Link to={servicePath(product.id)}>{product.title}</Link>
      </h3>
      <p>{product.description}</p>
      <div className="product-card-links">
        <span className="text-link" aria-hidden="true">
          {c["loans.learn-more"]}
          <Icon name="arrow" />
        </span>
        {showApply ? (
          <Link className="product-card-apply" to={applyPath(product.id)}>
            {isLoan(product.id) ? c["loans.apply-link"] : c["saving.apply"]}
          </Link>
        ) : null}
      </div>
    </article>
  );
}

export function ProductGrid({
  products,
  columns = 3,
  showApply = true,
}: {
  products: Product[];
  columns?: 3 | 4;
  showApply?: boolean;
}) {
  return (
    <div className={`product-grid product-grid-${columns}`}>
      {products.map((product) => (
        <ProductCard product={product} key={product.id} showApply={showApply} />
      ))}
    </div>
  );
}

export function HelpBanner() {
  const { copy: c, contact } = useWebsite();
  const actions = [
    ["calendar", "shared.help-apply-heading", "shared.help-apply-text", "shared.help-apply-button", "/loan-application-form/"],
    ["people", "shared.help-staff-heading", "shared.help-staff-text", "shared.help-staff-button", "/staff/"],
  ] as const;
  return (
    <section className="help-section">
      <div className="container help-layout">
        <div className="help-intro">
          <span className="eyebrow">{c["shared.help-eyebrow"]}</span>
          <h2>{c["shared.help-heading"]}</h2>
          <p>{c["shared.help-text"]}</p>
          <div className="help-actions">
            {actions.map(([icon, heading, text, button, to]) => (
              <Link className="help-action" to={to} key={to}>
                <span className="help-action-icon">
                  <Icon name={icon} />
                </span>
                <span className="help-action-body">
                  <strong>{c[heading]}</strong>
                  <span>{c[text]}</span>
                  <span className="help-action-link">{c[button]}</span>
                </span>
                <span className="help-action-arrow" aria-hidden="true">
                  <Icon name="arrow" />
                </span>
              </Link>
            ))}
          </div>
        </div>
        <aside className="help-contact">
          <span className="help-contact-icon">
            <Icon name="phone" />
          </span>
          <h3>{c["shared.help-call-heading"]}</h3>
          <p>{c["shared.help-call-text"]}</p>
          <ul className="help-phones">
            {contact.phones.map((phone) => (
              <li key={phone}>
                <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
              </li>
            ))}
          </ul>
          <a className="help-email" href={`mailto:${contact.email}`}>
            <Icon name="mail" />
            {contact.email}
          </a>
        </aside>
      </div>
    </section>
  );
}

// Each card opens the person's profile page at `${basePath}${slug}/`.
export function PeopleGrid({ people, basePath, viewLabel }: { people: Person[]; basePath: string; viewLabel: string }) {
  return (
    <div className="people-grid">
      {people.map(({ slug, name, role, photo }) => (
        <Link className="person" key={slug} to={`${basePath}${slug}/`}>
          <div className="person-photo">
            <img src={photo} alt="" loading="lazy" />
          </div>
          <div className="person-caption">
            <strong>{name}</strong>
            <span>{role}</span>
            <em className="person-view">
              {viewLabel}
              <Icon name="arrow" />
            </em>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function FaqList() {
  const { faqs } = useWebsite();
  return (
    <div className="accordion">
      {faqs.map(({ question, answer }, index) => (
        <details key={index} open={index === 0}>
          <summary>
            <span className="accordion-icon" aria-hidden="true">
              i
            </span>
            {question}
            <Icon name="chevronDown" />
          </summary>
          <p>{answer}</p>
        </details>
      ))}
    </div>
  );
}

// Sets the browser tab title for a page.
export function usePageTitle(title: string) {
  const { copy: c } = useWebsite();
  useEffect(() => {
    document.title = title ? `${title} – ${c["shared.name"]}` : `${c["shared.name"]} – People Helping People`;
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", document.title);
  }, [title, c]);
}

// Splits a text field on line breaks for lists.
export function lines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

// Splits a text field on blank lines for paragraphs.
export function paragraphs(value: string) {
  return value
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}
