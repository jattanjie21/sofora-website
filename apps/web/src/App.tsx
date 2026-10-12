import { Route, Routes } from "react-router";
import { Layout } from "./components/Layout";
import { ButtonLink, PageHero } from "./components/ui";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Savings } from "./pages/Savings";
import { Loans } from "./pages/Loans";
import { Membership } from "./pages/Membership";
import { Community } from "./pages/Community";
import { Contact } from "./pages/Contact";
import { Apply } from "./pages/Apply";

export function App({ preview = false }: { preview?: boolean }) {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="savings" element={<Savings />} />
        <Route path="loans" element={<Loans />} />
        <Route path="membership" element={<Membership />} />
        <Route path="community" element={<Community />} />
        <Route path="contact" element={<Contact />} />
        <Route path="apply/:kind" element={<Apply preview={preview} />} />
        <Route
          path="*"
          element={
            <>
              <PageHero
                eyebrow="404 · A small detour"
                title="Let’s get you back on track."
              >
                The page you’re looking for isn’t here. There’s plenty to
                discover at Sofora.
              </PageHero>
              <div className="container section">
                <ButtonLink to="/">Back to home</ButtonLink>
              </div>
            </>
          }
        />
      </Route>
    </Routes>
  );
}
