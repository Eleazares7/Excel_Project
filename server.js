import express from 'express';
import cors from 'cors';
import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendVerificationCode } from './nodemailerConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const filePath = 'users.xlsx';

// Almacenamiento temporal para códigos de verificación (en memoria)
const verificationCodes = new Map();

// Generar un código de verificación de 6 dígitos
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

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

// Ruta para enviar código de verificación (usada en login y register)
app.post('/send-verification-code', async (req, res) => {
    const { email, action } = req.body;

    if (!email || !action) {
        return res.status(400).json({ message: 'Correo y acción son requeridos.' });
    }

    try {
        const code = generateVerificationCode();
        // Almacenar el código con un tiempo de expiración de 10 minutos
        verificationCodes.set(email, { code, action, expires: Date.now() + 10 * 60 * 1000 });
        await sendVerificationCode(email, code);
        res.json({ message: 'Código de verificación enviado.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al enviar el código de verificación.', error: error.message });
    }
});

// Ruta para verificar el código de 2FA
app.post('/verify-2fa', (req, res) => {
    const { email, code, action } = req.body;

    if (!email || !code || !action) {
        return res.status(400).json({ message: 'Correo, código y acción son requeridos.' });
    }

    const storedData = verificationCodes.get(email);

    if (!storedData) {
        return res.status(400).json({ message: 'No se encontró un código de verificación para este correo.' });
    }

    if (storedData.action !== action) {
        return res.status(400).json({ message: 'Acción no coincide con el código enviado.' });
    }

    if (Date.now() > storedData.expires) {
        verificationCodes.delete(email);
        return res.status(400).json({ message: 'El código de verificación ha expirado.' });
    }

    if (storedData.code !== code) {
        return res.status(400).json({ message: 'Código de verificación incorrecto.' });
    }

    // Código válido, eliminarlo después de verificar
    verificationCodes.delete(email);
    res.json({ message: 'Verificación exitosa.' });
});

// Ruta de inicio de sesión
app.post('/login', (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ message: 'Correo, contraseña y rol son requeridos.' });
        }

        const user = users.find(
            u => u.email === email.toLowerCase() && u.password === password && u.role === role
        );

        if (user) {
            res.json({ message: 'Credenciales válidas, proceda con la verificación en 2 pasos.', rol: user.role });
        } else {
            res.status(401).json({ message: 'Credenciales incorrectas o rol no coincide.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor.', error: error.message });
    }
});

// Ruta para registrar nuevos usuarios
app.post('/register', (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    // Validación: evitar múltiples administradores
    if (role === 'admin' && users.some(user => user.role === 'admin')) {
        return res.status(403).json({ message: 'Ya existe un administrador registrado.' });
    }

    if (users.some(u => u.email === email.toLowerCase())) {
        return res.status(409).json({ message: 'El usuario ya existe.' });
    }

    const newUser = {
        email: email.toLowerCase(),
        password: password,
        role: role
    };

    users.push(newUser);

    const newWorkbook = xlsx.utils.book_new();
    const newSheet = xlsx.utils.json_to_sheet(users, {
        header: ['email', 'password', 'role']
    });

    xlsx.utils.book_append_sheet(newWorkbook, newSheet, 'Usuarios');
    xlsx.writeFile(newWorkbook, filePath);

    res.json({ message: 'Usuario registrado exitosamente.' });
});

// Rutas existentes para alumnos (sin cambios)
app.get('/listaAlumnos', (req, res) => {
    const filePath = 'alumnos.xlsx';
    if (!fs.existsSync(filePath)) {
        return res.json([]);
    }

    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const alumnos = xlsx.utils.sheet_to_json(sheet);

    res.json(alumnos);
});

app.get('/buscarAlumno/:matricula', (req, res) => {
    const filePath = 'alumnos.xlsx';
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'El archivo de alumnos no existe.' });
    }

    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const alumnos = xlsx.utils.sheet_to_json(sheet);

    const matricula = req.params.matricula;
    const alumno = alumnos.find(a => String(a.matricula) === matricula);

    if (alumno) {
        res.json(alumno);
    } else {
        res.status(404).json({ message: 'Alumno no encontrado.' });
    }
});

app.post('/registrarAlumno', (req, res) => {
    const { matricula, nombres, apellidos, grupo, promedio } = req.body;

    if (!matricula || !nombres || !apellidos || !grupo || !promedio) {
        return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    const filePath = 'alumnos.xlsx';
    let alumnos = [];

    if (fs.existsSync(filePath)) {
        const workbook = xlsx.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        alumnos = xlsx.utils.sheet_to_json(sheet);
    }

    if (alumnos.some(a => String(a.matricula) === matricula)) {
        return res.status(409).json({ message: 'La matrícula ya está registrada.' });
    }

    const nuevoAlumno = {
        matricula: String(matricula),
        nombres,
        apellidos,
        grupo: String(grupo),
        promedio: String(promedio)
    };

    alumnos.push(nuevoAlumno);

    const newWorkbook = xlsx.utils.book_new();
    const newSheet = xlsx.utils.json_to_sheet(alumnos, {
        header: ['matricula', 'nombres', 'apellidos', 'grupo', 'promedio']
    });
    xlsx.utils.book_append_sheet(newWorkbook, newSheet, 'Alumnos');
    xlsx.writeFile(newWorkbook, filePath);

    res.json({ message: 'Alumno registrado exitosamente.' });
});

app.put('/editarAlumno', (req, res) => {
    const { matricula, nombres, apellidos, grupo, promedio } = req.body;

    if (!matricula || !nombres || !apellidos || !grupo || !promedio) {
        return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    const filePath = 'alumnos.xlsx';
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'El archivo de alumnos no existe.' });
    }

    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    let alumnos = xlsx.utils.sheet_to_json(sheet);

    const alumnoIndex = alumnos.findIndex(a => String(a.matricula) === matricula);
    if (alumnoIndex === -1) {
        return res.status(404).json({ message: 'Alumno no encontrado.' });
    }

    alumnos[alumnoIndex] = {
        matricula: String(matricula),
        nombres,
        apellidos,
        grupo: String(grupo),
        promedio: String(promedio)
    };

    const newSheet = xlsx.utils.json_to_sheet(alumnos, {
        header: ['matricula', 'nombres', 'apellidos', 'grupo', 'promedio']
    });
    workbook.Sheets[workbook.SheetNames[0]] = newSheet;
    xlsx.writeFile(workbook, filePath);

    res.json({ message: 'Alumno editado exitosamente.' });
});

app.delete('/borrarAlumno/:matricula', (req, res) => {
    const matricula = req.params.matricula;
    const filePath = 'alumnos.xlsx';

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'El archivo de alumnos no existe.' });
    }

    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    let alumnos = xlsx.utils.sheet_to_json(sheet);

    const alumnoIndex = alumnos.findIndex(a => String(a.matricula) === matricula);
    if (alumnoIndex === -1) {
        return res.status(404).json({ message: 'Alumno no encontrado.' });
    }

    alumnos.splice(alumnoIndex, 1);

    const newSheet = xlsx.utils.json_to_sheet(alumnos, {
        header: ['matricula', 'nombres', 'apellidos', 'grupo', 'promedio']
    });
    workbook.Sheets[workbook.SheetNames[0]] = newSheet;
    xlsx.writeFile(workbook, filePath);

    res.json({ message: 'Alumno borrado exitosamente.' });
});

app.listen(3000, () => {
    console.log('Servidor en http://localhost:3000');
});