import { useWebsite } from "../data/WebsiteContent";
import { Icon, type IconName } from "../components/Icon";
import { FaqList, PageHeader, PeopleGrid, lines } from "../components/ui";

export function About() {
  const { copy: c } = useWebsite();
  const stats: [IconName, string, string][] = [
    ["people", c["about.stat-1-value"], c["about.stat-1-label"]],
    ["money", c["about.stat-2-value"], c["about.stat-2-label"]],
    ["money", c["about.stat-3-value"], c["about.stat-3-label"]],
    ["home", c["about.stat-4-value"], c["about.stat-4-label"]],
  ];
  const operating = ([1, 2, 3] as const).map((n) => ({
    title: c[`about.operating-${n}`],
    items: lines(c[`about.operating-${n}-items`]),
  }));
  return (
    <>
      <PageHeader title={c["about.title"]} />
      <div className="container page-panel about-panel">
        <div className="two-columns centered">
          <div>
            <h2>{c["about.who-heading"]}</h2>
            <p>{c["about.who-text"]}</p>
          </div>
          <div>
            <h2>{c["about.why-heading"]}</h2>
            <p>{c["about.why-text"]}</p>
          </div>
        </div>
        <hr className="soft-divider" />
        <div className="narrow centered">
          <h2>{c["about.vision-heading"]}</h2>
          <p>{c["about.vision-text"]}</p>
          <h2>{c["about.mission-heading"]}</h2>
          <p>{c["about.mission-text"]}</p>
        </div>
      </div>
      <div className="container">
        <div className="stats">
          {stats.map(([icon, value, label], index) => (
            <div className="stat" key={index}>
              <Icon name={icon} />
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
        <div className="principles">
          <div>
            <h2>{c["about.values-heading"]}</h2>
            <ul className="plain-list">
              {lines(c["about.values"]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2>{c["about.cooperative-heading"]}</h2>
            <ol>
              {lines(c["about.cooperative"]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </div>
          <div>
            <h2>{c["about.operating-heading"]}</h2>
            <ol>
              {operating.map(({ title, items }) => (
                <li key={title}>
                  {title}
                  <ol type="a">
                    {items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </>
  );
}

export function History() {
  const { copy: c } = useWebsite();
  return (
    <>
      <PageHeader title={c["history.title"]} crumbs={[[c["about.title"], "/about-us/"]]} />
      <div className="container page-panel prose">
        <h2>{c["history.heading"]}</h2>
        <img className="history-logo" src={c["history.image"]} alt="" width="192" height="192" />
        <p>{c["history.p1"]}</p>
        <p>{c["history.p2"]}</p>
        <p>{c["history.p3"]}</p>
      </div>
    </>
  );
}

export function Faq() {
  const { copy: c } = useWebsite();
  return (
    <>
      <PageHeader title={c["faq.title"]} crumbs={[[c["about.title"], "/about-us/"]]} />
      <div className="container page-panel">
        <h2>{c["faq.heading"]}</h2>
        <FaqList />
      </div>
    </>
  );
}

export function Board() {
  const { copy: c, board } = useWebsite();
  return (
    <>
      <PageHeader title={c["board.title"]} />
      <div className="container page-panel">
        <PeopleGrid people={board} />
      </div>
    </>
  );
}

export function Staff({ loanTeam = false }: { loanTeam?: boolean }) {
  const { copy: c, staff } = useWebsite();
  return (
    <>
      <PageHeader title={loanTeam ? c["staff.loan-team-title"] : c["staff.title"]} />
      <div className="container page-panel">
        <PeopleGrid people={staff} />
      </div>
    </>
  );
}
