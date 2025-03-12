document.getElementById("login-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const selectedRole = document.getElementById("role").value;

    if (!selectedRole) {
        Swal.fire({
            icon: 'warning',
            title: 'Atención',
            text: 'Debes seleccionar un rol.',
            confirmButtonColor: '#3b82f6'
        });
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, role: selectedRole })
        });

        const data = await response.json();

        if (response.ok) {
            if (data.rol === selectedRole) {
                localStorage.setItem("usuario", email);
                localStorage.setItem("rol", data.rol);
                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: 'Inicio de sesión exitoso.',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = "bienvenido.html";
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'El rol seleccionado no coincide con el registrado.',
                    confirmButtonColor: '#3b82f6'
                });
            }
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
