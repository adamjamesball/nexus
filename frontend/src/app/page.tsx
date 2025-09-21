import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { 
  ArrowRight, 
  Bot, 
  Brain, 
  Leaf, 
  TrendingUp, 
  Users,
  Zap,
  FileText,
  Clock,
  Shield
} from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: Bot,
      title: "Multi-Agent AI Network",
      description: "8 specialized AI agents collaborate in real-time to analyze your sustainability documents"
    },
    {
      icon: Brain,
      title: "Self-Improving Intelligence",
      description: "System continuously learns and improves accuracy with every document processed"
    },
    {
      icon: Clock,
      title: "Sub-2 Minute Analysis",
      description: "Complex organizational boundary analysis completed in under 2 minutes"
    },
    {
      icon: Shield,
      title: "Enterprise-Grade Security",
      description: "SOC 2 compliant with end-to-end encryption and audit trails"
    }
  ];

  const agents = [
    { name: "Document Processor", icon: FileText, color: "bg-blue-100 text-blue-700" },
    { name: "Entity Intelligence", icon: Brain, color: "bg-purple-100 text-purple-700" },
    { name: "Carbon Expert", icon: Leaf, color: "bg-green-100 text-green-700" },
    { name: "Social Impact", icon: Users, color: "bg-orange-100 text-orange-700" },
    { name: "Strategic Insight", icon: TrendingUp, color: "bg-indigo-100 text-indigo-700" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-green-50 dark:from-slate-900 dark:via-background dark:to-slate-800">
      {/* Header removed; using global header from layout */}

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-gradient-to-r from-blue-600 to-green-600 text-white">
              World's First Self-Improving AI Platform
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              AI-Powered{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                Sustainability Intelligence
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              Transform sustainability consultants and corporate teams with cutting-edge AI that processes 
              organizational documents, maps entity relationships, and delivers strategic insights in under 2 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-lg px-8 py-3">
                  Start Analysis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Agent Network Preview */}
      <section className="py-16 bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Multi-Agent Collaboration Network
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Watch specialized AI agents work together in real-time to analyze your documents
              and generate comprehensive sustainability insights.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {agents.map((agent, index) => (
              <div
                key={agent.name}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full ${agent.color} animate-pulse`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <agent.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{agent.name}</span>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Badge variant="secondary" className="text-sm">
              <Bot className="h-3 w-3 mr-1" />
              8 Specialized Agents • Real-time Processing • Sub-2 Minute Analysis
            </Badge>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Next-Generation AI Capabilities
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built on the latest AI models and agentic frameworks for unparalleled 
              sustainability intelligence and analysis.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center">
                      <feature.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <span>{feature.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Transform Your Sustainability Practice?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join the next generation of AI-powered sustainability professionals. 
            Experience time-to-value in under 3 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3">
                Start Free Analysis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white/10 text-lg px-8 py-3"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-green-600 rounded flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-foreground">Nexus</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 Nexus AI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}