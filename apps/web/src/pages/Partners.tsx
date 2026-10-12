import { useWebsite } from "../data/WebsiteContent";
import { Icon } from "../components/Icon";
import { CtaBanner, HeroBanner, usePageTitle } from "../components/ui";

export function Partners() {
  const { copy: c, partners } = useWebsite();
  usePageTitle(c["partners.title"]);
  return (
    <>
      <HeroBanner title={c["partners.title"]} intro={c["partners.intro"]} image={c["partners.hero-image"]} />
      <div className="container partners-body">
        <div className="partner-grid">
          {partners.map((partner, index) => {
            const inner = (
              <>
                <span className="partner-logo">
                  {partner.logo ? <img src={partner.logo} alt="" loading="lazy" /> : <span className="partner-initials">{partner.name}</span>}
                </span>
                <h3>{partner.name}</h3>
                <p>{partner.fullName}</p>
                {partner.url ? (
                  <span className="partner-visit">
                    {c["partners.visit"]}
                    <Icon name="northeast" />
                  </span>
                ) : null}
              </>
            );
            return partner.url ? (
              <a key={index} className="partner-card" href={partner.url} target="_blank" rel="noopener noreferrer">
                {inner}
              </a>
            ) : (
              <div key={index} className="partner-card">
                {inner}
              </div>
            );
          })}
        </div>
      </div>
      <CtaBanner
        heading={c["partners.cta-heading"]}
        text={c["partners.cta-text"]}
        primary={[c["partners.cta-button"], "/contact-us/"]}
        secondary={[c["partners.cta-about"], "/about-us/"]}
      />
    </>
  );
}
