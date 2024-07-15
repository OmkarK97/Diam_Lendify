import { useState } from "react";

const Stake = () => {
  const [activeButton, setActiveButton] = useState(1);

  const handleButtonClick = (buttonNumber) => {
    setActiveButton(buttonNumber);
  };

  const buttonDetails = [
    { label: "7 Days", lockPeriod: "07 Days", apy: "0 %" },
    { label: "14 Days", lockPeriod: "14 Days", apy: "12 %" },
    { label: "30 Days", lockPeriod: "30 Days", apy: "25 %" },
    { label: "60 Days", lockPeriod: "60 Days", apy: "35 %" },
  ];

  return (
    <div>
      <div className="flex flex-col bg-site-black rounded-xl w-[80%] mx-auto h-full">
        <div>
          <span className="text-3xl font-extrabold w-full flex justify-start ml-10 mt-10">
            Participate IGO Stake
          </span>
          <span className="text-3xl font-extrabold w-full flex justify-start ml-10">
            256.50 BUSD
          </span>
        </div>
        <div className="flex justify-between m-10">
          {buttonDetails.map((button, index) => (
            <button
              key={index}
              className={`${
                activeButton === index + 1 ? "bg-blue-700" : "bg-transparent"
              } w-[20%] rounded-lg h-10 cursor-pointer border-2 border-site-dim2`}
              onClick={() => handleButtonClick(index + 1)}
            >
              {button.label}
            </button>
          ))}
        </div>
        <div className="flex justify-between gap-5 m-10 w-[60%]">
          <div className="flex flex-col w-full">
            {buttonDetails.map(
              (button, index) =>
                activeButton === index + 1 && (
                  <div key={index} className="flex justify-between">
                    <div className="flex flex-col">
                      <span>Lock Period: {button.lockPeriod}</span>
                      <span>Extends lock on registration: Yes</span>
                      <span>Early unstake fee: 30%</span>
                      <span>Status: Unlocked</span>
                    </div>
                    <div className="flex flex-col justify-center items-center">
                      <span className="text-5xl text-gray-400 text-opacity-30 font-bold">
                        {button.apy}
                      </span>
                      <span className="text-xl text-gray-400 font-bold">
                        APY*
                      </span>
                    </div>
                  </div>
                )
            )}
          </div>
        </div>
        <div>
          <input className="bg-transparent mx-10  h-10 rounded-lg border-2 border-site-dim2 w-[50%]" />
          <button className="bg-blue-700 w-[20%] rounded-lg h-10 cursor-pointer">
            Approve
          </button>
        </div>
        <div>
          <input className="bg-transparent mx-10 mt-10 h-10 rounded-lg border-2 border-site-dim2 w-[50%]" />
          <button className="bg-blue-700 w-[20%] rounded-lg h-10 cursor-pointer">
            Withdraw
          </button>
        </div>
        <div className="text-purple-300 m-10">
          Once staked, you need to register for every IDO, so we can calculate
          the guaranteed allocation. Once registered, we lock your tokens, but
          you still can participate in other IDOs.
        </div>
      </div>
    </div>
  );
};

export default Stake;
