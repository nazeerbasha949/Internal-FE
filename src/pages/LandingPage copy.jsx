import React from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import SignavoxLogo from '../assets/snignavox_icon.png';

const containerVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80 } },
};

const glowVariants = {
    animate: {
        scale: [1, 1.1, 1],
        opacity: [0.7, 1, 0.7],
        transition: {
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
};

const LandingPage = () => {
    return (
        <Layout>
            <motion.div
                className="relative flex flex-col items-center justify-center min-h-screen px-4 py-12 overflow-hidden"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Animated Glows */}
                <motion.div
                    className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br from-purple-700/40 via-blue-500/30 to-pink-400/30 rounded-full blur-3xl z-0"
                    variants={glowVariants}
                    animate="animate"
                />
                <motion.div
                    className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tr from-blue-700/30 via-purple-400/30 to-pink-300/20 rounded-full blur-3xl z-0"
                    variants={glowVariants}
                    animate="animate"
                />
                {/* Company Name with Logo - Sequential Animation */}
                <motion.div
                    className="flex items-center justify-center  z-10"
                    style={{ minHeight: '3.5em' }}
                >
                    <motion.span
                        className="text-5xl md:text-7xl font-extrabold bg-white bg-clip-text text-transparent font-spoof drop-shadow-lg shimmer-text"
                        initial={{ opacity: 0, x: -80 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.0, duration: 0.8, type: 'spring' }}
                        style={{ zIndex: 2, lineHeight: '1.2', display: 'inline-block' }}
                    >
                        Sign
                    </motion.span>
                    <motion.img
                        src={SignavoxLogo}
                        alt="Signavox Logo"
                        style={{
                            height: '3em',
                            width: '3em',
                            display: 'inline-block',
                            verticalAlign: 'baseline',
                            position: 'relative',
                            top: '0.6em',
                            padding: '0 !important',
                            margin: '0 !important',
                            zIndex: 3,
                        }}
                        className="inline align-middle"
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.7, type: 'spring' }}
                    />
                    <motion.span
                        className="text-5xl md:text-7xl font-extrabold bg-white bg-clip-text text-transparent font-spoof drop-shadow-lg shimmer-text"
                        initial={{ opacity: 0, x: 80 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.0, duration: 0.8, type: 'spring' }}
                        style={{ zIndex: 2, lineHeight: '1.2', display: 'inline-block' }}
                    >
                        vox
                    </motion.span>
                </motion.div>
                <motion.p
                    className="text-base md:text-xl text-purple-200 font-spoof tracking-wide max-w-2xl mb-8 z-10 text-center"
                    variants={itemVariants}
                >
                    "Solution that speaks success"
                </motion.p>
                {/* Steps to Achieve Success using SCL - Ultra Creative Glass Cards (Compact) */}
                <motion.div
                    className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 z-10"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: {},
                        visible: {
                            transition: {
                                staggerChildren: 0.18,
                                delayChildren: 2.0
                            }
                        }
                    }}
                >
                    {[
                        {
                            title: 'Step 1: Join the Community',
                            desc: 'Become a part of the vibrant SCL network and connect with like-minded individuals.',
                            color: 'from-purple-400 via-blue-400 to-pink-400',
                            border: 'border-purple-200/40',
                            icon: (
                                <svg className="w-8 h-8 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m13-3.13a4 4 0 10-8 0 4 4 0 008 0zM7 7a4 4 0 100 8 4 4 0 000-8z" /></svg>
                            ),
                            features: [
                                { icon: '🎯', text: 'Access exclusive SCL events & forums' },
                                { icon: '🤝', text: 'Network with industry professionals' },
                                { icon: '💡', text: 'Collaborate on community projects' },
                            ],
                        },
                        {
                            title: 'Step 2: Learn & Upskill',
                            desc: 'Access world-class courses, mentorship, and real-world projects to boost your skills.',
                            color: 'from-pink-400 via-purple-400 to-blue-400',
                            border: 'border-pink-200/40',
                            icon: (
                                <svg className="w-8 h-8 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m0 0H6m6 0h6" /></svg>
                            ),
                            features: [
                                { icon: '📚', text: 'Expert-led, up-to-date curriculum' },
                                { icon: '👨‍🏫', text: 'Personalized mentorship & guidance' },
                                { icon: '🛠️', text: 'Hands-on, project-based learning' },
                            ],
                        },
                        {
                            title: 'Step 3: Get Certified',
                            desc: 'Earn globally recognized certifications to validate your expertise and stand out.',
                            color: 'from-blue-400 via-pink-400 to-purple-400',
                            border: 'border-blue-200/40',
                            icon: (
                                <svg className="w-8 h-8 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 7v7m0 0l-3 3m3-3l3 3" /></svg>
                            ),
                            features: [
                                { icon: '🏆', text: 'Industry-recognized certificates' },
                                { icon: '💼', text: 'Showcase your skills to employers' },
                                { icon: '🎖️', text: 'Digital badges for your portfolio' },
                            ],
                        },
                        {
                            title: 'Step 4: Achieve Success',
                            desc: 'Leverage SCL support for internships, jobs, and continuous growth in your career.',
                            color: 'from-purple-400 via-pink-400 to-blue-400',
                            border: 'border-purple-200/40',
                            icon: (
                                <svg className="w-8 h-8 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 018 0v2m-4-4a4 4 0 100-8 4 4 0 000 8zm0 0v6" /></svg>
                            ),
                            features: [
                                { icon: '🎯', text: 'Career guidance & placement support' },
                                { icon: '💼', text: 'Internship & job opportunities' },
                                { icon: '🚀', text: 'Continuous learning & alumni network' },
                            ],
                        },
                    ].map((step, idx) => (
                        <motion.div
                            key={step.title}
                            className={`relative flex flex-col items-center bg-white/10 bg-clip-padding backdrop-blur-2xl rounded-3xl p-5 ${step.border} border-2 group overflow-visible hover:scale-[1.04] transition-transform duration-300 fancy-card`}
                            style={{
                                minHeight: '280px',
                                background: 'rgba(255,255,255,0.08)',
                                boxShadow: '0 4px 16px 0 rgba(49,17,136,0.08), 0 1.5px 8px 0 rgba(236,72,153,0.06)',
                                border: '2px solid rgba(255,255,255,0.14)',
                                borderRadius: '1.5rem',
                                overflow: 'visible',
                            }}
                            initial={{ opacity: 0, y: 40, scale: 0.97 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: 2.1 + idx * 0.18, duration: 0.7, type: 'spring' }}
                            viewport={{ once: true }}
                        >
                            {/* Glowing/blurred accent shapes */}
                            <div className={`absolute -top-6 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-gradient-to-br ${step.color} opacity-20 blur-2xl z-0`}></div>
                            <div className={`absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-br ${step.color} opacity-15 blur-2xl z-0`}></div>
                            <div className={`mb-3 flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} shadow-xl z-10 border-2 border-white/20`}>{step.icon}</div>
                            <h3 className="text-lg font-extrabold mb-2 text-white font-spoof drop-shadow-lg text-center z-10 tracking-wide">{step.title}</h3>
                            <p className="text-gray-100 text-sm font-light leading-snug text-center z-10 mb-4">{step.desc}</p>
                            <div className="space-y-3 z-10 w-full">
                                {step.features.map((feature, i) => (
                                    <div key={i} className="flex items-start space-x-3 p-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                                        <span className="text-lg flex-shrink-0 mt-0.5">{feature.icon}</span>
                                        <p className="text-xs text-purple-100/90 font-medium leading-relaxed">{feature.text}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="absolute bottom-2 right-2 w-6 h-6 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-md opacity-50 z-0"></div>
                            <div className="absolute top-2 left-2 w-5 h-5 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-md opacity-40 z-0"></div>
                        </motion.div>
                    ))}
                </motion.div>
                {/* Decorative Animated Dots */}
                <motion.div
                    className="absolute left-10 top-1/3 w-6 h-6 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full blur-md z-0"
                    animate={{ y: [0, 20, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute right-10 bottom-1/4 w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-md z-0"
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />
            </motion.div>
        </Layout>
    );
};

export default LandingPage; 