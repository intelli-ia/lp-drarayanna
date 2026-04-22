import React from 'react';
import { cn } from "@/lib/utils";

interface InteractiveButtonProps {
  text: string;
  href?: string;
  className?: string;
  variant?: 'primary' | 'secondary';
  target?: string;
  onClick?: () => void;
}

export const InteractiveButton = ({ 
  text, 
  href, 
  className, 
  variant = 'primary', 
  target,
  onClick 
}: InteractiveButtonProps) => {
  const content = (
    <>
      <span className="translate-y-0 group-hover:-translate-y-12 group-hover:opacity-0 transition-all duration-300 inline-block">
        {text}
      </span>
      <div className={cn(
        "flex gap-2 text-white items-center absolute left-0 top-0 h-full w-full justify-center translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 rounded-full group-hover:rounded-none bg-[#1E5C50]"
      )}>
        <span>{text}</span>
      </div>
    </>
  );

  const baseClasses = cn(
    "group relative cursor-pointer px-10 py-5 border rounded-full overflow-hidden text-center font-semibold transition-all duration-300 inline-block shadow-sm hover:shadow-md",
    variant === 'primary' ? "bg-[#2A7F6F] text-white border-[#2A7F6F]" : "bg-transparent text-[#2A7F6F] border-[#2A7F6F] hover:bg-[#2A7F6F]/5",
    className
  );

  if (href) {
    return (
      <a href={href} target={target} className={baseClasses} onClick={onClick}>
        {content}
      </a>
    );
  }

  return (
    <button className={baseClasses} onClick={onClick}>
      {content}
    </button>
  );
};
