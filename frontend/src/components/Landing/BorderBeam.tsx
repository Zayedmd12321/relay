'use client';
import { motion } from "framer-motion";

export function BorderBeam({ duration = 10, delay = 0 }) {
  return (
    <div className="pointer-events-none absolute inset-0 rounded-2xl z-10 overflow-hidden">
      <motion.div
        initial={{ offsetDistance: "0%" }}
        animate={{ offsetDistance: "100%" }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
          delay,
        }}
        style={{
          offsetPath: `rect(0 auto auto 0 round 16px)`, // Follows the border rect
        }}
        className="absolute top-0 left-0 h-[1px] w-[200px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent"
      />
    </div>
  );
}