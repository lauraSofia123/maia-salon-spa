import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

const initialState = {
  step: 1,
  branch: null,
  service: null,
  professional: null,
  date: null,
  timeSlot: null,
  couponCode: '',
  promotion: null,
  finalPrice: 0,
  depositAmount: 0,
  clientNotes: '',
  appointmentId: null
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(initialState);

  const setStep = useCallback((step) => {
    setCart(prev => ({ ...prev, step }));
  });

  const setBranch = useCallback((branch) => {
    setCart(prev => ({ ...prev, branch, service: null, professional: null, date: null, timeSlot: null }));
  });

  const setService = useCallback((service) => {
    setCart(prev => ({ ...prev, service, professional: null, date: null, timeSlot: null }));
  });

  const setProfessional = useCallback((professional) => {
    setCart(prev => ({ ...prev, professional, date: null, timeSlot: null }));
  });

  const setDate = useCallback((date) => {
    setCart(prev => ({ ...prev, date, timeSlot: null }));
  });

  const setTimeSlot = useCallback((timeSlot) => {
    setCart(prev => ({ ...prev, timeSlot }));
  });

  const setCoupon = useCallback((couponCode) => {
    setCart(prev => ({ ...prev, couponCode }));
  });

  const setPromotion = useCallback((promotion) => {
    setCart(prev => ({ ...prev, promotion }));
  });

  const setPricing = useCallback((finalPrice, depositAmount) => {
    setCart(prev => ({ ...prev, finalPrice, depositAmount }));
  });

  const setClientNotes = useCallback((clientNotes) => {
    setCart(prev => ({ ...prev, clientNotes }));
  });

  const setAppointmentId = useCallback((appointmentId) => {
    setCart(prev => ({ ...prev, appointmentId }));
  });

  const resetCart = useCallback(() => {
    setCart(initialState);
  });

  const canProceedToStep = (targetStep) => {
    switch (targetStep) {
      case 2: return !!cart.branch;
      case 3: return !!cart.service;
      case 4: return !!cart.professional;
      case 5: return !!cart.date;
      case 6: return !!cart.timeSlot;
      default: return true;
    }
  };

  const value = {
    cart,
    setStep,
    setBranch,
    setService,
    setProfessional,
    setDate,
    setTimeSlot,
    setCoupon,
    setPromotion,
    setPricing,
    setClientNotes,
    setAppointmentId,
    resetCart,
    canProceedToStep,
    isComplete: !!cart.appointmentId
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};