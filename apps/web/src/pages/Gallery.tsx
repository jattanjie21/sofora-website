import { useEffect, useState } from "react";
import { useWebsite } from "../data/WebsiteContent";
import { Icon } from "../components/Icon";
import { PageHeader } from "../components/ui";

export function PhotoGallery() {
  const { copy: c } = useWebsite();
  const photos = ([1, 2, 3, 4, 5, 6, 7] as const)
    .map((n) => c[`photos.photo-${n}`])
    .filter(Boolean);
  const [open, setOpen] = useState<number | null>(null);
  useEffect(() => {
    if (open === null) return;
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
      if (event.key === "ArrowRight") setOpen((i) => (i! + 1) % photos.length);
      if (event.key === "ArrowLeft") setOpen((i) => (i! - 1 + photos.length) % photos.length);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [open, photos.length]);
  return (
    <>
      <PageHeader title={c["photos.title"]} />
      <div className="container page-panel">
        <div className="photo-grid">
          {photos.map((photo, index) => (
            <button type="button" key={index} onClick={() => setOpen(index)} aria-label={`Open photo ${index + 1}`}>
              <img src={photo} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      </div>
      {open !== null ? (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={`Photo ${open + 1} of ${photos.length}`} onClick={() => setOpen(null)}>
          <img src={photos[open]} alt="" onClick={(event) => event.stopPropagation()} />
          <button type="button" className="lightbox-close" aria-label="Close" autoFocus onClick={() => setOpen(null)}>
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
      <PageHeader title={c["videos.title"]} />
      <div className="container page-panel">
        <div className="video-grid">
          {channel ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/videoseries?list=UU${channel}`}
              title={c["videos.title"]}
              loading="lazy"
              allow="encrypted-media; picture-in-picture; fullscreen"
            />
          ) : null}
          {featured ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${featured}`}
              title={c["loans.business-heading"]}
              loading="lazy"
              allow="encrypted-media; picture-in-picture; fullscreen"
            />
          ) : null}
        </div>
        <a className="btn" href={c["videos.channel-url"]} target="_blank" rel="noreferrer">
          <Icon name="play" />
          {c["videos.channel-button"]}
        </a>
      </div>
    </>
  );
}
