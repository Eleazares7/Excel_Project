document.getElementById("register-form").addEventListener("submit", async (e) => {
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
        // Paso 1: Enviar código de verificación antes de registrar
        const sendCodeResponse = await fetch("http://localhost:3000/send-verification-code", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, action: "register" }),
        });

        const sendCodeData = await sendCodeResponse.json();

        if (sendCodeResponse.ok) {
            // Paso 2: Solicitar el código de verificación al usuario
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
                // Paso 3: Verificar el código
                const verifyResponse = await fetch("http://localhost:3000/verify-2fa", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, code, action: "register" }),
                });

                const verifyData = await verifyResponse.json();

                if (verifyResponse.ok) {
                    // Paso 4: Registrar al usuario si el código es válido
                    const registerResponse = await fetch("http://localhost:3000/register", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ email, password, role }),
                    });

                    const registerData = await registerResponse.json();

                    if (registerResponse.ok) {
                        Swal.fire({
                            icon: "success",
                            title: "Éxito",
                            text: "Usuario registrado exitosamente.",
                        }).then(() => {
                            window.location.href = "index.html";
                        });
                    } else {
                        Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: registerData.message,
                        });
                    }
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
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error en el servidor: " + error.message,
        });
    }
});