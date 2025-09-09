import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Leaf, TrendingUp, Shield, Zap } from "lucide-react";
import heroImage from "@/assets/hero-agriculture.jpg";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Leaf,
      title: "Smart Analysis",
      description: "Advanced algorithms analyze soil and climate data for optimal crop recommendations"
    },
    {
      icon: TrendingUp,
      title: "Increased Yield",
      description: "Boost your harvest with data-driven crop selection and farming insights"
    },
    {
      icon: Shield,
      title: "Risk Reduction",
      description: "Minimize crop failure risks with weather and soil compatibility analysis"
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Get immediate crop recommendations with just a few soil and climate parameters"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10" />
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight">
                  Smart Crop Recommendation System
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Harness the power of AI to make informed decisions about what crops to grow. 
                  Our intelligent system analyzes soil nutrients, climate conditions, and environmental 
                  factors to recommend the perfect crops for your land.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/form')}
                  className="bg-gradient-to-r from-primary to-accent hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-lg px-8 py-6"
                >
                  Get Started
                  <Leaf className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-primary/20 hover:bg-primary/5 text-lg px-8 py-6"
                >
                  Learn More
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-3xl transform rotate-6" />
              <img 
                src={heroImage} 
                alt="Smart Agriculture Technology" 
                className="relative z-10 w-full h-96 object-cover rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Why Choose Our System?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of agriculture with our comprehensive crop recommendation platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="p-12 text-center bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Ready to Optimize Your Harvest?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of farmers who have increased their yields with our intelligent crop recommendations. 
              Start your journey to smarter agriculture today.
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate('/form')}
              className="bg-gradient-to-r from-primary to-accent hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-lg px-12 py-6"
            >
              Start Analysis
              <TrendingUp className="ml-2 h-5 w-5" />
            </Button>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Landing;