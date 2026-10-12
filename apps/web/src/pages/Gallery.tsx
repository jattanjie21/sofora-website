import { useEffect, useRef, useState, type ReactNode } from "react";
import { NavLink, useSearchParams } from "react-router";
import { useWebsite } from "../data/WebsiteContent";
import { Icon } from "../components/Icon";
import { CtaBanner, HeroBanner, usePageTitle } from "../components/ui";

// Shared hero for both gallery pages, with tabs to switch between them.
function GalleryHero({
  page,
  children,
}: {
  page: "photos" | "videos";
  children: ReactNode;
}) {
  const { copy: c } = useWebsite();
  const title = c["shared.nav-gallery"];
  usePageTitle(
    page === "photos" ? title : `${title}: ${c["shared.gallery-videos-tab"]}`,
  );
  return (
    <HeroBanner title={title} intro={c[`${page}.intro`]} image={c["shared.gallery-hero-image"]}>
      <nav className="gallery-tabs" aria-label={title}>
        <NavLink to="/photo-gallery/">
          <Icon name="image" />
          {c["shared.gallery-photos-tab"]}
        </NavLink>
        <NavLink to="/youtube-gallery/">
          <Icon name="play" />
          {c["shared.gallery-videos-tab"]}
        </NavLink>
      </nav>
      {children}
    </HeroBanner>
  );
}

function GalleryCta() {
  const { copy: c } = useWebsite();
  return (
    <CtaBanner
      heading={c["shared.gallery-cta-heading"]}
      text={c["shared.gallery-cta-text"]}
      primary={[c["shared.gallery-cta-button"], "/membership-application-form/"]}
      secondary={[c["shared.gallery-cta-contact"], "/contact-us/"]}
    />
  );
}

const perPage = 6;

export function PhotoGallery() {
  const { copy: c } = useWebsite();
  const photos = ([1, 2, 3, 4, 5, 6, 7] as const)
    .map((n) => c[`photos.photo-${n}`])
    .filter(Boolean);
  const pages = Math.max(1, Math.ceil(photos.length / perPage));
  const [params, setParams] = useSearchParams();
  const page = Math.min(pages, Math.max(1, Number(params.get("page")) || 1));
  const grid = useRef<HTMLDivElement>(null);
  const goToPage = (n: number) => {
    setParams(n === 1 ? {} : { page: String(n) }, { replace: true });
    grid.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const [open, setOpen] = useState<number | null>(null);
  const step = (by: number) =>
    setOpen((i) => (i! + by + photos.length) % photos.length);
  const close = () => {
    // Land on the page holding the last photo viewed.
    const target = Math.floor(open! / perPage) + 1;
    if (target !== page)
      setParams(target === 1 ? {} : { page: String(target) }, {
        replace: true,
      });
    setOpen(null);
  };
  const swipeStart = useRef<number | null>(null);
  useEffect(() => {
    if (open === null) return;
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", key);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", key);
      document.body.style.overflow = "";
    };
  }, [open, photos.length]);
  const first = (page - 1) * perPage;
  return (
    <>
      <GalleryHero page="photos">
        <span className="gallery-count">{photos.length} photos</span>
      </GalleryHero>
      <div className="container gallery-body">
        <div className="photo-grid" ref={grid}>
          {photos.slice(first, first + perPage).map((photo, offset) => {
            const index = first + offset;
            return (
              <button
                type="button"
                key={index}
                onClick={() => setOpen(index)}
                aria-label={`Open photo ${index + 1} of ${photos.length}`}
              >
                <img src={photo} alt="" loading="lazy" />
                <span className="photo-overlay" aria-hidden="true">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <Icon name="expand" />
                </span>
              </button>
            );
          })}
        </div>
        {pages > 1 ? (
          <nav className="pagination" aria-label="Gallery pages">
            <button
              type="button"
              aria-label="Previous page"
              disabled={page === 1}
              onClick={() => goToPage(page - 1)}
            >
              <Icon name="chevronLeft" />
            </button>
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <button
                type="button"
                key={n}
                aria-label={`Page ${n}`}
                aria-current={n === page ? "page" : undefined}
                onClick={() => goToPage(n)}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              aria-label="Next page"
              disabled={page === pages}
              onClick={() => goToPage(page + 1)}
            >
              <Icon name="chevronRight" />
            </button>
          </nav>
        ) : null}
      </div>
      <GalleryCta />
      {open !== null ? (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Photo ${open + 1} of ${photos.length}`}
          onClick={close}
          onTouchStart={(event) =>
            (swipeStart.current = event.touches[0]?.clientX ?? null)
          }
          onTouchEnd={(event) => {
            const end = event.changedTouches[0]?.clientX;
            const moved =
              end === undefined || swipeStart.current === null
                ? 0
                : end - swipeStart.current;
            if (Math.abs(moved) > 50) step(moved < 0 ? 1 : -1);
            swipeStart.current = null;
          }}
        >
          <img
            key={open}
            src={photos[open]}
            alt=""
            onClick={(event) => event.stopPropagation()}
          />
          {photos.length > 1 ? (
            <>
              <button
                type="button"
                className="lightbox-nav lightbox-prev"
                aria-label="Previous photo"
                onClick={(event) => (event.stopPropagation(), step(-1))}
              >
                <Icon name="chevronLeft" />
              </button>
              <button
                type="button"
                className="lightbox-nav lightbox-next"
                aria-label="Next photo"
                onClick={(event) => (event.stopPropagation(), step(1))}
              >
                <Icon name="chevronRight" />
              </button>
            </>
          ) : null}
          <span className="lightbox-count">
            {open + 1} / {photos.length}
          </span>
          <button
            type="button"
            className="lightbox-close"
            aria-label="Close"
            autoFocus
            onClick={close}
          >
            <Icon name="close" />
          </button>
        </div>
      ) : null}
    </>
  );
}

function youtubeId(url: string) {
  return url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/)?.[1];
}

export function YouTubeGallery() {
  const { copy: c } = useWebsite();
  const channel = c["videos.channel-url"].match(/channel\/UC([\w-]+)/)?.[1];
  const featured = youtubeId(c["videos.featured-url"]);
  return (
    <>
      <GalleryHero page="videos">
        <a
          className="gallery-channel"
          href={c["videos.channel-url"]}
          target="_blank"
          rel="noreferrer"
        >
          {c["videos.channel-button"]}
          <Icon name="northeast" />
        </a>
      </GalleryHero>
      <div className="container gallery-body">
        <div className="video-grid">
          {featured ? (
            <figure className="video-card">
              <figcaption>
                <Icon name="play" />
                {c["videos.featured-heading"]}
              </figcaption>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${featured}`}
                title={c["loans.business-heading"]}
                loading="lazy"
                allow="encrypted-media; picture-in-picture; fullscreen"
              />
            </figure>
          ) : null}
          {channel ? (
            <figure className="video-card">
              <figcaption>
                <Icon name="menu" />
                {c["videos.playlist-heading"]}
              </figcaption>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/videoseries?list=UU${channel}`}
                title={c["videos.playlist-heading"]}
                loading="lazy"
                allow="encrypted-media; picture-in-picture; fullscreen"
              />
            </figure>
          ) : null}
        </div>
      </div>
      <GalleryCta />
    </>
  );
}
