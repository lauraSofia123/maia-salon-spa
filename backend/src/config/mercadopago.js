import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import dotenv from 'dotenv';

dotenv.config();

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  options: {
    timeout: 5000,
    idempotencyKey: 'abc'
  }
});

export const createPreference = async (preferenceData) => {
  try {
    const preference = new Preference(client);
    const result = await preference.create({ body: preferenceData });
    return result;
  } catch (error) {
    console.error('Error creando preferencia MP:', error);
    throw new Error(`Error creando preferencia: ${error.message}`);
  }
};

export const getPayment = async (paymentId) => {
  try {
    const payment = new Payment(client);
    const result = await payment.get({ id: paymentId });
    return result;
  } catch (error) {
    console.error('Error obteniendo pago MP:', error);
    throw new Error(`Error obteniendo pago: ${error.message}`);
  }
};

export const createPaymentPreference = async (appointment, client, service, professional, branch) => {
  const items = [{
    id: service.id,
    title: `${service.name} - ${professional.name}`,
    description: `${service.name} con ${professional.name} en ${branch.name}`,
    quantity: 1,
    unit_price: Number(appointment.finalPrice),
    currency_id: 'COP'
  }];

  const backUrls = {
    success: `${process.env.FRONTEND_URL}/payment/success?appointmentId=${appointment.id}`,
    failure: `${process.env.FRONTEND_URL}/payment/failure?appointmentId=${appointment.id}`,
    pending: `${process.env.FRONTEND_URL}/payment/pending?appointmentId=${appointment.id}`
  };

  const preferenceData = {
    items,
    payer: {
      name: client.name,
      email: client.email,
      phone: {
        area_code: '57',
        number: client.phone?.replace(/[^0-9]/g, '') || ''
      }
    },
    back_urls: backUrls,
    auto_return: 'approved',
    external_reference: appointment.id.toString(),
    notification_url: `${process.env.BACKEND_URL}/api/payments/webhook`,
    expires: false,
    payment_methods: {
      excluded_payment_methods: [],
      excluded_payment_types: [],
      installments: 12,
      default_installments: 1
    },
    shipments: {
      cost: 0,
      mode: 'not_specified'
    }
  };

  return createPreference(preferenceData);
};

export default { createPreference, getPayment, createPaymentPreference };