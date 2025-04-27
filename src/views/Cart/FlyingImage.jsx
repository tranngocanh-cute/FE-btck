// FlyingImage.jsx
import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';

export default function FlyingImage({ src, startRect, endRect, onComplete }) {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      top: endRect.top,
      left: endRect.left,
      width: endRect.width,
      height: endRect.height,
      opacity: 0,
      transition: { duration: 0.6, ease: 'easeInOut' }
    }).then(onComplete);
  }, []);

  return (
    <motion.img
      src={src}
      initial={{
        position: 'fixed',
        top: startRect.top,
        left: startRect.left,
        width: startRect.width,
        height: startRect.height,
        zIndex: 1300
      }}
      animate={controls}
    />
  );
}
