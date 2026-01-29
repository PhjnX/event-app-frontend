import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import config from "./config/index.ts";
import { Provider } from "react-redux";
import store from "./store";
import "./i18n";
import { HelmetProvider } from "react-helmet-async"; 

console.log("App Config:", config);

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </Provider>,
);
