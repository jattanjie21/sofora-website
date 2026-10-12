import { Link } from "react-router";
import { useWebsite } from "../data/WebsiteContent";
import { AmortizationCalculator, LoanCalculator } from "../components/LoanCalculator";
import { Icon } from "../components/Icon";
import { LoanCards, PageHeader, Slider, lines, usePageTitle } from "../components/ui";

export function LoanServices() {
  const { copy: c } = useWebsite();
  usePageTitle(c["loans.title"]);
  const slides = ([1, 2, 3] as const).map((n) => ({
    image: c[`loans.slide-${n}-image`],
    title: c[`loans.slide-${n}-title`],
    text: c[`loans.slide-${n}-text`],
    button: c["loans.slide-button"],
    link: "/loan-application-form/",
  }));
  const logos = ([1, 2, 3, 4, 5, 6] as const).map((n) => c[`loans.partner-logo-${n}`]);
  return (
    <>
      <h1 className="sr-only">{c["loans.title"]}</h1>
      <Slider slides={slides} />
      <section className="features" aria-label={c["loans.title"]}>
        <div className="container features-grid">
          {([1, 2, 3, 4] as const).map((n) => (
            <div key={n}>
              <Icon name="check" />
              {c[`loans.feature-${n}`]}
            </div>
          ))}
        </div>
      </section>

      <section className="section section-white">
        <div className="container media-split">
          <div>
            <h2>{c["loans.business-heading"]}</h2>
            <p className="tagline">{c["loans.business-tagline"]}</p>
            <p className="lead">{c["loans.business-question"]}</p>
            <p>{c["loans.business-p1"]}</p>
            <p>
              {c["loans.business-p2"]}{" "}
              <Link to="/faq/">{c["loans.business-faq"]}</Link>
            </p>
          </div>
          <a className="video-thumb" href={c["loans.business-video"]} target="_blank" rel="noreferrer">
            <img src={c["loans.business-image"]} alt="" loading="lazy" />
            <span className="play-button">
              <Icon name="play" />
              <span className="sr-only">{c["loans.business-video-label"]}</span>
            </span>
          </a>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>{c["loans.products-heading"]}</h2>
            <p>{c["loans.products-text"]}</p>
          </div>
          <LoanCards apply />
        </div>
      </section>

      <div className="section-flush">
        <LoanCalculator />
        <AmortizationCalculator />
      </div>

      <section className="section section-white">
        <div className="container">
          <h2 className="section-heading">{c["loans.partners-heading"]}</h2>
          <div className="partner-logos">
            {logos.map((logo, index) => (
              <img key={index} src={logo} alt="" loading="lazy" />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function Saving() {
  const { copy: c } = useWebsite();
  return (
    <>
      <PageHeader title={c["saving.title"]} />
      <div className="container page-panel prose">
        <h2>{c["saving.heading"]}</h2>
        <p>{c["saving.p1"]}</p>
        <p>{c["saving.p2"]}</p>
        <h2>{c["saving.types-heading"]}</h2>
        <ul className="check-list">
          {lines(c["saving.types"]).map((type) => (
            <li key={type}>
              <Icon name="check" />
              {type}
            </li>
          ))}
        </ul>
        <h2>{c["saving.boxes-heading"]}</h2>
        <p>{c["saving.boxes-p1"]}</p>
        <p>{c["saving.boxes-p2"]}</p>
        <p>{c["saving.boxes-p3"]}</p>
        <p>{c["saving.boxes-p4"]}</p>
        <img className="prose-image" src={c["saving.chart-image"]} alt="" loading="lazy" />
        <img className="prose-image" src={c["saving.boxes-image"]} alt="" loading="lazy" />
        <p>{c["saving.boxes-p5"]}</p>
      </div>
    </>
  );
}

export function Downloads() {
  const { copy: c } = useWebsite();
  const files = ([1, 2, 3, 4] as const).map((n) => ({
    title: c[`downloads.file-${n}-title`],
    category: c[`downloads.file-${n}-category`],
    date: c[`downloads.file-${n}-date`],
    path: c[`downloads.file-${n}-path`],
  }));
  return (
    <>
      <PageHeader title={c["downloads.title"]} />
      <div className="container page-panel">
        <div className="table-scroll">
          <table className="downloads">
            <thead>
              <tr>
                <th scope="col">{c["downloads.col-title"]}</th>
                <th scope="col">{c["downloads.col-category"]}</th>
                <th scope="col">{c["downloads.col-date"]}</th>
                <th scope="col">
                  <span className="sr-only">{c["downloads.button"]}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.path}>
                  <td>
                    <strong>{file.title}</strong>
                    <small>1 file(s)</small>
                  </td>
                  <td>{file.category}</td>
                  <td>{file.date}</td>
                  <td>
                    <a className="btn btn-small" href={file.path} download>
                      <Icon name="download" />
                      {c["downloads.button"]}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
