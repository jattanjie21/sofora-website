import { useWebsite } from "../data/WebsiteContent";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { Icon } from "./Icon";

export function ButtonLink({
  to,
  children,
  secondary = false,
  className = "",
}: {
  to: string;
  children: ReactNode;
  secondary?: boolean;
  className?: string;
}) {
  return (
    <Link
      className={`button ${secondary ? "button-secondary" : "button-primary"} ${className}`}
      to={to}
    >
      {children}
      <Icon name="arrow" />
    </Link>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {children ? <p className="section-description">{children}</p> : null}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="page-hero">
      <div className="container">
        <p className="eyebrow">
          <span className="eyebrow-dot" />
          {eyebrow}
        </p>
        <h1>{title}</h1>
        <p className="page-intro">{children}</p>
      </div>
      <span className="hero-orbit" aria-hidden="true" />
    </section>
  );
}

export function JoinBanner() {
  const { copy: c } = useWebsite();
  return (
    <section className="join-section">
      <div className="container join-banner">
        <div>
          <p className="eyebrow">{c["shared.your-next-chapter-starts-here"]}</p>
          <h2>
            {c["shared.theres-more-we-can"]}
            <br />
            {c["shared.achieve-together"]}
          </h2>
          <p>{c["shared.a-place-to-save-support-to-grow"]}</p>
        </div>
        <ButtonLink to="/membership" className="button-light">
          {c["shared.become-a-member"]}
        </ButtonLink>
        <span className="banner-rings" aria-hidden="true" />
      </div>
    </section>
  );
}

export function Faqs() {
  const { copy: c, faqs } = useWebsite();
  return (
    <section className="section" id="faq">
      <div className="container faq-layout">
        <div>
          <SectionHeading
            eyebrow={c["shared.a-little-clarity"]}
            title={c["shared.good-questions-clear-answers"]}
          />
          <p className="muted">
            {c["shared.still-have-something-on-your-mind"]}
          </p>
          <Link className="text-link" to="/contact">
            {c["shared.lets-talk"]}
            <Icon name="arrow" />
          </Link>
        </div>
        <div className="faq-list">
          {faqs.map(({ question, answer }, index) => (
            <details key={index}>
              <summary>
                {question}
                <Icon name="plus" />
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
