import { Link } from "react-router";
import { useWebsite } from "../data/WebsiteContent";
import { PageHeader } from "../components/ui";

export function NotFound() {
  const { copy: c } = useWebsite();
  return (
    <>
      <PageHeader title={c["shared.not-found-title"]} />
      <div className="container page-panel">
        <p>{c["shared.not-found-text"]}</p>
        <Link className="btn" to="/">
          {c["shared.not-found-button"]}
        </Link>
      </div>
    </>
  );
}
