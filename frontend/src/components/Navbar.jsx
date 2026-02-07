import React from 'react';
import { ShoppingBag, Menu } from 'lucide-react';
import { useStore } from '../context/store';

export default function Navbar() {
    const { cart, toggleCart, searchQuery, setSearchQuery } = useStore();
    const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);

    return (
        <nav className="fixed top-0 w-full bg-[#ef5579] shadow-md z-50 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center cursor-pointer">
                        <h1 className="text-2xl font-bold text-white tracking-tight">Mielissimo</h1>
                    </div>

                    {/* Right Icons (Search + Cart) */}
                    <div className="flex items-center space-x-3">

                        {/* Search Bar */}
                        <div className="relative hidden md:block">
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-3 pr-8 py-1 rounded-full text-sm bg-white/20 text-white placeholder-white/70 border border-transparent focus:bg-white focus:text-[#ef5579] focus:placeholder-gray-400 focus:outline-none transition-all w-32 focus:w-48"
                            />
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-white/70">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Cart Trigger */}
                        <button
                            onClick={toggleCart}
                            className="relative p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                        >
                            <ShoppingBag size={24} />
                            {totalItems > 0 && (
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-[#ef5579] transform translate-x-1/4 -translate-y-1/4 bg-white rounded-full shadow-sm">
                                    {totalItems}
                                </span>
                            )}
                        </button>

                        {/* Mobile Menu (Optional) */}
                        <button className="sm:hidden p-2 text-white hover:bg-white/20 rounded-full">
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
