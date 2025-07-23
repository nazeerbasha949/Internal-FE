import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import Layout from '../components/Layout';
import SignavoxLogo from '../assets/snignavox_icon.png';

const steps = [
  {
    title: 'Join the Community',
    desc: 'Become a part of the vibrant SCL network and connect with like-minded individuals. Access exclusive events, forums, and collaborate on projects.',
    color: 'from-purple-400 via-blue-400 to-pink-400',
    icon: '🤝',
  },
  {
    title: 'Learn & Upskill',
    desc: 'Access world-class courses, mentorship, and real-world projects to boost your skills. Personalized guidance and hands-on learning await you.',
    color: 'from-pink-400 via-purple-400 to-blue-400',
    icon: '📚',
  },
  {
    title: 'Get Certified',
    desc: 'Earn globally recognized certifications to validate your expertise and stand out. Showcase your skills to employers with digital badges.',
    color: 'from-blue-400 via-pink-400 to-purple-400',
    icon: '🎓',
  },
  {
    title: 'Achieve Success',
    desc: 'Leverage SCL support for internships, jobs, and continuous growth in your career. Join our alumni network for lifelong learning.',
    color: 'from-purple-400 via-pink-400 to-blue-400',
    icon: '🚀',
  },
];

const heroGroupVariants = {
  center: {
    top: '50%',
    left: '50%',
    x: '-50%',
    y: '-50%',
    scale: 1,
    position: 'fixed',
    transition: { type: 'spring', duration: 1, bounce: 0.2 },
  },
  topLeft: {
    top: '1vw',
    left: '1vw',
    x: 0,
    y: 0,
    scale: 0.7,
    position: 'fixed',
    transition: { type: 'spring', duration: 1, bounce: 0.2 },
  },
};

const logoVariants = {
  hidden: { opacity: 0, scale: 0.7 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, type: 'spring' } },
};
const signVariants = {
  hidden: { opacity: 0, x: -80 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, type: 'spring' } },
};
const voxVariants = {
  hidden: { opacity: 0, x: 80 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, type: 'spring' } },
};
const subheadingVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', duration: 0.8, delay: 0.1 } },
};
const cardsContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.18, delayChildren: 0.2 },
  },
};
const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, type: 'spring' } },
};

const LandingPage = () => {
  const [stage, setStage] = useState(0); // 0: hero, 1: move, 2: cards
  const heroControls = useAnimation();
  const logoControls = useAnimation();
  const signControls = useAnimation();
  const voxControls = useAnimation();
  const subheadingControls = useAnimation();
  const cardsControls = useAnimation();

  useEffect(() => {
    heroControls.start('center');
    logoControls.start('visible');
    setTimeout(() => {
      signControls.start('visible');
      voxControls.start('visible');
    }, 500);
    setTimeout(() => {
      subheadingControls.start('visible');
    }, 1200);
    setTimeout(() => {
      setStage(1);
      heroControls.start('topLeft');
    }, 2200);
    setTimeout(() => {
      setStage(2);
      cardsControls.start('visible');
    }, 3200);
    // eslint-disable-next-line
  }, []);

  return (
    <Layout>
      {/* Animated Glows */}
      <motion.div
        className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br from-purple-700/40 via-blue-500/30 to-pink-400/30 rounded-full blur-3xl z-0"
        animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tr from-blue-700/30 via-purple-400/30 to-pink-300/20 rounded-full blur-3xl z-0"
        animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Hero Group Animation (Company Name + Subheading) */}
      <motion.div
        className="flex flex-col items-center mb-2 z-30"
        style={{ minHeight: '3.5em', zIndex: 30 }}
        variants={heroGroupVariants}
        initial="center"
        animate={heroControls}
      >
        <div className="flex items-center">
          <motion.span
            className="text-5xl md:text-7xl font-extrabold bg-white bg-clip-text text-transparent font-spoof drop-shadow-lg shimmer-text"
            style={{ zIndex: 2, lineHeight: '1.2', display: 'inline-block' }}
            variants={signVariants}
            initial="hidden"
            animate={signControls}
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
            variants={logoVariants}
            initial="hidden"
            animate={logoControls}
          />
          <motion.span
            className="text-5xl md:text-7xl font-extrabold bg-white bg-clip-text text-transparent font-spoof drop-shadow-lg shimmer-text"
            style={{ zIndex: 2, lineHeight: '1.2', display: 'inline-block' }}
            variants={voxVariants}
            initial="hidden"
            animate={voxControls}
          >
            vox
          </motion.span>
        </div>
        <motion.p
          className="text-lg md:text-2xl text-purple-200 font-spoof tracking-wide max-w-2xl z-20 text-center font-semibold mt-2"
          variants={subheadingVariants}
          initial="hidden"
          animate={subheadingControls}
          style={{ fontStyle: 'italic', fontWeight: 500 }}
        >
          "Solution that speaks success"
        </motion.p>
      </motion.div>
      {/* Steps Cards Animation */}
      <motion.div
        className="absolute left-1/2 top-1/2 w-full max-w-5xl px-2 md:px-8"
        style={{
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          display: stage < 2 ? 'none' : 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1vw',
          maxHeight: '60vh',
          alignItems: 'center',
        }}
        variants={cardsContainerVariants}
        initial="hidden"
        animate={cardsControls}
      >
        {steps.map((step, idx) => (
          <motion.div
            key={step.title}
            className={`relative flex flex-col items-center bg-white/10 bg-clip-padding backdrop-blur-2xl rounded-3xl p-4 md:p-8 ${idx % 2 === 0 ? 'border-purple-200/40' : 'border-pink-200/40'} border-2 group fancy-card`}
            style={{
              maxHeight: '240px',
              background: 'rgba(255,255,255,0.10)',
              boxShadow: '0 4px 16px 0 rgba(49,17,136,0.10), 0 1.5px 8px 0 rgba(236,72,153,0.08)',
              border: '2px solid rgba(255,255,255,0.14)',
              borderRadius: '1.5rem',
              overflow: 'visible',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
            variants={cardVariants}
          >
            {/* Glowing/blurred accent shapes */}
            <div className={`absolute -top-6 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-gradient-to-br ${step.color} opacity-20 blur-2xl z-0`}></div>
            <div className={`absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-br ${step.color} opacity-15 blur-2xl z-0`}></div>
            <div className={`mb-3 flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} shadow-xl z-10 border-2 border-white/20 text-4xl md:text-5xl`}>
              {step.icon}
            </div>
            <h3 className="text-xl md:text-2xl font-extrabold mb-2 text-white font-spoof drop-shadow-lg text-center z-10 tracking-wide">
              {step.title}
            </h3>
            <p className="text-purple-100 text-sm md:text-base font-light leading-snug text-center z-10 mb-2" style={{maxWidth:'90%'}}>
              {step.desc}
            </p>
            <div className="absolute bottom-2 right-2 w-6 h-6 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-md opacity-50 z-0"></div>
            <div className="absolute top-2 left-2 w-5 h-5 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-md opacity-40 z-0"></div>
          </motion.div>
        ))}
      </motion.div>
    </Layout>
  );
};

export default LandingPage; 