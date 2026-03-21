import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import appStore from "./store/appStore.js";
import { Provider } from "react-redux";
import { setupAxiosInterceptors } from "./utils/axiosConfig.js";

setupAxiosInterceptors();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={appStore}>
      <App />
    </Provider>
  </StrictMode>
);
