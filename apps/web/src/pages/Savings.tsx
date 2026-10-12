import { useWebsite } from "../data/WebsiteContent";
import { Icon } from "../components/Icon";
import {
  ButtonLink,
  JoinBanner,
  PageHero,
  SectionHeading,
} from "../components/ui";

export function Savings() {
  const { copy: c, savings } = useWebsite();
  const savingsDetails: Record<string, string[]> = {
    personal: [
      c["savings.everyday-saving-for-your-own-goals"],
      c["savings.a-foundation-for-future-plans"],
      c["savings.guidance-from-a-community-that-knows-you"],
    ],
    group: [
      c["savings.for-kafos-groups-and-organisations"],
      c["savings.a-place-for-shared-business-ambitions"],
      c["savings.a-saving-habit-you-can-build-together"],
    ],
    children: [
      c["savings.an-early-start-on-a-lifelong-habit"],
      c["savings.save-towards-education-and-opportunities"],
      c["savings.a-way-for-families-to-plan-ahead"],
    ],
  };
  return (
    <>
      <PageHero
        eyebrow={c["savings.make-space-for-tomorrow"]}
        title={
          <>
            {c["savings.small-steps"]}
            <br />
            <span className="blue-text">
              {c["savings.brighter-possibilities"]}
            </span>
          </>
        }
      >
        {c["savings.a-little-set-aside-today-can-open"]}
      </PageHero>
      <section className="section">
        <div className="container saving-products">
          {savings.map((product, index) => (
            <article
              className={`saving-product saving-product-${index}`}
              id={product.id}
              key={product.id}
            >
              <div className="saving-product-heading">
                <span className="product-icon">
                  <Icon name={product.icon} />
                </span>
                <span className="card-number">0{index + 1}</span>
                <h2>{product.title}</h2>
                <p>{product.description}</p>
              </div>
              <div>
                <ul className="check-list">
                  {savingsDetails[product.id]?.map((detail) => (
                    <li key={detail}>
                      <Icon name="check" />
                      {detail}
                    </li>
                  ))}
                </ul>
                <ButtonLink to="/contact">
                  {c["savings.lets-talk-about-saving"]}
                </ButtonLink>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="section pale-section">
        <div className="container split-content">
          <div>
            <SectionHeading
              eyebrow={c["savings.a-habit-worth-growing"]}
              title={c["savings.good-things-take-a-little-consistency"]}
            />
            <p>{c["savings.theres-no-single-reason-to-save-your"]}</p>
            <p>{c["savings.start-with-a-conversation-our-team-can"]}</p>
            <ButtonLink to="/membership" secondary>
              {c["savings.discover-membership"]}
            </ButtonLink>
          </div>
          <div className="steps-panel">
            {[
              [
                c["savings.choose-your-goal"],
                c["savings.give-your-savings-a-purpose-whether-its"],
              ],
              [
                c["savings.find-your-account"],
                c["savings.talk-to-our-team-about-personal-group"],
              ],
              [
                c["savings.build-the-habit"],
                c["savings.make-regular-saving-part-of-your-routine"],
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
      <JoinBanner />
    </>
  );
}
