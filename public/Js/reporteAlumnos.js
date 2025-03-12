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

                const promedio = parseFloat(alumno.promedio);
                const status = promedio >= 8 ? "Aprobado" : "Reprobado";
                const statusCell = row.insertCell(5);
                statusCell.textContent = status;

                if (status === "Aprobado") {
                    statusCell.style.color = "green";
                    statusCell.style.fontWeight = "bold";
                } else {
                    statusCell.style.color = "red";
                    statusCell.style.fontWeight = "bold";
                }
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

function generarReportePDF() {
    fetch("http://localhost:3000/listaAlumnos")
        .then(response => response.json())
        .then(alumnos => {
            if (alumnos.length === 0) {
                Swal.fire({
                    icon: "warning",
                    title: "Sin datos",
                    text: "No hay alumnos para generar el reporte.",
                    confirmButtonColor: "#3b82f6"
                });
                return;
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Título
            doc.setFontSize(18);
            doc.setTextColor(30, 58, 138); // Azul oscuro (#1e3a8a)
            doc.text("Reporte de Alumnos", 14, 20);

            // Tabla
            const headers = ["Matrícula", "Nombres", "Apellidos", "Grupo", "Promedio", "Status"];
            const data = alumnos.map(alumno => {
                const promedio = parseFloat(alumno.promedio);
                const status = promedio >= 8 ? "Aprobado" : "Reprobado";
                return [
                    alumno.matricula,
                    alumno.nombres,
                    alumno.apellidos,
                    alumno.grupo,
                    alumno.promedio,
                    status
                ];
            });

            doc.autoTable({
                startY: 30,
                head: [headers],
                body: data,
                styles: {
                    fontSize: 10,
                    cellPadding: 2,
                    overflow: "linebreak",
                    halign: "center",
                    valign: "middle"
                },
                headStyles: {
                    fillColor: [30, 58, 138], // Azul oscuro (#1e3a8a)
                    textColor: [255, 255, 255], // Blanco
                    fontStyle: "bold"
                },
                alternateRowStyles: {
                    fillColor: [240, 240, 240] // Gris claro para filas alternas
                },
                columnStyles: {
                    5: { // Columna "Status"
                        textColor: (cell) => {
                            return cell === "Aprobado" ? [0, 128, 0] : [255, 0, 0]; // Verde o rojo
                        }
                    }
                }
            });

            // Guardar PDF
            doc.save("reporte_alumnos.pdf");

            Swal.fire({
                icon: "success",
                title: "¡Reporte Generado!",
                text: "El PDF se ha descargado exitosamente.",
                confirmButtonColor: "#1e3a8a"
            });
        })
        .catch(error => {
            console.error("Error:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo generar el reporte.",
                confirmButtonColor: "#b91c1c"
            });
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