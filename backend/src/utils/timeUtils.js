export const getDayName = (date) => {
  const d = new Date(date);
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[d.getDay()];
};

export const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

export const addMinutes = (time, minutes) => {
  const total = timeToMinutes(time) + minutes;
  return minutesToTime(total);
};

export const formatDate = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

export const formatDateTime = (date, time) => {
  return `${formatDate(date)}T${time}:00`;
};

export const isPast = (date, time) => {
  const appointmentDateTime = new Date(`${formatDate(date)}T${time}`);
  return appointmentDateTime < new Date();
};

export const getDaysDifference = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getWeekRange = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const start = new Date(d);
  start.setDate(d.getDate() - day);
  const end = new Date(d);
  end.setDate(d.getDate() + (6 - day));
  return { start: formatDate(start), end: formatDate(end) };
};

export const getMonthRange = (date) => {
  const d = new Date(date);
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return { start: formatDate(start), end: formatDate(end) };
};