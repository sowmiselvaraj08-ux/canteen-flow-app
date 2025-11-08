import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus } from "lucide-react";

interface MenuItemCardProps {
  item: {
    id: string;
    name: string;
    description: string | null;
    category: string;
    price: number;
    image_url: string | null;
  };
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}

export const MenuItemCard = ({ item, quantity, onAdd, onRemove }: MenuItemCardProps) => {
  const isVeg = item.category === "veg";
  
  return (
    <Card className="overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
      <div className="aspect-video bg-muted relative overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
        <Badge
          className={`absolute top-2 right-2 ${
            isVeg ? "bg-veg" : "bg-nonveg"
          } text-white border-0`}
        >
          {isVeg ? "VEG" : "NON-VEG"}
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
        )}
        <p className="text-xl font-bold text-primary mt-2">₹{item.price}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {quantity === 0 ? (
          <Button onClick={onAdd} className="w-full gradient-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        ) : (
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              size="icon"
              onClick={onRemove}
              className="h-9 w-9"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="font-semibold text-lg">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={onAdd}
              className="h-9 w-9"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
