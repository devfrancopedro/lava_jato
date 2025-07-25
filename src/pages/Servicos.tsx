import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Car, Clock, User, DollarSign, CheckCircle, Play } from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

interface Servico {
  id: number;
  tipoServico: string;
  nomeCliente: string;
  modeloCarro: string;
  placa: string;
  valor: number;
  tempoEstimado: number;
  funcionarioResponsavel: string;
  status: "andamento" | "finalizado";
  dataHora: string;
}

export default function Servicos() {
  const [servicos, setServicos] = useState<Servico[]>([
    {
      id: 1,
      tipoServico: "Lavagem Completa",
      nomeCliente: "João Silva",
      modeloCarro: "Honda Civic",
      placa: "ABC-1234",
      valor: 35.00,
      tempoEstimado: 60,
      funcionarioResponsavel: "Carlos Silva",
      status: "andamento",
      dataHora: "2024-01-15T10:30:00"
    },
    {
      id: 2,
      tipoServico: "Enceramento",
      nomeCliente: "Maria Santos",
      modeloCarro: "Toyota Corolla",
      placa: "XYZ-5678",
      valor: 80.00,
      tempoEstimado: 120,
      funcionarioResponsavel: "Ana Santos",
      status: "finalizado",
      dataHora: "2024-01-15T08:00:00"
    },
  ]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      tipoServico: "",
      nomeCliente: "",
      modeloCarro: "",
      placa: "",
      valor: "",
      tempoEstimado: "",
      funcionarioResponsavel: "",
    },
  });

  const tiposServico = [
    "Lavagem Simples",
    "Lavagem Completa",
    "Enceramento",
    "Polimento",
    "Lavagem + Enceramento",
    "Lavagem + Polimento"
  ];

  const funcionarios = [
    "Carlos Silva",
    "Ana Santos", 
    "João Costa",
    "Maria Oliveira"
  ];

  const filteredServicos = servicos.filter(servico =>
    servico.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    servico.nomeCliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    servico.tipoServico.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const servicosAndamento = filteredServicos.filter(s => s.status === "andamento");
  const servicosFinalizados = filteredServicos.filter(s => s.status === "finalizado");

  const onSubmit = (data: any) => {
    const novoServico: Servico = {
      id: servicos.length + 1,
      tipoServico: data.tipoServico,
      nomeCliente: data.nomeCliente,
      modeloCarro: data.modeloCarro,
      placa: data.placa.toUpperCase(),
      valor: parseFloat(data.valor),
      tempoEstimado: parseInt(data.tempoEstimado),
      funcionarioResponsavel: data.funcionarioResponsavel,
      status: "andamento",
      dataHora: new Date().toISOString(),
    };
    
    setServicos([novoServico, ...servicos]);
    setDialogOpen(false);
    form.reset();
    
    toast({
      title: "Serviço criado",
      description: `Serviço para ${novoServico.nomeCliente} foi iniciado.`,
    });
  };

  const finalizarServico = (id: number) => {
    setServicos(servicos.map(servico => 
      servico.id === id ? { ...servico, status: "finalizado" as const } : servico
    ));
    
    toast({
      title: "Serviço finalizado",
      description: "Serviço marcado como concluído.",
    });
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
                  name="tipoServico"
                  rules={{ required: "Tipo de serviço é obrigatório" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Serviço</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o serviço" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tiposServico.map((tipo) => (
                            <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nomeCliente"
                  rules={{ required: "Nome do cliente é obrigatório" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Cliente</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="modeloCarro"
                  rules={{ required: "Modelo do carro é obrigatório" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modelo do Carro</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Honda Civic" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="placa"
                  rules={{ required: "Placa é obrigatória" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Placa do Veículo</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC-1234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
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
                    name="tempoEstimado"
                    rules={{ required: "Tempo é obrigatório" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tempo (min)</FormLabel>
                        <FormControl>
                          <Input placeholder="60" type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar por placa, cliente ou tipo de serviço..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
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
                        {servico.tipoServico}
                      </CardTitle>
                      <Badge className="bg-orange-100 text-orange-700">Em Andamento</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Cliente</p>
                        <p className="font-medium">{servico.nomeCliente}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Veículo</p>
                        <p className="font-medium">{servico.modeloCarro}</p>
                        <p className="text-xs text-muted-foreground">{servico.placa}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Valor</p>
                        <p className="font-medium text-green-600">{formatCurrency(servico.valor)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tempo Estimado</p>
                        <p className="font-medium">{formatTime(servico.tempoEstimado)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>Responsável: {servico.funcionarioResponsavel}</span>
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
                        {servico.tipoServico}
                      </CardTitle>
                      <Badge className="bg-green-100 text-green-700">Finalizado</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Cliente</p>
                        <p className="font-medium">{servico.nomeCliente}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Veículo</p>
                        <p className="font-medium">{servico.modeloCarro}</p>
                        <p className="text-xs text-muted-foreground">{servico.placa}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Valor</p>
                        <p className="font-medium text-green-600">{formatCurrency(servico.valor)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Responsável</p>
                        <p className="font-medium">{servico.funcionarioResponsavel}</p>
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