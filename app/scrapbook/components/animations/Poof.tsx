import { motion } from "framer-motion";

export function Poof() {
  return (
    <motion.div
      className="absolute inset-0 z-50 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div 
        className="w-full h-full"
        style={{
          background: "url(/images/poof.png) no-repeat 0 0",
          animation: "poof 500ms steps(5) forwards",
          backgroundSize: "128px 640px",
          height: "128px",
          width: "128px",
          position: "absolute",
          left: "25%",
          top: "50%",
          transform: "translate(-50%, -50%)"
        }}
      />
    </motion.div>
  );
} 