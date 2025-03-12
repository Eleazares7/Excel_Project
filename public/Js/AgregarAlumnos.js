document.getElementById('registroForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const alumno = {
        matricula: document.getElementById('matricula').value,
        nombres: document.getElementById('nombres').value,
        apellidos: document.getElementById('apellidos').value,
        grupo: document.getElementById('grupo').value,
        promedio: document.getElementById('promedio').value
    };

    try {
        const response = await fetch('http://localhost:3000/registrarAlumno', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(alumno)
        });

        const result = await response.json();

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: result.message,
                confirmButtonColor: '#1e3a8a'
            });
            document.getElementById('registroForm').reset();
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: result.message,
                confirmButtonColor: '#b91c1c'
            });
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error en el servidor. Intenta de nuevo.',
            confirmButtonColor: '#b91c1c'
        });
    }
});