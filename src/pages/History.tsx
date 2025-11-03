import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { GoogleTranslateButton } from "@/components/GoogleTranslate";
import { 
  ArrowLeft, 
  History as HistoryIcon,
  TrendingUp,
  Calendar,
  Leaf
} from "lucide-react";

interface HistoryEntry {
  id: number;
  timestamp: string;
  input: {
    N: number;
    P: number;
    K: number;
    temperature: number;
    humidity: number;
    ph: number;
    rainfall: number;
  };
  prediction: string;
  confidence: number;
}

const History = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/history?limit=50');
      setHistory(response.data.history || []);
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleString();
  };

  const getCropStats = () => {
    const cropCounts: { [key: string]: number } = {};
    history.forEach(entry => {
      const crop = entry.prediction.toLowerCase();
      cropCounts[crop] = (cropCounts[crop] || 0) + 1;
    });
    return Object.entries(cropCounts)
      .map(([crop, count]) => ({ crop, count }))
      .sort((a, b) => b.count - a.count);
  };

  const stats = getCropStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-accent/5 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full mb-4">
              <HistoryIcon className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
              Prediction History
            </h1>
            <p className="text-xl text-muted-foreground">
              View your past crop recommendations and statistics
            </p>
          </div>
        </div>

        {/* Statistics */}
        {stats.length > 0 && (
          <Card className="p-6 mb-8 border-0 bg-card/50 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              Most Recommended Crops
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.slice(0, 8).map((stat, idx) => (
                <div key={idx} className="text-center p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="text-3xl font-bold text-primary capitalize">{stat.crop}</div>
                  <div className="text-sm text-muted-foreground">{stat.count} {stat.count === 1 ? 'time' : 'times'}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* History List */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Loading history...</p>
          </div>
        )}

        {error && (
          <Card className="p-6 mb-8 border-red-200 bg-red-50">
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchHistory} variant="outline" className="mt-4">
              Retry
            </Button>
          </Card>
        )}

        {!loading && !error && history.length === 0 && (
          <Card className="p-12 text-center border-0 bg-card/50 backdrop-blur-sm">
            <HistoryIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">No History Yet</h3>
            <p className="text-muted-foreground mb-6">
              Start making predictions to see your history here
            </p>
            <Button onClick={() => navigate('/form')} className="bg-gradient-to-r from-primary to-accent">
              Make a Prediction
            </Button>
          </Card>
        )}

        {!loading && !error && history.length > 0 && (
          <div className="space-y-4">
            {history.map((entry) => (
              <Card key={entry.id} className="p-6 border-0 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-shadow">
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{formatDate(entry.timestamp)}</span>
                    </div>
                    <Badge variant="outline" className="mb-2">
                      {entry.confidence}% Confidence
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Leaf className="h-5 w-5 text-primary" />
                      <span className="text-2xl font-bold capitalize">{entry.prediction}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <div className="text-muted-foreground">N</div>
                      <div className="font-semibold">{entry.input.N}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">P</div>
                      <div className="font-semibold">{entry.input.P}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">K</div>
                      <div className="font-semibold">{entry.input.K}</div>
                    </div>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <div><span className="text-muted-foreground">Temp:</span> {entry.input.temperature}°C</div>
                    <div><span className="text-muted-foreground">Humidity:</span> {entry.input.humidity}%</div>
                    <div><span className="text-muted-foreground">pH:</span> {entry.input.ph}</div>
                    <div><span className="text-muted-foreground">Rainfall:</span> {entry.input.rainfall}mm</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;

