import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

/**
 * Universal Spring & Easing Tokens (01-animation / motion-primitives standard)
 */
export const SPRINGS = {
  tactile: { type: "spring", stiffness: 500, damping: 30, mass: 0.6 },
  bounce: { type: "spring", stiffness: 300, damping: 18, mass: 0.8 },
  layout: { type: "spring", stiffness: 360, damping: 32, mass: 0.6 },
  gentle: { type: "spring", stiffness: 180, damping: 24, mass: 1.0 },
  snappy: { type: "spring", stiffness: 600, damping: 35, mass: 0.5 },
};

export const EASINGS = {
  expoOut: [0.16, 1, 0.3, 1],
  smooth: [0.25, 0.1, 0.25, 1],
};

/**
 * 1. TextEffect (motion-primitives pattern by ibelick)
 * Staggered word or character reveal with blur and spring motion
 */
export function TextEffect({
  children,
  per = "word",
  as = "div",
  className = "",
  delay = 0,
}) {
  if (typeof children !== "string") {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const elements = per === "char" ? Array.from(children) : children.split(" ");
  const MotionComponent = motion[as] || motion.div;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: per === "char" ? 0.02 : 0.06,
        delayChildren: delay,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10, filter: "blur(6px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.5, ease: EASINGS.expoOut },
    },
  };

  return (
    <MotionComponent
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {elements.map((el, i) => (
        <motion.span
          key={i}
          variants={itemVariants}
          className="inline-block whitespace-pre"
        >
          {el}{per === "word" ? " " : ""}
        </motion.span>
      ))}
    </MotionComponent>
  );
}

/**
 * 2. AnimatedGroup (motion-primitives pattern)
 * Staggers direct children with smooth vertical slide and fade
 */
export function AnimatedGroup({
  children,
  className = "",
  stagger = 0.05,
  delay = 0.02,
  as = "div",
}) {
  const MotionTag = motion[as] || motion.div;

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 14, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 340,
        damping: 26,
      },
    },
  };

  const childArray = React.Children.toArray(children);

  return (
    <MotionTag
      variants={container}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {childArray.map((child, index) => (
        <motion.div key={index} variants={item}>
          {child}
        </motion.div>
      ))}
    </MotionTag>
  );
}

/**
 * 3. TiltCard (motion-primitives pattern)
 * 3D spring-physics mouse tracking with specular sheen on Neumorphic surfaces
 */
export function TiltCard({
  children,
  className = "",
  maxTilt = 7,
  scale = 1.015,
  ...props
}) {
  const cardRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setCoords({ x: rotateY, y: rotateX });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: isHovered ? coords.y : 0,
        rotateY: isHovered ? coords.x : 0,
        scale: isHovered ? scale : 1,
      }}
      transition={SPRINGS.tactile}
      style={{
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * 4. MagneticTrigger / MotionButton
 * Tactile spring press feedback with subtle scale depression
 */
export function MotionButton({
  children,
  className = "",
  onClick,
  disabled,
  type = "button",
  ...props
}) {
  return (
    <motion.button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.025, y: -1 } : undefined}
      whileTap={!disabled ? { scale: 0.96, y: 1 } : undefined}
      transition={SPRINGS.tactile}
      {...props}
    >
      {children}
    </motion.button>
  );
}

/**
 * 5. PageTransition / TransitionPanel (motion-primitives pattern)
 * Seamlessly morphs views when navigating tabs with smooth slide & fade
 */
export function TransitionPanel({ children, activeKey, className = "" }) {
  return (
    <div className={`transition-panel-root ${className}`}>
      <motion.div
        key={activeKey}
        initial={{ opacity: 0.3, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.22,
          ease: EASINGS.expoOut,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/**
 * 6. PopoverSpring
 * Spring-based popover or modal container
 */
export function PopoverSpring({ children, isOpen, className = "" }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 6 }}
          transition={SPRINGS.bounce}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
