
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { configureAmplify } from "./app/aws-config.ts";

configureAmplify();

createRoot(document.getElementById("root")!).render(<App />);
