import { useId, useState, type CSSProperties, type FormEvent } from "react";
import { Link } from "react-router";
import { useWebsite } from "../data/WebsiteContent";

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

function Range({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  const id = useId();
  return (
    <div className="range-field">
      <label htmlFor={id}>
        {label}
        <output htmlFor={id}>{value.toLocaleString("en-GM")}</output>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ "--fill": `${((value - min) / (max - min)) * 100}%` } as CSSProperties}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

export function LoanCalculator() {
  const { copy: c } = useWebsite();
  const [amount, setAmount] = useState(1000);
  const [months, setMonths] = useState(1);
  const [rate, setRate] = useState(() => {
    const value = Number(c["calculator.default-rate"]);
    return Number.isFinite(value) && value >= 0 && value <= 50 ? value : 15;
  });
  const monthly = monthlyPayment(amount, rate, months);
  const payable = monthly * months;
  const interest = Math.max(0, payable - amount);
  return (
    <section className="section" id="calculator">
      <div className="container">
        <div className="calculator-box">
          <h2 className="section-heading">{c["calculator.heading"]}</h2>
          <div className="calculator">
            <div>
              <div className="calculator-inputs">
                <Range label={c["calculator.amount"]} value={amount} min={1000} max={1000000} step={1000} onChange={setAmount} />
                <Range label={c["calculator.months"]} value={months} min={1} max={120} step={1} onChange={setMonths} />
                <Range label={c["calculator.rate"]} value={rate} min={0} max={50} step={0.5} onChange={setRate} />
              </div>
              <Link className="btn" to="/loan-application-form/">
                {c["calculator.apply"]}
              </Link>
            </div>
            <dl className="calculator-results" aria-live="polite">
              <div>
                <dt>{c["calculator.monthly"]}</dt>
                <dd>{gmd(monthly)}</dd>
              </div>
              <div>
                <dt>{c["calculator.interest"]}</dt>
                <dd>{gmd(interest)}</dd>
              </div>
              <div>
                <dt>{c["calculator.payable"]}</dt>
                <dd>{gmd(payable)}</dd>
              </div>
              <div>
                <dt>{c["calculator.percentage"]}</dt>
                <dd>{payable ? ((interest / payable) * 100).toFixed(2) : "0.00"} %</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

const initial = { amount: "1000", rate: "13", term: "1", unit: "years" as "years" | "months" };

export function AmortizationCalculator() {
  const { copy: c } = useWebsite();
  const id = useId();
  const [form, setForm] = useState(initial);
  const [result, setResult] = useState<typeof initial | null>(null);
  const amount = Number(result?.amount);
  const rate = Number(result?.rate);
  const months = Number(result?.term) * (result?.unit === "years" ? 12 : 1);
  const valid =
    result !== null &&
    amount > 0 && amount <= 100000000 &&
    rate >= 0 && rate <= 100 &&
    Number.isInteger(months) && months >= 1 && months <= 600;
  const payment = valid ? monthlyPayment(amount, rate, months) : 0;
  const schedule: [number, number, number, number][] = [];
  if (valid) {
    let balance = amount;
    for (let month = 1; month <= months; month++) {
      const interest = balance * (rate / 1200);
      const principal = Math.min(balance, payment - interest);
      balance = Math.max(0, balance - principal);
      schedule.push([month, principal, interest, balance]);
    }
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    setResult(form);
  }
  return (
    <section className="section section-tight" id="amortization">
      <div className="container">
        <h2 className="section-heading">{c["calculator.amortization-heading"]}</h2>
        <form className="amortization" onSubmit={submit}>
          <h3>{c["calculator.amortization-title"]}</h3>
          <div className="amortization-fields">
            <label>
              {c["calculator.amortization-amount"]} (GMD)
              <input type="number" min="1" max="100000000" step="any" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </label>
            <label>
              {c["calculator.amortization-rate"]}
              <input type="number" min="0" max="100" step="any" required value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} />
            </label>
            <div>
              <span className="label" id={`${id}-term`}>{c["calculator.amortization-term"]}</span>
              <div className="term-row" role="group" aria-labelledby={`${id}-term`}>
                <input type="number" min="1" max={form.unit === "years" ? 50 : 600} step="1" required aria-labelledby={`${id}-term`} value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })} />
                {(["years", "months"] as const).map((unit) => (
                  <label className="radio" key={unit}>
                    <input type="radio" name={`${id}-unit`} checked={form.unit === unit} onChange={() => setForm({ ...form, unit })} />
                    {unit === "years" ? c["calculator.years"] : c["calculator.amortization-months"]}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="amortization-actions">
            <button className="btn">{c["calculator.submit"]}</button>
            <button type="button" className="btn btn-plain" onClick={() => { setForm(initial); setResult(null); }}>
              {c["calculator.reset"]}
            </button>
          </div>
          {valid ? (
            <div className="schedule" aria-live="polite">
              <p className="schedule-summary">
                {c["calculator.monthly"]}: <strong>{gmd(payment)}</strong> · {c["calculator.payable"]}: <strong>{gmd(payment * months)}</strong>
              </p>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">{c["calculator.col-payment"]}</th>
                      <th scope="col">{c["calculator.col-principal"]}</th>
                      <th scope="col">{c["calculator.col-interest"]}</th>
                      <th scope="col">{c["calculator.col-balance"]}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map(([month, principal, interest, balance]) => (
                      <tr key={month}>
                        <td>{month}</td>
                        <td>{gmd(principal + interest)}</td>
                        <td>{gmd(principal)}</td>
                        <td>{gmd(interest)}</td>
                        <td>{gmd(balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : result ? (
            <p className="field-error" role="alert">Check the amount, rate (0–100%) and term (up to 50 years).</p>
          ) : null}
          <p className="small-note">{c["calculator.note"]}</p>
        </form>
      </div>
    </section>
  );
}
