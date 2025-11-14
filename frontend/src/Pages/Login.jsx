import React, { useContext, useEffect, useState } from "react";

import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../Context/AppContext.jsx";

const Login = () => {
  const { token, setToken, role, setRole, link } = useContext(AppContext);
  const [state, setState] = useState("User Log In");
  const navigate = useNavigate();
  

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (state === "User Log In") {
        const data = await axios.post(
           `${link}/user/login-user`,
          { email, password }, {withCredentials: true}
        );
        if (data.data.success) {
          localStorage.setItem("token", data.data.token);
          setToken(data.data.token);
          localStorage.setItem("role", data.data.role);
          setRole(data.data.role);
          
          

          toast.success(data.data.message);
        } else {
          toast.error(data.data.message);
        }
      } else if (state === "Admin Log In") {
            if (email !== "mehmet0707gul@gmail.com"){
              const data = await axios.post(
               `${link}/admin/admin-login`,
              { email, password }
            );
              if (data.data.success) {
                localStorage.setItem("token", data.data.token);
                setToken(data.data.token);
                localStorage.setItem("role", data.data.role);
                setRole(data.data.role);
                

                toast.success(data.data.message);
              } else {
                toast.error(data.data.message);
              }
            } else {
              const data = await axios.post(
                 `${link}/admin/superadmin-login`,
                { email, password }
              );
              if (data.data.success) {
                localStorage.setItem("token", data.data.token);
                setToken(data.data.token);
                localStorage.setItem("role", data.data.role);
                setRole(data.data.role);
                
                toast.success(data.data.message);
              } else {
                toast.error(data.data.message);
              }
            }
        }

    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token]);

  return (
    <div className=" flex items-center justify-center m-auto">
      <form
        onSubmit={onSubmitHandler}
        className=" min-h-[80vh] flex items-center"
      >
        <div className="bg-[#F2F3FF] flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg">
          <p className="text-2xl  font-semibold">
            {state === "User Log In" ? "User Login" : "Admin Login"}
          </p>

          <div className="w-full">
            <p>Email</p>
            <input
              className="border border-zinc-300 rounded w-full p-2 mt-1"
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
            />
          </div>

          <div className="w-full">
            <p>Password</p>
            <input
              className="border border-zinc-300 rounded w-full p-2 mt-1"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
          </div>

          <button
            type="submit"
            className="bg-primary text-white w-full py-2 rounded-md text-base"
          >
            Login
          </button>

          {state === "User Log In" ? (
            <p>
              For admin account?{" "}
              <span
                onClick={() => setState("Admin Log In")}
                className="text-primary underline cursor-pointer"
              >
                Login here
              </span>
            </p>
          ) : (
            <p>
              For user account?{" "}
              <span
                onClick={() => setState("User Log In")}
                className="text-primary underline cursor-pointer"
              >
                Click here
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default Login;
