// Placeholder shapes shown while the published content loads from Convex.
// Lives outside the router and content context, so it uses no site data.

export function Bone({
  width,
  height,
  dark = false,
  round = false,
}: {
  width?: number | string;
  height?: number | string;
  dark?: boolean;
  round?: boolean;
}) {
  return (
    <span
      className={`bone${dark ? " bone-dark" : ""}${round ? " bone-round" : ""}`}
      style={{ width, height }}
    />
  );
}

function Cards() {
  return (
    <div className="sk-cards">
      {[0, 1, 2].map((n) => (
        <div className="sk-card" key={n}>
          <Bone width={56} height={56} round />
          <Bone width="70%" height={20} />
          <Bone width="100%" />
          <Bone width="85%" />
          <Bone width={110} />
        </div>
      ))}
    </div>
  );
}

function Split() {
  return (
    <div className="sk-split">
      <div className="sk-lines">
        <Bone width={120} height={12} />
        <Bone width="80%" height={30} />
        <Bone width="100%" />
        <Bone width="95%" />
        <Bone width="90%" />
        <Bone width="60%" />
      </div>
      <Bone width="100%" height={300} />
    </div>
  );
}

// `path` picks the home layout (slider and rates) or an inner page layout (the photo `HeroBanner` most pages use).
export function SiteSkeleton({ path }: { path: string }) {
  const home = path === "/" || path === "";
  return (
    <>
      <p className="sr-only" role="status">
        Loading Sofora…
      </p>
      <div className="site-skeleton" aria-hidden="true">
        <div className="top-bar">
          <div className="container container-wide top-bar-inner">
            <Bone width={260} height={12} dark />
            <Bone width={180} height={12} dark />
          </div>
        </div>
        <header className="site-header">
          <div className="container container-wide header-inner">
            <Bone width={64} height={64} round />
            <div className="sk-nav">
              {[64, 84, 92, 70, 58, 80].map((width, n) => (
                <Bone width={width} key={n} />
              ))}
            </div>
            <span className="sk-header-end">
              <Bone width={44} height={44} round />
            </span>
          </div>
        </header>
        <main>
          {home ? (
            <>
              <section className="sk-hero">
                <div className="container sk-lines">
                  <Bone width="55%" height={44} dark />
                  <Bone width="40%" height={44} dark />
                  <Bone width={150} height={48} dark />
                </div>
              </section>
              <div className="rates">
                <div className="rates-grid">
                  {[0, 1, 2, 3, 4].map((n) => (
                    <div className="rate" key={n}>
                      <Bone width={52} height={52} round />
                      <div className="sk-lines">
                        <Bone width={60} height={24} />
                        <Bone width={80} height={10} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <section className="hero-banner">
              <div className="container sk-lines">
                <Bone width="40%" height={52} dark />
                <Bone width={520} dark />
                <Bone width={380} dark />
              </div>
            </section>
          )}
          <section className="section section-white">
            <div className="container">
              <Split />
              <Cards />
            </div>
          </section>
        </main>
        <footer className="site-footer">
          <div className="container container-wide footer-main">
            <Bone width={96} height={96} round dark />
          </div>
          <div className="footer-bottom">
            <div className="container container-wide">
              <Bone width={280} height={12} dark />
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
