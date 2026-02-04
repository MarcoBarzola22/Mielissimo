import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import axios from "axios";

export const CategoryScroll = ({ onSelectCategory }: { onSelectCategory: (id: string | null) => void }) => {
  const [categories, setCategories] = useState<{ id: number; nombre: string }[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/categorias");
        setCategories(response.data);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleSelect = (id: string | null) => {
    setActiveTab(id);
    onSelectCategory(id);
  };

  return (
    <div className="w-full bg-white/80 backdrop-blur-md sticky top-16 z-30 border-b">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-4 p-4">
          <Button
            variant={activeTab === null ? "default" : "ghost"}
            className="rounded-full"
            onClick={() => handleSelect(null)}
          >
            Todos
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeTab === category.id.toString() ? "default" : "ghost"}
              className="rounded-full"
              onClick={() => handleSelect(category.id.toString())}
            >
              {category.nombre}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};