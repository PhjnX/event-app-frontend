import Header from "./_components/Header";
import Footer from "./_components/Footer";
import { Outlet } from "react-router-dom";

export default function HomeTemplate() {
  return (
    <div className="w-full relative">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
