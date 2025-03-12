document.addEventListener("DOMContentLoaded", () => {
    cargarAlumnos();
});

function cargarAlumnos() {
    fetch("http://localhost:3000/listaAlumnos")
        .then(response => {
            if (!response.ok) {
                throw new Error("Error al cargar la lista de alumnos");
            }
            return response.json();
        })
        .then(alumnos => {
            const tbody = document.querySelector("#alumnos-table tbody");
            tbody.innerHTML = ""; // Limpiar tabla

            if (alumnos.length === 0) {
                Swal.fire({
                    icon: "info",
                    title: "Sin datos",
                    text: "No hay alumnos registrados.",
                    confirmButtonColor: "#3b82f6"
                });
                return;
            }

            alumnos.forEach(alumno => {
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

                // Botones de acciones
                const actionsCell = row.insertCell(6);
                actionsCell.innerHTML = `
                    <button class="btn btn-warning btn-action" onclick="editarAlumno('${alumno.matricula}')">Editar</button>
                    <button class="btn btn-danger btn-action" onclick="borrarAlumno('${alumno.matricula}')">Borrar</button>
                `;
            });
        })
        .catch(error => {
            console.error("Error:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo cargar la lista de alumnos.",
                confirmButtonColor: "#3b82f6"
            });
        });
}

function editarAlumno(matricula) {
    fetch(`http://localhost:3000/buscarAlumno/${matricula}`)
        .then(response => response.json())
        .then(alumno => {
            Swal.fire({
                title: "Editar Alumno",
                html: `
                    <input id="nombres" class="swal2-input" value="${alumno.nombres}" placeholder="Nombres" required>
                    <input id="apellidos" class="swal2-input" value="${alumno.apellidos}" placeholder="Apellidos" required>
                    <select id="grupo" class="swal2-select" required>
                        <option value="101" ${alumno.grupo === "101" ? "selected" : ""}>101</option>
                        <option value="201" ${alumno.grupo === "201" ? "selected" : ""}>201</option>
                        <option value="301" ${alumno.grupo === "301" ? "selected" : ""}>301</option>
                        <option value="401" ${alumno.grupo === "401" ? "selected" : ""}>401</option>
                        <option value="501" ${alumno.grupo === "501" ? "selected" : ""}>501</option>
                        <option value="601" ${alumno.grupo === "601" ? "selected" : ""}>601</option>
                        <option value="701" ${alumno.grupo === "701" ? "selected" : ""}>701</option>
                        <option value="801" ${alumno.grupo === "801" ? "selected" : ""}>801</option>
                        <option value="901" ${alumno.grupo === "901" ? "selected" : ""}>901</option>
                        <option value="1001" ${alumno.grupo === "1001" ? "selected" : ""}>1001</option>
                    </select>
                    <input id="promedio" class="swal2-input" value="${alumno.promedio}" placeholder="Promedio" required>
                `,
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Guardar",
                cancelButtonText: "Cancelar",
                confirmButtonColor: "#1e3a8a",
                cancelButtonColor: "#b91c1c",
                preConfirm: () => {
                    const nombres = document.getElementById("nombres").value;
                    const apellidos = document.getElementById("apellidos").value;
                    const grupo = document.getElementById("grupo").value;
                    const promedio = document.getElementById("promedio").value;

                    if (!nombres || !apellidos || !grupo || !promedio) {
                        Swal.showValidationMessage("Todos los campos son requeridos");
                        return false;
                    }

                    return { matricula, nombres, apellidos, grupo, promedio };
                }
            }).then(result => {
                if (result.isConfirmed) {
                    fetch("http://localhost:3000/editarAlumno", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(result.value)
                    })
                    .then(response => response.json())
                    .then(data => {
                        Swal.fire({
                            icon: "success",
                            title: "¡Editado!",
                            text: data.message,
                            confirmButtonColor: "#1e3a8a"
                        });
                        cargarAlumnos(); // Recargar la lista
                    })
                    .catch(error => {
                        Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: "No se pudo editar el alumno.",
                            confirmButtonColor: "#b91c1c"
                        });
                    });
                }
            });
        });
}

function borrarAlumno(matricula) {
    Swal.fire({
        title: "¿Estás seguro?",
        text: "Esta acción eliminará al alumno permanentemente.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, borrar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#b91c1c",
        cancelButtonColor: "#3b82f6"
    }).then(result => {
        if (result.isConfirmed) {
            fetch(`http://localhost:3000/borrarAlumno/${matricula}`, {
                method: "DELETE"
            })
            .then(response => response.json())
            .then(data => {
                Swal.fire({
                    icon: "success",
                    title: "¡Borrado!",
                    text: data.message,
                    confirmButtonColor: "#1e3a8a"
                });
                cargarAlumnos(); // Recargar la lista
            })
            .catch(error => {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "No se pudo borrar el alumno.",
                    confirmButtonColor: "#b91c1c"
                });
            });
        }
    });
}

// Event listeners para navegación
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