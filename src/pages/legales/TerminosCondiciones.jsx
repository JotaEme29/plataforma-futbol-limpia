import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaFileContract } from 'react-icons/fa';

const TerminosCondiciones = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-6 md:p-12">
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
                <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors">
                    <FaArrowLeft className="mr-2" /> Volver al Inicio
                </Link>

                <div className="flex items-center gap-4 mb-8 border-b dark:border-gray-700 pb-6">
                    <FaFileContract className="text-4xl text-blue-600" />
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Términos y Condiciones</h1>
                </div>

                <div className="space-y-6 text-lg leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">1. Aceptación de los Términos</h2>
                        <p>
                            Al registrarte y utilizar <strong>Vision Coach</strong>, aceptas estos términos y condiciones en su totalidad. Si no estás de acuerdo con alguna parte, no debes utilizar nuestra plataforma.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">2. Descripción del Servicio</h2>
                        <p>
                            Vision Coach es una herramienta de gestión deportiva "SaaS" (Software como Servicio) que permite a clubes y entrenadores gestionar plantillas, registrar partidos en vivo y analizar estadísticas.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">3. Cuentas y Seguridad</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Eres responsable de mantener la confidencialidad de tu contraseña.</li>
                            <li>Eres responsable de toda la actividad que ocurra bajo tu cuenta.</li>
                            <li>Debes notificarnos inmediatamente sobre cualquier uso no autorizado de tu cuenta.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">4. Planes y Pagos (Futuro)</h2>
                        <p>
                            Actualmente, Vision Coach se ofrece en modalidad <strong>Gratuita (Beta/MVP)</strong> con funcionalidades limitadas. Nos reservamos el derecho de introducir planes de pago en el futuro, notificando a los usuarios con antelación. Las funcionalidades básicas actuales pueden pasar a ser parte de un plan de pago.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">5. Uso Aceptable</h2>
                        <p>Queda prohibido:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Usar la plataforma para fines ilegales.</li>
                            <li>Intentar acceder a datos de otros clubes sin autorización.</li>
                            <li>Introducir virus o código malicioso.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">6. Limitación de Responsabilidad</h2>
                        <p>
                            Vision Coach se proporciona "tal cual". No garantizamos que el servicio sea ininterrumpido o libre de errores. No nos hacemos responsables de pérdidas de datos, aunque realizamos copias de seguridad periódicas.
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

export default TerminosCondiciones;
