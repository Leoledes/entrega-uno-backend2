import nodemailer from 'nodemailer';
import config from '../config/envConfig.js';

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: config.email.service,
            auth: {
                user: config.email.user,
                pass: config.email.password
            }
        });
    }

    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('✅ Servidor de email listo para enviar mensajes');
            return true;
        } catch (error) {
            console.error('❌ Error en la configuración del email:', error.message);
            return false;
        }
    }

    async sendEmail(to, subject, html) {
        try {
            const mailOptions = {
                from: config.email.from,
                to,
                subject,
                html
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email enviado:', info.messageId);
            return info;
        } catch (error) {
            console.error('❌ Error al enviar email:', error.message);
            throw new Error(`Error al enviar email: ${error.message}`);
        }
    }

    async sendPasswordResetEmail(email, resetToken, userName) {
        try {
            const resetLink = `${config.frontend.url}/reset-password?token=${resetToken}`;
            
            const subject = 'Recuperación de Contraseña';
            
            const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            border: 1px solid #ddd;
                            border-radius: 5px;
                        }
                        .header {
                            background-color: #4CAF50;
                            color: white;
                            padding: 10px;
                            text-align: center;
                            border-radius: 5px 5px 0 0;
                        }
                        .content {
                            padding: 20px;
                        }
                        .button {
                            display: inline-block;
                            padding: 12px 24px;
                            background-color: #4CAF50;
                            color: white;
                            text-decoration: none;
                            border-radius: 5px;
                            margin: 20px 0;
                        }
                        .footer {
                            margin-top: 20px;
                            padding-top: 20px;
                            border-top: 1px solid #ddd;
                            font-size: 12px;
                            color: #777;
                        }
                        .warning {
                            background-color: #fff3cd;
                            border: 1px solid #ffc107;
                            padding: 10px;
                            border-radius: 5px;
                            margin: 15px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>Recuperación de Contraseña</h2>
                        </div>
                        <div class="content">
                            <p>Hola ${userName},</p>
                            <p>Recibimos una solicitud para restablecer tu contraseña.</p>
                            <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
                            
                            <a href="${resetLink}" class="button">Restablecer Contraseña</a>
                            
                            <div class="warning">
                                <strong>⚠️ Este enlace expirará en 1 hora.</strong>
                            </div>
                            
                            <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este correo de forma segura.</p>
                            
                            <p>Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
                            <p style="word-break: break-all; color: #4CAF50;">${resetLink}</p>
                        </div>
                        <div class="footer">
                            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
                            <p>&copy; 2024 E-commerce. Todos los derechos reservados.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            return await this.sendEmail(email, subject, html);
        } catch (error) {
            throw new Error(`Error al enviar email de recuperación: ${error.message}`);
        }
    }

    async sendPasswordChangedEmail(email, userName) {
        try {
            const subject = 'Contraseña Actualizada';
            
            const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            border: 1px solid #ddd;
                            border-radius: 5px;
                        }
                        .header {
                            background-color: #4CAF50;
                            color: white;
                            padding: 10px;
                            text-align: center;
                            border-radius: 5px 5px 0 0;
                        }
                        .content {
                            padding: 20px;
                        }
                        .success {
                            background-color: #d4edda;
                            border: 1px solid #c3e6cb;
                            padding: 10px;
                            border-radius: 5px;
                            margin: 15px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>✅ Contraseña Actualizada</h2>
                        </div>
                        <div class="content">
                            <p>Hola ${userName},</p>
                            
                            <div class="success">
                                <strong>Tu contraseña ha sido actualizada exitosamente.</strong>
                            </div>
                            
                            <p>Si no realizaste este cambio, por favor contacta con nuestro soporte inmediatamente.</p>
                            
                            <p>Puedes iniciar sesión con tu nueva contraseña en cualquier momento.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            return await this.sendEmail(email, subject, html);
        } catch (error) {
            throw new Error(`Error al enviar email de confirmación: ${error.message}`);
        }
    }
}

export default new EmailService();