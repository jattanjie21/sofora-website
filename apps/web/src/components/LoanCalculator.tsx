import { useId, useState, type CSSProperties } from "react";
import { Link } from "react-router";
import { useWebsite } from "../data/WebsiteContent";
import { Icon } from "./Icon";

const money = new Intl.NumberFormat("en-GM", {
  style: "currency",
  currency: "GMD",
  currencyDisplay: "code",
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});
const gmd = (value: number) => money.format(value).replace(/\s/g, "");

// Equal monthly payments on a reducing balance; numerically stable for small rates.
export function monthlyPayment(principal: number, annualRate: number, months: number) {
  const rate = annualRate / 1200;
  if (rate === 0) return principal / months;
  return (principal * rate) / -Math.expm1(-months * Math.log1p(rate));
}

// A slider with an editable number box; typed values are clamped when the box loses focus.
function Range({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  return (
    <div className="calc-field">
      <div className="calc-field-head">
        <label htmlFor={id}>{label}</label>
        <span className="calc-value">
          <input
            type="number"
            inputMode="decimal"
            aria-label={`${label} (${unit})`}
            min={min}
            max={max}
            step={step}
            style={{ width: `${String(max).length + 1}ch` }}
            value={draft ?? value}
            onChange={(event) => {
              setDraft(event.target.value);
              const n = Number(event.target.value);
              if (event.target.value !== "" && Number.isFinite(n)) onChange(clamp(n));
            }}
            onBlur={() => setDraft(null)}
          />
          <span>{unit}</span>
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ "--fill": `${((value - min) / (max - min)) * 100}%` } as CSSProperties}
        onChange={(event) => {
          setDraft(null);
          onChange(Number(event.target.value));
        }}
      />
      <div className="calc-field-scale" aria-hidden="true">
        <span>{min.toLocaleString("en-GM")}</span>
        <span>{max.toLocaleString("en-GM")}</span>
      </div>
    </div>
  );
}

// Loan calculator with a month-by-month repayment schedule (equal payments on a reducing balance).
export function LoanCalculator() {
  const { copy: c } = useWebsite();
  const scheduleId = useId();
  const [amount, setAmount] = useState(50000);
  const [months, setMonths] = useState(12);
  const [rate, setRate] = useState(() => {
    const value = Number(c["calculator.default-rate"]);
    return Number.isFinite(value) && value >= 0 && value <= 50 ? value : 15;
  });
  const [showSchedule, setShowSchedule] = useState(false);
  const monthly = monthlyPayment(amount, rate, months);
  const payable = monthly * months;
  const interest = Math.max(0, payable - amount);
  const principalShare = payable ? (amount / payable) * 100 : 100;
  const schedule: [number, number, number, number][] = [];
  if (showSchedule) {
    let balance = amount;
    for (let month = 1; month <= months; month++) {
      const monthInterest = balance * (rate / 1200);
      const principal = Math.min(balance, monthly - monthInterest);
      balance = Math.max(0, balance - principal);
      schedule.push([month, principal, monthInterest, balance]);
    }
  }
  return (
    <section className="section section-white calc-section" id="calculator">
      <div className="container">
        <div className="section-title">
          <h2>{c["calculator.heading"]}</h2>
          <p>{c["calculator.text"]}</p>
        </div>
        <div className="calc">
          <div className="calc-inputs">
            <Range label={c["calculator.amount-label"]} unit="GMD" value={amount} min={1000} max={1000000} step={1000} onChange={setAmount} />
            <Range label={c["calculator.term-label"]} unit={c["calculator.months-unit"]} value={months} min={1} max={120} step={1} onChange={setMonths} />
            <Range label={c["calculator.rate-label"]} unit="%" value={rate} min={0} max={50} step={0.5} onChange={setRate} />
          </div>
          <div className="calc-result" aria-live="polite">
            <p className="calc-result-label">{c["calculator.monthly-label"]}</p>
            <p className="calc-result-value">
              {gmd(monthly)}
              <span> / {c["calculator.per-month"]}</span>
            </p>
            <div className="calc-bar" aria-hidden="true">
              <span style={{ width: `${principalShare}%` }} />
            </div>
            <dl className="calc-totals">
              <div>
                <dt>
                  <i className="calc-dot calc-dot-principal" />
                  {c["calculator.principal-label"]}
                </dt>
                <dd>{gmd(amount)}</dd>
              </div>
              <div>
                <dt>
                  <i className="calc-dot calc-dot-interest" />
                  {c["calculator.interest"]}
                </dt>
                <dd>{gmd(interest)}</dd>
              </div>
              <div className="calc-total">
                <dt>{c["calculator.total-label"]}</dt>
                <dd>{gmd(payable)}</dd>
              </div>
            </dl>
            <Link className="btn btn-light" to="/loan-application-form/">
              {c["calculator.apply"]}
            </Link>
          </div>
        </div>
        <div className="calc-schedule">
          <button
            type="button"
            className="calc-schedule-toggle"
            aria-expanded={showSchedule}
            aria-controls={scheduleId}
            onClick={() => setShowSchedule(!showSchedule)}
          >
            {showSchedule ? c["calculator.schedule-hide"] : c["calculator.schedule-show"]}
            <Icon name="chevronDown" />
          </button>
          {showSchedule ? (
            <div className="table-scroll" id={scheduleId}>
              <table>
                <thead>
                  <tr>
                    <th scope="col">{c["calculator.col-month"]}</th>
                    <th scope="col">{c["calculator.col-payment"]}</th>
                    <th scope="col">{c["calculator.col-principal"]}</th>
                    <th scope="col">{c["calculator.col-interest"]}</th>
                    <th scope="col">{c["calculator.col-balance"]}</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map(([month, principal, monthInterest, balance]) => (
                    <tr key={month}>
                      <td>{month}</td>
                      <td>{gmd(principal + monthInterest)}</td>
                      <td>{gmd(principal)}</td>
                      <td>{gmd(monthInterest)}</td>
                      <td>{gmd(balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          <p className="small-note">{c["calculator.note"]}</p>
        </div>
      </div>
    </section>
  );
}
