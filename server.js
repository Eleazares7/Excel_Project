const express = require("express");
const cors = require("cors");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const filePath = "users.xlsx";

// Cargar usuarios al inicio
function loadUsers() {
  if (fs.existsSync(filePath)) {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = xlsx.utils.sheet_to_json(sheet);

    return jsonData.map(user => ({
      email: String(user.email)?.toLowerCase(),
      password: String(user.password),
      role: String(user.role)
    }));
  }
  return [];
}

let users = loadUsers();

// Ruta de inicio de sesión
app.post("/login", (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "Correo, contraseña y rol son requeridos." });
    }

    const user = users.find(
      u => u.email === email.toLowerCase() && u.password === password && u.role === role
    );

    if (user) {
      res.json({ message: "Inicio de sesión exitoso", rol: user.role });
    } else {
      res.status(401).json({ message: "Credenciales incorrectas o rol no coincide." });
    }
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor.", error: error.message });
  }
});

// Ruta para registrar nuevos usuarios
app.post("/register", (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: "Todos los campos son requeridos." });
  }

  // Validación: evitar múltiples administradores
  if (role === "admin" && users.some(user => user.role === "admin")) {
    return res.status(403).json({ message: "Ya existe un administrador registrado." });
  }

  if (users.some(u => u.email === email.toLowerCase())) {
    return res.status(409).json({ message: "El usuario ya existe." });
  }

  const newUser = {
    email: email.toLowerCase(),
    password: password,
    role: role
  };

  users.push(newUser);

  const newWorkbook = xlsx.utils.book_new();

  // Asegurarse de usar las claves correctas para evitar duplicados
  const newSheet = xlsx.utils.json_to_sheet(users, {
    header: ["email", "password", "role"]
  });

  xlsx.utils.book_append_sheet(newWorkbook, newSheet, "Usuarios");

  // Guardar archivo Excel
  xlsx.writeFile(newWorkbook, filePath);

  res.json({ message: "Usuario registrado exitosamente." });
});
console.log("Hola")
// Ruta para buscar alumnos por matrícula
app.get("/buscarAlumno/:matricula", (req, res) => {
  const filePath = "alumnos.xlsx"; // Archivo de alumnos
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "El archivo de alumnos no existe." });
  }

  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const alumnos = xlsx.utils.sheet_to_json(sheet);

  const matricula = req.params.matricula;
  const alumno = alumnos.find(a => String(a.matricula) === matricula);

  if (alumno) {
    res.json(alumno);
  } else {
    res.status(404).json({ message: "Alumno no encontrado." });
  }
});

app.listen(3000, () => {
  console.log("Servidor en http://localhost:3000");
});
