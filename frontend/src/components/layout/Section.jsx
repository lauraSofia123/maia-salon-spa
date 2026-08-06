import { motion } from 'framer-motion';

const Section = ({
  children,
  className = '',
  id,
  background = 'white',
  padding = 'py-16 sm:py-24 lg:py-32',
  container = true
}) => {
  const bgClasses = {
    white: 'bg-white',
    'neutral-50': 'bg-neutral-50',
    'primary-50': 'bg-primary-50',
    'secondary-50': 'bg-secondary-50',
    gradient: 'bg-gradient-hero',
    dark: 'bg-neutral-900 text-white'
  };

  return (
    <section
      id={id}
      className={`${padding} ${bgClasses[background] || background} ${className}`}
      aria-labelledby={id ? `${id}-heading` : undefined}
    >
      {container && <div className="container-custom">{children}</div>}
      {!container && children}
    </section>
  );
};

const Container = ({ children, className = '', size = 'default' }) => {
  const sizeClasses = {
    default: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    narrow: 'max-w-3xl mx-auto px-4 sm:px-6 lg:px-8',
    wide: 'max-w-full mx-auto px-4 sm:px-6 lg:px-8',
    full: 'w-full px-4 sm:px-6 lg:px-8'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      {children}
    </div>
  );
};

const SectionHeader = ({
  title,
  subtitle,
  align = 'center',
  className = '',
  titleClassName = '',
  subtitleClassName = ''
}) => {
  const alignClasses = {
    center: 'text-center',
    left: 'text-left',
    right: 'text-right'
  };

  return (
    <motion.div
      className={`${alignClasses[align]} mb-12 lg:mb-16 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6 }}
    >
      {title && (
        <h2 id={`${title}-heading`} className={`section-title ${titleClassName}`}>
          {title}
        </h2>
      )}
      {subtitle && (
        <p className={`section-subtitle mt-4 ${align === 'center' ? 'mx-auto' : ''} ${subtitleClassName}`}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};

export { Section, Container, SectionHeader };
export default Section;