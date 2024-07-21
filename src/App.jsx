import { BrowserRouter, Route, Routes } from "react-router-dom";
import ButtonGradient from "./assets/svg/ButtonGradient";
import Login from "./components/Login/Login";
import CreateWallet from "./PageAccounts/CreateWallet";
import Pages from "./components/Pages/Pages";
import Layout from "./components/HomePage/Layout";

function App() {
  const diam_details = localStorage.getItem("diam_wallet");

  return (
    <BrowserRouter>
      <div className="no-scrollbar overflow-auto h-screen w-screen">
        <Routes>
          <Route path="/" element={<Layout />} />
          <Route
            path="/login"
            element={
              diam_details ? (
                <Login diam_details={diam_details} />
              ) : (
                <CreateWallet />
              )
            }
          />
          <Route path="/*" element={<Pages />} />
        </Routes>
        <ButtonGradient />
      </div>
    </BrowserRouter>
  );
}

export default App;
