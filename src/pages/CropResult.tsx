import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  RefreshCw, 
  TrendingUp, 
  CheckCircle,
  Leaf,
  Info
} from "lucide-react";

interface PredictionResult {
  crop: string;
  confidence: number;
  inputData: {
    N: number;
    P: number;
    K: number;
    temperature: number;
    humidity: number;
    ph: number;
    rainfall: number;
  };
}

const CropResult = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [cropImage, setCropImage] = useState<string>("");

  useEffect(() => {
    const savedResult = localStorage.getItem('cropPrediction');
    if (savedResult) {
      const parsedResult = JSON.parse(savedResult);
      setResult(parsedResult);
      
      // Generate crop image based on the recommended crop
      generateCropImage(parsedResult.crop);
    } else {
      navigate('/form');
    }
  }, [navigate]);

  const generateCropImage = async (cropName: string) => {
    // Set a placeholder for now - in a real app you'd have actual crop images
    setCropImage(`/api/placeholder/400/300?text=${encodeURIComponent(cropName)}`);
  };

  const handleRetry = () => {
    localStorage.removeItem('cropPrediction');
    navigate('/form');
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-600 bg-green-50 border-green-200";
    if (confidence >= 75) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-orange-600 bg-orange-50 border-orange-200";
  };

  const getCropBenefits = (crop: string) => {
    const benefits: { [key: string]: string[] } = {
      rice: ["High yield potential", "Staple food crop", "Grows in wet conditions"],
      wheat: ["Versatile grain crop", "Good market demand", "Drought tolerant varieties"],
      corn: ["High biomass production", "Multiple uses", "Good feed crop"],
      default: ["Suitable for your conditions", "Good agricultural choice", "Profitable crop option"]
    };
    
    return benefits[crop.toLowerCase()] || benefits.default;
  };

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-accent/5 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4 hover:bg-primary/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full mb-4">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
              Crop Recommendation
            </h1>
            <p className="text-xl text-muted-foreground">
              Based on your soil and climate data analysis
            </p>
          </div>
        </div>

        {/* Result Card */}
        <Card className="p-8 shadow-2xl border-0 bg-card/50 backdrop-blur-sm mb-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div>
                <Badge 
                  variant="outline" 
                  className={`mb-4 px-4 py-2 text-sm font-medium ${getConfidenceColor(result.confidence)}`}
                >
                  {result.confidence}% Confidence
                </Badge>
                
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                  Recommended Crop:
                </h2>
                <h3 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent capitalize">
                  {result.crop}
                </h3>
              </div>

              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Key Benefits:
                </h4>
                <ul className="space-y-2">
                  {getCropBenefits(result.crop).map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2 text-muted-foreground">
                      <Leaf className="h-4 w-4 text-accent" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl transform rotate-3" />
              <div className="relative z-10 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-6 border border-primary/20">
                <div className="aspect-video bg-gradient-to-br from-secondary/30 to-accent/20 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <Leaf className="h-16 w-16 text-primary mx-auto mb-4" />
                    <p className="text-2xl font-bold text-primary capitalize">{result.crop}</p>
                    <p className="text-muted-foreground">Recommended Crop</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Input Summary */}
        <Card className="p-6 mb-8 border-0 bg-secondary/20">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Analysis Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{result.inputData.N}</p>
              <p className="text-sm text-muted-foreground">Nitrogen (kg/ha)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{result.inputData.P}</p>
              <p className="text-sm text-muted-foreground">Phosphorus (kg/ha)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{result.inputData.K}</p>
              <p className="text-sm text-muted-foreground">Potassium (kg/ha)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{result.inputData.temperature}°C</p>
              <p className="text-sm text-muted-foreground">Temperature</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{result.inputData.humidity}%</p>
              <p className="text-sm text-muted-foreground">Humidity</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{result.inputData.ph}</p>
              <p className="text-sm text-muted-foreground">pH Level</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{result.inputData.rainfall}mm</p>
              <p className="text-sm text-muted-foreground">Rainfall</p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={handleRetry}
            size="lg"
            className="bg-gradient-to-r from-primary to-accent hover:shadow-lg transform hover:scale-105 transition-all duration-300 px-8"
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            Try Another Analysis
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            size="lg"
            className="border-primary/20 hover:bg-primary/5 px-8"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CropResult;