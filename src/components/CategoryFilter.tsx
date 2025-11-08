import { Button } from "@/components/ui/button";
import { Leaf, Drumstick, UtensilsCrossed, Sandwich, Coffee, Cookie } from "lucide-react";

const categories = [
  { id: "all", label: "All", icon: UtensilsCrossed },
  { id: "veg", label: "Veg", icon: Leaf },
  { id: "non_veg", label: "Non-Veg", icon: Drumstick },
  { id: "meals", label: "Meals", icon: UtensilsCrossed },
  { id: "starters", label: "Starters", icon: Sandwich },
  { id: "beverages", label: "Beverages", icon: Coffee },
  { id: "snacks", label: "Snacks", icon: Cookie },
];

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categories.map((category) => {
        const Icon = category.icon;
        return (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(category.id)}
            className="gap-2"
          >
            <Icon className="w-4 h-4" />
            {category.label}
          </Button>
        );
      })}
    </div>
  );
};
