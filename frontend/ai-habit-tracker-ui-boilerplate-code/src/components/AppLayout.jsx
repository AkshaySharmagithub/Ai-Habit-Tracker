import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import MobileNav from "./MobileNav.jsx";

export default function AppLayout() {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <MobileNav />
      <main className="w-full md:pl-64">
        <div className="px-3 sm:px-4 md:px-8 py-5 md:py-8 pb-24 md:pb-10 max-w-6xl mx-auto">
        <Outlet />
        </div>
      </main>
    </div>
  );
}
