import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Car, Users, UserCheck, Clock, CheckCircle, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  // Mock data - em um app real viria de uma API/estado global
  const stats = {
    servicosHoje: 12,
    servicosAndamento: 5,
    servicosFinalizados: 7,
    totalClientes: 156,
    totalFuncionarios: 8,
    faturamentoHoje: 1850.00
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do seu lava jato</p>
        </div>
        <Link to="/servicos/novo">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Serviço
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Serviços Hoje</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.servicosHoje}</div>
            <p className="text-xs text-muted-foreground">
              {stats.servicosAndamento} em andamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.servicosAndamento}</div>
            <p className="text-xs text-muted-foreground">
              serviços sendo executados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Finalizados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.servicosFinalizados}</div>
            <p className="text-xs text-muted-foreground">
              serviços concluídos hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClientes}</div>
            <p className="text-xs text-muted-foreground">
              clientes cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funcionários</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFuncionarios}</div>
            <p className="text-xs text-muted-foreground">
              funcionários ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Hoje</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {stats.faturamentoHoje.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              receita do dia
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Services */}
      <Card>
        <CardHeader>
          <CardTitle>Serviços Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { id: 1, cliente: "João Silva", servico: "Lavagem Completa", placa: "ABC-1234", status: "Em Andamento", funcionario: "Carlos" },
              { id: 2, cliente: "Maria Santos", servico: "Enceramento", placa: "XYZ-5678", status: "Finalizado", funcionario: "Ana" },
              { id: 3, cliente: "Pedro Costa", servico: "Lavagem Simples", placa: "DEF-9012", status: "Em Andamento", funcionario: "João" },
            ].map((servico) => (
              <div key={servico.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{servico.cliente}</p>
                  <p className="text-sm text-muted-foreground">{servico.servico} - {servico.placa}</p>
                  <p className="text-sm text-muted-foreground">Responsável: {servico.funcionario}</p>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  servico.status === "Finalizado" 
                    ? "bg-green-100 text-green-700" 
                    : "bg-orange-100 text-orange-700"
                }`}>
                  {servico.status}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}