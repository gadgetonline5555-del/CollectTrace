import { forwardRef } from "react";
import { motion } from "framer-motion";

const PageTransition = forwardRef(({ children, ...props }, ref) => (
  <motion.div
    ref={ref}
    initial={{ opacity: 0, x: "30%" }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.2, ease: "easeOut" }}
    {...props}
  >
    {children}
  </motion.div>
));

PageTransition.displayName = "PageTransition";
export default PageTransition;