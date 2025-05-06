
import { Outlet } from "react-router-dom";
import Sidebar from "../navigation/Sidebar";
import Footer from "../navigation/Footer";

const AppLayout = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <main className="flex-1 p-6">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AppLayout;
