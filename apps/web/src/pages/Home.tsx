import { Link, useSearchParams } from "react-router";
import { useWebsite } from "../data/WebsiteContent";
import { AmortizationCalculator, LoanCalculator } from "../components/LoanCalculator";
import { Icon } from "../components/Icon";
import { HelpBanner, LoanCards, Slider, usePageTitle } from "../components/ui";
import { PostCards } from "./Blog";
import { SearchResults } from "./Search";

export function Home() {
  const query = useSearchParams()[0].get("s");
  return query?.trim() ? <SearchResults key={query} query={query.trim()} /> : <HomePage />;
}

function HomePage() {
  const { copy: c } = useWebsite();
  usePageTitle("");
  const slides = ([1, 2, 3, 4] as const).map((n) => ({
    image: c[`home.slide-${n}-image`],
    title: c[`home.slide-${n}-title`],
    button: c[`home.slide-${n}-button`],
    link: c[`home.slide-${n}-link`],
  }));
  const rates = ([1, 2, 3, 4] as const).map((n) => ({
    icon: c[`home.rate-${n}-icon`],
    value: c[`home.rate-${n}-value`],
    label: c[`home.rate-${n}-label`],
  }));
  return (
    <>
      <h1 className="sr-only">{c["shared.name"]}</h1>
      <Slider slides={slides} />
      <section className="rates" aria-label="Loan rates">
        <div className="container rates-grid">
          {rates.map((rate) => (
            <div className="rate" key={rate.label}>
              <img src={rate.icon} alt="" width="60" height="60" />
              <div>
                <strong>{rate.value}</strong>
                <span>{rate.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section section-white">
        <div className="container about-intro">
          <div>
            <h2 className="accent-heading">{c["home.about-heading"]}</h2>
            <p className="justify">{c["home.about-text"]}</p>
            <Link className="text-link" to="/about-us/">
              {c["home.about-link"]}
            </Link>
          </div>
          <img className="circle-photo" src={c["home.about-image"]} alt={c["home.about-image-alt"]} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>{c["home.loans-heading"]}</h2>
            <p>
              {c["home.loans-text"]} <strong>{c["home.loans-highlight"]}</strong>
            </p>
          </div>
          <LoanCards />
          <Link className="btn btn-spaced" to="/loan-services/">
            {c["home.loans-button"]}
          </Link>
        </div>
      </section>

      <div className="section-flush">
        <LoanCalculator />
        <AmortizationCalculator />
      </div>

      <section className="section section-white">
        <div className="container">
          <h2 className="section-heading">{c["home.news-heading"]}</h2>
          <PostCards />
        </div>
      </section>

      <HelpBanner />

      <section className="social-section">
        <div className="container">
          <h2>{c["shared.social-heading"]}</h2>
          <a className="btn" href={c["shared.twitter-url"]} target="_blank" rel="noreferrer">
            <Icon name="twitter" />
            {c["shared.twitter-label"]}
          </a>
        </div>
      </section>
    </>
  );
}
