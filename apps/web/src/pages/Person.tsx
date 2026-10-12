import { Link, useParams } from "react-router";
import { useWebsite } from "../data/WebsiteContent";
import type { Person } from "../data/content";
import { Icon } from "../components/Icon";
import { CtaBanner, PeopleGrid, lines, usePageTitle } from "../components/ui";
import { NotFound } from "./NotFound";

type Group = "board" | "staff";
const basePaths: Record<Group, string> = { board: "/board-of-directors/", staff: "/staff/" };

// Profile page of one board member (/board-of-directors/<slug>/) or staff member (/staff/<slug>/).
export function PersonProfile({ group }: { group: Group }) {
  const { slug } = useParams();
  const people = useWebsite()[group];
  const person = people.find((p) => p.slug === slug);
  return person ? <Profile key={person.slug} group={group} person={person} people={people} /> : <NotFound />;
}

// "Mrs Fatou Kolley Gaye" -> "Fatou", for headings such as "About Fatou".
const firstName = (name: string) => name.replace(/^(mrs|mr|ms|miss|dr)\.?\s+/i, "").split(/\s+/)[0] ?? name;

function Profile({ group, person, people }: { group: Group; person: Person; people: Person[] }) {
  const { copy: c, contact } = useWebsite();
  usePageTitle(person.name);
  const text = (key: string) => c[`${group}.${key}` as keyof typeof c].replaceAll("{name}", firstName(person.name));
  const base = basePaths[group];
  const others = people.filter((p) => p.slug !== person.slug).slice(0, 4);
  const paragraphs = person.bio.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const focus = lines(person.focus);
  const phone = contact.phones[0];
  return (
    <>
      <section className="hero-banner profile-hero" style={{ backgroundImage: `url("${c[`${group}.hero-image`]}")` }}>
        <div className="container profile-hero-grid">
          <div className="profile-portrait">
            <img src={person.photo} alt={person.name} />
          </div>
          <div className="profile-intro">
            <Link className="profile-back" to={base}>
              <Icon name="chevronLeft" />
              {text("profile-back")}
            </Link>
            <h1>{person.name}</h1>
            <span className="profile-role">{person.role}</span>
            {person.quote ? <blockquote className="profile-quote">{person.quote}</blockquote> : null}
            {person.since ? (
              <p className="profile-since">
                <Icon name="calendar" />
                {text("profile-since-label")} {person.since}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <div className="container profile-layout">
        <div className="profile-main">
          {paragraphs.length ? (
            <section>
              <h2>{text("profile-bio-heading")}</h2>
              {paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </section>
          ) : null}
          {focus.length ? (
            <section>
              <h2>{text("profile-focus-heading")}</h2>
              <ul className="profile-focus">
                {focus.map((item) => (
                  <li key={item}>
                    <Icon name="check" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
        <aside className="profile-aside">
          <div className="profile-card">
            <h3>{text("profile-facts-heading")}</h3>
            <dl>
              <div>
                <dt>{text("profile-role-label")}</dt>
                <dd>{person.role}</dd>
              </div>
              {person.since ? (
                <div>
                  <dt>{text("profile-since-label")}</dt>
                  <dd>{person.since}</dd>
                </div>
              ) : null}
            </dl>
          </div>
          <div className="profile-card profile-card-navy">
            <h3>{text("profile-contact-heading")}</h3>
            <p>{text("profile-contact-text")}</p>
            {person.email ? (
              <a className="btn btn-small btn-light" href={`mailto:${person.email}`}>
                <Icon name="mail" />
                {text("profile-email-button")}
              </a>
            ) : null}
            <ul className="profile-contacts">
              {phone ? (
                <li>
                  <Icon name="phone" />
                  <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
                </li>
              ) : null}
              <li>
                <Icon name="mail" />
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      {others.length ? (
        <section className="container profile-others">
          <div className="profile-others-head">
            <h2>{text("profile-others-heading")}</h2>
            <Link className="profile-all" to={base}>
              {text("profile-back")}
              <Icon name="arrow" />
            </Link>
          </div>
          <PeopleGrid people={others} basePath={base} viewLabel={text("profile-view")} />
        </section>
      ) : null}

      {group === "board" ? (
        <CtaBanner
          heading={c["board.cta-heading"]}
          text={c["board.cta-text"]}
          primary={[c["board.cta-button"], "/membership-application-form/"]}
          secondary={[c["board.cta-about"], "/about-us/"]}
        />
      ) : (
        <CtaBanner
          heading={c["staff.cta-heading"]}
          text={c["staff.cta-text"]}
          primary={[c["staff.cta-button"], "/contact-us/"]}
          secondary={[c["staff.cta-member"], "/membership-application-form/"]}
        />
      )}
    </>
  );
}
