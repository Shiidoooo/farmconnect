import { Link } from "react-router-dom";

interface LogoProps {
  /** Optional className for custom styling */
  className?: string;
  /** Whether to show the text label */
  showText?: boolean;
  /** Custom text to display */
  text?: string;
  /** Size of the logo icon */
  size?: "sm" | "md" | "lg";
  /** Link destination - defaults to "/" */
  to?: string;
  /** Whether the logo should be clickable */
  clickable?: boolean;
}

const Logo = ({ 
  className = "", 
  showText = true, 
  text = "HarvestConnect",
  size = "md",
  to = "/",
  clickable = true
}: LogoProps) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  };

  const logoIcon = (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`${sizeClasses[size]} text-red-600`}
    >
      <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z"/>
    </svg>
  );

  const logoContent = (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`${sizeClasses[size]} flex items-center justify-center`}>
        {logoIcon}
      </div>
      {showText && (
        <span className={`${textSizeClasses[size]} font-bold text-gray-800 dark:text-white`}>
          {text}
        </span>
      )}
    </div>
  );

  if (!clickable) {
    return logoContent;
  }

  return (
    <Link to={to} className="inline-block">
      {logoContent}
    </Link>
  );
};

export default Logo;
