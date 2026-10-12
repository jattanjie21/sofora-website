import { useWebsite } from "../data/WebsiteContent";
import { Icon } from "../components/Icon";
import { ButtonLink, Faqs, PageHero, SectionHeading } from "../components/ui";

export function Membership() {
  const { copy: c } = useWebsite();
  return (
    <>
      <PageHero
        eyebrow={c["membership.theres-a-place-for-you-here"]}
        title={
          <>
            {c["membership.more-than-an-account"]}
            <br />
            <span className="blue-text">{c["membership.a-community"]}</span>
          </>
        }
      >
        {c["membership.when-you-join-sofora-you-become-part"]}
      </PageHero>
      <section className="section">
        <div className="container">
          <div className="membership-benefits">
            {[
              {
                icon: "people" as const,
                title: c["membership.a-voice-of-your-own"],
                text: c[
                  "membership.member-ownership-and-democratic-participation-are-at"
                ],
              },
              {
                icon: "sprout" as const,
                title: c["membership.space-for-your-goals"],
                text: c["membership.explore-saving-and-borrowing-with-a-team"],
              },
              {
                icon: "heart" as const,
                title: c["membership.progress-we-share"],
                text: c["membership.join-people-who-believe-that-helping-one"],
              },
            ].map(({ icon, title, text }) => (
              <article key={title}>
                <span className="product-icon">
                  <Icon name={icon} />
                </span>
                <h2>{title}</h2>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section pale-section">
        <div className="container split-content">
          <div>
            <SectionHeading
              eyebrow={c["membership.your-first-step-is-a-conversation"]}
              title={c["membership.lets-get-to-know-each-other"]}
            >
              {c["membership.our-team-will-help-you-understand-membership"]}
            </SectionHeading>
            <ButtonLink to="/apply/membership">
              Start your membership application
            </ButtonLink>
          </div>
          <div className="steps-panel">
            {[
              [
                c["membership.get-in-touch"],
                c["membership.call-email-or-visit-our-office-at"],
              ],
              [
                c["membership.prepare-your-details"],
                c[
                  "membership.the-team-will-confirm-the-identification-photographs"
                ],
              ],
              [
                c["membership.start-your-sofora-journey"],
                c["membership.once-your-membership-is-set-up-our"],
              ],
            ].map(([title, text], index) => (
              <div className="numbered-step" key={title}>
                <span>0{index + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Faqs />
    </>
  );
}
