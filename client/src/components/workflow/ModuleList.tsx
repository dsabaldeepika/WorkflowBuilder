import React from "react";
import { Module } from "@/types/workflow";

interface ModuleListProps {
  modules: Module[];
  onSelectModule: (module: Module) => void;
}

export function ModuleList({ modules, onSelectModule }: ModuleListProps) {
  return (
    <div className="p-4 space-y-3">
      {modules.map((module) => (
        <button
          key={module.id}
          className="w-full bg-white border border-gray-200 rounded-md p-4 hover:bg-gray-50 text-left transition duration-150 focus:outline-none focus:ring-2 focus:ring-primary flex items-center"
          onClick={() => onSelectModule(module)}
        >
          <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-md flex items-center justify-center mr-3">
            <span className="flex items-center justify-center">
              {React.createElement(module.icon, { size: 18 })}
            </span>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-800">{module.label}</h4>
            <p className="text-xs text-gray-500">{module.description}</p>
          </div>
          <div className="ml-auto">
            <span
              className={`inline-block px-2 py-1 text-xs ${
                module.type === "trigger"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-green-100 text-green-700"
              } rounded-full`}
            >
              {module.type === "trigger" ? "Trigger" : "Action"}
            </span>
          </div>
        </button>
      ))}
      
      {modules.length === 0 && (
        <div className="py-8 text-center text-gray-500">
          No modules available for this app
        </div>
      )}
    </div>
  );
}
