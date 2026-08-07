import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const fromWhatsApp = process.env.TWILIO_WHATSAPP_FROM;

export const sendWhatsApp = async (to, body) => {
  try {
    const message = await client.messages.create({
      from: fromWhatsApp,
      to: `whatsapp:${to}`,
      body
    });
    return message;
  } catch (error) {
    console.error('Error enviando WhatsApp:', error);
    throw new Error(`Error enviando WhatsApp: ${error.message}`);
  }
};

export const sendAppointmentConfirmationWhatsApp = async (phone, appointment, client, professional, service, branch) => {
  const body = `✅ *Cita Confirmada - Salón de Belleza*

Hola ${client.name}, tu cita está confirmada:

📅 *Fecha:* ${appointment.date}
⏰ *Hora:* ${appointment.startTime}
💇 *Servicio:* ${service.name}
👩‍💼 *Profesional:* ${professional.name}
📍 *Sede:* ${branch.name}
💰 *Precio:* $${appointment.finalPrice.toLocaleString()} COP

Dirección: ${branch.address}
Tel: ${branch.phone}

Para cancelar o reprogramar, contáctanos con 2h de antelación.

¡Te esperamos! 💖`;

  return sendWhatsApp(phone, body);
};

export const sendAppointmentReminderWhatsApp = async (phone, appointment, client, professional, service, branch, hoursBefore = 2) => {
  const body = `⏰ *Recordatorio - Salón de Belleza*

Hola ${client.name}, tu cita es en ${hoursBefore} horas:

📅 *Fecha:* ${appointment.date}
⏰ *Hora:* ${appointment.startTime}
💇 *Servicio:* ${service.name}
👩‍💼 *Profesional:* ${professional.name}
📍 *Sede:* ${branch.name}
📍 *Dirección:* ${branch.address}

¡Te esperamos! 💖`;

  return sendWhatsApp(phone, body);
};

export const sendAppointmentCancellationWhatsApp = async (phone, appointment, client, professional, service, branch, reason) => {
  const body = `❌ *Cita Cancelada - Salón de Belleza*

Hola ${client.name}, tu cita ha sido cancelada:

💇 *Servicio:* ${service.name}
👩‍💼 *Profesional:* ${professional.name}
📅 *Fecha:* ${appointment.date}
⏰ *Hora:* ${appointment.startTime}
📍 *Sede:* ${branch.name}

${reason ? `Motivo: ${reason}` : ''}

Si fue un error, contáctanos para reagendar.`;

  return sendWhatsApp(phone, body);
};

export default { sendWhatsApp, sendAppointmentConfirmationWhatsApp, sendAppointmentReminderWhatsApp, sendAppointmentCancellationWhatsApp };