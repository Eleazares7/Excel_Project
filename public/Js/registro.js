document.getElementById("register-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    if (!email || !password || !role) {
        Swal.fire({
            icon: 'warning',
            title: 'Atención',
            text: 'Todos los campos son obligatorios.',
            confirmButtonColor: '#3b82f6'
        });
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, role })
        });

        const data = await response.json();

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: data.message,
                timer: 2000, // Notificación visible por 2 segundos
                showConfirmButton: false // Sin botón de confirmación
            }).then(() => {
                window.location.href = "index.html"; // Redirecciona a index.html
            });
            document.getElementById("register-form").reset(); // Resetea el formulario
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.message,
                confirmButtonColor: '#3b82f6'
            });
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al conectar con el servidor.',
            confirmButtonColor: '#3b82f6'
        });
    }
});