import { Professional, ProfessionalBranch, ProfessionalService, Service, Appointment, ScheduleBlock, Branch } from '../models/index.js';
import { Op } from 'sequelize';
import { addMinutes, getDayName, timeToMinutes, minutesToTime } from '../utils/timeUtils.js';

export const calculateAvailability = async (professionalId, branchId, serviceId, date) => {
  const professional = await Professional.findByPk(professionalId, {
    include: [
      { association: 'branches', where: { branchId }, required: true },
      { association: 'services', where: { id: serviceId }, required: true }
    ]
  });
  
  if (!professional) {
    throw new Error('Profesional no encontrado o no trabaja en esta sede/servicio');
  }
  
  const profBranch = professional.branches[0];
  const profService = professional.services[0];
  const service = await Service.findByPk(serviceId);
  
  const dayName = getDayName(date);
  const daySchedule = profBranch.schedule[dayName];
  
  if (!daySchedule || !daySchedule.isWorking) {
    return { date, slots: [], message: 'El profesional no trabaja este día' };
  }
  
  const branch = await Branch.findByPk(branchId);
  const branchHours = branch.openingHours[dayName];
  
  if (!branchHours || branchHours.isClosed) {
    return { date, slots: [], message: 'La sede está cerrada este día' };
  }
  
  const workStart = daySchedule.start;
  const workEnd = daySchedule.end;
  const breaks = daySchedule.breaks || [];
  
  const serviceDuration = profService.ProfessionalService.customDuration || service.duration;
  const bufferTime = service.bufferTime || 0;
  const totalDuration = serviceDuration + bufferTime;
  
  const startMinutes = timeToMinutes(workStart);
  const endMinutes = timeToMinutes(workEnd);
  
  const existingAppointments = await Appointment.findAll({
    where: {
      professionalId,
      branchId,
      date,
      status: { [Op.in]: ['pending', 'confirmed', 'in_progress'] }
    },
    attributes: ['startTime', 'endTime', 'duration']
  });
  
  const scheduleBlocks = await ScheduleBlock.findAll({
    where: {
      professionalId,
      branchId: { [Op.or]: [branchId, null] },
      startDate: { [Op.lte]: date },
      endDate: { [Op.gte]: date },
      isActive: true
    }
  });
  
  const blockedSlots = [];
  
  for (const block of scheduleBlocks) {
    if (!block.startTime && !block.endTime) {
      return { date, slots: [], message: 'El profesional tiene bloqueo todo el día' };
    }
    
    if (block.startTime && block.endTime) {
      blockedSlots.push({
        start: timeToMinutes(block.startTime),
        end: timeToMinutes(block.endTime)
      });
    }
  }
  
  const breakSlots = breaks.map(b => ({
    start: timeToMinutes(b.start),
    end: timeToMinutes(b.end)
  }));
  
  const appointmentSlots = existingAppointments.map(a => ({
    start: timeToMinutes(a.startTime),
    end: timeToMinutes(a.endTime)
  }));
  
  const allBlocked = [...blockedSlots, ...breakSlots, ...appointmentSlots];
  allBlocked.sort((a, b) => a.start - b.start);
  
  const slots = [];
  let currentTime = startMinutes;
  
  const slotInterval = 15;
  
  while (currentTime + totalDuration <= endMinutes) {
    const slotEnd = currentTime + totalDuration;
    let isBlocked = false;
    
    for (const blocked of allBlocked) {
      if (currentTime < blocked.end && slotEnd > blocked.start) {
        isBlocked = true;
        currentTime = blocked.end;
        break;
      }
    }
    
    if (!isBlocked) {
      slots.push({
        time: minutesToTime(currentTime),
        endTime: minutesToTime(slotEnd),
        available: true,
        duration: totalDuration
      });
    }
    
    currentTime += slotInterval;
  }
  
  return {
    date,
    professionalId,
    branchId,
    serviceId,
    serviceDuration,
    bufferTime,
    totalDuration,
    workHours: { start: workStart, end: workEnd },
    slots
  };
};

export const getAvailableProfessionals = async (branchId, serviceId, date) => {
  const dayName = getDayName(date);
  
  const professionals = await Professional.findAll({
    where: { isActive: true },
    include: [
      { 
        association: 'services', 
        where: { id: serviceId },
        through: { attributes: ['customPrice', 'customDuration'] }
      },
      {
        association: 'branches',
        where: { branchId },
        through: { 
          where: { 
            schedule: {
              [dayName]: { isWorking: true }
            }
          }
        }
      }
    ]
  });
  
  const results = [];
  
  for (const prof of professionals) {
    const profBranch = prof.branches[0];
    const daySchedule = profBranch.schedule[dayName];
    
    if (!daySchedule || !daySchedule.isWorking) continue;
    
    const availability = await calculateAvailability(prof.id, branchId, serviceId, date);
    const availableSlots = availability.slots.filter(s => s.available).length;
    
    if (availableSlots > 0) {
      results.push({
        professional: {
          id: prof.id,
          name: prof.user.name,
          avatar: prof.user.avatar,
          rating: prof.rating,
          totalReviews: prof.totalReviews
        },
        availableSlots,
        schedule: daySchedule
      });
    }
  }
  
  return results;
};

export const getBranchAvailability = async (branchId, date) => {
  const branch = await Branch.findByPk(branchId);
  if (!branch) throw new Error('Sede no encontrada');
  
  const dayName = getDayName(date);
  const branchHours = branch.openingHours[dayName];
  
  if (!branchHours || branchHours.isClosed) {
    return { date, isOpen: false, message: 'Sede cerrada' };
  }
  
  const professionals = await Professional.findAll({
    where: { isActive: true },
    include: [
      { association: 'services', through: { attributes: ['customPrice', 'customDuration'] } },
      { 
        association: 'branches', 
        where: { branchId },
        through: { 
          where: { 
            schedule: {
              [dayName]: { isWorking: true }
            }
          }
        }
      }
    ]
  });
  
  const servicesMap = new Map();
  
  for (const prof of professionals) {
    for (const service of prof.services) {
      if (!servicesMap.has(service.id)) {
        servicesMap.set(service.id, {
          service: {
            id: service.id,
            name: service.name,
            category: service.category,
            duration: service.duration,
            price: service.price
          },
          professionals: []
        });
      }
      
      const availability = await calculateAvailability(prof.id, branchId, service.id, date);
      const availableSlots = availability.slots.filter(s => s.available);
      
      if (availableSlots.length > 0) {
        servicesMap.get(service.id).professionals.push({
          id: prof.id,
          name: prof.user.name,
          avatar: prof.user.avatar,
          rating: prof.rating,
          availableSlots: availableSlots.length,
          schedule: prof.branches[0].schedule[dayName]
        });
      }
    }
  }
  
  const services = Array.from(servicesMap.values()).filter(s => s.professionals.length > 0);
  
  return { date, isOpen: true, branchHours, services };
};

export default { calculateAvailability, getAvailableProfessionals, getBranchAvailability };