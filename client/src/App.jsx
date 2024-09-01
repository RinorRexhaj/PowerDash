import {
  BrowserRouter,
  Routes,
  Route,
  Router,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar/Sidebar";
import Searchbar from "./Searchbar/Searchbar";

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="w-full h-screen flex relative overflow-hidden">
      <BrowserRouter>
        <Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="w-full flex flex-col items-center gap-15">
          <Searchbar
            search={search}
            setSearch={setSearch}
            toggleSidebar={toggleSidebar}
          />
          <div className="w-full h-full overflow-y-auto z-0 -mt-[74px] p-10 sm:px-6 bg-slate-100"></div>
          <Routes>
            <Route path="*" element={<h1>PowerDash</h1>} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
};

export default App;
