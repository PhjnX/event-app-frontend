import { motion } from "framer-motion";

const LoadingScreen = () => {
  return (
    <div className="flex flex-col h-screen w-full items-center justify-center bg-[#0a0a0a] z-50 fixed inset-0">
      <div className="relative flex items-center justify-center">
        {/* Vòng tròn xoay bên ngoài (Outer Ring) */}
        <motion.div
          className="w-20 h-20 border-2 border-[#B5A65F]/30 border-t-[#B5A65F] rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Vòng tròn xoay ngược bên trong (Inner Ring) */}
        <motion.div
          className="absolute w-12 h-12 border-2 border-[#B5A65F]/30 border-b-[#B5A65F] rounded-full"
          animate={{ rotate: -360 }}
          transition={{
            duration: 2, // Quay chậm hơn
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Chấm tròn ở giữa (Pulsing Dot) */}
        <motion.div
          className="absolute w-2 h-2 bg-[#B5A65F] rounded-full shadow-[0_0_15px_#B5A65F]"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Text hiển thị bên dưới */}
      <motion.div
        className="mt-8 text-[#B5A65F] font-noto font-bold tracking-[0.3em] text-sm uppercase"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        Loading
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
