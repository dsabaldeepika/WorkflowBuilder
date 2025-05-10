import React, { useMemo } from "react";
import { apps } from "@/data/apps";
import { App } from "@/types/workflow";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface SearchableAppListProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
  onSelectApp: (app: App) => void;
}

export function SearchableAppList({
  searchQuery,
  onSearchChange,
  onClearSearch,
  onSelectApp
}: SearchableAppListProps) {
  // Filter apps based on search query
  const filteredApps = useMemo(() => {
    if (!searchQuery.trim()) return apps;
    
    const query = searchQuery.toLowerCase();
    return apps.filter(app => 
      app.label.toLowerCase().includes(query) || 
      app.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <>
      <div className="sticky top-0 bg-white p-4 border-b border-gray-200 z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search apps..."
            value={searchQuery}
            onChange={onSearchChange}
            className="w-full pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 h-8 w-8"
              onClick={onClearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredApps.map((app) => (
          <button
            key={app.id}
            className="bg-white border border-gray-200 rounded-md p-4 hover:bg-gray-50 flex items-center transition duration-150 focus:outline-none focus:ring-2 focus:ring-primary w-full"
            onClick={() => onSelectApp(app)}
          >
            <div className={`flex-shrink-0 w-10 h-10 bg-${app.iconBg}-100 text-${app.iconColor}-600 rounded-md flex items-center justify-center mr-3`}>
              <span className="flex items-center justify-center">
                {React.createElement(app.icon, { size: 20 })}
              </span>
            </div>
            <div className="text-left">
              <h4 className="text-sm font-medium text-gray-800">{app.label}</h4>
              <p className="text-xs text-gray-500">{app.description}</p>
            </div>
          </button>
        ))}
        
        {filteredApps.length === 0 && (
          <div className="col-span-3 py-8 text-center text-gray-500">
            No apps found matching "{searchQuery}"
          </div>
        )}
      </div>
    </>
  );
}
