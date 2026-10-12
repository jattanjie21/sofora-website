import { useWebsite } from "../data/WebsiteContent";
import { Link } from "react-router";
import { Icon } from "../components/Icon";
import { LoanCalculator } from "../components/LoanCalculator";
import { ButtonLink, Faqs, PageHero } from "../components/ui";

export function Loans() {
  const { copy: c, loans } = useWebsite();
  return (
    <>
      <PageHero
        eyebrow={c["loans.support-for-your-next-chapter"]}
        title={
          <>
            {c["loans.big-plans-deserve"]}
            <br />
            <span className="blue-text">{c["loans.a-little-support"]}</span>
          </>
        }
      >
        {c["loans.from-a-new-business-idea-to-a"]}
      </PageHero>
      <section className="section">
        <div className="container">
          <div className="intro-row">
            <p>
              {c["loans.whatever-youre-working-towards"]}
              <br />
              <strong>{c["loans.lets-find-a-way-forward"]}</strong>
            </p>
            <ButtonLink to="/loans#calculator" secondary>
              {c["loans.estimate-your-repayment"]}
            </ButtonLink>
          </div>
          <div className="loan-grid">
            {loans.map((loan) => (
              <article key={loan.id} id={loan.id} className="loan-card">
                <span className="product-icon">
                  <Icon name={loan.icon} />
                </span>
                <h2>{loan.title}</h2>
                <p>{loan.description}</p>
                <Link to={`/contact?interest=${loan.id}`} className="text-link">
                  {c["loans.talk-to-us"]}
                  <Icon name="arrow" />
                </Link>
                <Link to={`/apply/loan?product=${loan.id}`} className="text-link">Apply for this loan <Icon name="arrow" /></Link>
              </article>
            ))}
          </div>
          <p className="supporting-note">
            {c["loans.our-team-will-explain-current-rates-repayment"]}
          </p>
        </div>
      </section>
      <LoanCalculator />
      <Faqs />
    </>
  );
}
