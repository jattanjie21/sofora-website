import { Navigate, Route, Routes } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { About, Board, Faq, History, Staff } from "./pages/About";
import { Downloads, ServiceDetail, ServicesHub } from "./pages/Services";
import { Blog, BlogPost } from "./pages/Blog";
import { PhotoGallery, YouTubeGallery } from "./pages/Gallery";
import { Contact } from "./pages/Contact";
import { Partners } from "./pages/Partners";
import { Apply } from "./pages/Apply";
import { NotFound } from "./pages/NotFound";
import { PersonProfile } from "./pages/Person";

// Routes keep the original WordPress addresses so existing links still work
// (/loan-services/ and /saving/ now redirect into /services/).
export function App({ preview = false }: { preview?: boolean }) {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about-us" element={<About />} />
        <Route path="history" element={<History />} />
        <Route path="faq" element={<Faq />} />
        <Route path="board-of-directors" element={<Board />} />
        <Route path="staff" element={<Staff />} />
        <Route path="board-of-directors/:slug" element={<PersonProfile group="board" />} />
        <Route path="staff/:slug" element={<PersonProfile group="staff" />} />
        <Route path="loan-team" element={<Staff loanTeam />} />
        <Route path="services" element={<ServicesHub />} />
        <Route path="services/:slug" element={<ServiceDetail />} />
        <Route path="loan-services" element={<Navigate to="/services/#loans" replace />} />
        <Route path="saving" element={<Navigate to="/services/#savings" replace />} />
        <Route path="downloads" element={<Downloads />} />
        <Route path="blog" element={<Blog />} />
        <Route path="photo-gallery" element={<PhotoGallery />} />
        <Route path="youtube-gallery" element={<YouTubeGallery />} />
        <Route path="contact-us" element={<Contact preview={preview} />} />
        <Route path="partners" element={<Partners />} />
        <Route path="registration-form" element={<Apply form="registration" preview={preview} />} />
        <Route path="membership-application-form" element={<Apply form="membership" preview={preview} />} />
        <Route path="kafo-application-form" element={<Apply form="kafo" preview={preview} />} />
        <Route path="loan-application-form" element={<Apply form="loan" preview={preview} />} />
        <Route path=":slug" element={<BlogPost />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
