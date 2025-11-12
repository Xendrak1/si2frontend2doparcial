import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-8 md:p-12 lg:p-16">
          <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

