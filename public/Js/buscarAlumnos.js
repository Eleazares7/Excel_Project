function buscarAlumno() {
    const matricula = document.getElementById("matricula-search").value;
    const resultTable = document.getElementById("result-table");
    const tbody = resultTable.querySelector("tbody");
    tbody.innerHTML = ""; // Limpiar tabla

    if (!matricula) {
        Swal.fire({
            icon: "warning",
            title: "Atención",
            text: "Por favor, introduce una matrícula.",
            confirmButtonColor: "#3b82f6"
        });
        return;
    }

    fetch(`http://localhost:3000/buscarAlumno/${matricula}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Alumno no encontrado");
            }
            return response.json();
        })
        .then(alumno => {
            resultTable.style.display = "table";
            const row = tbody.insertRow();
            row.insertCell(0).textContent = alumno.matricula;
            row.insertCell(1).textContent = alumno.nombres;
            row.insertCell(2).textContent = alumno.apellidos;
            row.insertCell(3).textContent = alumno.grupo;
            row.insertCell(4).textContent = alumno.promedio;

            // Calcular status basado en el promedio
            const promedio = parseFloat(alumno.promedio);
            const status = promedio >= 8 ? "Aprobado" : "Reprobado";
            const statusCell = row.insertCell(5);
            statusCell.textContent = status;

            // Aplicar colores distintivos
            if (status === "Aprobado") {
                statusCell.style.color = "green";
                statusCell.style.fontWeight = "bold";
            } else {
                statusCell.style.color = "red";
                statusCell.style.fontWeight = "bold";
            }

            Swal.fire({
                icon: "success",
                title: "¡Éxito!",
                text: "Alumno encontrado.",
                timer: 1500,
                showConfirmButton: false
            });
        })
        .catch(error => {
            console.error("Error:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se encontró la matrícula del alumno.",
                confirmButtonColor: "#3b82f6"
            });
        });
}

// Mantén el resto de tu código (event listeners para logout, agregar, eliminar, reporte)
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

document.getElementById("agregar-link").addEventListener("click", (e) => {
    e.preventDefault();
    Swal.fire({ icon: "info", title: "Agregar", text: "Funcionalidad en desarrollo.", confirmButtonColor: "#3b82f6" });
});

document.getElementById("eliminar-link").addEventListener("click", (e) => {
    e.preventDefault();
    Swal.fire({ icon: "info", title: "Eliminar", text: "Funcionalidad en desarrollo.", confirmButtonColor: "#3b82f6" });
});

document.getElementById("reporte-link").addEventListener("click", (e) => {
    e.preventDefault();
    Swal.fire({ icon: "info", title: "Reporte", text: "Funcionalidad en desarrollo.", confirmButtonColor: "#3b82f6" });
});