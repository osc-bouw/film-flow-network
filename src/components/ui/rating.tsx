
import React, { useState } from "react";
import { Star } from "lucide-react";

interface RatingProps {
  value: number;
  onChange?: (value: number) => void;
}

export const Rating = ({ value = 0, onChange }: RatingProps) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  
  const handleMouseEnter = (index: number) => {
    if (onChange) {
      setHoverValue(index);
    }
  };
  
  const handleMouseLeave = () => {
    setHoverValue(null);
  };
  
  const handleClick = (index: number) => {
    if (onChange) {
      onChange(index);
    }
  };
  
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((index) => {
        const fill = 
          hoverValue !== null
            ? index <= hoverValue
              ? "fill-primary text-primary"
              : "fill-none text-muted-foreground"
            : index <= value
              ? "fill-primary text-primary"
              : "fill-none text-muted-foreground";
              
        return (
          <Star
            key={index}
            className={`cursor-pointer h-5 w-5 ${fill} transition-colors`}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(index)}
          />
        );
      })}
    </div>
  );
};
