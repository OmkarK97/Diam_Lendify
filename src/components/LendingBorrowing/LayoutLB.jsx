import React from "react";
import Header from "../../Header";
import COP from "../LendingBorrowing/COP";

const LayoutLB = ({ walletData }) => {
  return (
    <div>
      <Header walletData={walletData} />
      <COP walletData={walletData} />
    </div>
  );
};

export default LayoutLB;
