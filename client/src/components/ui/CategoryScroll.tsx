import { categories } from '@/data/products';

interface CategoryScrollProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export function CategoryScroll({ selectedCategory, onSelectCategory }: CategoryScrollProps) {
  return (
    <section className="py-4">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 px-4 pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap text-sm font-medium transition-all shrink-0 ${
                selectedCategory === category.id
                  ? 'bg-primary text-primary-foreground shadow-soft'
                  : 'bg-card text-foreground hover:bg-secondary shadow-card'
              }`}
            >
              <span className="text-base">{category.emoji}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
