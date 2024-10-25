import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "../i18n";
import { I18nSwitcher } from "../i18n/components";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nSwitcher />
    <App />
  </StrictMode>,
);
