import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      text
    });
    return info;
  } catch (error) {
    console.error('Error enviando email:', error);
    throw new Error(`Error enviando email: ${error.message}`);
  }
};

export const sendAppointmentConfirmation = async (appointment, client, professional, service, branch) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fafafa; padding: 30px; border-radius: 0 0 10px 10px; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .label { font-weight: bold; color: #666; }
        .value { color: #333; }
        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Cita Confirmada</h1>
          <p>Salón de Belleza</p>
        </div>
        <div class="content">
          <p>Hola <strong>${client.name}</strong>,</p>
          <p>Tu cita ha sido confirmada exitosamente. Aquí están los detalles:</p>
          
          <div class="detail-row">
            <span class="label">Servicio:</span>
            <span class="value">${service.name}</span>
          </div>
          <div class="detail-row">
            <span class="label">Profesional:</span>
            <span class="value">${professional.name}</span>
          </div>
          <div class="detail-row">
            <span class="label">Sede:</span>
            <span class="value">${branch.name}</span>
          </div>
          <div class="detail-row">
            <span class="label">Fecha:</span>
            <span class="value">${appointment.date}</span>
          </div>
          <div class="detail-row">
            <span class="label">Hora:</span>
            <span class="value">${appointment.startTime}</span>
          </div>
          <div class="detail-row">
            <span class="label">Duración:</span>
            <span class="value">${service.duration} minutos</span>
          </div>
          <div class="detail-row">
            <span class="label">Precio:</span>
            <span class="value">$${appointment.finalPrice.toLocaleString()} COP</span>
          </div>
          
          <p style="margin-top: 20px;">Si necesitas cancelar o reprogramar, hazlo con al menos 2 horas de antelación.</p>
          <p>¡Te esperamos!</p>
        </div>
        <div class="footer">
          <p>Salón de Belleza - Todos los derechos reservados</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: client.email,
    subject: `Confirmación de cita - ${service.name} - ${appointment.date}`,
    html
  });
};

export const sendAppointmentReminder = async (appointment, client, professional, service, branch, hoursBefore = 2) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fafafa; padding: 30px; border-radius: 0 0 10px 10px; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .label { font-weight: bold; color: #666; }
        .value { color: #333; }
        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Recordatorio de Cita</h1>
          <p>Tu cita es en ${hoursBefore} horas</p>
        </div>
        <div class="content">
          <p>Hola <strong>${client.name}</strong>,</p>
          <p>Te recordamos tu cita próxima:</p>
          
          <div class="detail-row">
            <span class="label">Servicio:</span>
            <span class="value">${service.name}</span>
          </div>
          <div class="detail-row">
            <span class="label">Profesional:</span>
            <span class="value">${professional.name}</span>
          </div>
          <div class="detail-row">
            <span class="label">Sede:</span>
            <span class="value">${branch.name} - ${branch.address}</span>
          </div>
          <div class="detail-row">
            <span class="label">Fecha:</span>
            <span class="value">${appointment.date}</span>
          </div>
          <div class="detail-row">
            <span class="label">Hora:</span>
            <span class="value">${appointment.startTime}</span>
          </div>
          
          <p style="margin-top: 20px;"><strong>Dirección:</strong> ${branch.address}</p>
          <p><strong>Teléfono:</strong> ${branch.phone}</p>
        </div>
        <div class="footer">
          <p>Salón de Belleza - Todos los derechos reservados</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: client.email,
    subject: `Recordatorio: Tu cita en ${hoursBefore} horas - ${service.name}`,
    html
  });
};

export const sendAppointmentCancellation = async (appointment, client, professional, service, branch, reason) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fafafa; padding: 30px; border-radius: 0 0 10px 10px; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .label { font-weight: bold; color: #666; }
        .value { color: #333; }
        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Cita Cancelada</h1>
        </div>
        <div class="content">
          <p>Hola <strong>${client.name}</strong>,</p>
          <p>Tu cita ha sido cancelada. Detalles:</p>
          
          <div class="detail-row">
            <span class="label">Servicio:</span>
            <span class="value">${service.name}</span>
          </div>
          <div class="detail-row">
            <span class="label">Profesional:</span>
            <span class="value">${professional.name}</span>
          </div>
          <div class="detail-row">
            <span class="label">Fecha:</span>
            <span class="value">${appointment.date}</span>
          </div>
          <div class="detail-row">
            <span class="label">Hora:</span>
            <span class="value">${appointment.startTime}</span>
          </div>
          <div class="detail-row">
            <span class="label">Motivo:</span>
            <span class="value">${reason || 'No especificado'}</span>
          </div>
          
          <p style="margin-top: 20px;">Si fue un error, por favor contáctanos para reagendar.</p>
        </div>
        <div class="footer">
          <p>Salón de Belleza - Todos los derechos reservados</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: client.email,
    subject: `Cancelación de cita - ${service.name}`,
    html
  });
};

export default { sendEmail, sendAppointmentConfirmation, sendAppointmentReminder, sendAppointmentCancellation };