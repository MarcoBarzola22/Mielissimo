import { Button } from "./ui/button";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { useCategories } from "../hooks/useShopData";

export const CategoryScroll = ({
  onSelectCategory,
  onToggleOffers,
  selectedCategory,
  showOffers
}: {
  onSelectCategory: (id: string | null) => void;
  onToggleOffers: (show: boolean) => void;
  selectedCategory: string | null;
  showOffers: boolean;
}) => {
  const { data: categories = [] } = useCategories();

  return (
    <div className="w-full bg-white/80 backdrop-blur-md sticky top-16 z-30 border-b">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-4 p-4">
          <Button
            variant={!showOffers && selectedCategory === null ? "default" : "ghost"}
            className="rounded-full"
            onClick={() => {
              onSelectCategory(null);
              onToggleOffers(false);
            }}
          >
            Todos
          </Button>

          <Button
            variant={showOffers ? "default" : "ghost"}
            className="rounded-full"
            onClick={() => {
              onSelectCategory(null);
              onToggleOffers(true);
            }}
          >
            Ofertas
          </Button>

          {categories.map((category) => (
            <Button
              key={category.id}
              variant={!showOffers && selectedCategory === category.id.toString() ? "default" : "ghost"}
              className="rounded-full"
              onClick={() => {
                onToggleOffers(false);
                onSelectCategory(category.id.toString());
              }}
            >
              {category.emoji} {category.nombre}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};