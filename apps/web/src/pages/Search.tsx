import { Fragment, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { useWebsite } from "../data/WebsiteContent";
import { searchSite } from "../data/search";
import { PageHeader } from "../components/ui";

function Highlight({ text, words }: { text: string; words: string[] }) {
  const pattern = new RegExp(`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  return (
    <>
      {text.split(pattern).map((part, index) =>
        index % 2 ? <mark key={index}>{part}</mark> : <Fragment key={index}>{part}</Fragment>,
      )}
    </>
  );
}

// Shown at /?s=…, the address WordPress used for search results.
export function SearchResults({ query }: { query: string }) {
  const content = useWebsite();
  const { copy: c } = content;
  const results = searchSite(content, query);
  const words = query.split(/\s+/).filter(Boolean);
  return (
    <>
      <PageHeader title={`${c["shared.search-title"]} ${query}`} />
      <div className="container page-panel">
        <SearchForm initial={query} />
        {results.length ? (
          <ol className="search-results">
            {results.map((result) => (
              <li key={result.path}>
                <h2>
                  <Link to={result.path}>
                    <Highlight text={result.title} words={words} />
                  </Link>
                </h2>
                <p>
                  <Highlight text={result.snippet} words={words} />
                </p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="search-empty">{c["shared.search-empty"]}</p>
        )}
      </div>
    </>
  );
}

export function SearchForm({ initial = "", autoFocus = false, onSearch }: { initial?: string; autoFocus?: boolean; onSearch?: () => void }) {
  const { copy: c } = useWebsite();
  const navigate = useNavigate();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = String(new FormData(event.currentTarget).get("s") ?? "").trim();
    if (!query) return;
    navigate(`/?s=${encodeURIComponent(query)}`);
    onSearch?.();
  }
  return (
    <form className="search-form" role="search" onSubmit={submit}>
      <label className="sr-only" htmlFor={autoFocus ? "header-search" : "page-search"}>
        {c["shared.search-button"]}
      </label>
      <input
        id={autoFocus ? "header-search" : "page-search"}
        type="search"
        name="s"
        required
        autoFocus={autoFocus}
        defaultValue={initial}
        placeholder={c["shared.search-placeholder"]}
      />
      <button className="btn">{c["shared.search-button"]}</button>
    </form>
  );
}
