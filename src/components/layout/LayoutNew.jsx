import { useState } from "react";
import SidebarNew from "./SidebarNew";
import HeaderNew from "./HeaderNew";

// Layout principal con diseño minimalista
const LayoutNew = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Barra lateral */}
      <SidebarNew isOpen={sidebarOpen} />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <HeaderNew
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />

        {/* Área de contenido con scroll */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* Container centrado con padding responsivo */}
          <div className="max-w-[1400px] mx-auto px-6 md:px-8 lg:px-12 py-8 md:py-10 lg:py-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default LayoutNew;

