import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Leaf, TrendingUp, Shield, Zap, Cloud, Thermometer, Droplets, Wind, MapPin, Search, Loader2 } from "lucide-react";
import heroImage from "@/assets/hero-agriculture.jpg";
import { Link } from "react-router-dom";
import { GoogleTranslateButton } from "@/components/GoogleTranslate";
import { api } from "@/lib/api";

const Landing = () => {
  const navigate = useNavigate();
  const [weather, setWeather] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [city, setCity] = useState("Chennai");
  const [inputCity, setInputCity] = useState("");

  const fetchWeather = async (location: string) => {
    try {
      setWeatherLoading(true);
      setWeatherError(null);
      const response = await api.get("/weather", {
        params: { city: location }
      });
      setWeather(response.data);
    } catch (error: any) {
      setWeatherError(error?.response?.data?.error || "Failed to fetch weather");
      setWeather(null);
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    // Fetch weather for default city on mount
    fetchWeather(city);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleWeatherSearch = () => {
    if (inputCity.trim()) {
      fetchWeather(inputCity.trim());
      setCity(inputCity.trim());
    }
  };

  const getWeatherIcon = (description: string) => {
    const desc = description?.toLowerCase() || "";
    if (desc.includes("rain") || desc.includes("drizzle")) {
      return <Droplets className="h-12 w-12 text-green-500" />;
    } else if (desc.includes("cloud")) {
      return <Cloud className="h-12 w-12 text-gray-500" />;
    } else if (desc.includes("sun") || desc.includes("clear")) {
      return <Cloud className="h-12 w-12 text-yellow-500" />;
    } else {
      return <Cloud className="h-12 w-12 text-primary" />;
    }
  };

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
      {/* Header with Translator */}
      <div className="fixed top-4 right-4 z-50">
        <GoogleTranslateButton />
      </div>
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10" />
        <div className="container mx-auto max-w-6xl relative z-10">
          {/* Weather Widget - Enhanced UI without box */}
          <div className="mb-12 w-full">
            {/* City Search Bar */}
            <div className="flex justify-center mb-6">
              <div className="flex gap-3 max-w-md w-full">
                <Input
                  placeholder="Enter city name to check weather..."
                  value={inputCity}
                  onChange={(e) => setInputCity(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleWeatherSearch()}
                  className="flex-1 bg-white/80 backdrop-blur-sm border-primary/20 focus:border-primary shadow-lg h-12 text-base"
                />
                <Button
                  onClick={handleWeatherSearch}
                  disabled={weatherLoading}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent hover:shadow-lg transform hover:scale-105 transition-all duration-300 h-12 px-6"
                >
                  {weatherLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Loading State */}
            {weatherLoading && (
              <div className="text-center py-12">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
                <p className="text-lg text-muted-foreground">Loading weather data...</p>
              </div>
            )}

            {/* Error State */}
            {weatherError && (
              <div className="text-center py-8">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-red-50 border border-red-200 rounded-full">
                  <Cloud className="h-5 w-5 text-red-600" />
                  <p className="text-sm text-red-600 font-medium">{weatherError}</p>
                </div>
              </div>
            )}

            {/* Weather Display */}
            {weather && !weatherLoading && (
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 p-8 md:p-12 text-white shadow-2xl">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -ml-24 -mb-24"></div>
                </div>

                <div className="relative z-10">
                  {/* Location Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-6 w-6 text-white/90" />
                      <div>
                        <h2 className="text-2xl md:text-3xl font-bold">{weather.location}</h2>
                        <p className="text-white/80 text-sm">{weather.country}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                      <Thermometer className="h-4 w-4 mr-2" />
                      Live Weather
                    </Badge>
                  </div>

                  {/* Main Weather Info */}
                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div className="flex items-center gap-6">
                      <div className="flex-shrink-0">
                        {weather.icon ? (
                          <img 
                            src={weather.icon} 
                            alt={weather.description || "Weather"} 
                            className="h-24 w-24 drop-shadow-lg"
                          />
                        ) : (
                          <div className="h-24 w-24">
                            {getWeatherIcon(weather.description)}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-6xl md:text-7xl font-bold mb-2">
                          {Math.round(weather.temperature)}°
                        </div>
                        {weather.feels_like && (
                          <div className="text-lg text-white/80 mb-1">
                            Feels like {Math.round(weather.feels_like)}°C
                          </div>
                        )}
                        <div className="text-xl text-white/90 capitalize font-medium">
                          {weather.description}
                        </div>
                      </div>
                    </div>

                    {/* Weather Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Droplets className="h-5 w-5 text-white/90" />
                          <span className="text-sm text-white/80">Humidity</span>
                        </div>
                        <div className="text-2xl font-bold">{weather.humidity}%</div>
                      </div>
                      
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Wind className="h-5 w-5 text-white/90" />
                          <span className="text-sm text-white/80">Pressure</span>
                        </div>
                        <div className="text-2xl font-bold">{weather.pressure} mb</div>
                      </div>
                      
                      {weather.wind_kph && (
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Wind className="h-5 w-5 text-white/90" />
                            <span className="text-sm text-white/80">Wind</span>
                          </div>
                          <div className="text-2xl font-bold">{weather.wind_kph} km/h</div>
                          {weather.wind_dir && (
                            <div className="text-xs text-white/70 mt-1">{weather.wind_dir}</div>
                          )}
                        </div>
                      )}
                      
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Thermometer className="h-5 w-5 text-white/90" />
                          <span className="text-sm text-white/80">Temp</span>
                        </div>
                        <div className="text-2xl font-bold">{Math.round(weather.temperature)}°C</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

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
             <Link to="/dashboard">   <Button 
                  variant="outline" 
                  size="lg"
                  className="border-primary/20 hover:bg-primary/5 text-lg px-8 py-6"
                >
                  Dashboard
                </Button> </Link>
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