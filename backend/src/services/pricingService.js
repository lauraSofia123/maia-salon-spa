import { LoyaltyProgram } from '../models/index.js';

export const calculatePrice = (service, professional, profService) => {
  let price = service.price;
  
  if (profService.customPrice) {
    price = profService.customPrice;
  }
  
  return price;
};

export const calculateDeposit = (finalPrice, service) => {
  const depositPercent = service.category === 'hair' ? 0.3 : 0.2;
  const minDeposit = 15000;
  const calculated = Math.round(finalPrice * depositPercent);
  return Math.max(calculated, minDeposit);
};

export const calculateLoyaltyPoints = async (amount) => {
  const program = await LoyaltyProgram.findOne({ where: { isActive: true } });
  if (!program) return 0;
  
  const points = Math.floor(amount / program.currencyBase) * program.pointsPerCurrency;
  return points;
};

export const applyLoyaltyDiscount = (client, amount) => {
  if (!client.loyaltyTier || client.loyaltyTier === 'bronze') return { discount: 0, pointsUsed: 0 };
  
  const program = {
    silver: { discount: 5, maxPointsPerVisit: 1000 },
    gold: { discount: 10, maxPointsPerVisit: 3000 },
    platinum: { discount: 15, maxPointsPerVisit: 5000 }
  };
  
  const tier = program[client.loyaltyTier];
  if (!tier) return { discount: 0, pointsUsed: 0 };
  
  const discountAmount = amount * (tier.discount / 100);
  const pointsNeeded = Math.ceil(discountAmount * 10);
  const pointsUsed = Math.min(pointsNeeded, client.loyaltyPoints, tier.maxPointsPerVisit);
  
  return {
    discount: pointsUsed > 0 ? discountAmount : 0,
    pointsUsed
  };
};

export const calculateTier = (points) => {
  if (points >= 30000) return 'platinum';
  if (points >= 15000) return 'gold';
  if (points >= 5000) return 'silver';
  return 'bronze';
};

export const getTierBenefits = (tier) => {
  const benefits = {
    bronze: { discount: 0, freeServicesPerMonth: 0, priority: false },
    silver: { discount: 5, freeServicesPerMonth: 0, priority: true },
    gold: { discount: 10, freeServicesPerMonth: 1, priority: true },
    platinum: { discount: 15, freeServicesPerMonth: 2, priority: true }
  };
  return benefits[tier] || benefits.bronze;
};

export default { calculatePrice, calculateDeposit, calculateLoyaltyPoints, applyLoyaltyDiscount, calculateTier, getTierBenefits };