import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { StoreProvider } from "@/lib/store";
import { App } from "@/components/App";
import "@/globals.css";

const root = document.getElementById("root");
if (!root) throw new Error("Root element #root not found");

createRoot(root).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>
);
