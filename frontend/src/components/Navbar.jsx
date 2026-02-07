import React from 'react';
import { ShoppingBag, Menu } from 'lucide-react';
import { useStore } from '../context/store';

export default function Navbar() {
    const { cart, toggleCart } = useStore();
    const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);

    return (
        <nav className="fixed top-0 w-full bg-[#ef5579] shadow-md z-50 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center cursor-pointer">
                        <h1 className="text-2xl font-bold text-white tracking-tight">Mielissimo</h1>
                    </div>

                    {/* Right Icons */}
                    <div className="flex items-center space-x-4">
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
