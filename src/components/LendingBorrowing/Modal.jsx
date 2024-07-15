import React, { useEffect, useState, useCallback } from "react";
import { useWallet } from "../../WalletContext";
import { Keypair } from "diamante-sdk-js";
import { getBalance, transferDiam } from "../../utils/utils";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { LoadingButton } from "../ui/LoadingButton";
import { ReloadIcon } from "@radix-ui/react-icons";

const Modal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("stake");
  const [amount, setAmount] = useState(0);
  const [depositBalance, setDepositBalance] = useState(0);
  const [withdrawBalance, setWithdrawBalance] = useState(0);
  const [dbData, setDBdata] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { data } = useWallet();

  const fetchBalance = useCallback(async () => {
    try {
      const DBalance = await getBalance(data?.public_key);
      setDepositBalance(DBalance);

      const { data: userResponse } = await axios.get(
        "http://localhost:3000/userData/get",
        {
          params: { address: data?.public_key },
        }
      );

      setWithdrawBalance(userResponse.msg.Total_Diam_Deposit);
      setDBdata(userResponse.msg);
    } catch (error) {
      console.error(error);
    }
  }, [data?.public_key]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance, amount, withdrawBalance, isOpen]);

  const protocolAddress = import.meta.env.VITE_PROTOCOL_ADDRESS;
  const protocolPair = Keypair.fromSecret(protocolAddress);
  const userPair = Keypair.fromSecret(data.secret_key);

  const handleMax = () => {
    setAmount(activeTab === "stake" ? depositBalance : withdrawBalance);
  };

  const handleAction = async (isDeposit) => {
    setIsLoading(true);
    console.log(isDeposit);
    const actionAmount = isDeposit ? parseInt(amount) : parseInt(amount * -1);

    const interest_per_sec = 0.000000192;

    const { Total_Diam_Deposit, Last_Borrowed, Total_USDC_Borrowed } = dbData;

    console.log(Total_Diam_Deposit, Last_Borrowed, Total_USDC_Borrowed);

    const diam_to_usdc = Total_Diam_Deposit * 0.8;

    const time_since_borrowed = Date.now() / 1000 - Last_Borrowed;

    const current_loan =
      Total_USDC_Borrowed * interest_per_sec * time_since_borrowed +
      Total_USDC_Borrowed;

    console.log(current_loan);

    const minimut_liquidity_threshold = current_loan * 1.125;

    console.log(minimut_liquidity_threshold);

    const available_to_withdraw =
      (diam_to_usdc - minimut_liquidity_threshold) / 0.8;

    console.log(available_to_withdraw);

    try {
      const userData = {
        address: data?.public_key,
        Total_Diam_Deposit: actionAmount,
        Total_USDC_Deposit: 0,
        Total_USDC_Borrowed: 0,
      };

      const protocolData = {
        USDC_Deposit_Total: 0,
        Total_Diam_Deposit: actionAmount,
        Total_USDC_Borrowed: 0,
        Available_Borrow_USDC: 0,
      };
      if (!isDeposit) {
        console.log(!isDeposit);
        if (parseInt(amount) <= available_to_withdraw) {
          await transferDiam(
            isDeposit ? userPair : protocolPair,
            isDeposit ? protocolPair.publicKey() : userPair.publicKey(),
            amount
          );
          toast.success(
            `${isDeposit ? "Deposit" : "Withdraw"} was successful!`,
            {
              position: "top-right",
              autoClose: 2500,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              theme: "dark",
            }
          );
          const { data: userResponse } = await axios.post(
            "http://localhost:3000/userData/send",
            userData
          );
          await axios.post(
            "http://localhost:3000/protocolData/send",
            protocolData
          );
          setWithdrawBalance(userResponse?.data?.response?.Total_Diam_Deposit);
        } else {
          toast.error(
            `Max Balance for withdraw is ${available_to_withdraw.toFixed(3)}`,
            {
              position: "top-right",
              autoClose: 2500,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              theme: "dark",
            }
          );
        }
      }

      if (isDeposit) {
        await transferDiam(
          isDeposit ? userPair : protocolPair,
          isDeposit ? protocolPair.publicKey() : userPair.publicKey(),
          amount
        );
        toast.success(`${isDeposit ? "Deposit" : "Withdraw"} was successful!`, {
          position: "top-right",
          autoClose: 2500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });
        const { data: userResponse } = await axios.post(
          "http://localhost:3000/userData/send",
          userData
        );
        await axios.post(
          "http://localhost:3000/protocolData/send",
          protocolData
        );
        setWithdrawBalance(userResponse?.data?.response?.Total_Diam_Deposit);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="h-full w-full fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur">
      <ToastContainer />
      <div className="bg-site-black rounded-lg w-[30%]">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Manage Collateral</h2>
          <button onClick={onClose} className="text-2xl">
            &times;
          </button>
        </div>
        <div className="p-4">
          <div className="flex justify-around mb-4 w-full h-full">
            <button
              onClick={() => setActiveTab("stake")}
              className={`px-4 py-2 rounded w-full ${
                activeTab === "stake"
                  ? "bg-purple-600 text-white"
                  : "bg-transparent text-white"
              }`}
            >
              Deposit
            </button>
            <button
              onClick={() => setActiveTab("unstake")}
              className={`px-4 py-2 rounded w-full ${
                activeTab === "unstake"
                  ? "bg-purple-600 text-white"
                  : "bg-transparent text-white"
              }`}
            >
              Withdraw
            </button>
          </div>
          <div className="flex items-center mb-4">
            <input
              type="number"
              placeholder="Amount"
              className="w-full px-4 py-2 border rounded"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <button
              className="ml-2 px-4 py-2 bg-purple-600 rounded"
              onClick={handleMax}
            >
              Max
            </button>
          </div>
          <div className="flex justify-between mb-4">
            <p>
              {activeTab === "stake"
                ? `Balance: ${depositBalance || "0.00"}`
                : `Balance: ${withdrawBalance || "0.00"}`}
            </p>
          </div>
        </div>
        <div className="flex justify-center p-4">
          {isLoading ? (
            <LoadingButton disabled>
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </LoadingButton>
          ) : activeTab === "stake" ? (
            <button
              className="px-4 py-2 w-36 h-10 font-semibold bg-purple-600 text-white rounded-lg"
              onClick={() => handleAction(true)}
            >
              Deposit
            </button>
          ) : activeTab === "unstake" ? (
            <button
              className="px-4 py-2 w-36 h-10 font-semibold bg-purple-600 text-white rounded-lg"
              onClick={() => handleAction(false)}
            >
              Withdraw
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Modal;
