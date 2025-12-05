import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaShieldAlt } from 'react-icons/fa';

const PoliticaPrivacidad = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-6 md:p-12">
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
                <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors">
                    <FaArrowLeft className="mr-2" /> Volver al Inicio
                </Link>

                <div className="flex items-center gap-4 mb-8 border-b dark:border-gray-700 pb-6">
                    <FaShieldAlt className="text-4xl text-green-600" />
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Política de Privacidad</h1>
                </div>

                <div className="space-y-6 text-lg leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">1. Introducción</h2>
                        <p>
                            En <strong>Vision Coach</strong>, nos tomamos muy en serio la privacidad de tus datos. Esta política explica cómo recopilamos, usamos y protegemos la información personal y deportiva de los usuarios de nuestra plataforma.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">2. Información que recopilamos</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Datos de Registro:</strong> Nombre, correo electrónico y contraseña encriptada.</li>
                            <li><strong>Datos del Club:</strong> Nombre del club, categorías y escudos.</li>
                            <li><strong>Datos Deportivos:</strong> Nombres de jugadores, estadísticas de partidos, alineaciones y evaluaciones de rendimiento.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">3. Uso de la Información</h2>
                        <p>Utilizamos tus datos exclusivamente para:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Proporcionar el servicio de gestión deportiva y estadísticas "En Vivo".</li>
                            <li>Generar reportes y análisis de rendimiento para tu club.</li>
                            <li>Mejorar la funcionalidad de la plataforma.</li>
                        </ul>
                        <p className="mt-2 font-semibold">Nunca vendemos tus datos a terceros.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">4. Seguridad de los Datos</h2>
                        <p>
                            Tus datos están almacenados en servidores seguros (Firebase/Google Cloud) con estándares de industria. Implementamos autenticación robusta y reglas de seguridad para asegurar que solo los miembros autorizados de tu club puedan acceder a la información sensible.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">5. Menores de Edad</h2>
                        <p>
                            La plataforma gestiona datos de jugadores que pueden ser menores de edad. Estos datos son introducidos bajo la responsabilidad del Club/Entrenador. Vision Coach actúa como encargado del tratamiento de datos, siendo el Club el responsable de obtener los consentimientos necesarios de los tutores legales.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">6. Contacto</h2>
                        <p>
                            Si tienes dudas sobre esta política, puedes contactarnos en: <a href="mailto:legal@visioncoach.com" className="text-blue-600 hover:underline">legal@visioncoach.com</a>
                        </p>
                    </section>

                    <div className="mt-8 text-sm text-gray-500 border-t dark:border-gray-700 pt-4">
                        Última actualización: {new Date().toLocaleDateString()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PoliticaPrivacidad;
