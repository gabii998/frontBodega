import PageTransition from "./PageTransition";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

// Componente de layout principal que incluye Sidebar y Topbar
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
      <div className="min-h-screen bg-gray-100">
        <Topbar />
        <Sidebar />
        <div className="pl-64 pt-16">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </div>
    );
  };

  export default MainLayout;