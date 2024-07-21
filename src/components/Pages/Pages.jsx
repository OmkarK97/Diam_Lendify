import { Route, Routes } from "react-router-dom";
import LayoutStake from "../Staking/LayoutStake";
import LayoutTransfer from "../transfer/LayoutTransfer";
import LayoutLB from "../LendingBorrowing/LayoutLB";
import { useWallet } from "../../WalletContext";

const Pages = () => {
  const { data } = useWallet();

  return (
    <Routes>
      <Route path="staking" element={<LayoutStake />} />
      <Route path="transfer" element={<LayoutTransfer walletData={data} />} />
      <Route
        path="lending_borrowing"
        element={<LayoutLB walletData={data} />}
      />
    </Routes>
  );
};

export default Pages;
