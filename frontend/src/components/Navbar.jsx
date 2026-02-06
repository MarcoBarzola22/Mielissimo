import React from 'react';
import { ShoppingBag, Menu } from 'lucide-react';
import { useStore } from '../context/store';

export default function Navbar() {
    const { cart, toggleCart } = useStore();
    const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);

    return (
        <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md shadow-sm z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center cursor-pointer">
                        <h1 className="text-2xl font-bold text-[#ef5579] tracking-tight">Mielissimo</h1>
                    </div>

                    {/* Right Icons */}
                    <div className="flex items-center space-x-4">
                        {/* Cart Trigger */}
                        <button
                            onClick={toggleCart}
                            className="relative p-2 text-gray-600 hover:text-[#ef5579] transition-colors"
                        >
                            <ShoppingBag size={24} />
                            {totalItems > 0 && (
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-[#ef5579] rounded-full">
                                    {totalItems}
                                </span>
                            )}
                        </button>

                        {/* Mobile Menu (Optional) */}
                        <button className="sm:hidden p-2 text-gray-600">
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
