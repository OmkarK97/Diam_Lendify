import Stake from "./Stake";
import StakingDetails from "./StakingDetails";

const LayoutStake = () => {
  return (
    <div className="flex w-full">
      <div className="pink_gradient" />
      <Stake />
      <StakingDetails />
      <div className="blue_gradient" />
    </div>
  );
};

export default LayoutStake;
