import React from 'react';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 py-12 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center bg-brand-bg rounded-2xl p-8">
                    <div className="mb-6 md:mb-0">
                        <h2 className="text-2xl font-bold text-brand-pink">Mielissimo</h2>
                        <p className="text-gray-500 mt-2">Dulzura en cada detalle.</p>
                    </div>

                    <div className="flex space-x-6">
                        <a href="#" className="text-gray-500 hover:text-brand-pink transition">Instagram</a>
                        <a href="#" className="text-gray-500 hover:text-brand-pink transition">Facebook</a>
                        <a href="#" className="text-gray-500 hover:text-brand-pink transition">WhatsApp</a>
                    </div>
                </div>

                <div className="mt-8 text-center text-sm text-gray-400">
                    © {new Date().getFullYear()} Mielissimo. Todos los derechos reservados.
                </div>
            </div>
        </footer>
    );
}
