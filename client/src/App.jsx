import {
  BrowserRouter,
  Routes,
  Route,
  Router,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar/Sidebar";
import Searchbar from "./Searchbar/Searchbar";
import View from "./View/View";
import DefaultView from "./View/DefaultView";

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState([]);
  const [copyData, setCopyData] = useState([]);
  const [searchData, setSearchData] = useState([]);
  const [search, setSearch] = useState("");
  const [views, setViews] = useState([]);
  const searchRef = useRef();

  useEffect(() => {
    const handleKeyUp = (e) => {
      if (e.key === "/") searchRef.current.focus();
    };
    document.addEventListener("keyup", handleKeyUp);
    const initViews = [];
    Object.entries(localStorage).forEach(([key, value]) => {
      if (key !== "") initViews.push({ dest: key });
    });
    if (initViews.length > 0) {
      setViews(initViews.sort((a, b) => a.dest.localeCompare(b.dest)));
      // window.location.href = "/" + initViews[0].dest.toLowerCase();
    }
    return () => document.removeEventListener("keyup", handleKeyUp);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="w-full h-screen flex relative overflow-hidden">
      <BrowserRouter>
        <Sidebar
          open={sidebarOpen}
          toggleSidebar={toggleSidebar}
          views={views}
          setViews={setViews}
        />
        <div className="w-full flex flex-col items-center gap-15">
          <Searchbar
            search={search}
            setSearch={setSearch}
            data={data}
            setData={setData}
            copyData={copyData}
            toggleSidebar={toggleSidebar}
            searchRef={searchRef}
          />
          <div className="w-full h-full overflow-y-auto z-0 -mt-[74px] py-6 px-8 sm:px-6 bg-slate-100">
            <div className="w-full absolute top-22.5 left-0 h-6 bg-slate-100 z-99"></div>
            <Routes>
              <Route
                path="/"
                element={
                  <DefaultView type={"PowerDash"} key={"default-view"} />
                }
              />
              {views.map((view) => {
                return (
                  <Route
                    path={`/${view.dest.toLowerCase()}`}
                    element={
                      <View
                        type={view.dest}
                        data={data}
                        setData={setData}
                        copyData={copyData}
                        setCopyData={setCopyData}
                        key={view.dest}
                      />
                    }
                    key={view.dest}
                    created={view.created}
                  />
                );
              })}
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </div>
  );
};

export default App;
