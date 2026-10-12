import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { useWebsite } from "../data/WebsiteContent";
import type { Person } from "../data/content";
import { Icon, LoanIcon } from "./Icon";

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

export function LoanCards({ apply = false }: { apply?: boolean }) {
  const { copy: c, loans } = useWebsite();
  return (
    <div className="card-grid">
      {loans.map((loan) => (
        <article className="loan-card" key={loan.id}>
          <LoanIcon id={loan.id} />
          <h3>{loan.title}</h3>
          <p>{loan.description}</p>
          {apply ? (
            <Link
              className="text-link"
              to={`/loan-application-form/?product=${loan.id}`}
            >
              {c["loans.apply-link"]}
            </Link>
          ) : null}
        </article>
      ))}
    </div>
  );
}

export function HelpBanner() {
  const { copy: c, contact } = useWebsite();
  return (
    <section className="help-section">
      <div className="container">
        <div className="section-title">
          <h2>{c["shared.help-heading"]}</h2>
          <p>{c["shared.help-text"]}</p>
        </div>
        <div className="help-grid">
          <div className="help-item">
            <Icon name="calendar" />
            <h3>{c["shared.help-apply-heading"]}</h3>
            <p>{c["shared.help-apply-text"]}</p>
            <Link className="btn btn-outline" to="/loan-application-form/">
              {c["shared.help-apply-button"]}
            </Link>
          </div>
          <div className="help-item">
            <Icon name="phone" />
            <h3>{c["shared.help-call-heading"]}</h3>
            <p className="help-phones">{contact.phones.join(" | ")}</p>
            <a className="help-email" href={`mailto:${contact.email}`}>
              {contact.email}
            </a>
            <Link className="btn btn-outline" to="/contact-us/">
              {c["shared.help-contact-button"]}
            </Link>
          </div>
          <div className="help-item">
            <Icon name="people" />
            <h3>{c["shared.help-committee-heading"]}</h3>
            <p>{c["shared.help-committee-text"]}</p>
            <Link className="btn btn-outline" to="/loan-team/">
              {c["shared.help-committee-button"]}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PeopleGrid({ people }: { people: Person[] }) {
  return (
    <div className="people-grid">
      {people.map(([name, role, photo], index) => (
        <figure className="person" key={index}>
          <img src={photo} alt="" loading="lazy" />
          <figcaption>
            <span>{role}</span>
            <strong>{name}</strong>
          </figcaption>
        </figure>
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
