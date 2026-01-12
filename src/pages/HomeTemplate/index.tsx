import { useState } from "react";
import Header from "./_components/common/Header";
import Footer from "./_components/common/Footer";
import { Outlet } from "react-router-dom";
import BackToTop from "./_components/common/BackToTop";
import OrganizerRegModal from "./_components/common/OrganizerRegModal";
import FrequencyPopup from "./_components/common/FrequencyPopup";

export default function HomeTemplate() {
  const [showOrgModal, setShowOrgModal] = useState(false);

  const handleOpenModal = () => {
    console.log("🚀 Đã nhận lệnh mở Modal từ nút bấm!"); 
    setShowOrgModal(true);
  };

  return (
    <div className="w-full relative overflow-x-hidden bg-[#09090b]">
      <Header />

      <main className="relative w-full min-h-screen">
        <Outlet />
      </main>

      <Footer />

      <BackToTop onOpenOrgModal={handleOpenModal} />

      <FrequencyPopup />

      <OrganizerRegModal
        isOpen={showOrgModal}
        onClose={() => setShowOrgModal(false)}
      />
    </div>
  );
}
