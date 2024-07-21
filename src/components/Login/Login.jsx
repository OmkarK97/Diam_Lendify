/* eslint-disable no-unused-vars */
"use client";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn, decrypt } from "../../utils/utils";
import { toast, ToastContainer } from "react-toastify";
("use client");
import { BackgroundGradient } from "../ui/background-gradient";
import { useWallet } from "../../WalletContext";

const Login = ({ diam_details }) => {
  const navigate = useNavigate();

  const { setData } = useWallet();

  const [password, setPassword] = useState("");

  const handleLogin = () => {
    const decryptData = decrypt(diam_details, password);
    if (decryptData) {
      setData(decryptData);
      navigate("/lending_borrowing");
    } else {
      toast.error("Invalid password", {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    }
  };

  const handleCreateNewAccount = () => {
    localStorage.removeItem("diam_wallet");
    localStorage.removeItem("walletData");
    window.location.reload();
  };

  return (
    <div className="h-screen w-screen flex flex-col justify-center bg-slate-950">
      <div className="pink_gradient" />
      <div className="flex flex-col items-center justify-center mx-auto">
        <BackgroundGradient className="rounded-[22px] max-w-sm p-4 sm:p-10 bg-white dark:bg-zinc-900">
          <ToastContainer />
          <div className="h-full flex flex-col justify-center">
            <div className="text-4xl font-semibold text-center">Login</div>
            <form className="my-8" onSubmit={handleLogin}>
              <div className="flex-col justify-center items-center mb-4">
                <label className="flex justify-start my-5">
                  Your password :
                </label>
                <input
                  placeholder="••••••••"
                  type="password"
                  className={cn(
                    "flex h-10 w-full border-none bg-gray-50 dark:bg-zinc-800 text-black dark:text-white shadow-input rounded-md px-3 py-2 text-sm  file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 dark:placeholder-text-neutral-600 focus-visible:outline-none focus-visible:ring-[2px]  focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-600 disabled:cursor-not-allowed disabled:opacity-50 dark:shadow-[0px_0px_1px_1px_var(--neutral-700)] group-hover/input:shadow-none transition duration-400"
                  )}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  required
                />
              </div>

              <button
                className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                type="submit"
              >
                Login &rarr;
              </button>

              <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />
            </form>
            <div
              className="text-sm text-gray-400 underline cursor-pointer"
              onClick={handleCreateNewAccount}
            >
              Create new Account ?
            </div>
          </div>
        </BackgroundGradient>
      </div>
      <div className="blue_gradient" />
    </div>
  );
};

export default Login;
