import React, { useState } from 'react';
import { FaCommentDots, FaTimes, FaPaperPlane } from 'react-icons/fa';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';

const FeedbackWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const { currentUser } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setSending(true);
        try {
            await addDoc(collection(db, 'feedback'), {
                userId: currentUser?.uid || 'anonymous',
                userEmail: currentUser?.email || 'anonymous',
                message: message,
                createdAt: serverTimestamp(),
                url: window.location.href,
                userAgent: navigator.userAgent
            });
            alert('¡Gracias por tu feedback! Lo tendremos en cuenta.');
            setMessage('');
            setIsOpen(false);
        } catch (error) {
            console.error('Error enviando feedback:', error);
            alert('Hubo un error al enviar tu mensaje. Por favor intenta de nuevo.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-110 flex items-center gap-2"
                    title="Enviar Feedback o Reportar Problema"
                >
                    <FaCommentDots className="text-xl" />
                    <span className="hidden md:inline font-bold">¿Ayuda?</span>
                </button>
            )}

            {isOpen && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-80 md:w-96 border border-gray-200 dark:border-gray-700 animate-fade-in-up">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <FaCommentDots className="text-blue-500" />
                            Tu opinión nos importa
                        </h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <textarea
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none h-32 text-sm"
                            placeholder="¿Encontraste un error? ¿Tienes una sugerencia? Cuéntanos..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                        ></textarea>

                        <button
                            type="submit"
                            disabled={sending}
                            className={`w-full mt-4 py-2 px-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${sending ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg'
                                }`}
                        >
                            {sending ? 'Enviando...' : (
                                <>
                                    <FaPaperPlane /> Enviar Feedback
                                </>
                            )}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default FeedbackWidget;
