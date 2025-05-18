import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Workflow } from "lucide-react";

export function WelcomeContent() {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 -z-10 animate-gradient bg-gradient-to-br from-blue-100 via-indigo-100 to-pink-100 opacity-80" />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 md:pt-32 md:pb-24 relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <Badge
              variant="outline"
              className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20 animate-float"
            >
              #1 Workflow Automation Solution for Business
            </Badge>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent drop-shadow-lg">
              Transform Your Business with Automated Workflows...
              
            </h1>

            <p className="text-xl text-gray-700 max-w-2xl mb-6">
              <span className="font-semibold text-primary">
                Save 20+ hours per week
              </span>{" "}
              by eliminating repetitive tasks.
              <br />
              PumpFlux helps businesses connect applications and automate
              workflows without writing code.
            </p>

            {/* Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">89%</div>
                  <p className="text-gray-700">Reduction in manual data entry errors</p>
                </div>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">75%</div>
                  <p className="text-gray-700">Faster customer onboarding process</p>
                </div>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">60%</div>
                  <p className="text-gray-700">Cost reduction in operational tasks</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">3.5x</div>
                  <p className="text-gray-700">Return on investment in first year</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 