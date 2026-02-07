import React from 'react';

export default function CategoryPills({ categories, activeCategory, onSelectCategory }) {
    return (
        <div className="sticky top-16 z-30 bg-[#ef5579] shadow-sm py-3 border-b border-pink-700/10">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex overflow-x-auto gap-3 scrollbar-hide pb-1">
                    {categories.map(cat => {
                        const isActive = activeCategory.id === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => onSelectCategory(cat)}
                                className={`
                                    px-5 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all duration-200 transform
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
            </div>
        </div>
    );
}
