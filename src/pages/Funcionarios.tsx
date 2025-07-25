import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, UserCheck, Briefcase } from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

interface Funcionario {
  id: number;
  nome: string;
  funcao: string;
}

export default function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([
    { id: 1, nome: "Carlos Silva", funcao: "Lavador" },
    { id: 2, nome: "Ana Santos", funcao: "Encerador" },
    { id: 3, nome: "João Costa", funcao: "Lavador" },
    { id: 4, nome: "Maria Oliveira", funcao: "Atendente" },
  ]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      nome: "",
      funcao: "",
    },
  });

  const filteredFuncionarios = funcionarios.filter(funcionario =>
    funcionario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    funcionario.funcao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = (data: any) => {
    const novoFuncionario: Funcionario = {
      id: funcionarios.length + 1,
      nome: data.nome,
      funcao: data.funcao,
    };
    
    setFuncionarios([...funcionarios, novoFuncionario]);
    setDialogOpen(false);
    form.reset();
    
    toast({
      title: "Funcionário cadastrado",
      description: `${novoFuncionario.nome} foi adicionado com sucesso.`,
    });
  };

  const getFuncaoColor = (funcao: string) => {
    switch (funcao.toLowerCase()) {
      case "lavador":
        return "bg-blue-100 text-blue-700";
      case "encerador":
        return "bg-purple-100 text-purple-700";
      case "atendente":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Funcionários</h1>
          <p className="text-muted-foreground">Gerencie sua equipe</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Funcionário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Funcionário</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nome"
                  rules={{ required: "Nome é obrigatório" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="funcao"
                  rules={{ required: "Função é obrigatória" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Função</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Lavador, Encerador, Atendente" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">Cadastrar</Button>
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
          placeholder="Buscar por nome ou função..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Funcionários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{funcionarios.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Lavadores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {funcionarios.filter(f => f.funcao.toLowerCase() === "lavador").length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Enceradores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {funcionarios.filter(f => f.funcao.toLowerCase() === "encerador").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employees List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredFuncionarios.map((funcionario) => (
          <Card key={funcionario.id}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserCheck className="h-5 w-5 text-primary" />
                {funcionario.nome}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <Badge className={getFuncaoColor(funcionario.funcao)}>
                  {funcionario.funcao}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFuncionarios.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? "Nenhum funcionário encontrado" : "Nenhum funcionário cadastrado"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}