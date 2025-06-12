"use client";

import { motion } from "framer-motion";

const bounceVariants = [
  {
    animate: {
      y: [0, -7, 0],
      transition: {
        duration: 0.4,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 0,
        repeatDelay: 0.8,
      },
    },
  },
  {
    animate: {
      y: [0, -7, 0],
      transition: {
        duration: 0.4,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 0.15,
        repeatDelay: 0.8,
      },
    },
  },
  {
    animate: {
      y: [0, -7, 0],
      transition: {
        duration: 0.4,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 0.3,
        repeatDelay: 0.8,
      },
    },
  },
];

export default function MessageLoading() {
  return (
    <div className="flex justify-start">
      <div className="bg-foreground/10 text-foreground p-3 rounded-lg">
        <div className="flex space-x-1">
          {bounceVariants.map((variant, index) => (
            <motion.div
              key={index}
              className="w-2 h-2 bg-foreground/60 rounded-full"
              variants={variant}
              animate="animate"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
