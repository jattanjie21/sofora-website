import { useWebsite } from "../data/WebsiteContent";
import { Icon, type IconName } from "../components/Icon";
import { Link, NavLink } from "react-router";
import { CtaBanner, FaqList, HeroBanner, PeopleGrid, lines, usePageTitle } from "../components/ui";

// Hero tabs shared by the About, History and FAQ pages.
function AboutTabs() {
  const { copy: c } = useWebsite();
  return (
    <nav className="gallery-tabs" aria-label={c["shared.nav-about-us"]}>
      <NavLink to="/about-us/">
        <Icon name="people" />
        {c["shared.nav-about"]}
      </NavLink>
      <NavLink to="/history/">
        <Icon name="calendar" />
        {c["shared.nav-history"]}
      </NavLink>
      <NavLink to="/faq/">
        <Icon name="book" />
        {c["shared.nav-faq"]}
      </NavLink>
    </nav>
  );
}

export function About() {
  const { copy: c } = useWebsite();
  usePageTitle(c["about.title"]);
  const stats: [IconName, string, string][] = [
    ["people", c["about.stat-1-value"], c["about.stat-1-label"]],
    ["wallet", c["about.stat-2-value"], c["about.stat-2-label"]],
    ["money", c["about.stat-3-value"], c["about.stat-3-label"]],
    ["home", c["about.stat-4-value"], c["about.stat-4-label"]],
  ];
  const intro: [IconName, string, string][] = [
    ["people", c["about.who-heading"], c["about.who-text"]],
    ["shield", c["about.why-heading"], c["about.why-text"]],
    ["sprout", c["about.vision-heading"], c["about.vision-text"]],
    ["check", c["about.mission-heading"], c["about.mission-text"]],
  ];
  const operating = ([1, 2, 3] as const).map((n) => ({
    title: c[`about.operating-${n}`],
    items: lines(c[`about.operating-${n}-items`]),
  }));
  return (
    <>
      <HeroBanner title={c["about.title"]} intro={c["about.intro"]} image={c["about.hero-image"]}>
        <AboutTabs />
      </HeroBanner>
      <div className="container">
        <ul className="service-highlights about-stats">
          {stats.map(([icon, value, label], index) => (
            <li key={index}>
              <span className="service-highlight-icon">
                <Icon name={icon} />
              </span>
              <span>
                <strong>{value}</strong>
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="container about-body">
        <div className="about-cards">
          {intro.map(([icon, heading, text]) => (
            <article className="contact-card" key={heading}>
              <span className="contact-card-icon">
                <Icon name={icon} />
              </span>
              <h3>{heading}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
      <section className="section services-section about-principles-section">
        <div className="container">
          <div className="section-title">
            <h2>{c["about.principles-heading"]}</h2>
            <p>{c["about.principles-text"]}</p>
          </div>
          <div className="about-principles">
            <article className="about-principle">
              <h3>{c["about.values-heading"]}</h3>
              <ul className="about-checks">
                {lines(c["about.values"]).map((item) => (
                  <li key={item}>
                    <Icon name="check" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
            <article className="about-principle">
              <h3>{c["about.cooperative-heading"]}</h3>
              <ol className="about-numbered">
                {lines(c["about.cooperative"]).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </article>
            <article className="about-principle">
              <h3>{c["about.operating-heading"]}</h3>
              <ol className="about-numbered">
                {operating.map(({ title, items }) => (
                  <li key={title}>
                    <strong>{title}</strong>
                    <ul className="about-subitems">
                      {items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </article>
          </div>
        </div>
      </section>
      <CtaBanner
        heading={c["about.cta-heading"]}
        text={c["about.cta-text"]}
        primary={[c["about.cta-button"], "/membership-application-form/"]}
        secondary={[c["about.cta-contact"], "/contact-us/"]}
      />
    </>
  );
}

export function History() {
  const { copy: c } = useWebsite();
  usePageTitle(c["history.title"]);
  const milestones = ([1, 2, 3] as const).map((n) => ({
    date: c[`history.p${n}-date`],
    title: c[`history.p${n}-title`],
    text: c[`history.p${n}`],
  }));
  return (
    <>
      <HeroBanner title={c["history.title"]} intro={c["history.intro"]} image={c["history.hero-image"]}>
        <AboutTabs />
      </HeroBanner>
      <div className="container history-body">
        <aside className="history-card">
          <img src={c["history.image"]} alt="" width="192" height="192" />
          <h2>{c["history.heading"]}</h2>
          <p>{c["history.name-text"]}</p>
        </aside>
        <ol className="timeline">
          {milestones.map(({ date, title, text }, index) => (
            <li key={index}>
              <span className="timeline-dot" aria-hidden="true" />
              <p className="timeline-date">{date}</p>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </div>
      <CtaBanner
        heading={c["history.cta-heading"]}
        text={c["history.cta-text"]}
        primary={[c["history.cta-button"], "/membership-application-form/"]}
        secondary={[c["history.cta-about"], "/about-us/"]}
      />
    </>
  );
}

export function Faq() {
  const { copy: c, contact } = useWebsite();
  usePageTitle(c["faq.title"]);
  return (
    <>
      <HeroBanner title={c["faq.title"]} intro={c["faq.intro"]} image={c["faq.hero-image"]}>
        <AboutTabs />
      </HeroBanner>
      <div className="container faq-body">
        <div>
          <h2>{c["faq.heading"]}</h2>
          <FaqList />
        </div>
        <aside className="contact-card faq-help">
          <span className="contact-card-icon">
            <Icon name="phone" />
          </span>
          <h3>{c["faq.help-heading"]}</h3>
          <p>{c["faq.help-text"]}</p>
          <ul className="faq-help-links">
            {contact.phones.map((phone) => (
              <li key={phone}>
                <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
              </li>
            ))}
            <li>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </li>
          </ul>
          <Link className="btn" to="/contact-us/">
            {c["faq.help-button"]}
            <Icon name="arrow" />
          </Link>
        </aside>
      </div>
      <CtaBanner
        heading={c["faq.cta-heading"]}
        text={c["faq.cta-text"]}
        primary={[c["faq.cta-button"], "/membership-application-form/"]}
        secondary={[c["faq.cta-loan"], "/loan-application-form/"]}
      />
    </>
  );
}

// Hero tabs shared by the two team pages.
function TeamTabs() {
  const { copy: c } = useWebsite();
  return (
    <nav className="gallery-tabs" aria-label={c["shared.nav-team"]}>
      <NavLink to="/board-of-directors/">
        <Icon name="shield" />
        {c["shared.nav-board"]}
      </NavLink>
      <NavLink to="/staff/">
        <Icon name="people" />
        {c["shared.nav-staff"]}
      </NavLink>
    </nav>
  );
}

export function Board() {
  const { copy: c, board } = useWebsite();
  usePageTitle(c["board.title"]);
  return (
    <>
      <HeroBanner title={c["board.title"]} intro={c["board.intro"]} image={c["board.hero-image"]}>
        <TeamTabs />
      </HeroBanner>
      <div className="container team-body">
        <PeopleGrid people={board} basePath="/board-of-directors/" viewLabel={c["board.profile-view"]} />
      </div>
      <CtaBanner
        heading={c["board.cta-heading"]}
        text={c["board.cta-text"]}
        primary={[c["board.cta-button"], "/membership-application-form/"]}
        secondary={[c["board.cta-about"], "/about-us/"]}
      />
    </>
  );
}

export function Staff({ loanTeam = false }: { loanTeam?: boolean }) {
  const { copy: c, staff } = useWebsite();
  const title = loanTeam ? c["staff.loan-team-title"] : c["staff.title"];
  usePageTitle(title);
  return (
    <>
      <HeroBanner title={title} intro={c["staff.intro"]} image={c["staff.hero-image"]}>
        <TeamTabs />
      </HeroBanner>
      <div className="container team-body">
        <PeopleGrid people={staff} basePath="/staff/" viewLabel={c["staff.profile-view"]} />
      </div>
      <CtaBanner
        heading={c["staff.cta-heading"]}
        text={c["staff.cta-text"]}
        primary={[c["staff.cta-button"], "/contact-us/"]}
        secondary={[c["staff.cta-member"], "/membership-application-form/"]}
      />
    </>
  );
}
