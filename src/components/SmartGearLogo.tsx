import { cn } from '@/lib/utils';

interface SmartGearLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const SmartGearLogo = ({ className, size = 'md', showText = true }: SmartGearLogoProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(sizeClasses[size], 'flex-shrink-0')}
      >
        {/* Outer gear ring */}
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke="url(#goldGradient)"
          strokeWidth="2"
          fill="none"
        />
        
        {/* Gear teeth */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <rect
            key={i}
            x="22"
            y="2"
            width="4"
            height="6"
            rx="1"
            fill="url(#goldGradient)"
            transform={`rotate(${angle} 24 24)`}
          />
        ))}
        
        {/* Inner circuit/smart element */}
        <circle
          cx="24"
          cy="24"
          r="12"
          fill="url(#darkGradient)"
          stroke="url(#goldGradient)"
          strokeWidth="1.5"
        />
        
        {/* Central "S" stylized as circuit */}
        <path
          d="M20 18C20 16.8954 20.8954 16 22 16H26C27.6569 16 29 17.3431 29 19C29 20.6569 27.6569 22 26 22H22C20.3431 22 19 23.3431 19 25C19 26.6569 20.3431 28 22 28H26C27.1046 28 28 28.8954 28 30"
          stroke="url(#goldGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Circuit dots */}
        <circle cx="20" cy="18" r="1.5" fill="url(#goldGradient)" />
        <circle cx="28" cy="30" r="1.5" fill="url(#goldGradient)" />
        
        {/* Definitions */}
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" />
            <stop offset="50%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#B8860B" />
          </linearGradient>
          <linearGradient id="darkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a1a2e" />
            <stop offset="100%" stopColor="#16213e" />
          </linearGradient>
        </defs>
      </svg>
      
      {showText && (
        <span className="font-serif font-bold text-gradient-gold whitespace-nowrap">
          Smart Gear
        </span>
      )}
    </div>
  );
};
