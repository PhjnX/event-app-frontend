import Header from "./_components/common/Header";
import Footer from "./_components/common/Footer";
import { Outlet } from "react-router-dom";
import BackToTop from "./_components/common/BackToTop";
export default function HomeTemplate() {
  return (
    <div className="w-full relative">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
