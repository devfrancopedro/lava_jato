import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Car, Clock, User, DollarSign, CheckCircle, Play, Filter, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Cliente {
  id: string;
  nome: string;
  modelo_veiculo: string;
}

interface TipoServico {
  id: string;
  nome: string;
  tempo_medio_minutos: number;
  valor_padrao: number;
}

interface Servico {
  id: string;
  cliente_id: string;
  tipo_servico_id: string;
  valor: number;
  data_inicio: string;
  data_fim?: string;
  tempo_real_minutos?: number;
  funcionario_responsavel: string;
  status: "andamento" | "finalizado";
  clientes?: Cliente;
  tipos_servicos?: TipoServico;
}

interface Filtros {
  dataInicio: string;
  dataFim: string;
  tipoServico: string;
  cliente: string;
  modeloVeiculo: string;
  status: string;
}

// Dados específicos para os filtros
const dadosFiltros = {
  tiposServicos: [
    { id: "1", nome: "Lavagem Simples" },
    { id: "2", nome: "Lavagem Completa" },
    { id: "3", nome: "Lavagem Premium" },
    { id: "4", nome: "Enceramento" },
    { id: "5", nome: "Polimento" },
    { id: "6", nome: "Higienização Interna" }
  ],
  clientes: [
    { id: "1", nome: "João Silva", modelo_veiculo: "Honda Civic" },
    { id: "2", nome: "Maria Santos", modelo_veiculo: "Toyota Corolla" },
    { id: "3", nome: "Carlos Oliveira", modelo_veiculo: "Ford Focus" },
    { id: "4", nome: "Ana Costa", modelo_veiculo: "Volkswagen Golf" },
    { id: "5", nome: "Pedro Lima", modelo_veiculo: "Chevrolet Cruze" }
  ],
  modelosVeiculos: [
    "Honda Civic",
    "Toyota Corolla", 
    "Ford Focus",
    "Volkswagen Golf",
    "Chevrolet Cruze",
    "Hyundai HB20",
    "Fiat Argo",
    "Renault Kwid"
  ],
  status: [
    { id: "andamento", nome: "Em Andamento" },
    { id: "finalizado", nome: "Finalizado" }
  ]
};

export default function Servicos() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [tiposServicos, setTiposServicos] = useState<TipoServico[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [filtros, setFiltros] = useState<Filtros>({
    dataInicio: "",
    dataFim: "",
    tipoServico: "",
    cliente: "",
    modeloVeiculo: "",
    status: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const form = useForm({
    defaultValues: {
      cliente_id: "",
      tipo_servico_id: "",
      valor: "",
      funcionarioResponsavel: "",
    },
  });

  const loadData = async () => {
    try {
      const [servicosResult, clientesResult, tiposResult] = await Promise.all([
        supabase
          .from('historico_servicos')
          .select(`
            *,
            clientes (id, nome, modelo_veiculo),
            tipos_servicos (id, nome, tempo_medio_minutos, valor_padrao)
          `)
          .order('data_inicio', { ascending: false }),
        supabase.from('clientes').select('id, nome, modelo_veiculo').order('nome'),
        supabase.from('tipos_servicos').select('*').order('nome')
      ]);

      if (servicosResult.error) throw servicosResult.error;
      if (clientesResult.error) throw clientesResult.error;
      if (tiposResult.error) throw tiposResult.error;

      setServicos((servicosResult.data || []).map(s => ({ ...s, status: s.status as "andamento" | "finalizado" })));
      setClientes(clientesResult.data || []);
      setTiposServicos(tiposResult.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const funcionarios = [
    "Carlos Silva",
    "Ana Santos", 
    "João Costa",
    "Maria Oliveira"
  ];

  const aplicarFiltros = (servicos: Servico[]) => {
    return servicos.filter(servico => {
      try {
        // Filtro por termo de busca
        const matchSearch = !searchTerm || 
          servico.clientes?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          servico.tipos_servicos?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          servico.funcionario_responsavel?.toLowerCase().includes(searchTerm.toLowerCase());

        // Filtro por data
        const dataInicio = new Date(servico.data_inicio);
        const matchDataInicio = !filtros.dataInicio || dataInicio >= new Date(filtros.dataInicio);
        const matchDataFim = !filtros.dataFim || dataInicio <= new Date(filtros.dataFim);

        // Filtro por tipo de serviço
        const matchTipoServico = !filtros.tipoServico || filtros.tipoServico === "all" ||
          servico.tipos_servicos?.id === filtros.tipoServico;

        // Filtro por cliente
        const matchCliente = !filtros.cliente || filtros.cliente === "all" ||
          servico.clientes?.id === filtros.cliente;

        // Filtro por modelo de veículo
        const matchModeloVeiculo = !filtros.modeloVeiculo || filtros.modeloVeiculo === "all" ||
          servico.clientes?.modelo_veiculo?.toLowerCase().includes(filtros.modeloVeiculo.toLowerCase());

        // Filtro por status
        const matchStatus = !filtros.status || filtros.status === "all" ||
          servico.status === filtros.status;

        return matchSearch && matchDataInicio && matchDataFim && matchTipoServico && matchCliente && matchModeloVeiculo && matchStatus;
      } catch (error) {
        console.error('Erro ao aplicar filtro:', error);
        return true; // Se houver erro, mostra o item
      }
    });
  };

  const filteredServicos = aplicarFiltros(servicos);
  const servicosAndamento = filteredServicos.filter(s => s.status === "andamento");
  const servicosFinalizados = filteredServicos.filter(s => s.status === "finalizado");

  const limparFiltros = () => {
    setFiltros({
      dataInicio: "",
      dataFim: "",
      tipoServico: "",
      cliente: "",
      modeloVeiculo: "",
      status: "",
    });
  };

  const temFiltrosAtivos = () => {
    return Object.values(filtros).some(valor => valor !== "");
  };

  const onSubmit = async (data: any) => {
    try {
      const { data: novoServico, error } = await supabase
        .from('historico_servicos')
        .insert([{
          cliente_id: data.cliente_id,
          tipo_servico_id: data.tipo_servico_id,
          valor: parseFloat(data.valor),
          funcionario_responsavel: data.funcionarioResponsavel,
          status: "andamento",
        }])
        .select(`
          *,
          clientes (id, nome, modelo_veiculo),
          tipos_servicos (id, nome, tempo_medio_minutos, valor_padrao)
        `)
        .single();
      
      if (error) throw error;
      
      setServicos([{ ...novoServico, status: novoServico.status as "andamento" | "finalizado" }, ...servicos]);
      setDialogOpen(false);
      form.reset();
      
      toast({
        title: "Serviço criado",
        description: `Serviço para ${novoServico.clientes?.nome} foi iniciado.`,
      });
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o serviço.",
        variant: "destructive",
      });
    }
  };

  const finalizarServico = async (id: string) => {
    try {
      const servico = servicos.find(s => s.id === id);
      if (!servico) return;

      const tempoRealMinutos = Math.floor((new Date().getTime() - new Date(servico.data_inicio).getTime()) / 60000);

      const { error } = await supabase
        .from('historico_servicos')
        .update({ 
          status: "finalizado",
          data_fim: new Date().toISOString(),
          tempo_real_minutos: tempoRealMinutos
        })
        .eq('id', id);
      
      if (error) throw error;
      
      setServicos(servicos.map(servico => 
        servico.id === id ? { 
          ...servico, 
          status: "finalizado" as const,
          data_fim: new Date().toISOString(),
          tempo_real_minutos: tempoRealMinutos
        } : servico
      ));
      
      toast({
        title: "Serviço finalizado",
        description: "Serviço marcado como concluído.",
      });
    } catch (error) {
      console.error('Erro ao finalizar serviço:', error);
      toast({
        title: "Erro",
        description: "Não foi possível finalizar o serviço.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Serviços</h1>
          <p className="text-muted-foreground">Gerencie os serviços do lava jato</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Serviço</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="tipo_servico_id"
                  rules={{ required: "Tipo de serviço é obrigatório" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Serviço</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value);
                        const tipoSelecionado = tiposServicos.find(t => t.id === value);
                        if (tipoSelecionado) {
                          form.setValue('valor', tipoSelecionado.valor_padrao.toString());
                        }
                      }} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o serviço" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tiposServicos.map((tipo) => (
                            <SelectItem key={tipo.id} value={tipo.id}>
                              {tipo.nome} - {formatCurrency(tipo.valor_padrao)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cliente_id"
                  rules={{ required: "Cliente é obrigatório" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o cliente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clientes.map((cliente) => (
                            <SelectItem key={cliente.id} value={cliente.id}>
                              {cliente.nome} - {cliente.modelo_veiculo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="valor"
                  rules={{ required: "Valor é obrigatório" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor (R$)</FormLabel>
                      <FormControl>
                        <Input placeholder="35.00" type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="funcionarioResponsavel"
                  rules={{ required: "Funcionário responsável é obrigatório" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Funcionário Responsável</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o funcionário" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {funcionarios.map((funcionario) => (
                            <SelectItem key={funcionario} value={funcionario}>{funcionario}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">Iniciar Serviço</Button>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por placa, cliente ou tipo de serviço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Advanced Filters */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setFiltrosAbertos(!filtrosAbertos)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros Avançados
              {temFiltrosAtivos() && (
                <Badge variant="secondary" className="ml-2">
                  {Object.values(filtros).filter(v => v !== "").length}
                </Badge>
              )}
            </Button>
            
            {temFiltrosAtivos() && (
              <Button
                variant="ghost"
                onClick={limparFiltros}
                className="gap-2 text-muted-foreground"
              >
                <X className="h-4 w-4" />
                Limpar Filtros
              </Button>
            )}
          </div>

          {filtrosAbertos && (
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data Início</label>
                    <Input
                      type="date"
                      value={filtros.dataInicio}
                      onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data Fim</label>
                    <Input
                      type="date"
                      value={filtros.dataFim}
                      onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo de Serviço</label>
                    <Select value={filtros.tipoServico} onValueChange={(value) => setFiltros({ ...filtros, tipoServico: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os serviços" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os serviços</SelectItem>
                        {dadosFiltros.tiposServicos.map((tipo) => (
                          <SelectItem key={tipo.id} value={tipo.id}>
                            {tipo.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cliente</label>
                    <Select value={filtros.cliente} onValueChange={(value) => setFiltros({ ...filtros, cliente: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os clientes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os clientes</SelectItem>
                        {dadosFiltros.clientes.map((cliente) => (
                          <SelectItem key={cliente.id} value={cliente.id}>
                            {cliente.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Modelo do Veículo</label>
                    <Select value={filtros.modeloVeiculo} onValueChange={(value) => setFiltros({ ...filtros, modeloVeiculo: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os modelos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os modelos</SelectItem>
                        {dadosFiltros.modelosVeiculos.map((modelo) => (
                          <SelectItem key={modelo} value={modelo}>
                            {modelo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select value={filtros.status} onValueChange={(value) => setFiltros({ ...filtros, status: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os status</SelectItem>
                        {dadosFiltros.status.map((status) => (
                          <SelectItem key={status.id} value={status.id}>
                            {status.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Services Tabs */}
      <Tabs defaultValue="andamento" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="andamento" className="gap-2">
            <Play className="h-4 w-4" />
            Em Andamento ({servicosAndamento.length})
          </TabsTrigger>
          <TabsTrigger value="finalizados" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Finalizados ({servicosFinalizados.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="andamento" className="space-y-4">
          {servicosAndamento.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum serviço em andamento</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {servicosAndamento.map((servico) => (
                <Card key={servico.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Car className="h-5 w-5 text-primary" />
                         {servico.tipos_servicos?.nome}
                      </CardTitle>
                      <Badge className="bg-orange-100 text-orange-700">Em Andamento</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Cliente</p>
                        <p className="font-medium">{servico.clientes?.nome}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Veículo</p>
                        <p className="font-medium">{servico.clientes?.modelo_veiculo}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Valor</p>
                        <p className="font-medium text-green-600">{formatCurrency(servico.valor)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tempo Estimado</p>
                        <p className="font-medium">{formatTime(servico.tipos_servicos?.tempo_medio_minutos || 0)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>Responsável: {servico.funcionario_responsavel}</span>
                      </div>
                      <Button 
                        onClick={() => finalizarServico(servico.id)}
                        size="sm"
                        className="gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Finalizar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="finalizados" className="space-y-4">
          {servicosFinalizados.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum serviço finalizado</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {servicosFinalizados.map((servico) => (
                <Card key={servico.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Car className="h-5 w-5 text-primary" />
                        {servico.tipos_servicos?.nome}
                      </CardTitle>
                      <Badge className="bg-green-100 text-green-700">Finalizado</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Cliente</p>
                        <p className="font-medium">{servico.clientes?.nome}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Veículo</p>
                        <p className="font-medium">{servico.clientes?.modelo_veiculo}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Valor</p>
                        <p className="font-medium text-green-600">{formatCurrency(servico.valor)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Responsável</p>
                        <p className="font-medium">{servico.funcionario_responsavel}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}