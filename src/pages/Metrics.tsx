
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Download, ChartBar, ArrowUp, ArrowDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Sample data for demo
const sampleCampaignData = [
  {
    id: "1",
    name: "Campanha de Leads - E-commerce",
    metrics: {
      daily: [
        { date: "01/05", impressions: 1250, clicks: 85, conversions: 12, ctr: 6.8, cpc: 1.35 },
        { date: "02/05", impressions: 1300, clicks: 92, conversions: 15, ctr: 7.1, cpc: 1.32 },
        { date: "03/05", impressions: 1450, clicks: 110, conversions: 18, ctr: 7.6, cpc: 1.28 },
        { date: "04/05", impressions: 1520, clicks: 105, conversions: 14, ctr: 6.9, cpc: 1.40 },
        { date: "05/05", impressions: 1680, clicks: 128, conversions: 20, ctr: 7.6, cpc: 1.25 },
        { date: "06/05", impressions: 1720, clicks: 135, conversions: 22, ctr: 7.8, cpc: 1.20 },
        { date: "07/05", impressions: 1620, clicks: 112, conversions: 19, ctr: 6.9, cpc: 1.30 }
      ],
      creatives: [
        { id: "c1", name: "Criativo 1", impressions: 5200, clicks: 380, conversions: 48, ctr: 7.3, cpc: 1.25 },
        { id: "c2", name: "Criativo 2", impressions: 4800, clicks: 345, conversions: 42, ctr: 7.2, cpc: 1.30 },
        { id: "c3", name: "Criativo 3", impressions: 2540, clicks: 112, conversions: 18, ctr: 4.4, cpc: 1.75 }
      ]
    }
  },
  {
    id: "2",
    name: "Brand Awareness - Novo Produto",
    metrics: {
      daily: [
        { date: "01/05", impressions: 3800, clicks: 210, conversions: 0, ctr: 5.5, cpc: 0.85 },
        { date: "02/05", impressions: 4200, clicks: 240, conversions: 0, ctr: 5.7, cpc: 0.82 },
        { date: "03/05", impressions: 4500, clicks: 280, conversions: 0, ctr: 6.2, cpc: 0.80 },
        { date: "04/05", impressions: 5800, clicks: 350, conversions: 0, ctr: 6.0, cpc: 0.78 },
        { date: "05/05", impressions: 6200, clicks: 380, conversions: 0, ctr: 6.1, cpc: 0.79 },
        { date: "06/05", impressions: 10800, clicks: 520, conversions: 0, ctr: 4.8, cpc: 0.65 },
        { date: "07/05", impressions: 10020, clicks: 485, conversions: 0, ctr: 4.8, cpc: 0.70 }
      ],
      creatives: [
        { id: "c4", name: "Criativo 1", impressions: 25000, clicks: 1250, conversions: 0, ctr: 5.0, cpc: 0.75 },
        { id: "c5", name: "Criativo 2", impressions: 20320, clicks: 1180, conversions: 0, ctr: 5.8, cpc: 0.72 }
      ]
    }
  },
];

// AI insights for campaigns
const aiInsights = {
  "1": [
    "O Criativo 1 tem o melhor desempenho geral, com CTR de 7.3% e menor CPC.",
    "Há um padrão de aumento de engajamento aos fins de semana, considere aumentar o orçamento nesses dias.",
    "O crescimento de conversões é consistente, mostrando boa recepção do produto pelo público-alvo."
  ],
  "2": [
    "A campanha teve um salto significativo de impressões nos dias 06/05 e 07/05, indicando maior alcance.",
    "O Criativo 2 apresenta melhor CTR (5.8%), sugiro focar nesse formato criativo.",
    "O CPC está diminuindo ao longo do tempo, mostrando melhoria na eficiência da campanha."
  ]
};

const Metrics = () => {
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [campaignData, setCampaignData] = useState<any>(null);
  const { user } = useAuth();
  
  useEffect(() => {
    // In a real implementation, we would fetch from the database
    // For now, using sample data
    setCampaigns(sampleCampaignData);
    
    if (sampleCampaignData.length > 0 && !selectedCampaign) {
      setSelectedCampaign(sampleCampaignData[0].id);
      setCampaignData(sampleCampaignData[0]);
    }
  }, []);
  
  useEffect(() => {
    if (selectedCampaign) {
      const data = sampleCampaignData.find(c => c.id === selectedCampaign);
      setCampaignData(data);
    }
  }, [selectedCampaign]);

  const handleExportData = () => {
    if (!campaignData) return;
    
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Impressions,Clicks,Conversions,CTR,CPC\n";
    
    campaignData.metrics.daily.forEach((row: any) => {
      csvContent += `${row.date},${row.impressions},${row.clicks},${row.conversions},${row.ctr},${row.cpc}\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `campaign-${campaignData.name}-metrics.csv`);
    document.body.appendChild(link);
    
    // Trigger download and cleanup
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Métricas de Campanha</h1>
        <p className="text-muted-foreground mt-2">
          Analise o desempenho das suas campanhas e criativos com dados detalhados e insights de IA.
        </p>
      </header>
      
      <div className="flex flex-col lg:flex-row gap-4 items-start mb-8">
        <div className="w-full lg:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Selecione a Campanha</CardTitle>
              <CardDescription>
                Escolha uma campanha para visualizar seus dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione uma campanha" />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map(campaign => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
        
        <div className="w-full lg:w-2/3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Exportar Dados</CardTitle>
                <CardDescription>
                  Baixe os dados para análise externa
                </CardDescription>
              </div>
              <Button variant="outline" onClick={handleExportData} disabled={!campaignData}>
                <Download className="mr-2 h-4 w-4" /> Exportar CSV
              </Button>
            </CardHeader>
          </Card>
        </div>
      </div>
      
      {campaignData && (
        <div className="space-y-6">
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="daily">Dados Diários</TabsTrigger>
              <TabsTrigger value="creatives">Criativos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              {/* KPI Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total de Impressões</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {campaignData.metrics.daily.reduce((sum: number, day: any) => sum + day.impressions, 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-green-600 flex items-center mt-1">
                      <ArrowUp className="h-3 w-3 mr-1" /> +15% vs período anterior
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total de Cliques</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {campaignData.metrics.daily.reduce((sum: number, day: any) => sum + day.clicks, 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-green-600 flex items-center mt-1">
                      <ArrowUp className="h-3 w-3 mr-1" /> +8.5% vs período anterior
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Conversões</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {campaignData.metrics.daily.reduce((sum: number, day: any) => sum + day.conversions, 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-green-600 flex items-center mt-1">
                      <ArrowUp className="h-3 w-3 mr-1" /> +12% vs período anterior
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>CTR Médio</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(campaignData.metrics.daily.reduce((sum: number, day: any) => sum + day.ctr, 0) / campaignData.metrics.daily.length).toFixed(1)}%
                    </div>
                    <div className="text-xs text-red-600 flex items-center mt-1">
                      <ArrowDown className="h-3 w-3 mr-1" /> -0.5% vs período anterior
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Desempenho da Campanha</CardTitle>
                  <CardDescription>Visão geral dos últimos 7 dias</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ChartContainer
                      config={{
                        impressions: { label: "Impressões", color: "#94a3b8" },
                        clicks: { label: "Cliques", color: "#2563eb" },
                        conversions: { label: "Conversões", color: "#16a34a" }
                      }}
                    >
                      <LineChart data={campaignData.metrics.daily}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="impressions" stroke="#94a3b8" name="Impressões" />
                        <Line yAxisId="left" type="monotone" dataKey="clicks" stroke="#2563eb" name="Cliques" />
                        <Line yAxisId="right" type="monotone" dataKey="conversions" stroke="#16a34a" name="Conversões" />
                      </LineChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              {/* AI Insights */}
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChartBar className="h-5 w-5 text-primary" />
                    Insights de IA
                  </CardTitle>
                  <CardDescription>
                    Análises e recomendações geradas por IA com base nos dados da campanha
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {aiInsights[campaignData.id as keyof typeof aiInsights]?.map((insight, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="daily" className="space-y-6">
              {/* Daily Data */}
              <Card>
                <CardHeader>
                  <CardTitle>Dados Diários</CardTitle>
                  <CardDescription>Métricas detalhadas por dia</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-muted">
                      <thead className="bg-muted/30">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Data</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Impressões</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Cliques</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Conversões</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">CTR</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">CPC</th>
                        </tr>
                      </thead>
                      <tbody className="bg-background divide-y divide-muted">
                        {campaignData.metrics.daily.map((day: any, idx: number) => (
                          <tr key={idx}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{day.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{day.impressions.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{day.clicks.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{day.conversions.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{day.ctr}%</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">R$ {day.cpc.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="creatives" className="space-y-6">
              {/* Creative Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Desempenho por Criativo</CardTitle>
                  <CardDescription>Compare a eficácia dos diferentes criativos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] mb-8">
                    <ChartContainer
                      config={{
                        impressions: { label: "Impressões", color: "#94a3b8" },
                        clicks: { label: "Cliques", color: "#2563eb" },
                        conversions: { label: "Conversões", color: "#16a34a" }
                      }}
                    >
                      <BarChart data={campaignData.metrics.creatives}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="impressions" fill="#94a3b8" name="Impressões" />
                        <Bar dataKey="clicks" fill="#2563eb" name="Cliques" />
                        <Bar dataKey="conversions" fill="#16a34a" name="Conversões" />
                      </BarChart>
                    </ChartContainer>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-muted">
                      <thead className="bg-muted/30">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Criativo</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Impressões</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Cliques</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Conversões</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">CTR</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">CPC</th>
                        </tr>
                      </thead>
                      <tbody className="bg-background divide-y divide-muted">
                        {campaignData.metrics.creatives.map((creative: any, idx: number) => (
                          <tr key={idx} className={idx === 0 ? "bg-green-50 dark:bg-green-950/10" : ""}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {creative.name} 
                              {idx === 0 && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded dark:bg-green-900 dark:text-green-200">Melhor desempenho</span>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{creative.impressions.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{creative.clicks.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{creative.conversions.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{creative.ctr}%</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">R$ {creative.cpc.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default Metrics;
