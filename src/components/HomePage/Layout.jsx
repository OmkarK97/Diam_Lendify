import { useLocation } from "react-router-dom";
import Footer from "./Footer";
import HeaderHomePage from "./HeaderHomePage";
import Hero from "./Hero";
import { useWallet } from "../../WalletContext";

const Layout = () => {
  const { data } = useWallet();
  return (
    <div className="pt-[4.75rem] lg:pt-[5.25rem]">
      <HeaderHomePage />
      <Hero />
      <Footer />
    </div>
  );
};

export default Layout;
