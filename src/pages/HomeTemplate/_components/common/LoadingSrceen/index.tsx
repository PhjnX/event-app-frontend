import { motion } from "framer-motion";

const LoadingScreen = () => {
  return (
    <div className="flex flex-col h-screen w-full items-center justify-center bg-[#0a0a0a] z-50 fixed inset-0">
      <div className="relative flex items-center justify-center">
        <motion.div
          className="w-20 h-20 border-2 border-[#D8C97B]/30 border-t-[#D8C97B] rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <motion.div
          className="absolute w-12 h-12 border-2 border-[#D8C97B]/30 border-b-[#D8C97B] rounded-full"
          animate={{ rotate: -360 }}
          transition={{
            duration: 2, 
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <motion.div
          className="absolute w-2 h-2 bg-[#D8C97B] rounded-full shadow-[0_0_15px_#D8C97B]"
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

      <motion.div
        className="mt-8 text-[#D8C97B] font-noto font-bold tracking-[0.3em] text-sm uppercase"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        Loading
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
