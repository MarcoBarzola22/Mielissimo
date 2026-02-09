import React from 'react';
import { Instagram, Facebook, MessageCircle } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-[#ef5579] text-white py-12 mt-0 border-t border-pink-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    
                    {/* Logo y Slogan */}
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-black tracking-tight text-white drop-shadow-md">Mielissimo</h2>
                        <p className="text-pink-100 mt-2 font-medium opacity-90">Dulzura en cada detalle.</p>
                    </div>

                    {/* Redes Sociales con Íconos */}
                    <div className="flex space-x-6">
                        <a href="https://instagram.com" target="_blank" className="p-3 bg-white/10 rounded-full hover:bg-white hover:text-[#ef5579] transition-all transform hover:scale-110 shadow-lg backdrop-blur-sm" aria-label="Instagram">
                            <Instagram size={28} />
                        </a>
                        <a href="https://facebook.com" target="_blank" className="p-3 bg-white/10 rounded-full hover:bg-white hover:text-[#ef5579] transition-all transform hover:scale-110 shadow-lg backdrop-blur-sm" aria-label="Facebook">
                            <Facebook size={28} />
                        </a>
                        <a href="https://wa.me/" target="_blank" className="p-3 bg-white/10 rounded-full hover:bg-white hover:text-[#ef5579] transition-all transform hover:scale-110 shadow-lg backdrop-blur-sm" aria-label="WhatsApp">
                            <MessageCircle size={28} />
                        </a>
                    </div>
                </div>

                {/* Copyright y Créditos */}
                <div className="mt-12 pt-8 border-t border-white/20 text-center">
                    <p className="text-sm text-pink-100/80">© {new Date().getFullYear()} Mielissimo. Todos los derechos reservados.</p>
                    <p className="mt-2 text-xs font-bold text-white uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">
                        Desarrollado por Marco Barzola
                    </p>
                </div>
            </div>
        </footer>
    );
}