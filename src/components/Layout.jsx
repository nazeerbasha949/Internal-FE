import { motion } from 'framer-motion';

const Layout = ({ children }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            //   className="min-h-screen bg-[#0A081E] bg-gradient-[90deg] from-[#311188] to-[#0A081E] text-white"
            className="h-full  bg-gradient-to-b from-[#311188] to-[#0A081E]  text-white"

        >
            {children}
        </motion.div>
    );
};

export default Layout;