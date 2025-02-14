import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { copy } from "../assets";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createWallet, encrypt } from "../utils/utils";
import axios from "axios";
import { useWallet } from "../WalletContext";
import { ReloadIcon } from "@radix-ui/react-icons";
import { LoadingButton } from "../components/ui/LoadingButton";

const CreateWallet = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [walletData, setWalletData] = useState({});
  const [submit, setSubmit] = useState(false);

  const { setData } = useWallet();

  useEffect(() => {
    const keypair = createWallet();
    setWalletData(keypair);
  }, []);

  const handleCopy = async (text, successMessage) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(successMessage, {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    } catch (err) {
      toast.error("Failed to copy!", {
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

  const handleCreateNewAddress = () => {
    const pair = createWallet();
    setWalletData(pair);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmit(true);

      const response = await axios.get(
        `https://friendbot.diamcircle.io?addr=${walletData.public_key}`
      );

      const data = {
        address: walletData.public_key,
        Total_Diam_Deposit: 0,
        Total_USDC_Deposit: 0,
        Total_USDC_Borrowed: 0,
        Last_Borrowed: 0,
        Last_Supplied: 0,
      };

      await axios.post(
        "https://lendify-backend-nmnj.vercel.app/userData/send",
        data
      );

      setSubmit(false);

      if (response.status === 200) {
        const encryptText = encrypt(walletData, password);
        localStorage.setItem("diam_wallet", encryptText);
        setPassword("");
        setData(walletData);
        navigate("/lending_borrowing");
      } else {
        toast.error("Something went wrong while creating wallet");
      }
    } catch (error) {
      toast.error("Something went wrong while creating wallet");
    }
  };

  return (
    <div className="h-full w-[70%] pt-[4.75rem] lg:pt-[5.25rem] flex flex-col items-center mx-auto justify-center">
      <ToastContainer />
      <div className="text-[34px] font-bold mb-10">Create Wallet</div>
      <span className="text-base">
        Create a 6-digit PIN code to secure your account. Your private key will
        be encrypted and stored locally on your device, giving you sole control
        over your funds.{" "}
        <strong className="text-purple-500">
          Keep your private key safe and never share it with anyone
        </strong>
        . Our wallet uses industry-leading security measures to protect your
        assets. However, you are ultimately responsible for the safety of your
        private key.{" "}
        <strong className="text-purple-500">
          If you lose it, we cannot recover your funds.
        </strong>
      </span>
      <div className="flex h-full w-full justify-between">
        <div className="h-full w-[50%] flex flex-col justify-center">
          <div className="flex flex-col">
            <p className="text-xl font-bold">Public Key :</p>
            <div className="mt-5 flex justify-between h-10 bg-site-black items-center rounded-lg">
              <span className="ml-5">{`${walletData.public_key?.slice(
                0,
                10
              )}.....${walletData.public_key?.slice(
                walletData.public_key.length - 10
              )}`}</span>
              <img
                src={copy}
                alt="copy"
                className="ml-10 cursor-pointer mr-5"
                onClick={() =>
                  handleCopy(
                    walletData.public_key,
                    "Public key copied to clipboard"
                  )
                }
              />
            </div>
          </div>
          <div className="flex flex-col mt-10">
            <p className="text-xl font-bold">Secret key :</p>
            <div className="mt-5 flex justify-between h-10 bg-site-black items-center rounded-lg">
              <span className="ml-5">{`${walletData.secret_key?.slice(
                0,
                11
              )}.....${walletData.secret_key?.slice(
                walletData.secret_key.length - 11
              )}`}</span>
              <img
                src={copy}
                alt="copy"
                className="ml-10 cursor-pointer mr-5"
                onClick={() =>
                  handleCopy(
                    walletData.secret_key,
                    "Secret key copied to clipboard"
                  )
                }
              />
            </div>
          </div>
        </div>
        <div className="h-full w-[50%] flex justify-center">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col justify-center"
          >
            <div className="flex flex-col justify-center">
              <label className="text-2xl">Password :</label>
              <input
                type="password"
                placeholder="••••••••"
                className="h-10 w-full p-5 bg-transparent border-2 border-site-black mt-5"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-between w-full mt-10">
              {submit ? (
                <LoadingButton disabled>
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </LoadingButton>
              ) : (
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-800 cursor-pointer h-10 w-36 rounded-lg font-semibold text-lg"
                >
                  Login
                </button>
              )}
              <button
                type="button"
                className="text-[#878787] hover:text-gray-500 cursor-pointer ml-10"
                onClick={handleCreateNewAddress}
              >
                Create new address?
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateWallet;
