import { Link, useNavigate } from "react-router-dom";
import { disablePageScroll, enablePageScroll } from "scroll-lock";
import { brainwaveSymbol } from "../../assets";
import { navigationHomePage } from "../../constants/index";
import Button from "../Button";
import MenuSvg from "../../assets/svg/MenuSvg";
import { HambugerMenu } from "../design/Header";
import { useState } from "react";

const HeaderHomePage = () => {
  const [openNavigation, setOpenNavigation] = useState(false);
  const navigate = useNavigate();

  const toggleNavigation = () => {
    if (openNavigation) {
      setOpenNavigation(false);
      enablePageScroll();
    } else {
      setOpenNavigation(true);
      disablePageScroll();
    }
  };

  const handleGetStarted = () => {
    navigate("/login");
  };

  const handleClick = () => {
    if (!openNavigation) return;

    enablePageScroll();
    setOpenNavigation(false);
  };

  return (
    <div
      className={`fixed top-0 left-0 w-full z-50  border-b border-n-6 lg:bg-n-8/90 lg:backdrop-blur-sm ${
        openNavigation ? "bg-n-8" : "bg-n-8/90 backdrop-blur-sm"
      }`}
    >
      <div className="flex items-center px-5 lg:px-7.5 xl:px-10 max-lg:py-4">
        <Link to="/" className="w-[12rem] xl:mr-8 cursor-pointer flex">
          <img src={brainwaveSymbol} width={40} height={40} alt="Brainwave" />
          <span className="py-2 px-2 text-2xl font-semibold">Lendify</span>
        </Link>

        <nav
          className={`${
            openNavigation ? "flex" : "hidden"
          } fixed top-[5rem] left-0 right-0 bottom-0 bg-n-8 lg:static lg:flex lg:mx-auto lg:bg-transparent`}
        >
          <div className="relative z-2 flex flex-col items-center justify-center m-auto lg:flex-row">
            {navigationHomePage.map((item) => (
              <Link
                key={item.id}
                to={item.url}
                onClick={() => handleClick(item.url)}
                className={`block relative font-code text-2xl uppercase text-n-1 transition-colors hover:text-color-1 ${
                  item.onlyMobile ? "lg:hidden" : ""
                } px-6 py-6 md:py-8 lg:-mr-0.25 lg:text-xs lg:font-semibold  lg:leading-5 lg:hover:text-n-1 xl:px-12`}
              >
                {item.title}
              </Link>
            ))}
          </div>

          <HambugerMenu />
        </nav>

        <Button className="hidden lg:flex" onClick={handleGetStarted}>
          Get Started
        </Button>

        <Button
          className="ml-auto lg:hidden"
          px="px-3"
          onClick={toggleNavigation}
        >
          <MenuSvg openNavigation={openNavigation} />
        </Button>
      </div>
    </div>
  );
};

export default HeaderHomePage;
