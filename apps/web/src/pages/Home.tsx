import { useWebsite } from "../data/WebsiteContent";
import { Link } from "react-router";
import { Icon } from "../components/Icon";
import { ButtonLink, JoinBanner, SectionHeading } from "../components/ui";

export function Home() {
  const { copy: c, savings } = useWebsite();
  return (
    <>
      <section className="home-hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="eyebrow-dot" />
              {c["home.your-community-your-credit-union"]}
            </p>
            <h1>
              {c["home.a-better-future"]}
              <br />
              {c["home.built"]}{" "}
              <span className="headline-accent">
                {c["home.together"]}
                <svg viewBox="0 0 370 18" fill="none" aria-hidden="true">
                  <path
                    d="M4 12C97 1 241 0 366 10M20 17C141 7 260 8 332 14"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <p className="hero-description">
              {c["home.big-dreams-begin-with-small-steps-save"]}
            </p>
            <div className="hero-actions">
              <ButtonLink to="/membership">
                {c["home.find-your-place-at-sofora"]}
              </ButtonLink>
              <Link className="text-link" to="/loans">
                {c["home.explore-our-loans"]}
                <Icon name="arrow" />
              </Link>
            </div>
            <div className="hero-footnote">
              <span className="small-icon">
                <Icon name="people" />
              </span>
              <p>
                {c["home.owned-by-our-members"]}
                <br />
                <strong>{c["home.here-for-each-other"]}</strong>
              </p>
            </div>
          </div>
          <div className="hero-visual">
            <span className="visual-decoration" aria-hidden="true" />
            <div className="hero-photo-wrap">
              <img
                className="hero-photo"
                src={c["home.imagessoforacommunityjpg"]}
                alt={c["home.members-and-visitors-gathered-outside-the-sofora"]}
                width="960"
                height="806"
                fetchPriority="high"
              />
              <span className="photo-caption">
                <span />
                {c["home.together-we-go-further"]}
              </span>
            </div>
            <div className="hero-note">
              <span className="note-icon">
                <Icon name="sprout" />
              </span>
              <div>
                <strong>{c["home.rooted-in-community"]}</strong>
                <span>{c["home.growing-with-you"]}</span>
              </div>
              <Icon name="northeast" />
            </div>
            <span className="vertical-label">
              {c["home.the-gambia-people-helping-people"]}
            </span>
          </div>
        </div>
      </section>
      <div className="trust-strip">
        <div className="container trust-grid">
          <div>
            <Icon name="people" />
            <span>
              {c["home.memberowned"]}
              <br />
              <strong>{c["home.people-come-first"]}</strong>
            </span>
          </div>
          <div>
            <Icon name="sprout" />
            <span>
              {c["home.built-around-your-goals"]}
              <br />
              <strong>{c["home.room-to-grow"]}</strong>
            </span>
          </div>
          <div>
            <Icon name="shield" />
            <span>
              {c["home.a-cooperative-since-2011"]}
              <br />
              <strong>{c["home.rooted-in-togetherness"]}</strong>
            </span>
          </div>
          <a
            href={c["home.httpswwwnaccugcom"]}
            target="_blank"
            rel="noreferrer"
          >
            <span>{c["home.affiliated-with"]}</span>
            <strong>
              {c["home.naccug"]}
              <Icon name="northeast" />
            </strong>
          </a>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <div className="section-header">
            <SectionHeading
              eyebrow={c["home.a-little-today-more-tomorrow"]}
              title={
                <>
                  {c["home.good-things-start"]}
                  <br />
                  {c["home.with-a-little-saving"]}
                </>
              }
            />
            <Link to="/savings" className="text-link">
              {c["home.find-your-savings-account"]}
              <Icon name="arrow" />
            </Link>
          </div>
          <div className="savings-grid">
            {savings.map((product, index) => (
              <Link
                to={`/savings#${product.id}`}
                className={`savings-card savings-card-${index}`}
                key={product.id}
              >
                <span className="card-topline">
                  <span className="product-icon">
                    <Icon name={product.icon} />
                  </span>
                  <span className="card-number">0{index + 1}</span>
                </span>
                <h3>{product.title}</h3>
                <p>{product.description}</p>
                <span className="card-link">
                  {c["home.lets-start-saving"]}
                  <Icon name="arrow" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="section story-section">
        <div className="container story-grid">
          <div className="together-art">
            <span className="art-kicker">
              {c["home.a-word-a-belief-a-way-forward"]}
            </span>
            <Icon name="people" />
            <p>
              {c["home.sofora-means"]}
              <br />
              <em>{c["home.togetherness"]}</em>
            </p>
            <div className="art-bottom">
              <span>{c["home.our-name-is-our-promise"]}</span>
              <span>{c["home.01-community"]}</span>
            </div>
            <div className="art-circle" aria-hidden="true" />
          </div>
          <div className="story-copy">
            <SectionHeading
              eyebrow={c["home.more-than-a-credit-union"]}
              title={
                <>
                  {c["home.your-progress"]}
                  <br />
                  {c["home.our-shared-purpose"]}
                </>
              }
            >
              {c["home.a-business-idea-a-childs-education-a"]}
            </SectionHeading>
            <p>{c["home.we-began-as-a-community-study-group"]}</p>
            <div className="story-values">
              <span>
                <Icon name="check" />
                {c["home.a-voice-for-every-member"]}
              </span>
              <span>
                <Icon name="check" />
                {c["home.opportunity-for-our-community"]}
              </span>
            </div>
            <Link className="text-link" to="/about">
              {c["home.get-to-know-sofora"]}
              <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="section-header">
            <SectionHeading
              eyebrow={c["home.for-the-next-step"]}
              title={c["home.your-ambitions-our-support"]}
            />
            <Link to="/loans" className="text-link">
              {c["home.explore-all-loans"]}
              <Icon name="arrow" />
            </Link>
          </div>
          <div className="featured-loans">
            <Link to="/loans#business" className="featured-loan">
              <span className="feature-illustration illustration-business">
                <Icon name="briefcase" />
                <span className="illustration-sun" />
                <span className="illustration-line" />
              </span>
              <div>
                <p className="eyebrow">{c["home.build-your-business"]}</p>
                <h3>
                  {c["home.small-business"]}
                  <br />
                  {c["home.big-possibilities"]}
                </h3>
                <span className="card-link">
                  {c["home.business-loans"]}
                  <Icon name="arrow" />
                </span>
              </div>
            </Link>
            <Link to="/loans#education" className="featured-loan">
              <span className="feature-illustration illustration-education">
                <Icon name="book" />
                <span className="illustration-sun" />
                <span className="illustration-line" />
              </span>
              <div>
                <p className="eyebrow">{c["home.invest-in-tomorrow"]}</p>
                <h3>
                  {c["home.open-doors"]}
                  <br />
                  {c["home.keep-learning"]}
                </h3>
                <span className="card-link">
                  {c["home.education-loans"]}
                  <Icon name="arrow" />
                </span>
              </div>
            </Link>
            <Link to="/loans#building" className="featured-loan">
              <span className="feature-illustration illustration-home">
                <Icon name="home" />
                <span className="illustration-sun" />
                <span className="illustration-line" />
              </span>
              <div>
                <p className="eyebrow">{c["home.make-room-for-life"]}</p>
                <h3>
                  {c["home.your-own-place"]}
                  <br />
                  {c["home.your-next-chapter"]}
                </h3>
                <span className="card-link">
                  {c["home.building-loans"]}
                  <Icon name="arrow" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>
      <section className="calculator-teaser">
        <div className="container calculator-teaser-inner">
          <span className="teaser-icon">
            <Icon name="wallet" />
          </span>
          <div>
            <h2>{c["home.a-little-planning-goes-a-long-way"]}</h2>
            <p>{c["home.explore-what-a-monthly-loan-repayment-could"]}</p>
          </div>
          <ButtonLink to="/loans#calculator" secondary>
            {c["home.try-the-loan-calculator"]}
          </ButtonLink>
        </div>
      </section>
      <section className="section community-preview">
        <div className="container community-preview-grid">
          <div>
            <SectionHeading
              eyebrow={c["home.people-behind-the-progress"]}
              title={
                <>
                  {c["home.small-beginnings"]}
                  <br />
                  {c["home.lasting-connections"]}
                </>
              }
            >
              {c["home.from-regular-savings-to-shared-opportunities-our"]}
            </SectionHeading>
            <Link to="/community" className="text-link">
              {c["home.meet-our-community"]}
              <Icon name="arrow" />
            </Link>
          </div>
          <Link to="/community#saving-together" className="community-feature">
            <img
              src={c["home.imagessavingsboxesjpeg"]}
              alt={c["home.sofora-community-savings-boxes"]}
              width="348"
              height="317"
              loading="lazy"
            />
            <div>
              <p className="eyebrow">{c["home.our-saving-culture"]}</p>
              <h3>
                {c["home.small-habits"]}
                <br />
                {c["home.a-shared-future"]}
              </h3>
              <span className="card-link">
                {c["home.discover-the-story"]}
                <Icon name="arrow" />
              </span>
            </div>
          </Link>
        </div>
      </section>
      <JoinBanner />
    </>
  );
}
