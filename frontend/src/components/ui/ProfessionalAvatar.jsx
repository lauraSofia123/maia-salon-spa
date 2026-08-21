import { useState } from 'react';

const ProfessionalAvatar = ({ src, name, size = 'md', className = '' }) => {
  const [hasError, setHasError] = useState(false);
  
  const sizeClasses = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-[72px] h-[72px] text-lg',
    lg: 'w-24 h-24 text-2xl'
  };

  const getInitials = (fullName) => {
    if (!fullName) return '';
    const parts = fullName.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  const baseClasses = `rounded-full flex items-center justify-center flex-shrink-0 ${sizeClasses[size]} ${className}`;

  if (!src || hasError) {
    return (
      <div className={`${baseClasses} bg-primary-50 text-primary-700 font-semibold border border-primary-100`}>
        {getInitials(name)}
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={name}
      onError={() => setHasError(true)}
      className={`${baseClasses} object-cover border border-neutral-100`}
    />
  );
};

export default ProfessionalAvatar;
