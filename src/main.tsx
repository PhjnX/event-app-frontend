import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "react-redux";
import store from "./store";
import "./i18n";
import { HelmetProvider } from "react-helmet-async";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </Provider>,
);
