import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { PlusCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col items-center mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
            Workflow Automation Builder
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Create powerful automation workflows by connecting your favorite apps and services
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Create a new workflow</CardTitle>
              <CardDescription>
                Start from scratch and build your custom workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/create">
                <Button className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Workflow
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Templates</CardTitle>
              <CardDescription>
                Get started quickly with pre-built workflow templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/templates">
                <Button variant="outline" className="w-full">
                  Browse Templates
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
