import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { 
  Zap, 
  PlusCircle, 
  LayoutGrid, 
  ArrowRight, 
  CreditCard, 
  Puzzle, 
  LineChart, 
  Settings,
  Workflow 
} from "lucide-react";
import { GradientBackground } from "@/components/ui/gradient-background";
import { Badge } from "@/components/ui/badge";
import { ContactFormDialog } from "@/components/dialogs/ContactFormDialog";
import { TemplateRequestDialog } from "@/components/dialogs/TemplateRequestDialog";

export default function Home() {
  return (
    <div className="min-h-screen">
      <GradientBackground>
        {/* Hero Section */}
        <section className="pt-20 pb-16 md:pt-32 md:pb-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
              <Badge variant="outline" className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20">
                Welcome to PumpFlux
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Powerful Workflow Automation Platform
              </h1>
              
              <p className="text-xl text-gray-600 max-w-2xl mb-10">
                Create seamless integrations and automate complex workflows with our intuitive, 
                drag-and-drop builder. Connect your favorite apps and services in minutes.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard">
                  <Button size="lg" className="gap-2">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="outline" className="gap-2">
                    View Pricing <CreditCard className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-white/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Why Choose PumpFlux?</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Our platform combines power and simplicity to help you create sophisticated 
                automation workflows without coding.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Puzzle className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Intuitive Interface</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Drag-and-drop workflow builder with a node-based interface that makes creating
                    complex automations simple and intuitive.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                    <LayoutGrid className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">500+ Integrations</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Connect with hundreds of popular applications and services including Slack, 
                    Google Workspace, HubSpot, and more.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                    <LineChart className="h-6 w-6 text-indigo-600" />
                  </div>
                  <CardTitle className="text-xl">Health Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Real-time monitoring and analytics to track workflow performance, identify bottlenecks,
                    and optimize your automations.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Ready to Streamline Your Workflow?</h2>
              <p className="text-xl text-gray-600 mb-8">
                Join thousands of businesses using PumpFlux to save time and automate repetitive tasks
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/dashboard">
                  <Button size="lg" className="gap-2">
                    Create Your First Workflow <Zap className="h-4 w-4" />
                  </Button>
                </Link>
                <ContactFormDialog 
                  buttonClassName="h-11 px-4 py-2 rounded-md text-sm font-medium"
                  trigger={
                    <Button size="lg" variant="outline" className="gap-2">
                      Contact Sales <ArrowRight className="h-4 w-4" />
                    </Button>
                  }
                />
              </div>
            </div>
          </div>
        </section>
      
        {/* Footer */}
        <footer className="py-12 bg-white/30 backdrop-blur-sm border-t border-gray-100">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-6 md:mb-0">
                <Workflow className="h-8 w-8 text-primary mr-2" />
                <span className="text-xl font-bold text-gray-900">PumpFlux</span>
              </div>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="link" size="sm" asChild>
                  <Link href="/pricing">Pricing</Link>
                </Button>
                <Button variant="link" size="sm" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <TemplateRequestDialog 
                  buttonClassName="h-9 px-3 py-2 rounded-md text-sm font-medium text-primary"
                  trigger={
                    <Button variant="link" size="sm">
                      Request Template
                    </Button>
                  }
                />
                <ContactFormDialog 
                  buttonClassName="h-9 px-3 py-2 rounded-md text-sm font-medium text-primary"
                  trigger={
                    <Button variant="link" size="sm">
                      Contact Us
                    </Button>
                  }
                />
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-100 text-center text-gray-500 text-sm">
              <p>&copy; {new Date().getFullYear()} PumpFlux. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </GradientBackground>
    </div>
  );
}
