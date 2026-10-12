import { useWebsite } from "../data/WebsiteContent";
import { Icon } from "../components/Icon";
import { JoinBanner, PageHero, SectionHeading } from "../components/ui";

export function About() {
  const { copy: c, board, staff } = useWebsite();
  return (
    <>
      <PageHero
        eyebrow={c["about.our-story"]}
        title={
          <>
            {c["about.togetherness-is"]}
            <br />
            <span className="blue-text">{c["about.where-we-began"]}</span>
          </>
        }
      >
        {c["about.sofora-is-a-memberowned-credit-union-in"]}
      </PageHero>
      <section className="section">
        <div className="container story-grid">
          <figure className="about-photo">
            <img
              src={c["about.imagessoforacommunityjpg"]}
              alt={c["about.the-sofora-community-gathered-at-the-credit"]}
              width="960"
              height="806"
              loading="lazy"
            />
            <figcaption>
              {c["about.people-helping-people-in-the-heart-of"]}
            </figcaption>
          </figure>
          <div>
            <SectionHeading
              eyebrow={c["about.from-an-idea-to-a-cooperative"]}
              title={c["about.a-shared-challenge-a-shared-way-forward"]}
            />
            <p>{c["about.in-2006-a-group-of-60-people"]}</p>
            <p>{c["about.after-a-period-as-a-study-group"]}</p>
            <p>{c["about.today-our-purpose-remains-simple-make-financial"]}</p>
          </div>
        </div>
      </section>
      <section className="section pale-section">
        <div className="container">
          <div className="mission-grid">
            <article>
              <p className="eyebrow">{c["about.our-vision"]}</p>
              <h2>{c["about.opportunity-within-everyones-reach"]}</h2>
              <p>
                {c["about.a-future-where-individuals-can-access-affordable"]}
              </p>
            </article>
            <article>
              <p className="eyebrow">{c["about.our-mission"]}</p>
              <h2>{c["about.progress-that-we-can-share"]}</h2>
              <p>
                {
                  c[
                    "about.help-members-improve-their-livelihoods-through-accessible"
                  ]
                }
              </p>
            </article>
          </div>
          <div className="values-row">
            {[
              c["about.service-to-members"],
              c["about.confidentiality"],
              c["about.integrity"],
              c["about.transparency"],
              c["about.accountability"],
            ].map((value) => (
              <span key={value}>
                <Icon name="check" />
                {value}
              </span>
            ))}
          </div>
        </div>
      </section>
      <section className="section" id="our-people">
        <div className="container">
          <SectionHeading
            eyebrow={c["about.the-people-behind-sofora"]}
            title={c["about.here-to-serve-our-members"]}
          >
            {c["about.our-board-and-staff-bring-the-cooperatives"]}
          </SectionHeading>
          <div className="people-directory">
            <details open>
              <summary>
                {c["about.board-of-directors"]}
                <span>
                  {board.length}
                  {c["about.members"]}
                  <Icon name="plus" />
                </span>
              </summary>
              <div className="people-grid">
                {board.map(([name, role], index) => (
                  <div key={index} className="person">
                    <span className="person-avatar" aria-hidden="true">
                      <Icon name="people" />
                    </span>
                    <div>
                      <h3>{name}</h3>
                      <p>{role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </details>
            <details>
              <summary>
                {c["about.our-team"]}
                <span>
                  {staff.length}
                  {c["about.colleagues"]}
                  <Icon name="plus" />
                </span>
              </summary>
              <div className="people-grid">
                {staff.map(([name, role], index) => (
                  <div key={index} className="person">
                    <span className="person-avatar" aria-hidden="true">
                      <Icon name="people" />
                    </span>
                    <div>
                      <h3>{name}</h3>
                      <p>{role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          </div>
        </div>
      </section>
      <section className="partners-section">
        <div className="container">
          <p className="eyebrow">
            {c["about.part-of-a-wider-cooperative-community"]}
          </p>
          <div className="partner-list">
            <a
              href={c["about.httpswwwnaccugcom"]}
              target="_blank"
              rel="noreferrer"
            >
              {c["about.naccug"]}
              <Icon name="northeast" />
            </a>
            <a
              href={c["about.httpswwwsparkassenstiftungde"]}
              target="_blank"
              rel="noreferrer"
            >
              {c["about.dsik"]}
              <Icon name="northeast" />
            </a>
            <a href={c["about.httpsgtuccugm"]} target="_blank" rel="noreferrer">
              {c["about.gtuccu"]}
              <Icon name="northeast" />
            </a>
            <a href={c["about.httpsgsccuorg"]} target="_blank" rel="noreferrer">
              {c["about.gamtel-ccu"]}
              <Icon name="northeast" />
            </a>
          </div>
        </div>
      </section>
      <JoinBanner />
    </>
  );
}
