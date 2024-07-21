/* eslint-disable react-refresh/only-export-components */
import React, { useCallback, useEffect, useState } from "react";
import { addLogo } from "../../assets";
import { LuArrowUpDown } from "react-icons/lu";
import { useWallet } from "../../WalletContext";
import { Keypair, Asset } from "diamante-sdk-js";
import { changeTrust, transferAssets } from "../../utils/utils";
import Modal from "./Modal";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { LoadingButton } from "../ui/LoadingButton";
import { ReloadIcon } from "@radix-ui/react-icons";

const protocolAddress = import.meta.env.VITE_PROTOCOL_ADDRESS;
const protocolPair = Keypair.fromSecret(protocolAddress);
const usdc = new Asset(
  "USDC",
  "GAW54VVDJKR7NQDZKM4F26IRA4WO4663ZGVN4CPTG74AOPHM6EUSGOCF"
);

const COP = () => {
  const [manage, setManage] = useState(false);
  const [dbData, setDBdata] = useState({});
  const [manageAmount, setManageAmount] = useState("0");
  const [arrowClicked, setArrowClicked] = useState(true);
  const [supplyBalance, setSupplyBalance] = useState(0);
  const [borrowBalance, setBorrowBalance] = useState(0);
  const [text, setText] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { data: walletData } = useWallet();

  const userPair = Keypair.fromSecret(walletData.secret_key);

  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get(
        "https://lendify-backend-nmnj.vercel.app/userData/get",
        {
          params: { address: walletData?.public_key },
        }
      );
      setDBdata(response.data.msg);
    } catch (error) {
      console.error(error);
    }
  }, [walletData?.public_key]);

  useEffect(() => {
    const {
      Total_USDC_Borrowed,
      Last_Borrowed,
      Total_USDC_Deposit,
      Last_Supplied,
    } = dbData;
    const interest_per_sec_supply = 0.00000025;
    const interest_per_sec_borrow = 0.000000192;
    const current_time = Date.now() / 1000;
    const time_since_borrowed = current_time - Last_Borrowed;
    const time_since_deposit = current_time - Last_Supplied;
    const current_Supply =
      (Total_USDC_Deposit * time_since_deposit * interest_per_sec_supply) /
        100 +
      Total_USDC_Deposit;
    const current_Borrow =
      Total_USDC_Borrowed * interest_per_sec_borrow * time_since_borrowed +
      Total_USDC_Borrowed;
    setSupplyBalance(current_Supply);
    setBorrowBalance(current_Borrow);
  }, [dbData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleManageSupply = () => {
    setManage(true);
    setText(0);
  };

  const handleManageWithdraw = () => {
    setManage(true);
    setText(1);
  };

  const handleManageBorrow = () => {
    setManage(true);
    setText(2);
  };

  const handleManageRepay = () => {
    setManage(true);
    setText(3);
  };

  const handleManage = async ({ number }) => {
    if (number === 0) {
      setIsLoading(true);
      const change_Trust = await changeTrust(protocolPair, usdc, "100000");

      const data = await transferAssets(
        userPair,
        protocolPair.publicKey(),
        usdc,
        manageAmount
      );

      if (data && change_Trust) {
        const { Last_Supplied, Total_USDC_Deposit } = dbData;
        const interest_per_sec = 0.00000025;
        const current_time = Date.now() / 1000;
        const time_since_deposit = current_time - Last_Supplied;
        const current_user_balance =
          (Total_USDC_Deposit * time_since_deposit * interest_per_sec) / 100;

        const new_balance = current_user_balance + parseInt(manageAmount);

        const userData = {
          address: walletData?.public_key,
          Total_Diam_Deposit: 0,
          Total_USDC_Deposit: parseInt(new_balance),
          Total_USDC_Borrowed: 0,
          Last_Supplied: Date.now() / 1000,
        };

        const protocolData = {
          USDC_Deposit_Total: parseInt(manageAmount),
          Total_Diam_Deposit: 0,
          Total_USDC_Borrowed: 0,
          Available_Borrow_USDC: 0,
        };

        await axios.post(
          "https://lendify-backend-nmnj.vercel.app/userData/send",
          userData
        );

        await axios.post(
          "https://lendify-backend-nmnj.vercel.app/protocolData/send",
          protocolData
        );

        fetchData();
      } else {
        toast.error(`Error occurred`, {
          position: "top-right",
          autoClose: 2500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });
      }

      toast.success(`Supply was successful!`, {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      setIsLoading(false);
    } else if (number === 1) {
      setIsLoading(true);
      const change_Trust = await changeTrust(userPair, usdc, "100000");
      const { Last_Supplied, Total_USDC_Deposit } = dbData;
      const interest_per_sec = 0.00000025;
      const current_time = Date.now() / 1000;
      const time_since_deposit = current_time - Last_Supplied;
      const current_user_balance =
        (Total_USDC_Deposit * time_since_deposit * interest_per_sec) / 100 +
        Total_USDC_Deposit;

      if (parseInt(manageAmount) < current_user_balance) {
        const data = await transferAssets(
          protocolPair,
          userPair.publicKey(),
          usdc,
          manageAmount
        );

        if (data && change_Trust) {
          const userData = {
            address: walletData?.public_key,
            Total_Diam_Deposit: 0,
            Total_USDC_Deposit: parseInt(manageAmount) * -1,
            Total_USDC_Borrowed: 0,
          };

          const protocolData = {
            USDC_Deposit_Total: parseInt(manageAmount) * -1,
            Total_Diam_Deposit: 0,
            Total_USDC_Borrowed: 0,
            Available_Borrow_USDC: 0,
          };

          await axios.post(
            "https://lendify-backend-nmnj.vercel.app/userData/send",
            userData
          );

          await axios.post(
            "https://lendify-backend-nmnj.vercel.app/protocolData/send",
            protocolData
          );

          toast.success(`Withdraw was successful!`, {
            position: "top-right",
            autoClose: 2500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "dark",
          });

          fetchData();
        } else {
          toast.error(`Error occurred`, {
            position: "top-right",
            autoClose: 2500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "dark",
          });
        }
      } else {
        toast.error(`Not enough Balance`, {
          position: "top-right",
          autoClose: 2500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });
      }
      setIsLoading(false);
    } else if (number === 2) {
      const { Total_USDC_Borrowed, Total_Diam_Deposit, Last_Borrowed } = dbData;
      const diam_to_usdc = Total_Diam_Deposit * 0.64;
      const interest_per_sec = 0.000000192;
      const current_time = Date.now() / 1000;
      const time_since_borrowed = current_time - Last_Borrowed;
      const current_loan =
        Total_USDC_Borrowed * interest_per_sec * time_since_borrowed;

      const available_to_borrow =
        diam_to_usdc - current_loan - Total_USDC_Borrowed;

      const new_borrow = current_loan + parseInt(manageAmount);

      const userData = {
        address: walletData?.public_key,
        Total_Diam_Deposit: 0,
        Total_USDC_Deposit: 0,
        Total_USDC_Borrowed: new_borrow,
        Last_Borrowed: Date.now() / 1000,
      };

      const protocolData = {
        USDC_Deposit_Total: 0,
        Total_Diam_Deposit: 0,
        Total_USDC_Borrowed: new_borrow,
        Available_Borrow_USDC: 0,
      };

      if (parseInt(manageAmount) <= available_to_borrow) {
        setIsLoading(true);

        const data = await transferAssets(
          protocolPair,
          userPair.publicKey(),
          usdc,
          manageAmount
        );

        if (data) {
          await axios.post(
            "https://lendify-backend-nmnj.vercel.app/userData/send",
            userData
          );

          await axios.post(
            "https://lendify-backend-nmnj.vercel.app/protocolData/send",
            protocolData
          );
        }

        toast.success(`Borrow was successful!`, {
          position: "top-right",
          autoClose: 2500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });

        fetchData();
      } else {
        toast.error(`Max Borrow amount is ${available_to_borrow}`, {
          position: "top-right",
          autoClose: 2500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });
      }
      setIsLoading(false);
    } else {
      const { Total_USDC_Borrowed, Last_Borrowed } = dbData;
      const interest_per_sec = 0.000000192;
      const current_time = Date.now() / 1000;
      const time_since_borrowed = current_time - Last_Borrowed;
      const current_loan =
        Total_USDC_Borrowed * interest_per_sec * time_since_borrowed +
        Total_USDC_Borrowed;

      const userData = {
        address: walletData?.public_key,
        Total_Diam_Deposit: 0,
        Total_USDC_Deposit: 0,
        Total_USDC_Borrowed: parseInt(manageAmount) * -1,
      };

      const protocolData = {
        USDC_Deposit_Total: 0,
        Total_Diam_Deposit: 0,
        Total_USDC_Borrowed: parseInt(manageAmount) * -1,
        Available_Borrow_USDC: 0,
      };

      if (current_loan >= parseInt(manageAmount)) {
        setIsLoading(true);
        const data = await transferAssets(
          userPair,
          protocolPair.publicKey(),
          usdc,
          manageAmount
        );

        toast.success(`Repay was successful!`, {
          position: "top-right",
          autoClose: 2500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });

        if (parseInt(manageAmount) > 0 && data) {
          await axios.post(
            "https://lendify-backend-nmnj.vercel.app/userData/send",
            userData
          );
          await axios.post(
            "https://lendify-backend-nmnj.vercel.app/protocolData/send",
            protocolData
          );
          fetchData();
        }
      } else {
        toast.error(`Max repay amount is ${current_loan}`, {
          position: "top-right",
          autoClose: 2500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full w-screen flex flex-col items-center mt-36">
      <ToastContainer />
      <div className="pink_gradient" />
      <div className="flex justify-evenly w-full">
        <div className="flex h-full w-[20%]">
          <LuArrowUpDown
            onClick={() => {
              setArrowClicked(!arrowClicked);
              setManage(false);
            }}
            className="h-8 w-8 mt-5 mx-5 cursor-pointer"
          />
          <div>
            <h1 className="text-purple-500 font-semibold text-lg">Balance</h1>
            <p className="text-4xl font-bold">
              {arrowClicked
                ? `$ ${parseInt(supplyBalance)?.toFixed(3)}`
                : `$ ${parseInt(borrowBalance)?.toFixed(3)}`}
            </p>
          </div>
        </div>
        <div className="flex justify-center items-center text-lg ">
          {arrowClicked ? (
            <div className="flex">
              <button
                className="flex justify-between items-center px-4 bg-site-black h-15 w-44 rounded-full mr-[20px]"
                onClick={handleManageSupply}
              >
                <img src={addLogo} alt="addLogo" className="w-5 opacity-40" />
                <span className="text-base text-gray-500 font-semibold">
                  Supply USDC
                </span>
              </button>
              <button
                className="flex justify-between items-center px-4 bg-site-black h-15 w-48 rounded-full mr-[20px]"
                onClick={handleManageWithdraw}
              >
                <img src={addLogo} alt="addLogo" className="w-5 opacity-40" />
                <span className="text-base text-gray-500 font-semibold">
                  Withdraw USDC
                </span>
              </button>
            </div>
          ) : (
            <div className="flex">
              <button
                className="flex justify-between items-center px-4 bg-site-black h-15 w-44 rounded-full mr-[20px]"
                onClick={handleManageBorrow}
              >
                <img src={addLogo} alt="addLogo" className="w-5 opacity-40" />
                <span className="text-base text-gray-500 font-semibold">
                  Borrow USDC
                </span>
              </button>
              <button
                className="flex justify-between items-center px-4 bg-site-black h-15 w-48 tracking-wider rounded-full mr-[20px]"
                onClick={handleManageRepay}
              >
                <img src={addLogo} alt="addLogo" className="w-5 opacity-40" />
                <span className="text-base text-gray-500 font-semibold">
                  Repay USDC
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center items-center gap-x-12 p-10 mt-10">
        <div className="h-[510px] w-[550px] bg-site-black bg-opacity-30 rounded-lg pb-10">
          <div className="flex justify-between mt-[20px] mx-[20px]">
            <h1 className="w-full text-gray-400 text-sm">Collateral Asset</h1>
            <h1 className="w-full text-gray-400 text-sm">Protocol Balance</h1>
          </div>

          <div className="mx-[20px] flex flex-row justify-between mt-10">
            <div className="h-[50px] flex flex-col justify-center gap-y-[10px]">
              <h1 className="text-lg font-semibold">Diam</h1>
              <h1 className="text-sm text-gray-400">
                Diam {dbData?.Total_Diam_Deposit}
              </h1>
            </div>

            <div className="flex flex-row gap-x-[15px] h-[50px] justify-between items-center">
              <button
                onClick={openModal}
                className="h-15 w-80   px-5 bg-site-black rounded-full text-sm flex justify-center items-center"
              >
                Manage Collateral
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-y-[20px]">
          <div className=" h-full w-[450px] bg-site-black bg-opacity-30 rounded-lg p-10">
            <div className="flex flex-col gap-5">
              <h1 className="text-gray-400 font-bold">
                {manage ? "Manage Lending & Borrowing" : "USDC Wallet Address"}
              </h1>
              {manage ? (
                <div className="flex w-full justify-between">
                  <input
                    type="number"
                    placeholder="0.000"
                    className={`flex h-9 w-44 border-site-black rounded-md border-2 border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50`}
                    onChange={(e) => {
                      setManageAmount(e.target.value);
                    }}
                    disabled={isLoading}
                  />
                  {text === 0 ? (
                    <div>
                      {isLoading ? (
                        <LoadingButton disabled>
                          <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                          Please wait
                        </LoadingButton>
                      ) : (
                        <button
                          className="flex bg-gray-800 h-10 w-36 justify-center items-center rounded-lg font-semibold cursor-pointer"
                          onClick={() => handleManage({ number: 0 })}
                        >
                          Supply
                        </button>
                      )}
                    </div>
                  ) : text === 1 ? (
                    <div>
                      {isLoading ? (
                        <LoadingButton disabled>
                          <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                          Please wait
                        </LoadingButton>
                      ) : (
                        <button
                          className="flex bg-gray-800 h-10 w-36 justify-center items-center rounded-lg font-semibold cursor-pointer"
                          onClick={() => handleManage({ number: 1 })}
                        >
                          Withdraw
                        </button>
                      )}
                    </div>
                  ) : text === 2 ? (
                    <div>
                      {isLoading ? (
                        <LoadingButton disabled>
                          <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                          Please wait
                        </LoadingButton>
                      ) : (
                        <button
                          className="flex bg-gray-800 h-10 w-36 justify-center items-center rounded-lg font-semibold cursor-pointer"
                          onClick={() => handleManage({ number: 2 })}
                        >
                          Borrow
                        </button>
                      )}
                    </div>
                  ) : (
                    <div>
                      {isLoading ? (
                        <LoadingButton disabled>
                          <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                          Please wait
                        </LoadingButton>
                      ) : (
                        <button
                          className="flex bg-gray-800 h-10 w-36 justify-center items-center rounded-lg font-semibold cursor-pointer"
                          onClick={() => handleManage({ number: 3 })}
                        >
                          Repay
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 font-semibold text-lg">
                  $ <span className="text-white">0</span>.000
                </p>
              )}
              <hr className="border-gray-500 border-opacity-30" />

              <div className="flex flex-row text-white justify-between">
                <div className="flex flex-col">
                  <h1 className="text-gray-400 text-xs">Net Borrow APR</h1>
                  <p className="text-white underline underline-offset-8 decoration-dashed">
                    8.66%
                  </p>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-gray-400 text-xs">Net Supply APR</h1>
                  <p className="text-white underline underline-offset-8 decoration-dashed">
                    6.6%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className=" h-full w-[450px] bg-site-black bg-opacity-30 rounded-lg p-10">
            <h1 className="text-gray-400 font-medium text-sm">
              Position Summary
            </h1>
            <div className="flex flex-row mx-[20px] justify-between mt-[20px]">
              <p>Collateral Value</p>
              <h3>$ {dbData?.Total_Diam_Deposit * 0.8}</h3>
            </div>
            <div className="flex flex-row mx-[20px] justify-between mt-[20px]">
              <p>Liquidation price</p>
              <h3>
                ${" "}
                {(
                  dbData?.Total_USDC_Borrowed /
                  (dbData?.Total_Diam_Deposit * 0.8 * 0.9)
                ).toFixed(2)}
              </h3>
            </div>
            <div className="flex flex-row mx-[20px] justify-between mt-[20px]">
              <p>Borrow Capacity</p>
              <h3>
                ${" "}
                {dbData.Total_Diam_Deposit * 0.64 - dbData.Total_USDC_Borrowed}
              </h3>
            </div>
            <div className="flex flex-row mx-[20px] justify-between mt-[20px]">
              <p>LTV</p>
              <h3>
                {((dbData.Total_Diam_Deposit * 0.8) /
                  dbData.Total_USDC_Borrowed) *
                  100}{" "}
                %
              </h3>
            </div>
          </div>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal} />
      <div className="blue_gradient" />
    </div>
  );
};

export default COP;
