document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    if (!email || !password || !role) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Por favor, completa todos los campos.",
        });
        return;
    }

    try {
        // Paso 1: Validar credenciales
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password, role }),
        });

        const data = await response.json();

        if (response.ok) {
            // Paso 2: Enviar código de verificación
            const sendCodeResponse = await fetch("http://localhost:3000/send-verification-code", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, action: "login" }),
            });

            const sendCodeData = await sendCodeResponse.json();

            if (sendCodeResponse.ok) {
                // Paso 3: Solicitar el código de verificación al usuario
                const { value: code } = await Swal.fire({
                    title: "Verificación en 2 Pasos",
                    text: "Se ha enviado un código de verificación a tu correo. Ingresa el código:",
                    input: "text",
                    inputPlaceholder: "Código de 6 dígitos",
                    showCancelButton: true,
                    confirmButtonText: "Verificar",
                    cancelButtonText: "Cancelar",
                });

                if (code) {
                    // Paso 4: Verificar el código
                    const verifyResponse = await fetch("http://localhost:3000/verify-2fa", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ email, code, action: "login" }),
                    });

                    const verifyData = await verifyResponse.json();

                    if (verifyResponse.ok) {
                        Swal.fire({
                            icon: "success",
                            title: "Éxito",
                            text: "Inicio de sesión exitoso.",
                        }).then(() => {
                            if (role === "admin") {
                                window.location.href = "bienvenido.html";
                            } else if (role === "trabajador") {
                                window.location.href = "bienvenido.html";
                            }
                        });
                    } else {
                        Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: verifyData.message,
                        });
                    }
                }
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: sendCodeData.message,
                });
            }
        } else {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: data.message,
            });
        }
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error en el servidor: " + error.message,
        });
    }
});