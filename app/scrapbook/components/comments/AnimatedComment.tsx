import { motion, AnimatePresence } from "framer-motion";
import { Poof } from "../animations/Poof";

interface AnimatedCommentProps {
  children: React.ReactNode;
  isDeleting?: boolean;
  isNew?: boolean;
}

export function AnimatedComment({ children, isDeleting, isNew }: AnimatedCommentProps) {
  return (
    <AnimatePresence mode="popLayout">
      {!isDeleting ? (
        <motion.div
          layout
          initial={isNew ? { opacity: 0, y: 0, scale: 0.95 } : false}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{
            opacity: 0,
            scale: 0.8,
            transition: { duration: 0.1 },
          }}
          transition={{ duration: 0.1 }}
          className="relative"
        >
          {children}
        </motion.div>
      ) : (
        <motion.div
          className="relative"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
        >
          <Poof />
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
} 