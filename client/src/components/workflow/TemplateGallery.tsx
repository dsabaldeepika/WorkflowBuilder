import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Clock,
  Star,
  Zap,
  X,
  FileText,
  ShoppingCart,
  Mail,
  Bell,
  Calendar,
  Database,
  ArrowRight,
  UploadCloud,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Backend-driven WorkflowTemplate interface
interface WorkflowTemplate {
  id: string;
  name: string;
  description: string[];
  category: string[];
  difficulty?: string;
  estimatedTime?: string;
  rating?: number;
  usageCount?: number;
  icon1?: string; // backend icon name or url
  icon2?: string;
  featured?: boolean;
}

// Icon mapping utility (expand as needed)
const iconMap: Record<string, React.ComponentType<any>> = {
  database: Database,
  mail: Mail,
  bell: Bell,
  calendar: Calendar,
  filetext: FileText,
  shoppingcart: ShoppingCart,
  uploadcloud: UploadCloud,
  zap: Zap,
  star: Star,
  // ...add more as needed
};

function getIconComponent(iconName?: string) {
  if (!iconName) return Database;
  const key = iconName.replace(/[-_ ]/g, "").toLowerCase();
  return iconMap[key] || Database;
}

// Fetch templates from backend
function useTemplates() {
  return useQuery<WorkflowTemplate[]>({
    queryKey: ["/api/workflow/templates"],
    queryFn: async () => {
      const res = await fetch("/api/workflow/templates");
      if (!res.ok) throw new Error("Failed to fetch templates");
      return res.json();
    },
  });
}

interface TemplateCardProps {
  template: WorkflowTemplate;
  onSelect: (template: WorkflowTemplate) => void;
}

function TemplateCard({ template, onSelect }: TemplateCardProps) {
  const Icon1 = getIconComponent(template.icon1);
  const Icon2 = getIconComponent(template.icon2);
  // Handle description as string or string[]
  const description = Array.isArray(template.description)
    ? template.description.join(" ")
    : template.description;
  // Debug: log template data and icon resolution
  console.log("[TemplateCard] Rendering template:", template);
  console.log("[TemplateCard] Icon1:", template.icon1, "=>", Icon1.name);
  console.log("[TemplateCard] Icon2:", template.icon2, "=>", Icon2.name);
  return (
    <div
      className="border rounded-md p-4 hover:border-primary hover:shadow-sm transition-all cursor-pointer bg-white"
      onClick={() => {
        console.log("[TemplateCard] Template selected:", template);
        onSelect(template);
      }}
    >
      {template.featured && (
        <Badge
          variant="secondary"
          className="mb-2 bg-blue-100 text-blue-800 hover:bg-blue-200"
        >
          <Star className="h-3 w-3 mr-1 fill-current" />
          Featured
        </Badge>
      )}
      <div className="flex items-center mb-3">
        <div className="w-8 h-8 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center mr-2">
          <Icon1 size={16} />
        </div>
        <div className="w-8 h-8 rounded-md bg-green-100 text-green-600 flex items-center justify-center">
          <Icon2 size={16} />
        </div>
        <div className="text-xs text-gray-500 flex items-center mx-2">
          <ArrowRight size={12} />
        </div>
      </div>
      <h3 className="font-medium text-sm mb-1">{template.name}</h3>
      <p className="text-xs text-gray-500 mb-3">{description}</p>
      <div className="flex justify-between text-xs text-gray-500">
        {template.estimatedTime && (
          <span className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {template.estimatedTime}
          </span>
        )}
        {template.rating && (
          <span className="flex items-center">
            <Star className="h-3 w-3 mr-1 fill-amber-400 text-amber-400" />
            {template.rating}
          </span>
        )}
        {typeof template.usageCount === "number" && (
          <span className="flex items-center">
            <Zap className="h-3 w-3 mr-1" />
            {template.usageCount.toLocaleString()} uses
          </span>
        )}
      </div>
    </div>
  );
}

interface TemplateGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: WorkflowTemplate) => void;
}

export function TemplateGallery({
  isOpen,
  onClose,
  onSelectTemplate,
}: TemplateGalleryProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: templates, isLoading, error } = useTemplates();

  // Debug: log all templates loaded from backend
  console.log("[TemplateGallery] Loaded templates:", templates);
  // Debug: log current filter state
  console.log(
    "[TemplateGallery] Active category:",
    activeCategory,
    "Search query:",
    searchQuery
  );

  // Extract categories from backend templates
  const categories = React.useMemo(() => {
    if (!templates) return ["All"];
    const cats = new Set<string>();
    templates.forEach((t) => t.category?.forEach((c) => cats.add(c)));
    return ["All", ...Array.from(cats)];
  }, [templates]);

  const filteredTemplates = React.useMemo(() => {
    if (!templates) return [];
    return templates.filter((template) => {
      if (
        activeCategory !== "All" &&
        !template.category?.includes(activeCategory)
      ) {
        return false;
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const desc = (template.description ?? "").toString().toLowerCase();
        return (
          template.name.toLowerCase().includes(query) || desc.includes(query)
        );
      }
      return true;
    });
  }, [templates, activeCategory, searchQuery]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Workflow Templates</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={18} />
            </Button>
          </div>
          <DialogDescription>
            Choose a pre-built workflow template to get started quickly.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-4 my-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search templates..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <Tabs
          defaultValue="All"
          className="flex-1 flex flex-col"
          onValueChange={setActiveCategory}
        >
          <TabsList className="grid grid-cols-8">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollArea className="flex-1 mt-4">
            <div className="grid grid-cols-3 gap-4 p-1">
              {isLoading && (
                <div className="col-span-3 py-8 text-center text-gray-500">
                  Loading templates...
                </div>
              )}
              {error && (
                <div className="col-span-3 py-8 text-center text-red-500">
                  Failed to load templates
                </div>
              )}
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={onSelectTemplate}
                />
              ))}
              {filteredTemplates.length === 0 && !isLoading && !error && (
                <div className="col-span-3 py-8 text-center text-gray-500">
                  <p>No templates found for your search criteria.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </Tabs>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
