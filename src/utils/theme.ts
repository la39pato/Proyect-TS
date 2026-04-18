
export function initTheme() {
    const toggleBtn = document.getElementById("toggle-dark");

    // aplicar tema guardado
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark");
    }

    // actualizar texto botón
    updateButtonText(toggleBtn);

    // evento click
    toggleBtn?.addEventListener("click", () => {
        document.body.classList.toggle("dark");

        const isDark = document.body.classList.contains("dark");

        localStorage.setItem("theme", isDark ? "dark" : "light");

        updateButtonText(toggleBtn);
    });
}

function updateButtonText(btn: HTMLElement | null) {
    if (!btn) return;

    const isDark = document.body.classList.contains("dark");

    btn.textContent = isDark ? " Modo claro" : " Modo oscuro";
}