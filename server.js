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

// Ruta para obtener la lista de todos los alumnos
app.get("/listaAlumnos", (req, res) => {
  const filePath = "alumnos.xlsx";
  if (!fs.existsSync(filePath)) {
    return res.json([]); // Devolver array vacío si no existe el archivo
  }

  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const alumnos = xlsx.utils.sheet_to_json(sheet);

  res.json(alumnos);
});

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

// Ruta para registrar nuevos alumnos
app.post("/registrarAlumno", (req, res) => {
  const { matricula, nombres, apellidos, grupo, promedio } = req.body;

  if (!matricula || !nombres || !apellidos || !grupo || !promedio) {
    return res.status(400).json({ message: "Todos los campos son requeridos." });
  }

  const filePath = "alumnos.xlsx";
  let alumnos = [];

  // Cargar alumnos existentes
  if (fs.existsSync(filePath)) {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    alumnos = xlsx.utils.sheet_to_json(sheet);
  }

  // Verificar si la matrícula ya existe
  if (alumnos.some(a => String(a.matricula) === matricula)) {
    return res.status(409).json({ message: "La matrícula ya está registrada." });
  }

  // Agregar nuevo alumno como texto plano
  const nuevoAlumno = {
    matricula: String(matricula), // Convertir a texto plano
    nombres,
    apellidos,
    grupo: String(grupo), // Convertir a texto plano
    promedio: String(promedio) // Convertir a texto plano
  };

  alumnos.push(nuevoAlumno);

  // Crear o actualizar el archivo Excel
  const newWorkbook = xlsx.utils.book_new();
  const newSheet = xlsx.utils.json_to_sheet(alumnos, {
    header: ["matricula", "nombres", "apellidos", "grupo", "promedio"]
  });
  xlsx.utils.book_append_sheet(newWorkbook, newSheet, "Alumnos");
  xlsx.writeFile(newWorkbook, filePath);

  res.json({ message: "Alumno registrado exitosamente." });
});
// Ruta para editar un alumno
app.put("/editarAlumno", (req, res) => {
  const { matricula, nombres, apellidos, grupo, promedio } = req.body;

  if (!matricula || !nombres || !apellidos || !grupo || !promedio) {
    return res.status(400).json({ message: "Todos los campos son requeridos." });
  }

  const filePath = "alumnos.xlsx";
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "El archivo de alumnos no existe." });
  }

  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  let alumnos = xlsx.utils.sheet_to_json(sheet);

  const alumnoIndex = alumnos.findIndex(a => String(a.matricula) === matricula);
  if (alumnoIndex === -1) {
    return res.status(404).json({ message: "Alumno no encontrado." });
  }

  alumnos[alumnoIndex] = {
    matricula: String(matricula),
    nombres,
    apellidos,
    grupo: String(grupo),
    promedio: String(promedio)
  };

  const newSheet = xlsx.utils.json_to_sheet(alumnos, {
    header: ["matricula", "nombres", "apellidos", "grupo", "promedio"]
  });
  workbook.Sheets[workbook.SheetNames[0]] = newSheet;
  xlsx.writeFile(workbook, filePath);

  res.json({ message: "Alumno editado exitosamente." });
});

// Ruta para borrar un alumno
app.delete("/borrarAlumno/:matricula", (req, res) => {
  const matricula = req.params.matricula;
  const filePath = "alumnos.xlsx";

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "El archivo de alumnos no existe." });
  }

  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  let alumnos = xlsx.utils.sheet_to_json(sheet);

  const alumnoIndex = alumnos.findIndex(a => String(a.matricula) === matricula);
  if (alumnoIndex === -1) {
    return res.status(404).json({ message: "Alumno no encontrado." });
  }

  alumnos.splice(alumnoIndex, 1); // Eliminar el alumno

  const newSheet = xlsx.utils.json_to_sheet(alumnos, {
    header: ["matricula", "nombres", "apellidos", "grupo", "promedio"]
  });
  workbook.Sheets[workbook.SheetNames[0]] = newSheet;
  xlsx.writeFile(workbook, filePath);

  res.json({ message: "Alumno borrado exitosamente." });
});

app.listen(3000, () => {
  console.log("Servidor en http://localhost:3000");
});
