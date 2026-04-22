import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";

interface AccordionProps {
  items: {
    question: string;
    answer: string;
  }[];
}

export const Accordion = ({ items }: AccordionProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {items.map((item, index) => (
        <div 
          key={index} 
          className="border-b border-[rgba(42,127,111,0.1)] pb-4 overflow-hidden"
        >
          <button
            onClick={() => setActiveIndex(activeIndex === index ? null : index)}
            className="w-full flex justify-between items-center text-left py-4 focus:outline-none group"
          >
            <span className={cn(
              "text-lg font-semibold transition-colors duration-300",
              activeIndex === index ? "text-[#2A7F6F]" : "text-[#2D3436] group-hover:text-[#2A7F6F]"
            )}>
              {item.question}
            </span>
            <motion.span
              animate={{ rotate: activeIndex === index ? 180 : 0 }}
              className="text-[#2A7F6F]"
            >
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </motion.span>
          </button>
          <AnimatePresence>
            {activeIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <p className="text-[#2D3436] opacity-80 leading-relaxed pb-4">
                  {item.answer}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};
