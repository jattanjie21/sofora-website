import { useWebsite } from "../data/WebsiteContent";
import { Link, useSearchParams } from "react-router";
import { Icon } from "../components/Icon";
import { Faqs, PageHero } from "../components/ui";

export function Contact() {
  const { copy: c, contact, loans } = useWebsite();
  const [searchParams] = useSearchParams();
  const loan = loans.find(({ id }) => id === searchParams.get("interest"));
  const subject = loan
    ? `Enquiry about ${loan.title.toLowerCase()}`
    : "Sofora membership enquiry";

  return (
    <>
      <PageHero
        eyebrow={c["contact.a-conversation-can-be-a-good-beginning"]}
        title={
          <>
            {c["contact.were-here"]}
            <br />
            <span className="blue-text">{c["contact.lets-talk"]}</span>
          </>
        }
      >
        {c["contact.a-question-about-saving-borrowing-or-becoming"]}
      </PageHero>
      <section className="section">
        <div className="container contact-grid">
          <div className="contact-methods">
            {loan ? (
              <p className="enquiry-context">
                <Icon name={loan.icon} />
                {c["contact.lets-talk-about"]}
                {loan.title.toLowerCase()}.
              </p>
            ) : null}
            <article className="contact-method">
              <span className="product-icon">
                <Icon name="phone" />
              </span>
              <div>
                <p className="eyebrow">{c["contact.a-friendly-voice"]}</p>
                <h2>{c["contact.give-us-a-call"]}</h2>
                <p>{c["contact.talk-to-the-team-about-your-next"]}</p>
                <div className="phone-list">
                  {contact.phones.map((phone) => (
                    <a href={`tel:${phone.replace(/\s/g, "")}`} key={phone}>
                      {phone}
                      <Icon name="northeast" />
                    </a>
                  ))}
                </div>
              </div>
            </article>
            <article className="contact-method">
              <span className="product-icon">
                <Icon name="mail" />
              </span>
              <div>
                <p className="eyebrow">{c["contact.drop-us-a-line"]}</p>
                <h2>{c["contact.send-an-email"]}</h2>
                <p>{c["contact.tell-us-how-we-can-help-for"]}</p>
                <a
                  className="text-link"
                  href={`mailto:${contact.email}?subject=${encodeURIComponent(subject)}`}
                >
                  {contact.email}
                  <Icon name="northeast" />
                </a>
              </div>
            </article>
          </div>
          <aside className="visit-card">
            <span className="visit-symbol">
              <Icon name="pin" />
            </span>
            <p className="eyebrow">{c["contact.your-local-credit-union"]}</p>
            <h2>
              {c["contact.a-warm-welcome"]}
              <br />
              {c["contact.in-bundung"]}
            </h2>
            <p>{c["contact.visit-us-for-a-conversation-about-your"]}</p>
            <address>{contact.address}</address>
            <a
              className="button button-light"
              href={
                c[
                  "contact.httpswwwgooglecommapssearchapi1querysoforacooperativecreditunionbundungthegambia"
                ]
              }
              target="_blank"
              rel="noreferrer"
            >
              {c["contact.find-us-on-the-map"]}
              <Icon name="northeast" />
            </a>
            <p className="visit-note">
              {c["contact.please-call-ahead-to-confirm-opening-hours"]}
            </p>
          </aside>
        </div>
      </section>
      <section className="contact-membership-strip">
        <div className="container">
          <span>{c["contact.new-to-sofora"]}</span>
          <p>{c["contact.theres-a-place-for-you-in-our"]}</p>
          <Link to="/membership" className="text-link">
            {c["contact.discover-membership"]}
            <Icon name="arrow" />
          </Link>
        </div>
      </section>
      <Faqs />
    </>
  );
}
