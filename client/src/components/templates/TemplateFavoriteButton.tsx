import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface TemplateFavoriteButtonProps {
  templateId: number;
  initialFavorited?: boolean;
  onFavoriteChange?: (templateId: number, isFavorited: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function TemplateFavoriteButton({
  templateId,
  initialFavorited = false,
  onFavoriteChange,
  size = 'md'
}: TemplateFavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const { toast } = useToast();

  // Load favorite status from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteTemplates');
    if (savedFavorites) {
      try {
        const favorites = JSON.parse(savedFavorites);
        setIsFavorited(favorites.includes(templateId));
      } catch (e) {
        console.error('Error parsing favorites from localStorage:', e);
      }
    }
  }, [templateId]);

  const handleToggleFavorite = () => {
    // Get current favorites
    const savedFavorites = localStorage.getItem('favoriteTemplates');
    let favorites: number[] = [];
    
    if (savedFavorites) {
      try {
        favorites = JSON.parse(savedFavorites);
      } catch (e) {
        console.error('Error parsing favorites from localStorage:', e);
      }
    }
    
    // Update favorites
    let newFavorites: number[];
    if (isFavorited) {
      newFavorites = favorites.filter(id => id !== templateId);
      toast({
        title: "Template removed from favorites",
        description: "The template has been removed from your favorites.",
        variant: "default"
      });
    } else {
      newFavorites = [...favorites, templateId];
      toast({
        title: "Template added to favorites",
        description: "The template has been added to your favorites.",
        variant: "default"
      });
    }
    
    // Save to localStorage
    localStorage.setItem('favoriteTemplates', JSON.stringify(newFavorites));
    
    // Update state and call callback
    setIsFavorited(!isFavorited);
    if (onFavoriteChange) {
      onFavoriteChange(templateId, !isFavorited);
    }
  };

  // Calculate size parameters based on size prop
  const getButtonSize = () => {
    switch (size) {
      case 'sm':
        return {
          buttonClass: 'h-7 w-7',
          iconClass: 'h-3.5 w-3.5'
        };
      case 'lg':
        return {
          buttonClass: 'h-10 w-10',
          iconClass: 'h-5 w-5'
        };
      case 'md':
      default:
        return {
          buttonClass: 'h-8 w-8',
          iconClass: 'h-4 w-4'
        };
    }
  };

  const { buttonClass, iconClass } = getButtonSize();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`${buttonClass} rounded-full ${
        isFavorited 
          ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200 hover:text-yellow-700' 
          : 'bg-white/80 text-gray-400 hover:bg-white hover:text-yellow-500'
      }`}
      onClick={(e) => {
        e.stopPropagation(); // Prevent triggering any parent click events
        handleToggleFavorite();
      }}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Star className={iconClass} fill={isFavorited ? "currentColor" : "none"} />
    </Button>
  );
}