import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendVerificationCode = async (email, code) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Código de Verificación en 2 Pasos - Farmacia Digital',
        html: `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                        color: #333;
                    }
                    .container {
                        max-width: 600px;
                        margin: 20px auto;
                        background-color: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                        overflow: hidden;
                    }
                    .header {
                        background-color: #134e4a;
                        color: #ffffff;
                        padding: 20px;
                        text-align: center;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 24px;
                    }
                    .body {
                        padding: 30px;
                        text-align: center;
                    }
                    .code {
                        display: inline-block;
                        background-color: #e0f7fa;
                        color: #00695c;
                        font-size: 32px;
                        font-weight: bold;
                        padding: 10px 20px;
                        border-radius: 5px;
                        margin: 20px 0;
                        letter-spacing: 5px;
                    }
                    .body p {
                        font-size: 16px;
                        line-height: 1.6;
                        margin: 10px 0;
                    }
                    .footer {
                        background-color: #f4f4f4;
                        padding: 15px;
                        text-align: center;
                        font-size: 14px;
                        color: #777;
                    }
                    .footer a {
                        color: #00695c;
                        text-decoration: none;
                    }
                    .footer a:hover {
                        text-decoration: underline;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Farmacia Digital</h1>
                    </div>
                    <div class="body">
                        <h2>Código de Verificación</h2>
                        <p>Hemos recibido una solicitud para verificar tu identidad. Usa el siguiente código para completar el proceso:</p>
                        <div class="code">${code}</div>
                        <p>Este código es válido por <strong>10 minutos</strong>. Si no solicitaste este código, ignora este correo.</p>
                    </div>
                    <div class="footer">
                        <p>¿Necesitas ayuda? Contáctanos en <a href="mailto:soporte@farmaciadigital.com">soporte@farmaciadigital.com</a></p>
                        <p>&copy; ${new Date().getFullYear()} Farmacia Digital. Todos los derechos reservados.</p>
                    </div>
                </div>
            </body>
            </html>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Código de verificación enviado a ${email}`);
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        throw new Error('No se pudo enviar el código de verificación');
    }
};

export { sendVerificationCode };