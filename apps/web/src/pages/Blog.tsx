import { Link, useParams } from "react-router";
import { useWebsite } from "../data/WebsiteContent";
import { Icon } from "../components/Icon";
import { PageHeader, paragraphs } from "../components/ui";
import { NotFound } from "./NotFound";

export const postSlugs = [
  "exciting-news-for-sofora-cooperative-credit-union-members",
  "the-evolution-of-sofora",
] as const;

export function usePosts() {
  const { copy: c } = useWebsite();
  return [
    {
      slug: postSlugs[0],
      title: c["blog.post-1-title"],
      date: c["blog.post-1-date"],
      author: c["blog.post-1-author"],
      image: c["blog.post-1-image"],
      excerpt: c["blog.post-1-excerpt"],
      body: c["blog.post-1-body"],
      photos: [] as string[],
    },
    {
      slug: postSlugs[1],
      title: c["blog.post-2-title"],
      date: c["blog.post-2-date"],
      author: c["blog.post-2-author"],
      image: c["blog.post-2-image"],
      excerpt: c["blog.post-2-excerpt"],
      body: c["blog.post-2-body"],
      photos: [c["blog.post-2-photo-1"], c["blog.post-2-photo-2"], c["blog.post-2-photo-3"]],
    },
  ];
}

export function PostCards() {
  const { copy: c } = useWebsite();
  return (
    <div className="card-grid news-grid">
      {usePosts().map((post) => (
        <article className="news-card" key={post.slug}>
          <Link to={`/${post.slug}/`} tabIndex={-1} aria-hidden="true">
            <img src={post.image} alt="" loading="lazy" />
          </Link>
          <div className="news-card-body">
            <h3>
              <Link to={`/${post.slug}/`}>{post.title}</Link>
            </h3>
            <p className="post-meta">
              {post.date}
              <span aria-hidden="true">|</span>
              {c["blog.by"]} <strong>{post.author}</strong>
            </p>
            <p>{post.excerpt}</p>
            <Link className="text-link" to={`/${post.slug}/`}>
              {c["blog.read-more"]}
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}

export function Blog() {
  const { copy: c } = useWebsite();
  return (
    <>
      <PageHeader title={c["blog.title"]} />
      <div className="container page-panel">
        <PostCards />
      </div>
    </>
  );
}

export function BlogPost() {
  const { copy: c } = useWebsite();
  const { slug } = useParams();
  const post = usePosts().find((item) => item.slug === slug);
  if (!post) return <NotFound />;
  return (
    <>
      <PageHeader title={post.title} crumbs={[[c["blog.title"], "/blog/"]]} />
      <article className="container page-panel post">
        <img className="post-image" src={post.image} alt="" />
        <p className="post-meta">
          {post.date}
          <span aria-hidden="true">|</span>
          {c["blog.by"]} <strong>{post.author}</strong>
        </p>
        {paragraphs(post.body).map((text, index) =>
          /^https?:\/\/\S+$/.test(text) ? (
            <p key={index}>
              <a href={text} target="_blank" rel="noreferrer">
                {text}
              </a>
            </p>
          ) : (
            <p key={index}>{text}</p>
          ),
        )}
        {post.photos.length ? (
          <div className="post-photos">
            {post.photos.map((photo) => (
              <img key={photo} src={photo} alt="" loading="lazy" />
            ))}
          </div>
        ) : null}
        <Link className="text-link" to="/blog/">
          <Icon name="chevronLeft" />
          {c["blog.back"]}
        </Link>
      </article>
    </>
  );
}
