import { forwardRef } from "react";
import { motion } from "framer-motion";
import { useNavigationType } from "react-router-dom";

const PageTransition = forwardRef(({ children, ...props }, ref) => {
  const navType = useNavigationType();
  // PUSH (forward) slides in from the right; POP (back) slides in from the left.
  const x = navType === "POP" ? "-30%" : "30%";
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
});

PageTransition.displayName = "PageTransition";
export default PageTransition;