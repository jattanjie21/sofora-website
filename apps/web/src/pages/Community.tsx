import { useWebsite } from "../data/WebsiteContent";
import { Link } from "react-router";
import { Icon } from "../components/Icon";
import { JoinBanner, PageHero, SectionHeading } from "../components/ui";

export function Community() {
  const { copy: c } = useWebsite();
  return (
    <>
      <PageHero
        eyebrow={c["community.people-behind-the-progress"]}
        title={
          <>
            {c["community.many-stories"]}
            <br />
            <span className="blue-text">{c["community.one-community"]}</span>
          </>
        }
      >
        {c["community.our-cooperative-is-built-on-everyday-acts"]}
      </PageHero>
      <section className="section">
        <div className="container">
          <figure className="community-hero-photo">
            <img
              src={c["community.imagessoforacommunityjpg"]}
              width="960"
              height="806"
              alt={c["community.a-gathering-of-community-members-and-visitors"]}
              loading="lazy"
            />
            <figcaption>
              <span className="eyebrow">
                {c["community.our-community-in-focus"]}
              </span>
              <h2>{c["community.it-starts-with-people"]}</h2>
              <p>{c["community.our-office-our-members-and-the-connections"]}</p>
            </figcaption>
          </figure>
        </div>
      </section>
      <section className="section pale-section" id="saving-together">
        <div className="container saving-story">
          <figure>
            <img
              src={c["community.imagessavingsboxesjpeg"]}
              width="348"
              height="317"
              alt={c["community.two-people-demonstrating-one-of-the-community"]}
              loading="lazy"
            />
            <figcaption>
              {c["community.from-the-sofora-savingsbox-programme-archive"]}
            </figcaption>
          </figure>
          <div>
            <SectionHeading
              eyebrow={c["community.from-our-story-2013"]}
              title={c["community.small-habits-can-make-a-lasting-difference"]}
            />
            <p>{c["community.in-november-2013-sofora-received-ten-savings"]}</p>
            <p>{c["community.the-programme-supported-by-irish-aid-through"]}</p>
            <p>{c["community.its-a-simple-idea-that-reflects-our"]}</p>
            <Link className="text-link" to="/savings">
              {c["community.find-your-own-way-to-save"]}
              <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container split-content">
          <SectionHeading
            eyebrow={c["community.our-cooperative-journey"]}
            title={c["community.a-story-we-keep-building-together"]}
          />
          <div className="timeline">
            <div>
              <span>{c["community.study-group-year"]}</span>
              <h3>{c["community.an-idea-takes-root"]}</h3>
              <p>{c["community.a-community-study-group-of-60-people"]}</p>
            </div>
            <div>
              <span>{c["community.registration-year"]}</span>
              <h3>{c["community.sofora-becomes-a-credit-union"]}</h3>
              <p>{c["community.on-8-september-sofora-is-registered-as"]}</p>
            </div>
            <div>
              <span>{c["community.savings-boxes-year"]}</span>
              <h3>{c["community.a-saving-culture-grows"]}</h3>
              <p>
                {
                  c[
                    "community.community-savings-boxes-bring-a-practical-saving"
                  ]
                }
              </p>
            </div>
          </div>
        </div>
      </section>
      <JoinBanner />
    </>
  );
}
