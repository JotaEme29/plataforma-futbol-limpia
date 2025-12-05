import React, { useState, useEffect } from 'react';
import { FaTimes, FaArrowRight, FaCheck } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const steps = [
    {
        target: 'body', // General welcome
        title: '¡Bienvenido a Vision Coach!',
        content: 'Te ayudaremos a configurar tu club en 3 sencillos pasos. ¿Listo para empezar?',
        position: 'center'
    },
    {
        target: '.tour-equipos', // You need to add this class to the Teams button/section
        title: '1. Crea tu Equipo',
        content: 'Aquí podrás registrar tus equipos (Cadete, Juvenil...). Es el primer paso para todo.',
        position: 'bottom'
    },
    {
        target: '.tour-plantilla', // Add this class to Squad button
        title: '2. Añade Jugadores',
        content: 'Después, ve a "Plantilla" para añadir a tus jugadores o invitarles por email.',
        position: 'bottom'
    },
    {
        target: '.tour-envivo', // Add this class to Live Match button
        title: '3. ¡Partido en Vivo!',
        content: 'La magia ocurre aquí. Inicia un partido y registra goles y estadísticas en tiempo real.',
        position: 'bottom'
    }
];

const OnboardingTour = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already seen the tour
        const hasSeenTour = localStorage.getItem('vision_coach_tour_completed');
        if (!hasSeenTour) {
            setIsVisible(true);
        }
    }, []);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = () => {
        setIsVisible(false);
        localStorage.setItem('vision_coach_tour_completed', 'true');
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 relative border-2 border-blue-500"
                >
                    <button
                        onClick={handleComplete}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                        <FaTimes />
                    </button>

                    <div className="mb-6">
                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                            Paso {currentStep + 1} de {steps.length}
                        </span>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-4 mb-2">
                            {steps[currentStep].title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                            {steps[currentStep].content}
                        </p>
                    </div>

                    <div className="flex justify-between items-center mt-8">
                        <button
                            onClick={handleComplete}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 font-semibold text-sm"
                        >
                            Saltar tour
                        </button>
                        <button
                            onClick={handleNext}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all transform hover:translate-x-1"
                        >
                            {currentStep === steps.length - 1 ? '¡Empezar!' : 'Siguiente'}
                            {currentStep === steps.length - 1 ? <FaCheck /> : <FaArrowRight />}
                        </button>
                    </div>

                    {/* Progress Dots */}
                    <div className="flex justify-center gap-2 mt-6">
                        {steps.map((_, index) => (
                            <div
                                key={index}
                                className={`w-2 h-2 rounded-full transition-colors ${index === currentStep ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                            />
                        ))}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default OnboardingTour;
