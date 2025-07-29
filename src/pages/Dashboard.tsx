import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Car, Users, UserCheck, Clock, CheckCircle, DollarSign, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

interface DashboardStats {
  totalClientes: number;
  servicosAndamento: number;
  servicosFinalizados: number;
  faturamentoMensal: number;
}

interface ServicoData {
  tipo_servico: string;
  quantidade: number;
  tempo_medio: number;
  valor_total: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8884d8', '#82ca9d', '#ffc658'];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClientes: 0,
    servicosAndamento: 0,
    servicosFinalizados: 0,
    faturamentoMensal: 0
  });
  const [servicosData, setServicosData] = useState<ServicoData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Buscar estatísticas gerais
      const [clientesResult, servicosAndamentoResult, servicosFinalizadosResult] = await Promise.all([
        supabase.from('clientes').select('id', { count: 'exact' }),
        supabase.from('historico_servicos').select('id', { count: 'exact' }).eq('status', 'andamento'),
        supabase.from('historico_servicos').select('id, valor', { count: 'exact' }).eq('status', 'finalizado')
      ]);

      // Calcular faturamento do mês atual
      const currentMonth = new Date().toISOString().substring(0, 7);
      const { data: faturamentoData } = await supabase
        .from('historico_servicos')
        .select('valor')
        .eq('status', 'finalizado')
        .gte('data_inicio', `${currentMonth}-01`)
        .lt('data_inicio', `${currentMonth}-31`);

      const faturamentoMensal = faturamentoData?.reduce((sum, item) => sum + Number(item.valor), 0) || 0;

      setStats({
        totalClientes: clientesResult.count || 0,
        servicosAndamento: servicosAndamentoResult.count || 0,
        servicosFinalizados: servicosFinalizadosResult.count || 0,
        faturamentoMensal
      });

      // Buscar dados dos serviços para gráficos
      const { data: servicosAnalytics } = await supabase
        .from('historico_servicos')
        .select(`
          valor,
          tempo_real_minutos,
          tipos_servicos (
            nome,
            tempo_medio_minutos
          )
        `)
        .eq('status', 'finalizado');

      if (servicosAnalytics) {
        const groupedData = servicosAnalytics.reduce((acc: any, servico) => {
          const tipoNome = servico.tipos_servicos?.nome || 'Sem tipo';
          if (!acc[tipoNome]) {
            acc[tipoNome] = {
              tipo_servico: tipoNome,
              quantidade: 0,
              tempo_total: 0,
              valor_total: 0,
              tempo_medio_padrao: servico.tipos_servicos?.tempo_medio_minutos || 0
            };
          }
          
          acc[tipoNome].quantidade += 1;
          acc[tipoNome].tempo_total += servico.tempo_real_minutos || 0;
          acc[tipoNome].valor_total += Number(servico.valor);
          
          return acc;
        }, {});

        const chartData = Object.values(groupedData).map((item: any) => ({
          tipo_servico: item.tipo_servico,
          quantidade: item.quantidade,
          tempo_medio: Math.round(item.tempo_total / item.quantidade) || item.tempo_medio_padrao,
          valor_total: item.valor_total
        }));

        setServicosData(chartData as ServicoData[]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do seu lava jato</p>
        </div>
        <Link to="/servicos">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Serviço
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClientes}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.servicosAndamento}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Finalizados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.servicosFinalizados}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Mensal</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.faturamentoMensal)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="demanda" className="space-y-4">
        <TabsList>
          <TabsTrigger value="demanda">Análise de Demanda</TabsTrigger>
          <TabsTrigger value="faturamento">Faturamento por Serviço</TabsTrigger>
        </TabsList>

        <TabsContent value="demanda" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quantidade de Serviços por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={servicosData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="tipo_servico" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="quantidade" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tempo Médio por Serviço (minutos)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={servicosData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="tipo_servico" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="tempo_medio" fill="hsl(var(--secondary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição dos Tipos de Serviços</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={servicosData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ tipo_servico, percent }) => `${tipo_servico} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="quantidade"
                  >
                    {servicosData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faturamento" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Faturamento por Tipo de Serviço</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={servicosData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="tipo_servico" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={12}
                  />
                  <YAxis tickFormatter={(value) => `R$ ${value}`} />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Faturamento']} />
                  <Bar dataKey="valor_total" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}