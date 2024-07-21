const StakingDetails = () => {
  return (
    <div className="flex flex-col bg-transparent rounded-xl w-[50%] mx-auto my-10 mr-20 h-full">
      <div className="w-full h-full flex flex-col gap-8 bg-site-black rounded-xl p-10">
        <span className="text-4xl font-bold">$9,574,20.84</span>
        <span className="text-[#9CA0D2] text-lg font-semibold">
          Total Value Locked
        </span>
      </div>
      <div className="w-full h-full flex flex-col gap-10 bg-site-black rounded-xl p-10 mt-10">
        <span className="text-4xl font-bold">97.23%</span>
        <span className="text-[#9CA0D2] text-lg font-semibold">APY</span>
      </div>
      <div className="w-full h-full flex flex-col gap-10 bg-site-black rounded-xl p-10 mt-10">
        <span className="text-4xl font-bold">6997</span>
        <span className="text-[#9CA0D2] text-lg font-semibold">
          Number of Stakers
        </span>
      </div>
    </div>
  );
};

export default StakingDetails;
