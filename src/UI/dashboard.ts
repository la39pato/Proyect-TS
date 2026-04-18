import { initTheme } from "../utils/theme.js";
import { renderDashboard } from "./dashboard.render.js";

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    renderDashboard();
});