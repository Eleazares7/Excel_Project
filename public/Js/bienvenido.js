window.onload = () => {
    const usuario = localStorage.getItem("usuario") || "Usuario";
    const rol = localStorage.getItem("rol") || "Invitado";
    document.getElementById("welcome-message").textContent = `Bienvenido, ${usuario}`;
    document.getElementById("role-message").textContent = `Rol: ${rol}`;
};

document.getElementById("logout").addEventListener("click", () => {
    Swal.fire({
        icon: "success",
        title: "Sesión cerrada",
        text: "Redirigiendo al inicio...",
        timer: 1500,
        showConfirmButton: false
    }).then(() => {
        localStorage.clear();
        window.location.href = "index.html";
    });
});



