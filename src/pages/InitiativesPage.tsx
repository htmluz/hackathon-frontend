import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InitiativeCard, type Initiative } from "@/components/InitiativeCard";
import { InitiativesFilter } from "@/components/InitiativesFilter";
import { NewInitiativeModal } from "@/components/NewInitiativeModal";

const mockInitiatives: Initiative[] = [
    {
        id: "1",
        title: "Automação do processo de admissão",
        status: "Em Execução",
        type: "Automação",
        priority: "Alta",
        description: "Implementar workflow automatizado para o processo de admissão de novos colaboradores, incluindo integração com...",
        sector: "Recursos Humanos",
        owner: "Carlos Oliveira",
        date: "10 de jan, 2024"
    },
    {
        id: "2",
        title: "Dashboard de vendas em tempo real",
        status: "Em Análise",
        type: "Novo Projeto",
        priority: "Média",
        description: "Criar painel executivo com indicadores de vendas atualizados em tempo real, incluindo metas, conversão e performance por...",
        sector: "Comercial",
        owner: "Maria Silva", // Assuming name
        date: "15 de jan, 2024"
    },
    {
        id: "3",
        title: "Integração SPED Fiscal com ERP",
        status: "Aprovada",
        type: "Integração",
        priority: "Alta",
        description: "Desenvolver integração automática entre o sistema SPED Fiscal e o ERP corporativo para envio automatizado de obrigações...",
        sector: "Fiscal",
        owner: "Carlos Oliveira",
        date: "08 de jan, 2024"
    },
    {
        id: "4",
        title: "Melhoria no módulo de relatórios",
        status: "Submetida",
        type: "Melhoria",
        priority: "Baixa",
        description: "Adicionar novos filtros e opções de exportação ao módulo de relatórios do sistema de gestão de produtos.",
        sector: "Produto",
        owner: "Ana Costa", // Assuming name
        date: "20 de jan, 2024"
    },
    {
        id: "5",
        title: "Portal do colaborador mobile",
        status: "Devolvida",
        type: "Novo Projeto",
        priority: "Média",
        description: "Desenvolver aplicativo mobile para acesso ao portal do colaborador com funcionalidades de ponto, férias e holerite.",
        sector: "Recursos Humanos",
        owner: "Pedro Santos", // Assuming name
        date: "12 de jan, 2024"
    },
    {
        id: "6",
        title: "Integração com marketplace",
        status: "Reprovada",
        type: "Integração",
        priority: "Alta",
        description: "Conectar sistema de vendas com principais marketplaces (Mercado Livre, Amazon, B2W) para gestão centralizada.",
        sector: "Comercial",
        owner: "Juliana Lima", // Assuming name
        date: "05 de jan, 2024"
    }
];

export default function InitiativesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Lista de Iniciativas</h1>
                    <p className="text-slate-500 mt-1">Gerencie e acompanhe todas as iniciativas de TI</p>
                </div>
                <Button
                    className="bg-[#8cc63f] hover:bg-[#7ab035] text-white font-semibold shadow-sm"
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus className="w-5 h-5 mr-1" />
                    Nova Iniciativa
                </Button>
            </div>

            <InitiativesFilter />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockInitiatives.map((initiative) => (
                    <InitiativeCard key={initiative.id} initiative={initiative} />
                ))}
            </div>

            <NewInitiativeModal open={isModalOpen} onOpenChange={setIsModalOpen} />
        </div>
    );
}
