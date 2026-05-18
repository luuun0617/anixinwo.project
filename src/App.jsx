import { HashRouter, useRoutes} from "react-router-dom";

import Navbar from "./components/homepage/Navbar";
import Footer from "./components/homepage/Footer";
import ScrollTop from "./components/ScrollTop";
import ToastMessage from "./store/ToastMessage";

import Routes from "./Router";

const AppRoutes=()=>{
  const element =useRoutes(Routes);
  return element;
};


function App() {
  return (
    <HashRouter>
      <ScrollTop/>

      <ToastMessage/>

      <Navbar />

      <AppRoutes />

      <Footer />
    </HashRouter>
  );
}

export default App;
