import React, { useState, useEffect } from "react";
import { useAuthStore } from "../Context/authStore.js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Login = () => {
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  const navigate = useNavigate();

  const [mode, setMode] = useState("User Log In");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      let type = "user";

      if (mode === "Admin Log In") {
        if (email === "mehmet0707gul@gmail.com") {
          type = "superadmin";
        } else {
          type = "admin";
        }
      }

      const data = await login(email, password, type);

      toast.success(data.message || "Login successful");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated]);

  return (
    <div className="flex items-center justify-center m-auto">
      <form
        onSubmit={onSubmitHandler}
        className="min-h-[80vh] flex items-center"
      >
        <div className="bg-[#F2F3FF] flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg">
          <p className="text-2xl font-semibold">
            {mode === "User Log In" ? "User Login" : "Admin Login"}
          </p>

          <div className="w-full">
            <p>Email</p>
            <input
              className="border border-zinc-300 rounded w-full p-2 mt-1"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="w-full">
            <p>Password</p>
            <input
              className="border border-zinc-300 rounded w-full p-2 mt-1"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-primary text-white w-full py-2 rounded-md text-base"
          >
            {isLoading ? "Loading..." : "Login"}
          </button>

          {mode === "User Log In" ? (
            <p>
              For admin account?{" "}
              <span
                onClick={() => setMode("Admin Log In")}
                className="text-primary underline cursor-pointer"
              >
                Login here
              </span>
            </p>
          ) : (
            <p>
              For user account?{" "}
              <span
                onClick={() => setMode("User Log In")}
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
