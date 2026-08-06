import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  hover = true,
  elevated = false,
  padding = 'p-6',
  onClick
}) => {
  return (
    <motion.div
      className={`
        bg-white rounded-2xl overflow-hidden transition-all duration-300
        ${elevated ? 'shadow-elegant' : 'shadow-card'}
        ${hover && !onClick ? 'hover:shadow-soft' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${padding}
        ${className}
      `}
      whileHover={hover && !onClick ? { y: -4, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

const CardHeader = ({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-xl font-display font-semibold text-neutral-900 ${className}`}>{children}</h3>
);

const CardDescription = ({ children, className = '' }) => (
  <p className={`text-neutral-600 mt-1 ${className}`}>{children}</p>
);

const CardContent = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);

const CardFooter = ({ children, className = '' }) => (
  <div className={`mt-4 pt-4 border-t border-neutral-100 ${className}`}>{children}</div>
);

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;