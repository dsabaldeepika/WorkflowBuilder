import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TemplateFavoriteButtonProps {
  templateId: number;
  initialFavorited?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  onFavoriteChange?: (templateId: number, isFavorited: boolean) => void;
}

const LOCAL_STORAGE_KEY = 'favoriteTemplates';

export function TemplateFavoriteButton({
  templateId,
  initialFavorited = false,
  variant = 'ghost',
  size = 'icon',
  onFavoriteChange,
}: TemplateFavoriteButtonProps) {
  const { toast } = useToast();
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  
  // Load favorite state from localStorage on component mount and when initialFavorited changes
  useEffect(() => {
    const savedFavorites = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedFavorites) {
      const favorites = JSON.parse(savedFavorites);
      setIsFavorited(favorites.includes(templateId));
    } else {
      setIsFavorited(initialFavorited);
    }
  }, [templateId, initialFavorited]);
  
  const toggleFavorite = () => {
    // Toggle the favorite state
    const newFavoritedState = !isFavorited;
    setIsFavorited(newFavoritedState);
    
    // Update localStorage
    const savedFavorites = localStorage.getItem(LOCAL_STORAGE_KEY);
    let favorites: number[] = [];
    
    if (savedFavorites) {
      favorites = JSON.parse(savedFavorites);
    }
    
    if (newFavoritedState) {
      // Add to favorites if not already in there
      if (!favorites.includes(templateId)) {
        favorites.push(templateId);
      }
      
      toast({
        title: "Added to favorites",
        description: "Template has been added to your favorites.",
      });
    } else {
      // Remove from favorites
      favorites = favorites.filter(id => id !== templateId);
      
      toast({
        title: "Removed from favorites",
        description: "Template has been removed from your favorites.",
      });
    }
    
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(favorites));
    
    // Notify parent component about the change
    if (onFavoriteChange) {
      onFavoriteChange(templateId, newFavoritedState);
    }
    
    // Here you could also make an API call to sync with the server
    // This is just a client-side implementation for now
  };
  
  return (
    <Button
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite();
      }}
      variant={variant}
      size={size}
      className={`${isFavorited ? 'text-yellow-500 hover:text-yellow-600' : 'text-muted-foreground hover:text-foreground'}`}
      title={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Star className="h-4 w-4" fill={isFavorited ? "currentColor" : "none"} />
    </Button>
  );
}