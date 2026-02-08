import React from 'react';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 py-12 mt-12 mb-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center bg-pink-50 rounded-2xl p-8 shadow-sm">
                    <div className="mb-6 md:mb-0 text-center md:text-left">
                        <h2 className="text-3xl font-bold text-[#ef5579]">Mielissimo</h2>
                        <p className="text-gray-500 mt-2 font-medium">Dulzura en cada detalle.</p>
                    </div>

                    <div className="flex space-x-8">
                        <a href="https://instagram.com" target="_blank" className="text-gray-500 hover:text-[#ef5579] transition-colors font-semibold">Instagram</a>
                        <a href="https://facebook.com" target="_blank" className="text-gray-500 hover:text-[#ef5579] transition-colors font-semibold">Facebook</a>
                        <a href="https://wa.me/" target="_blank" className="text-gray-500 hover:text-[#ef5579] transition-colors font-semibold">WhatsApp</a>
                    </div>
                </div>

                <div className="mt-10 pt-8 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-400">© {new Date().getFullYear()} Mielissimo. Todos los derechos reservados.</p>
                    <p className="mt-3 text-xs font-bold text-gray-300 uppercase tracking-widest">
                        Desarrollado por <span className="text-[#ef5579]">Marco Barzola</span>
                    </p>
                </div>
            </div>
        </footer>
    );
}
