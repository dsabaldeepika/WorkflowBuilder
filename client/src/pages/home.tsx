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
  Workflow,
  CheckCircle,
  Check,
} from "lucide-react";
import { GradientBackground } from "@/components/ui/gradient-background";
import { Badge } from "@/components/ui/badge";
import { ContactFormDialog } from "@/components/dialogs/ContactFormDialog";
import { TemplateRequestDialog } from "@/components/dialogs/TemplateRequestDialog";
import { DemoRequestDialog } from "@/components/dialogs/DemoRequestDialog";
import { testimonials } from '@/data/testimonials';

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 -z-10 animate-gradient bg-gradient-to-br from-blue-100 via-indigo-100 to-pink-100 opacity-80" />
      {/* Decorative SVG Illustration */}
      <svg
        className="absolute top-0 right-0 w-96 h-96 opacity-30 pointer-events-none select-none"
        viewBox="0 0 400 400"
        fill="none"
      >
        <circle cx="200" cy="200" r="180" fill="url(#paint0_radial)" />
        <defs>
          <radialGradient
            id="paint0_radial"
            cx="0"
            cy="0"
            r="1"
            gradientTransform="translate(200 200) scale(180)"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#6366F1" stopOpacity="0.2" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
      <GradientBackground>
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

              {/* SVG Workflow Illustration */}
              <div className="my-8">
                <svg
                  width="320"
                  height="80"
                  viewBox="0 0 320 80"
                  fill="none"
                  className="mx-auto animate-fade-in"
                >
                  <rect
                    x="10"
                    y="30"
                    width="60"
                    height="40"
                    rx="12"
                    fill="#6366F1"
                    opacity="0.15"
                  />
                  <rect
                    x="90"
                    y="10"
                    width="60"
                    height="60"
                    rx="12"
                    fill="#6366F1"
                    opacity="0.25"
                  />
                  <rect
                    x="170"
                    y="30"
                    width="60"
                    height="40"
                    rx="12"
                    fill="#6366F1"
                    opacity="0.15"
                  />
                  <rect
                    x="250"
                    y="20"
                    width="60"
                    height="50"
                    rx="12"
                    fill="#6366F1"
                    opacity="0.2"
                  />
                  <circle cx="40" cy="50" r="8" fill="#6366F1" />
                  <circle cx="120" cy="40" r="8" fill="#6366F1" />
                  <circle cx="200" cy="50" r="8" fill="#6366F1" />
                  <circle cx="280" cy="45" r="8" fill="#6366F1" />
                  <polyline
                    points="48,50 112,40"
                    stroke="#6366F1"
                    strokeWidth="2"
                    opacity="0.5"
                  />
                  <polyline
                    points="128,40 192,50"
                    stroke="#6366F1"
                    strokeWidth="2"
                    opacity="0.5"
                  />
                  <polyline
                    points="208,50 272,45"
                    stroke="#6366F1"
                    strokeWidth="2"
                    opacity="0.5"
                  />
                </svg>
              </div>

              <div className="flex flex-wrap justify-center gap-3 mb-10">
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 px-3 py-1.5 text-sm font-medium animate-float-slow"
                >
                  10x Faster Implementation
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 px-3 py-1.5 text-sm font-medium animate-float"
                >
                  97% Customer Satisfaction
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-800 px-3 py-1.5 text-sm font-medium animate-float-slow"
                >
                  500+ Integrations
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-amber-100 text-amber-800 px-3 py-1.5 text-sm font-medium animate-float"
                >
                  ROI in Under 30 Days
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="gap-2 shadow-xl hover:scale-105 transition-transform duration-200"
                  >
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200"
                  >
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
              <h2 className="text-3xl font-bold mb-4">
                Make Your Business More Efficient & Profitable
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Trusted by 10,000+ companies worldwide to reduce costs,
                eliminate errors, and accelerate growth.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Puzzle className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">No-Code Builder</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    <span className="font-semibold">
                      Implement in days, not months.
                    </span>{" "}
                    Our intuitive drag-and-drop interface allows anyone to build
                    complex business workflows without coding skills.
                  </p>
                  <div className="mt-4 flex items-center text-sm text-primary">
                    <CheckCircle className="h-4 w-4 mr-1" /> No IT team required
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                    <LayoutGrid className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">
                    Enterprise Integrations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    <span className="font-semibold">
                      Connect all your business tools.
                    </span>{" "}
                    Integrate with 500+ applications including Salesforce,
                    HubSpot, Slack, Google Workspace, and many more.
                  </p>
                  <div className="mt-4 flex items-center text-sm text-blue-600">
                    <CheckCircle className="h-4 w-4 mr-1" /> Secure API
                    connections
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                    <LineChart className="h-6 w-6 text-indigo-600" />
                  </div>
                  <CardTitle className="text-xl">Advanced Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    <span className="font-semibold">
                      Business insights that matter.
                    </span>{" "}
                    Get detailed performance metrics, identify bottlenecks, and
                    optimize your processes with actionable data.
                  </p>
                  <div className="mt-4 flex items-center text-sm text-indigo-600">
                    <CheckCircle className="h-4 w-4 mr-1" /> ROI monitoring
                    built-in
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Business Benefits Section */}
            <div className="mt-16 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-8 border border-blue-100">
              <div className="text-center mb-10">
                <h3 className="text-2xl font-bold mb-4">
                  Trusted by Businesses of All Sizes
                </h3>
                <p className="text-lg text-gray-600">
                  Our customers report transformative results with PumpFlux
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="flex flex-col items-center text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    89%
                  </div>
                  <p className="text-gray-700">
                    Reduction in manual data entry errors
                  </p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    75%
                  </div>
                  <p className="text-gray-700">
                    Faster customer onboarding process
                  </p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    60%
                  </div>
                  <p className="text-gray-700">
                    Cost reduction in operational tasks
                  </p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    3.5x
                  </div>
                  <p className="text-gray-700">
                    Return on investment in first year
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  {/* CTA Content */}
                  <div className="p-10 lg:p-12 flex flex-col justify-center">
                    <Badge
                      variant="outline"
                      className="mb-4 max-w-fit px-3 py-1.5 bg-green-50 text-green-700 border-green-200"
                    >
                      Limited Time Offer
                    </Badge>

                    <h2 className="text-3xl font-bold mb-4">
                      Start Automating Your Business Today
                    </h2>

                    <p className="text-lg text-gray-600 mb-4">
                      Join 10,000+ companies already saving time and reducing
                      costs with PumpFlux.
                    </p>

                    <ul className="space-y-2 mb-8">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                        <span>
                          Free 14-day trial with full access to all features
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                        <span>
                          Dedicated onboarding specialist for business accounts
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                        <span>No credit card required to start</span>
                      </li>
                    </ul>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link href="/templates">
                        <Button size="lg" className="gap-2 w-full sm:w-auto">
                          Explore Templates <Zap className="h-4 w-4" />
                        </Button>
                      </Link>
                      <DemoRequestDialog
                        buttonClassName="h-11 px-4 py-2 rounded-md text-sm font-medium w-full sm:w-auto"
                        trigger={
                          <Button size="lg" variant="outline" className="gap-2">
                            Schedule Demo <ArrowRight className="h-4 w-4" />
                          </Button>
                        }
                      />
                    </div>
                  </div>

                  {/* Testimonial */}
                  <div className="hidden lg:block bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-10 lg:p-12">
                    <div className="h-full flex flex-col justify-center">
                      {testimonials.map((t, idx) => (
                        <div className="mb-6" key={idx}>
                          <svg
                            className="h-8 w-8 text-blue-300 mb-4"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
                          </svg>
                          <p className="text-xl font-medium leading-relaxed mb-6">{t.quote}</p>
                          <div className="flex items-center">
                            <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-lg font-bold mr-4">
                              {t.avatar}
                            </div>
                            <div>
                              <h4 className="font-bold">{t.name}</h4>
                              <p className="text-blue-200">{t.title}, {t.company}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
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
                <span className="text-xl font-bold text-gray-900">
                  PumpFlux
                </span>
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
                <Link href="/pricing">
                  <Button variant="link" size="sm">
                    Pricing
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100 text-center text-gray-500 text-sm">
              <p>
                &copy; {new Date().getFullYear()} PumpFlux. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </GradientBackground>
    </div>
  );
}
