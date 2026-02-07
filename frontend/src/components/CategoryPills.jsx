import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CategoryPills({ categories, activeCategory, onSelectCategory }) {
    const scrollContainerRef = useRef(null);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = 200;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="sticky top-16 z-30 bg-[#ef5579] shadow-sm py-3 border-b border-pink-700/10">
            <div className="max-w-7xl mx-auto px-4 relative flex items-center group">

                {/* Left Arrow */}
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 z-10 p-1 bg-[#ef5579]/80 backdrop-blur rounded-full text-white hover:bg-white hover:text-[#ef5579] transition-all hidden md:block opacity-0 group-hover:opacity-100 shadow-md"
                >
                    <ChevronLeft size={20} />
                </button>

                <div
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto gap-3 scrollbar-hide pb-1 w-full px-2"
                >
                    {categories.map(cat => {
                        const isActive = activeCategory.id === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => onSelectCategory(cat)}
                                className={`
                                    px-5 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all duration-200 transform flex-shrink-0
                                    ${isActive
                                        ? 'bg-white text-[#ef5579] shadow-lg shadow-pink-900/20 scale-105'
                                        : 'bg-transparent text-white border border-white/30 hover:bg-white/10'
                                    }
                                `}
                            >
                                {cat.nombre}
                            </button>
                        )
                    })}
                </div>

                {/* Right Arrow */}
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 z-10 p-1 bg-[#ef5579]/80 backdrop-blur rounded-full text-white hover:bg-white hover:text-[#ef5579] transition-all hidden md:block opacity-0 group-hover:opacity-100 shadow-md"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}
