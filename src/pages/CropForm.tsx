import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { GoogleTranslateButton } from "@/components/GoogleTranslate";
import { CloudRain } from "lucide-react";
import { 
  Leaf, 
  Thermometer, 
  Droplets, 
  FlaskConical, 
  
  ArrowLeft,
  Send
} from "lucide-react";

interface FormData {
  N: string;
  P: string;
  K: string;
  temperature: string;
  humidity: string;
  ph: string;
  rainfall: string;
}

const CropForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    N: "",
    P: "",
    K: "",
    temperature: "",
    humidity: "",
    ph: "",
    rainfall: ""
  });

  const inputFields = [
    {
      key: "N" as keyof FormData,
      label: "Nitrogen (N)",
      icon: Leaf,
      placeholder: "0-140",
      unit: "kg/ha",
      description: "Nitrogen content in the soil"
    },
    {
      key: "P" as keyof FormData,
      label: "Phosphorus (P)",
      icon: Leaf,
      placeholder: "5-145",
      unit: "kg/ha",
      description: "Phosphorus content in the soil"
    },
    {
      key: "K" as keyof FormData,
      label: "Potassium (K)",
      icon: Leaf,
      placeholder: "5-205",
      unit: "kg/ha",
      description: "Potassium content in the soil"
    },
    {
      key: "temperature" as keyof FormData,
      label: "Temperature",
      icon: Thermometer,
      placeholder: "8.8-43.7",
      unit: "°C",
      description: "Average temperature"
    },
    {
      key: "humidity" as keyof FormData,
      label: "Humidity",
      icon: Droplets,
      placeholder: "14-100",
      unit: "%",
      description: "Relative humidity"
    },
    {
      key: "ph" as keyof FormData,
      label: "pH Level",
      icon: FlaskConical,
      placeholder: "3.5-10.0",
      unit: "pH",
      description: "Soil pH level"
    },
    {
      key: "rainfall" as keyof FormData,
      label: "Rainfall",
      icon: CloudRain,
      placeholder: "20-300",
      unit: "mm",
      description: "Annual rainfall"
    }
  ];

  const handleInputChange = (key: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const validateForm = () => {
    const values = Object.values(formData);
    if (values.some(value => !value.trim())) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields before submitting.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const numericData = {
        N: parseFloat(formData.N),
        P: parseFloat(formData.P),
        K: parseFloat(formData.K),
        temperature: parseFloat(formData.temperature),
        humidity: parseFloat(formData.humidity),
        ph: parseFloat(formData.ph),
        rainfall: parseFloat(formData.rainfall)
      };

      const response = await api.post('/predict', numericData);
      const crop = response.data.crop || response.data.prediction;
      
      // Save to history
      try {
        await api.post('/history', {
          input: numericData,
          prediction: crop,
          confidence: response.data.confidence || 95
        });
      } catch (e) {
        console.warn('Failed to save to history:', e);
      }
      
      // Store result in localStorage and navigate to results page
      localStorage.setItem('cropPrediction', JSON.stringify({
        crop,
        confidence: response.data.confidence || 95,
        inputData: numericData
      }));
      
      navigate('/result');
      
    } catch (error) {
      console.error('Prediction error:', error);
      toast({
        title: "Error",
        description: "Failed to get crop recommendation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromThingSpeak = async () => {
    try {
      const channelId = prompt("2703121");
      const apiKey = prompt("0F1OMJFYN95I7NF2");
      if (!channelId || !apiKey) return;
      const res = await fetch(`${(import.meta as any)?.env?.VITE_API_BASE || 'http://127.0.0.1:5000'}/thingspeak/latest?channelId=${encodeURIComponent(channelId)}&apiKey=${encodeURIComponent(apiKey)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'ThingSpeak fetch failed');
      setFormData(prev => ({
        ...prev,
        N: data.N != null ? String(data.N) : prev.N,
        P: data.P != null ? String(data.P) : prev.P,
        K: data.K != null ? String(data.K) : prev.K,
        temperature: data.temperature != null ? String(data.temperature) : prev.temperature,
        humidity: data.humidity != null ? String(data.humidity) : prev.humidity,
        ph: data.ph != null ? String(data.ph) : prev.ph,
        rainfall: data.rainfall != null ? String(data.rainfall) : prev.rainfall,
      }));
      toast({ title: "Loaded from ThingSpeak", description: "Values populated from latest feed." });
    } catch (e: any) {
      toast({ title: "ThingSpeak Error", description: e?.message || String(e), variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-accent/5 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
              className="hover:bg-primary/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
            <GoogleTranslateButton />
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
              Crop Analysis Form
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Enter your soil and climate parameters to get personalized crop recommendations
            </p>
          </div>
        </div>

        {/* Form */}
        <Card className="p-8 shadow-2xl border-0 bg-card/50 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              {inputFields.map((field) => (
                <div key={field.key} className="space-y-3">
                  <Label htmlFor={field.key} className="text-base font-medium flex items-center gap-2">
                    <field.icon className="h-5 w-5 text-primary" />
                    {field.label}
                    <span className="text-sm text-muted-foreground">({field.unit})</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id={field.key}
                      type="number"
                      step="0.1"
                      placeholder={field.placeholder}
                      value={formData[field.key]}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      className="h-12 text-base border-border/40 focus:border-primary transition-colors"
                      required
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {field.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-border/20 flex flex-col md:flex-row gap-3">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-14 text-lg bg-gradient-to-r from-primary to-accent hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin mr-2 h-6 w-6 border-2 border-white border-t-transparent rounded-full" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Get Crop Recommendation
                    <Send className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
              <Button 
                type="button"
                variant="outline"
                onClick={loadFromThingSpeak}
                className="w-full h-14 text-lg"
              >
                Load from ThingSpeak
              </Button>
            </div>
          </form>
        </Card>

        {/* Info Cards */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card className="p-6 text-center bg-primary/5 border-primary/20">
            <Leaf className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Soil Nutrients</h3>
            <p className="text-sm text-muted-foreground">
              N, P, K values represent essential soil nutrients for crop growth
            </p>
          </Card>
          
          <Card className="p-6 text-center bg-accent/5 border-accent/20">
            <Thermometer className="h-8 w-8 text-accent mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Climate Data</h3>
            <p className="text-sm text-muted-foreground">
              Temperature and humidity affect crop selection and yield
            </p>
          </Card>
          
          <Card className="p-6 text-center bg-secondary/20 border-secondary/40">
            <CloudRain className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Environmental</h3>
            <p className="text-sm text-muted-foreground">
              pH and rainfall data ensure optimal growing conditions
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CropForm;