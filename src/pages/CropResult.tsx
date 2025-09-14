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
import { getSuggestions } from "@/lib/suggest";

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
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);
  const [suggestData, setSuggestData] = useState<any | null>(null);

  useEffect(() => {
    const savedResult = localStorage.getItem('cropPrediction');
    if (savedResult) {
      const parsedResult = JSON.parse(savedResult);
      setResult(parsedResult);
      
      // Generate crop image based on the recommended crop
      generateCropImage(parsedResult.crop);
      // Auto-fetch suggestions
      fetchSuggestions(parsedResult);
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

  const fetchSuggestions = async (r: PredictionResult) => {
    try {
      setSuggestLoading(true);
      setSuggestError(null);
      const payload = { ...r.inputData, prediction: r.crop } as any;
      const data = await getSuggestions(payload);
      setSuggestData(data);
    } catch (e: any) {
      setSuggestError(e?.message || 'Failed to fetch suggestions');
    } finally {
      setSuggestLoading(false);
    }
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

        {/* Suggestions */}
        <Card className="p-6 mb-8 border-0 bg-card/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Cultivation Suggestions
            </h3>
            <Button variant="outline" onClick={() => result && fetchSuggestions(result)} disabled={suggestLoading}>
              {suggestLoading ? 'Loading…' : 'Refresh'}
            </Button>
          </div>
          {suggestError && (
            <p className="text-sm text-red-600">{suggestError}</p>
          )}
          {!suggestError && suggestLoading && (
            <p className="text-sm text-muted-foreground">Generating suggestions…</p>
          )}
          {!suggestLoading && !suggestError && suggestData && (
            <div className="space-y-6">
              {suggestData.structured ? (
                <div className="space-y-4">
                  {/* Paragraph summary */}
                  <div className="text-base leading-7 text-foreground/90">
                    {(() => {
                      const s = suggestData.structured;
                      const crop = s.crop || result?.crop || 'the crop';
                      const reason = s.reason ? `${s.reason.trim().replace(/\.$/, '')}.` : '';
                      const steps = Array.isArray(s.cultivation_steps) ? s.cultivation_steps : [];
                      const duration = s.duration_weeks ? `${s.duration_weeks} weeks` : '';
                      const costAmount = s?.estimated_cost?.amount;
                      const costCurrency = s?.estimated_cost?.currency || '';
                      const cost = costAmount != null ? `${costAmount} ${costCurrency}`.trim() : '';
                      const pH = s?.soil_preparation?.ph_adjustment;
                      const spacingRow = s?.spacing?.row_spacing_cm;
                      const spacingPlant = s?.spacing?.plant_spacing_cm;

                      const firstStep = steps[0] ? steps[0] : '';
                      const secondStep = steps[1] ? steps[1] : '';

                      const parts: string[] = [];
                      parts.push(`${String(crop).charAt(0).toUpperCase() + String(crop).slice(1)} is recommended${reason ? ' because ' + reason : ''}`.trim());
                      if (pH) parts.push(`Adjust soil pH (${pH}) and prepare the bed before planting.`);
                      if (spacingRow || spacingPlant) parts.push(`Transplant with spacing around ${spacingRow || '-'} cm (row) × ${spacingPlant || '-'} cm (plant).`);
                      if (firstStep) parts.push(firstStep + (firstStep.endsWith('.') ? '' : '.'));
                      if (secondStep) parts.push(secondStep + (secondStep.endsWith('.') ? '' : '.'));
                      if (duration) parts.push(`Time to first harvest is roughly ${duration}.`);
                      if (cost) parts.push(`Estimated cultivation cost is about ${cost}.`);

                      return parts.join(' ');
                    })()}
                  </div>

                  {/* Detailed sections remain below if you also want structure */}
                  <div><span className="font-semibold">Crop:</span> {suggestData.structured.crop || '-'}</div>
                  <div><span className="font-semibold">Why:</span> {suggestData.structured.reason || '-'}</div>
                  <div>
                    <span className="font-semibold">How to cultivate:</span>
                    <ol className="list-decimal ml-6 mt-2 space-y-1">
                      {(suggestData.structured.cultivation_steps || []).map((s: string, i: number) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ol>
                  </div>
                  <div><span className="font-semibold">Duration:</span> {suggestData.structured.duration_weeks || '-'} weeks</div>
                  <div><span className="font-semibold">Estimated cost:</span> {suggestData.structured?.estimated_cost?.amount || '-'} {suggestData.structured?.estimated_cost?.currency || ''}</div>
                  {suggestData.structured.soil_preparation && (
                    <div>
                      <span className="font-semibold">Soil preparation:</span>
                      <div className="ml-4 text-sm">
                        <div>pH: {suggestData.structured.soil_preparation.ph_adjustment || '-'}</div>
                        <div>Bed: {suggestData.structured.soil_preparation.bed_preparation || '-'}</div>
                        <div>Organic matter: {suggestData.structured.soil_preparation.organic_matter || '-'}</div>
                      </div>
                    </div>
                  )}
                  {suggestData.structured.spacing && (
                    <div>
                      <span className="font-semibold">Spacing:</span> row {suggestData.structured.spacing.row_spacing_cm || '-'} cm, plant {suggestData.structured.spacing.plant_spacing_cm || '-'} cm
                    </div>
                  )}
                  {Array.isArray(suggestData.structured.irrigation_schedule) && (
                    <div>
                      <span className="font-semibold">Irrigation schedule:</span>
                      <ul className="list-disc ml-6 mt-2 space-y-1 text-sm">
                        {suggestData.structured.irrigation_schedule.map((i: any, idx: number) => (
                          <li key={idx}>{i.stage || ''}: every {i.frequency_days || '-'} days, {i.amount_mm || '-'} mm</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {Array.isArray(suggestData.structured.fertilizer_plan) && (
                    <div>
                      <span className="font-semibold">Fertilizer plan:</span>
                      <ul className="list-disc ml-6 mt-2 space-y-1 text-sm">
                        {suggestData.structured.fertilizer_plan.map((f: any, idx: number) => (
                          <li key={idx}>{f.time || ''}: {f.type || ''} — {f.amount || ''}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {Array.isArray(suggestData.structured.pest_management) && (
                    <div>
                      <span className="font-semibold">Pest management:</span>
                      <ul className="list-disc ml-6 mt-2 space-y-1 text-sm">
                        {suggestData.structured.pest_management.map((p: any, idx: number) => (
                          <li key={idx}>{p.pest || ''}: monitor {p.monitoring || ''}; control {p.control || ''}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {suggestData.structured.expected_yield && (
                    <div><span className="font-semibold">Expected yield:</span> {suggestData.structured.expected_yield.amount || '-'} {suggestData.structured.expected_yield.unit || ''}</div>
                  )}
                  {suggestData.structured.market_notes && (
                    <div><span className="font-semibold">Market notes:</span> {suggestData.structured.market_notes}</div>
                  )}
                </div>
              ) : (
                <pre className="text-sm whitespace-pre-wrap">{suggestData.suggestions || '(No suggestions)'}</pre>
              )}

              {suggestData.formatted && (
                <pre className="text-xs whitespace-pre-wrap p-3 bg-muted/30 rounded-md border border-border/30">{suggestData.formatted}</pre>
              )}
            </div>
          )}
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