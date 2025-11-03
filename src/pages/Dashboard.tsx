import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { GoogleTranslateButton } from "@/components/GoogleTranslate";
import {
  ArrowLeft,
  TrendingUp,
  Calculator,
  Calendar,
  Droplets,
  DollarSign,
  MessageCircle,
  Image as ImageIcon,
  Brain,
  Info,
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("fertilizer");
  const [loading, setLoading] = useState(false);
  
  // Fertilizer calculator state
  const [fertData, setFertData] = useState({
    N: "", P: "", K: "", area: "", crop: ""
  });
  const [fertResult, setFertResult] = useState<any>(null);
  
  // Yield predictor state
  const [yieldData, setYieldData] = useState({
    crop: "", area: "", soil_quality: "medium", N: "", P: "", K: ""
  });
  const [yieldResult, setYieldResult] = useState<any>(null);
  
  // Irrigation state
  const [irrData, setIrrData] = useState({
    crop: "", soil_type: "loam", rainfall: ""
  });
  const [irrResult, setIrrResult] = useState<any>(null);
  
  // Calendar state
  const [calendarData, setCalendarData] = useState({ crop: "" });
  const [calendarResult, setCalendarResult] = useState<any>(null);
  
  // Market prices state
  const [prices, setPrices] = useState<any>(null);
  
  // Chat state
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{role: string, content: string}>>([]);
  
  // Disease detection state
  const [diseaseResult, setDiseaseResult] = useState<any>(null);
  const [uploadedImage, setUploadedImage] = useState<string>("");

  const handleFertilizerCalc = async () => {
    try {
      setLoading(true);
      const response = await api.post("/fertilizer/calculate", {
        N: parseFloat(fertData.N),
        P: parseFloat(fertData.P),
        K: parseFloat(fertData.K),
        area: parseFloat(fertData.area),
        crop: fertData.crop,
      });
      setFertResult(response.data);
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Calculation failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleYieldPredict = async () => {
    try {
      setLoading(true);
      const response = await api.post("/yield/predict", {
        crop: yieldData.crop,
        area: parseFloat(yieldData.area),
        soil_quality: yieldData.soil_quality,
        N: parseFloat(yieldData.N),
        P: parseFloat(yieldData.P),
        K: parseFloat(yieldData.K),
      });
      setYieldResult(response.data);
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Prediction failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleIrrigationSchedule = async () => {
    try {
      setLoading(true);
      const response = await api.post("/irrigation/schedule", {
        crop: irrData.crop,
        soil_type: irrData.soil_type,
        rainfall: parseFloat(irrData.rainfall),
      });
      setIrrResult(response.data);
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGetCalendar = async () => {
    try {
      setLoading(true);
      setCalendarResult(null); // Clear previous results
      const response = await api.post("/calendar", { crop: calendarData.crop });
      
      // Check for error in response
      if (response.data?.error) {
        toast({ 
          title: "Calendar Error", 
          description: response.data.error + (response.data.available_crops ? `. Available: ${response.data.available_crops.join(', ')}` : ''),
          variant: "destructive" 
        });
        if (response.data.available_crops) {
          // Still show available crops
          setCalendarResult({ calendars: {} });
        }
      } else {
        setCalendarResult(response.data);
      }
    } catch (e: any) {
      const errorMsg = e?.response?.data?.error || e?.message || "Failed to fetch calendar";
      toast({ title: "Error", description: errorMsg, variant: "destructive" });
      setCalendarResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGetPrices = async () => {
    try {
      setLoading(true);
      const response = await api.get("/market/prices");
      setPrices(response.data);
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async () => {
    if (!chatMessage.trim()) return;
    const userMsg = chatMessage;
    setChatMessage("");
    setChatHistory(prev => [...prev, { role: "user", content: userMsg }]);
    
    try {
      setLoading(true);
      const response = await api.post("/chat", { message: userMsg });
      const error = response.data?.error;
      if (error) {
        setChatHistory(prev => [...prev, { 
          role: "assistant", 
          content: `Error: ${error}. ${response.data?.quota_error ? 'Please wait a few minutes and try again.' : ''}` 
        }]);
      } else {
        setChatHistory(prev => [...prev, { role: "assistant", content: response.data.response || "I couldn't generate a response." }]);
      }
    } catch (e: any) {
      const errorMsg = e?.response?.data?.error || e?.message || "Sorry, I couldn't process your request.";
      setChatHistory(prev => [...prev, { role: "assistant", content: `Error: ${errorMsg}` }]);
      toast({
        title: "Chat Error",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDiseaseDetection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setUploadedImage(base64);
      try {
        setLoading(true);
        setDiseaseResult(null);
        const response = await api.post("/disease/detect", { image: base64 });
        setDiseaseResult(response.data);
        toast({
          title: "Analysis Complete",
          description: response.data.disease || response.data.analysis || "Disease detection completed",
        });
      } catch (err: any) {
        toast({ title: "Error", description: err?.message || "Detection failed", variant: "destructive" });
        setDiseaseResult(null);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const tabs = [
    { id: "fertilizer", label: "Fertilizer Calculator", icon: Calculator },
    { id: "yield", label: "Yield Predictor", icon: TrendingUp },
    { id: "irrigation", label: "Irrigation Schedule", icon: Droplets },
    { id: "calendar", label: "Planting Calendar", icon: Calendar },
    { id: "prices", label: "Market Prices", icon: DollarSign },
    { id: "chat", label: "AI Assistant", icon: Brain },
    { id: "disease", label: "Disease Detection", icon: ImageIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-accent/5 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={() => navigate("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <GoogleTranslateButton />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            Agricultural Tools Dashboard
          </h1>
          <p className="text-xl text-muted-foreground">
            Comprehensive farming tools and calculators
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-border/20 pb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                onClick={() => setActiveTab(tab.id)}
                className="gap-2"
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* Fertilizer Calculator */}
        {activeTab === "fertilizer" && (
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Calculator className="h-6 w-6 text-primary" />
              Fertilizer Calculator
            </h2>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label>Current N (kg/ha)</Label>
                <Input type="number" value={fertData.N} onChange={(e) => setFertData({...fertData, N: e.target.value})} />
              </div>
              <div>
                <Label>Current P (kg/ha)</Label>
                <Input type="number" value={fertData.P} onChange={(e) => setFertData({...fertData, P: e.target.value})} />
              </div>
              <div>
                <Label>Current K (kg/ha)</Label>
                <Input type="number" value={fertData.K} onChange={(e) => setFertData({...fertData, K: e.target.value})} />
              </div>
              <div>
                <Label>Area (hectares)</Label>
                <Input type="number" value={fertData.area} onChange={(e) => setFertData({...fertData, area: e.target.value})} />
              </div>
              <div>
                <Label>Crop</Label>
                <Input value={fertData.crop} onChange={(e) => setFertData({...fertData, crop: e.target.value})} placeholder="rice, wheat, corn..." />
              </div>
            </div>
            <Button onClick={handleFertilizerCalc} disabled={loading} className="w-full">
              Calculate
            </Button>
            {fertResult && (
              <div className="mt-8 space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Fertilizer Requirements</h3>
                  <Badge variant="outline" className="text-sm">
                    {fertResult.area_hectares} hectares
                  </Badge>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <Calculator className="h-6 w-6 text-white" />
                      </div>
                      <Badge className="bg-blue-600">Urea</Badge>
                    </div>
                    <div className="text-4xl font-bold text-blue-700 mb-2">
                      {fertResult.requirements_kg?.urea?.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">kilograms</div>
                  </Card>
                  
                  <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <Calculator className="h-6 w-6 text-white" />
                      </div>
                      <Badge className="bg-green-600">DAP</Badge>
                    </div>
                    <div className="text-4xl font-bold text-green-700 mb-2">
                      {fertResult.requirements_kg?.dap?.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">kilograms</div>
                  </Card>
                  
                  <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                        <Calculator className="h-6 w-6 text-white" />
                      </div>
                      <Badge className="bg-purple-600">Potash</Badge>
                    </div>
                    <div className="text-4xl font-bold text-purple-700 mb-2">
                      {fertResult.requirements_kg?.muriate_potash?.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">kilograms</div>
                  </Card>
                </div>
                
                {/* NPK Analysis */}
                <Card className="p-6 bg-muted/30 border border-border/20">
                  <h4 className="font-semibold mb-4">NPK Analysis</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Current N</div>
                      <div className="text-lg font-bold">{fertResult.current_npk?.N}</div>
                      <div className="text-xs text-muted-foreground">Target: {fertResult.target_npk?.N}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Current P</div>
                      <div className="text-lg font-bold">{fertResult.current_npk?.P}</div>
                      <div className="text-xs text-muted-foreground">Target: {fertResult.target_npk?.P}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Current K</div>
                      <div className="text-lg font-bold">{fertResult.current_npk?.K}</div>
                      <div className="text-xs text-muted-foreground">Target: {fertResult.target_npk?.K}</div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </Card>
        )}

        {/* Yield Predictor */}
        {activeTab === "yield" && (
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Yield Predictor</h2>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label>Crop</Label>
                <Input value={yieldData.crop} onChange={(e) => setYieldData({...yieldData, crop: e.target.value})} />
              </div>
              <div>
                <Label>Area (hectares)</Label>
                <Input type="number" value={yieldData.area} onChange={(e) => setYieldData({...yieldData, area: e.target.value})} />
              </div>
              <div>
                <Label>Soil Quality</Label>
                <select value={yieldData.soil_quality} onChange={(e) => setYieldData({...yieldData, soil_quality: e.target.value})} className="w-full p-2 border rounded">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <Button onClick={handleYieldPredict} disabled={loading}>Predict Yield</Button>
            {yieldResult && (
              <div className="mt-8 space-y-6">
                <Card className="p-8 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-green-200 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Predicted Yield</div>
                      <div className="text-5xl font-bold text-green-700 mb-2">
                        {yieldResult.predicted_yield_tonnes?.toFixed(2)}
                      </div>
                      <div className="text-2xl text-green-600 font-semibold">tonnes</div>
                    </div>
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <TrendingUp className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4 pt-6 border-t border-green-200">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-1">Per Hectare</div>
                      <div className="text-2xl font-bold text-green-700">
                        {yieldResult.yield_per_hectare?.toFixed(2)} t/ha
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-1">Area</div>
                      <div className="text-2xl font-bold text-green-700">
                        {yieldResult.area_hectares} ha
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-1">Confidence</div>
                      <div className="text-2xl font-bold text-green-700">
                        {yieldResult.confidence}%
                      </div>
                    </div>
                  </div>
                </Card>
                
                {/* Factors */}
                {yieldResult.factors && (
                  <Card className="p-6 bg-muted/30 border border-border/20">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Info className="h-5 w-5 text-primary" />
                      Factors Affecting Yield
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded">
                        <span className="text-sm font-medium">Soil Quality</span>
                        <Badge variant="outline" className="capitalize">
                          {yieldResult.factors.soil_quality}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded">
                        <span className="text-sm font-medium">NPK Adjustment</span>
                        <Badge variant="outline">
                          {yieldResult.factors.npk_adjustment}%
                        </Badge>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </Card>
        )}

        {/* Irrigation Schedule */}
        {activeTab === "irrigation" && (
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Irrigation Schedule</h2>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <Label>Crop</Label>
                <Input value={irrData.crop} onChange={(e) => setIrrData({...irrData, crop: e.target.value})} />
              </div>
              <div>
                <Label>Soil Type</Label>
                <select value={irrData.soil_type} onChange={(e) => setIrrData({...irrData, soil_type: e.target.value})} className="w-full p-2 border rounded">
                  <option value="sandy">Sandy</option>
                  <option value="loam">Loam</option>
                  <option value="clay">Clay</option>
                </select>
              </div>
              <div>
                <Label>Rainfall (mm)</Label>
                <Input type="number" value={irrData.rainfall} onChange={(e) => setIrrData({...irrData, rainfall: e.target.value})} />
              </div>
            </div>
            <Button onClick={handleIrrigationSchedule} disabled={loading}>Get Schedule</Button>
            {irrResult && (
              <div className="mt-8 space-y-6">
                <Card className="p-8 bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 border-blue-200 shadow-xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <Droplets className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-blue-700">Irrigation Schedule</h3>
                      <p className="text-sm text-muted-foreground">Optimal watering plan for your crop</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <Card className="p-6 bg-white border-blue-100 shadow-md">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-sm text-muted-foreground">Frequency</div>
                        <Badge className="bg-blue-600">Every {irrResult.schedule?.frequency_days} days</Badge>
                      </div>
                      <div className="text-4xl font-bold text-blue-700 mb-2">
                        {irrResult.schedule?.frequency_days}
                      </div>
                      <div className="text-sm text-muted-foreground">days between watering</div>
                    </Card>
                    
                    <Card className="p-6 bg-white border-blue-100 shadow-md">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-sm text-muted-foreground">Amount</div>
                        <Badge className="bg-blue-600">{irrResult.schedule?.amount_mm} mm</Badge>
                      </div>
                      <div className="text-4xl font-bold text-blue-700 mb-2">
                        {irrResult.schedule?.amount_mm}
                      </div>
                      <div className="text-sm text-muted-foreground">millimeters per session</div>
                    </Card>
                  </div>
                  
                  {/* Adjustments */}
                  {irrResult.adjustments && (
                    <div className="pt-6 border-t border-blue-200">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Info className="h-5 w-5 text-blue-600" />
                        Adjustments Applied
                      </h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="p-3 bg-white rounded border border-blue-100">
                          <div className="text-sm text-muted-foreground">Soil Type</div>
                          <div className="font-semibold capitalize">{irrResult.adjustments.soil_type}</div>
                        </div>
                        <div className="p-3 bg-white rounded border border-blue-100">
                          <div className="text-sm text-muted-foreground">Rainfall Impact</div>
                          <div className="font-semibold capitalize">{irrResult.adjustments.rainfall_impact}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Stage Adjustments */}
                  {irrResult.schedule?.stages && Object.keys(irrResult.schedule.stages).length > 0 && (
                    <div className="mt-6 pt-6 border-t border-blue-200">
                      <h4 className="font-semibold mb-4">Stage-Specific Schedule</h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        {Object.entries(irrResult.schedule.stages).map(([stage, data]: [string, any]) => (
                          <Card key={stage} className="p-4 bg-white border border-blue-100">
                            <div className="font-semibold capitalize mb-2">{stage.replace(/_/g, ' ')}</div>
                            <div className="text-sm text-muted-foreground">
                              Every {data.frequency_days} days, {data.amount_mm} mm
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            )}
          </Card>
        )}

        {/* Calendar */}
        {activeTab === "calendar" && (
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Planting Calendar</h2>
            <div className="mb-4">
              <Label>Crop (leave empty to see all calendars)</Label>
              <Input 
                value={calendarData.crop} 
                onChange={(e) => setCalendarData({crop: e.target.value})}
                placeholder="e.g., rice, wheat, corn"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleGetCalendar} disabled={loading}>
                {calendarData.crop ? `Get ${calendarData.crop} Calendar` : "Get All Calendars"}
              </Button>
            </div>
            {calendarResult && (
              <div className="mt-6 space-y-6">
                {(() => {
                  // Handle both single crop response and all calendars response
                  let calendarsToDisplay: any = {};
                  
                  if (calendarResult.calendars) {
                    calendarsToDisplay = calendarResult.calendars;
                  } else {
                    const cropName = calendarData.crop.toLowerCase();
                    if (calendarResult[cropName]) {
                      calendarsToDisplay[cropName] = calendarResult[cropName];
                    } else {
                      const cropKeys = Object.keys(calendarResult).filter(k => k !== "error");
                      if (cropKeys.length > 0) {
                        calendarsToDisplay[cropKeys[0]] = calendarResult[cropKeys[0]];
                      }
                    }
                  }
                  
                  if (Object.keys(calendarsToDisplay).length === 0) {
                    return (
                      <div className="p-4 bg-muted/30 rounded text-center">
                        <p className="text-muted-foreground">
                          No calendar data found for "{calendarData.crop}". Try: rice, wheat, corn
                        </p>
                      </div>
                    );
                  }
                  
                  const parseMonthRange = (range: string) => {
                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    const parts = range.split('-');
                    if (parts.length === 2) {
                      const startMonth = months.findIndex(m => m.toLowerCase().startsWith(parts[0].toLowerCase().substring(0, 3)));
                      const endMonth = months.findIndex(m => m.toLowerCase().startsWith(parts[1].toLowerCase().substring(0, 3)));
                      return { start: startMonth >= 0 ? startMonth : 0, end: endMonth >= 0 ? endMonth : 11 };
                    }
                    const singleMonth = months.findIndex(m => m.toLowerCase().startsWith(range.toLowerCase().substring(0, 3)));
                    return { start: singleMonth >= 0 ? singleMonth : 0, end: singleMonth >= 0 ? singleMonth : 0 };
                  };
                  
                  const getMonthNames = () => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  
                  return Object.entries(calendarsToDisplay).map(([crop, data]: [string, any]) => {
                    const plantingRanges = Array.isArray(data.planting) ? data.planting : [data.planting];
                    const harvestingRanges = Array.isArray(data.harvesting) ? data.harvesting : [data.harvesting];
                    const months = getMonthNames();
                    const activePlanting = new Set<number>();
                    const activeHarvesting = new Set<number>();
                    
                    plantingRanges.forEach((range: string) => {
                      if (range) {
                        const parsed = parseMonthRange(range);
                        for (let i = parsed.start; i <= parsed.end; i++) {
                          activePlanting.add(i);
                        }
                      }
                    });
                    
                    harvestingRanges.forEach((range: string) => {
                      if (range) {
                        const parsed = parseMonthRange(range);
                        for (let i = parsed.start; i <= parsed.end; i++) {
                          activeHarvesting.add(i);
                        }
                      }
                    });
                    
                    return (
                      <div key={crop} className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border border-primary/20 shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <div className="font-bold capitalize text-2xl mb-2">{crop}</div>
                            <div className="text-sm text-muted-foreground">
                              <span className="font-semibold">Season:</span> {data.season || "N/A"} • 
                              <span className="font-semibold ml-2">Duration:</span> {data.duration_days || "N/A"} days
                            </div>
                          </div>
                        </div>
                        
                        {/* Visual Calendar */}
                        <div className="grid grid-cols-12 gap-2 mb-6">
                          {months.map((month, idx) => {
                            const isPlanting = activePlanting.has(idx);
                            const isHarvesting = activeHarvesting.has(idx);
                            let bgClass = "bg-muted/30";
                            let textClass = "text-muted-foreground";
                            let label = "";
                            
                            if (isPlanting && isHarvesting) {
                              bgClass = "bg-gradient-to-br from-green-400 to-yellow-400";
                              textClass = "text-white font-bold";
                              label = "Both";
                            } else if (isPlanting) {
                              bgClass = "bg-green-500";
                              textClass = "text-white font-bold";
                              label = "Plant";
                            } else if (isHarvesting) {
                              bgClass = "bg-yellow-500";
                              textClass = "text-white font-bold";
                              label = "Harvest";
                            }
                            
                            return (
                              <div key={idx} className={`${bgClass} ${textClass} p-3 rounded-lg text-center border border-border/20 transition-all hover:scale-105`}>
                                <div className="text-xs font-semibold">{month}</div>
                                {label && <div className="text-[10px] mt-1">{label}</div>}
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* Legend and Details */}
                        <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-border/20">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500 rounded"></div>
                            <span className="text-sm font-semibold">Planting Period</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                            <span className="text-sm font-semibold">Harvesting Period</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-yellow-400 rounded"></div>
                            <span className="text-sm font-semibold">Overlapping</span>
                          </div>
                        </div>
                        
                        {/* Text Details */}
                        <div className="mt-4 pt-4 border-t border-border/20 grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-semibold text-green-700">Planting:</span>
                            <div className="text-muted-foreground mt-1">
                              {Array.isArray(data.planting) ? data.planting.join(", ") : data.planting || "N/A"}
                            </div>
                          </div>
                          <div>
                            <span className="font-semibold text-yellow-700">Harvesting:</span>
                            <div className="text-muted-foreground mt-1">
                              {Array.isArray(data.harvesting) ? data.harvesting.join(", ") : data.harvesting || "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </Card>
        )}

        {/* Market Prices */}
        {activeTab === "prices" && (
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Market Prices</h2>
            <Button onClick={handleGetPrices} disabled={loading} className="mb-4">Fetch Prices</Button>
            {prices && (
              <div className="space-y-6">
                {prices.last_updated && (
                  <div className="text-sm text-muted-foreground text-center">
                    Last updated: {new Date(prices.last_updated).toLocaleString()}
                  </div>
                )}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(prices.prices || {}).map(([crop, data]: [string, any]) => {
                    const trendColor = data.trend === "up" ? "from-green-500 to-emerald-500" : 
                                      data.trend === "down" ? "from-red-500 to-orange-500" : 
                                      "from-gray-500 to-slate-500";
                    const borderColor = data.trend === "up" ? "border-green-200" : 
                                       data.trend === "down" ? "border-red-200" : 
                                       "border-gray-200";
                    
                    return (
                      <Card key={crop} className={`p-6 bg-gradient-to-br ${trendColor} border-2 ${borderColor} shadow-lg hover:shadow-xl transition-all hover:scale-105`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <DollarSign className="h-6 w-6 text-white" />
                          </div>
                          <Badge className={`bg-white/30 text-white border-white/50 ${data.trend === "up" ? "hover:bg-green-600" : data.trend === "down" ? "hover:bg-red-600" : ""}`}>
                            {data.trend}
                          </Badge>
                        </div>
                        <div className="text-white mb-2">
                          <div className="text-sm font-medium opacity-90 mb-1 capitalize">{crop}</div>
                          <div className="text-4xl font-bold mb-2">
                            ${data.price_per_ton}
                          </div>
                          <div className="text-sm opacity-90">per ton</div>
                        </div>
                        <div className="pt-4 mt-4 border-t border-white/30">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-white/90">Change</span>
                            <span className={`text-lg font-bold ${data.change > 0 ? "text-green-200" : data.change < 0 ? "text-red-200" : "text-white"}`}>
                              {data.change > 0 ? "+" : ""}{data.change}%
                            </span>
                          </div>
                          <div className="text-xs text-white/70 mt-1">{data.currency}</div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* AI Chat */}
        {activeTab === "chat" && (
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">AI Agricultural Assistant</h2>
                <p className="text-sm text-muted-foreground">Ask me anything about farming!</p>
              </div>
            </div>
            
            <div className="h-96 overflow-y-auto border-2 border-primary/20 rounded-lg p-4 mb-4 bg-gradient-to-b from-muted/50 to-background">
              {chatHistory.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageCircle className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground text-lg">Start a conversation!</p>
                  <p className="text-sm text-muted-foreground mt-2">Ask about crops, soil, farming techniques...</p>
                </div>
              )}
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`mb-4 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-3 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === "user" 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {msg.role === "user" ? "You" : "AI"}
                    </div>
                    <div className={`p-4 rounded-2xl shadow-md ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-primary to-accent text-primary-foreground"
                        : "bg-card border border-border"
                    }`}>
                      <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !loading && handleChat()}
                placeholder="Ask about crops, soil, farming techniques..."
                className="h-12 text-base"
                disabled={loading}
              />
              <Button 
                onClick={handleChat} 
                disabled={loading || !chatMessage.trim()}
                className="h-12 px-6 bg-gradient-to-r from-primary to-accent hover:shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Thinking...
                  </>
                ) : (
                  <>
                    Send
                    <MessageCircle className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* Disease Detection */}
        {activeTab === "disease" && (
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <ImageIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Crop Disease Detection</h2>
                <p className="text-sm text-muted-foreground">AI-powered disease and pest identification</p>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Upload Section */}
              <div className="text-center p-8 border-2 border-dashed border-primary/30 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 hover:border-primary/50 transition-all">
                {uploadedImage ? (
                  <div className="space-y-4">
                    <img src={uploadedImage} alt="Uploaded crop" className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg border-2 border-primary/20" />
                    <Button
                      variant="outline"
                      onClick={() => {
                        setUploadedImage("");
                        setDiseaseResult(null);
                        const input = document.getElementById("disease-image") as HTMLInputElement;
                        if (input) input.value = "";
                      }}
                    >
                      Upload New Image
                    </Button>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="h-16 w-16 mx-auto mb-4 text-primary opacity-50" />
                    <Label htmlFor="disease-image" className="cursor-pointer">
                      <Input
                        id="disease-image"
                        type="file"
                        accept="image/*"
                        onChange={handleDiseaseDetection}
                        className="hidden"
                      />
                      <Button 
                        variant="outline" 
                        size="lg"
                        className="bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg"
                      >
                        Upload Crop Image
                      </Button>
                    </Label>
                    <p className="text-sm text-muted-foreground mt-4">
                      Upload an image of your crop to detect diseases or pests
                    </p>
                  </>
                )}
              </div>
              
              {/* Results */}
              {loading && (
                <Card className="p-8 text-center">
                  <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-muted-foreground">Analyzing image...</p>
                </Card>
              )}
              
              {diseaseResult && !loading && (
                <div className="space-y-4">
                  <Card className={`p-6 ${
                    diseaseResult.disease 
                      ? "bg-gradient-to-br from-red-50 to-orange-50 border-red-200" 
                      : "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
                  } shadow-xl`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${
                        diseaseResult.disease ? "bg-red-500" : "bg-green-500"
                      }`}>
                        {diseaseResult.disease ? (
                          <span className="text-2xl">⚠️</span>
                        ) : (
                          <span className="text-2xl">✓</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">
                          {diseaseResult.disease || "Healthy Plant"}
                        </h3>
                        {diseaseResult.confidence && (
                          <Badge variant="outline" className="mt-2">
                            Confidence: {diseaseResult.confidence}%
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {diseaseResult.severity && (
                      <div className="mb-4">
                        <div className="text-sm text-muted-foreground mb-2">Severity</div>
                        <Badge className={`${
                          diseaseResult.severity.toLowerCase().includes("high") ? "bg-red-600" :
                          diseaseResult.severity.toLowerCase().includes("medium") ? "bg-yellow-600" :
                          "bg-green-600"
                        }`}>
                          {diseaseResult.severity}
                        </Badge>
                      </div>
                    )}
                    
                    {diseaseResult.symptoms && Array.isArray(diseaseResult.symptoms) && diseaseResult.symptoms.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">Symptoms</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {diseaseResult.symptoms.map((symptom: string, idx: number) => (
                            <li key={idx} className="text-sm">{symptom}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {diseaseResult.treatment && (
                      <div className="mb-4 p-4 bg-white rounded border border-primary/20">
                        <h4 className="font-semibold mb-2 text-green-700">Recommended Treatment</h4>
                        <p className="text-sm">{diseaseResult.treatment}</p>
                      </div>
                    )}
                    
                    {diseaseResult.prevention && (
                      <div className="p-4 bg-white rounded border border-primary/20">
                        <h4 className="font-semibold mb-2 text-blue-700">Prevention Tips</h4>
                        <p className="text-sm">{diseaseResult.prevention}</p>
                      </div>
                    )}
                    
                    {diseaseResult.analysis && diseaseResult.raw && (
                      <div className="mt-4 p-4 bg-white rounded border border-primary/20">
                        <h4 className="font-semibold mb-2">Analysis</h4>
                        <p className="text-sm whitespace-pre-wrap">{diseaseResult.analysis}</p>
                      </div>
                    )}
                  </Card>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

