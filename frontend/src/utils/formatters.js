export const formatPrice = (price) => {
  if (price === null || price === undefined) return '0';
  return Number(price).toLocaleString('es-CO');
};

export const formatCurrency = (amount, currency = 'COP') => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  return new Date(date).toLocaleDateString('es-CO', defaultOptions);
};

export const formatShortDate = (date) => {
  return new Date(date).toLocaleDateString('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
};

export const formatTime = (time) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
};

export const formatDateTime = (date, time) => {
  return `${formatShortDate(date)} · ${formatTime(time)}`;
};

export const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  }
  if (cleaned.length === 12 && cleaned.startsWith('57')) {
    return `+57 ${cleaned.slice(2)}`.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4');
  }
  return phone;
};

export const truncate = (text, length = 100) => {
  if (!text || text.length <= length) return text;
  return text.substring(0, length).trim() + '...';
};

export const slugify = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export const getColorFromName = (name) => {
  if (!name) return 'bg-neutral-400';
  const colors = [
    'bg-primary-500', 'bg-secondary-500', 'bg-accent-500',
    'bg-green-500', 'bg-blue-500', 'bg-purple-500',
    'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export const categoryLabels = {
  nails: 'Uñas',
  hair: 'Cabello',
  eyelashes: 'Pestañas',
  other: 'Otros'
};

export const categoryIcons = {
  nails: '✨',
  hair: '💇',
  eyelashes: '👁️',
  other: '✨'
};

export const statusLabels = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  in_progress: 'En progreso',
  completed: 'Completada',
  cancelled: 'Cancelada',
  no_show: 'No asistió',
  rescheduled: 'Reprogramada'
};

export const statusColors = {
  pending: 'badge-warning',
  confirmed: 'badge-primary',
  in_progress: 'badge-info',
  completed: 'badge-success',
  cancelled: 'badge-danger',
  no_show: 'badge-neutral',
  rescheduled: 'badge-secondary'
};

export const paymentMethodLabels = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
  mercadopago: 'Mercado Pago',
  nequi: 'Nequi',
  daviplata: 'Daviplata',
  mixed: 'Mixto',
  other: 'Otro'
};

export const roleLabels = {
  client: 'Clienta',
  professional: 'Profesional',
  admin: 'Administrador'
};