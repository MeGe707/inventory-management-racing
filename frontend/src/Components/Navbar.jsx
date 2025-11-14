import React, { useContext, useState } from "react";
import { AppContext } from "../Context/AppContext";
import { NavLink, useNavigate } from "react-router-dom";

const Navbar = () => {
  const { assets } = useContext(AppContext);
  const { token, setToken, userData, role, link } = useContext(AppContext);
  const navigate = useNavigate();

  const [showMenu, setShowMenu] = useState(false);

  const logout = () => {
    setToken(false);
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  };


  

  return (
    <div className="">
      {token && (
        <div className="flex items-center justify-between text-sm py-4 border-b border-b-gray-400">
          <div>
            <NavLink
              to={"/"}
              className="flex items-center gap-2 ml-4 text-2xl font-bold"
            >
              {" "}
              Inventory App
            </NavLink>
            {role === "admin" ?  <div className="inline-flex ml-3 items-center">
              <p className="text-xs font-medium px-3 py-0.5 rounded-full border border-gray-300 text-gray-700 bg-gray-100 leading-none">
                Admin
              </p>
            </div> : null }

             {role === "superadmin" ?  <div className="inline-flex ml-3 items-center">
              <p className="text-xs font-medium px-3 py-0.5 rounded-full border border-gray-300 text-gray-700 bg-gray-100 leading-none">
                Superadmin
              </p>
            </div> : null }
           
          </div>

          <div className="flex item-center gap-4 ">
            {token && (
              <div className="flex mr-7 items-center gap-2 cursor-pointer group relative">
                <img className="w-8" src={assets.menu_icon} />
                <div className="absolute w-36 top-0 right-2 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block">
                  <div className="min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4 ">
                    <p
                      className="hover:text-black cursor-pointer"
                      onClick={() => navigate("/my-profile")}
                    >
                      My Profile
                    </p>
                    <p
                      className="hover:text-black cursor-pointer"
                      onClick={logout}
                    >
                      Logout
                    </p>
                  </div>
                </div>
              </div>
            )}

            <img
              onClick={() => setShowMenu(true)}
              className="w-6 md:hidden"
              src={assets.menu_icon}
              alt=""
            />
            {/*Mobile Menu */}
            <div
              className={`${
                showMenu ? "fixed w-full" : "h-0 w-0"
              } md:hidden right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all `}
            >
              <div className="flex items-center justify-between px-5 py-6">
                <img className="w-36" src={assets.logo} alt="" />
                <img
                  className="w-7"
                  onClick={() => setShowMenu(false)}
                  src={assets.cross_icon}
                  alt=""
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
