import React from "react";
import Header from "../../Header";
import CreateTransfer from "./CreateTransfer";

const LayoutTransfer = ({ walletData }) => {
  return (
    <div>
      <Header walletData={walletData} />
      <CreateTransfer walletData={walletData} />
    </div>
  );
};

export default LayoutTransfer;
