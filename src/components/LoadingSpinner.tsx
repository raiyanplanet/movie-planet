// LoadingSpinner.tsx
import React from "react";
import { motion } from "framer-motion";
import { Film } from "lucide-react";

interface LoadingSpinnerProps {
  type?: string;
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "xl",
  text = "Loading...",
}) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const iconSizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
    xl: "w-6 h-6",
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-4"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}>
      <motion.div
        className={`relative ${sizeClasses[size]}`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}>
        <motion.div
          className="absolute inset-0 border-4 border-blue-600/30 rounded-full"
          animate={{
            borderColor: [
              "rgba(37, 99, 235, 0.3)",
              "rgba(59, 130, 246, 0.6)",
              "rgba(37, 99, 235, 0.3)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute inset-2 border-2 border-blue-400 border-t-transparent rounded-full"
          animate={{ rotate: -360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}>
          <Film className={`${iconSizeClasses[size]} text-blue-400`} />
        </motion.div>
      </motion.div>
      {text && (
        <motion.p
          className="text-zinc-400 text-sm font-medium"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}>
          {text}
        </motion.p>
      )}
    </motion.div>
  );
};

export default LoadingSpinner;
