import { useWebsite } from "../data/WebsiteContent";
import { useId, useState } from "react";
import { ButtonLink, SectionHeading } from "./ui";

const money = new Intl.NumberFormat("en-GM", {
  style: "currency",
  currency: "GMD",
  maximumFractionDigits: 2,
});

export function LoanCalculator() {
  const { copy: c } = useWebsite();
  const id = useId();
  const [amount, setAmount] = useState("50000");
  const [months, setMonths] = useState("24");
  const [rate, setRate] = useState("15");
  const principal = Number(amount);
  const duration = Number(months);
  const annualRate = Number(rate);
  const validAmount =
    amount.trim() !== "" &&
    Number.isFinite(principal) &&
    principal >= 1000 &&
    principal <= 1000000;
  const validMonths =
    months.trim() !== "" &&
    Number.isInteger(duration) &&
    duration >= 1 &&
    duration <= 120;
  const validRate =
    rate.trim() !== "" &&
    Number.isFinite(annualRate) &&
    annualRate >= 0 &&
    annualRate <= 50;
  const valid = validAmount && validMonths && validRate;
  const monthlyRate = annualRate / 1200;
  const monthly = valid
    ? monthlyRate === 0
      ? principal / duration
      : (principal * monthlyRate) /
        -Math.expm1(-duration * Math.log1p(monthlyRate))
    : 0;
  const total = monthly * duration;
  const interest = Math.max(0, total - principal);

  return (
    <section className="section calculator-section" id="calculator">
      <div className="container">
        <SectionHeading
          eyebrow={c["calculator.make-a-little-room-for-planning"]}
          title={c["calculator.what-could-your-next-step-look-like"]}
        >
          {c["calculator.adjust-the-numbers-to-explore-an-estimated"]}
        </SectionHeading>
        <div className="calculator">
          <div className="calculator-inputs">
            <div className="calculator-field">
              <label htmlFor={`${id}-amount`}>
                {c["calculator.how-much-would-you-like-to-borrow"]}
              </label>
              <div className="number-field">
                <span>{c["calculator.gmd"]}</span>
                <input
                  id={`${id}-amount`}
                  type="number"
                  min="1000"
                  max="1000000"
                  step="any"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  aria-invalid={!validAmount}
                  aria-describedby={
                    !validAmount ? `${id}-amount-error` : undefined
                  }
                />
              </div>
              <input
                aria-label={c["calculator.adjust-loan-amount"]}
                type="range"
                min="1000"
                max="1000000"
                step="1000"
                value={validAmount ? principal : 1000}
                onChange={(event) => setAmount(event.target.value)}
              />
              <div className="range-labels">
                <span>{c["calculator.gmd-1000"]}</span>
                <span>{c["calculator.gmd-1000000"]}</span>
              </div>
              {!validAmount ? (
                <p className="field-error" id={`${id}-amount-error`}>
                  {c["calculator.enter-an-amount-from-gmd-1000-to"]}
                </p>
              ) : null}
            </div>
            <div className="calculator-field">
              <label htmlFor={`${id}-months`}>
                {c["calculator.over-how-many-months"]}
              </label>
              <div className="number-field">
                <input
                  id={`${id}-months`}
                  type="number"
                  min="1"
                  max="120"
                  step="1"
                  value={months}
                  onChange={(event) => setMonths(event.target.value)}
                  aria-invalid={!validMonths}
                  aria-describedby={
                    !validMonths ? `${id}-months-error` : undefined
                  }
                />
                <span>{c["calculator.months"]}</span>
              </div>
              <div
                className="term-options"
                aria-label={c["calculator.suggested-loan-terms"]}
              >
                {[12, 24, 36, 60].map((term) => (
                  <button
                    type="button"
                    key={term}
                    aria-pressed={duration === term}
                    onClick={() => setMonths(String(term))}
                  >
                    {term}
                    {c["calculator.months-2"]}
                  </button>
                ))}
              </div>
              {!validMonths ? (
                <p className="field-error" id={`${id}-months-error`}>
                  {c["calculator.enter-a-whole-number-from-1-to"]}
                </p>
              ) : null}
            </div>
            <div className="calculator-field">
              <label htmlFor={`${id}-rate`}>
                {c["calculator.example-annual-interest-rate"]}
              </label>
              <div className="number-field rate-field">
                <input
                  id={`${id}-rate`}
                  type="number"
                  min="0"
                  max="50"
                  step="any"
                  value={rate}
                  onChange={(event) => setRate(event.target.value)}
                  aria-invalid={!validRate}
                  aria-describedby={`${id}-rate-help${!validRate ? ` ${id}-rate-error` : ""}`}
                />
                <span>%</span>
              </div>
              <p className="input-hint" id={`${id}-rate-help`}>
                {c["calculator.enter-a-rate-to-explore-ask-our"]}
              </p>
              {!validRate ? (
                <p className="field-error" id={`${id}-rate-error`}>
                  {c["calculator.enter-a-rate-from-0-to-50"]}
                </p>
              ) : null}
            </div>
          </div>
          <div className="calculator-result">
            <p className="eyebrow">{c["calculator.your-monthly-estimate"]}</p>
            <div
              className="calculation-output"
              aria-live="polite"
              aria-atomic="true"
            >
              <strong>{valid ? money.format(monthly) : "—"}</strong>
              <span>{c["calculator.per-month"]}</span>
              <dl>
                <div>
                  <dt>{c["calculator.amount-borrowed"]}</dt>
                  <dd>{valid ? money.format(principal) : "—"}</dd>
                </div>
                <div>
                  <dt>{c["calculator.total-interest"]}</dt>
                  <dd>{valid ? money.format(interest) : "—"}</dd>
                </div>
                <div className="total-row">
                  <dt>{c["calculator.total-repayment"]}</dt>
                  <dd>{valid ? money.format(total) : "—"}</dd>
                </div>
              </dl>
            </div>
            <ButtonLink to="/contact" className="button-light">
              {c["calculator.talk-through-your-options"]}
            </ButtonLink>
            <p className="calculator-disclaimer">
              {
                c[
                  "calculator.an-illustrative-reducingbalance-estimate-excluding-fees-this"
                ]
              }
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
