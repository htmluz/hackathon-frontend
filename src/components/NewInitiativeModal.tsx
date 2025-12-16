import { useState, useEffect } from "react";
import { ArrowLeft, Lightbulb, Save, Send, Loader2, AlertTriangle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { initiativesService, aiService } from "@/services/initiativesService";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import api from "@/api/axios";

interface NewInitiativeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function NewInitiativeModal({ open, onOpenChange, onSuccess }: NewInitiativeModalProps) {
    const [loading, setLoading] = useState(false);
    const [sectorLoading, setSectorLoading] = useState(false);
    const [userSector, setUserSector] = useState<{ id: string; name: string } | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        benefits: "",
        type: "",
        priority: "",
        deadline: "",
        sector: ""
    });

    // Fetch user's sector when modal opens
    useEffect(() => {
        if (open) {
            const fetchUserSector = async () => {
                setSectorLoading(true);
                try {
                    // Get user data from localStorage
                    const userStr = localStorage.getItem('user');
                    if (!userStr) {
                        setError("Usuário não encontrado. Faça login novamente.");
                        return;
                    }

                    const user = JSON.parse(userStr);
                    const sectorId = user.sector_id;

                    if (!sectorId) {
                        setError("Setor do usuário não encontrado.");
                        return;
                    }

                    // Check if sector is already cached in localStorage
                    const cachedSectorsStr = localStorage.getItem('sectors');
                    let cachedSectors: any = {};

                    if (cachedSectorsStr) {
                        cachedSectors = JSON.parse(cachedSectorsStr);
                    }

                    // If sector is cached, use it
                    if (cachedSectors[sectorId]) {
                        setUserSector(cachedSectors[sectorId]);
                        setFormData(prev => ({ ...prev, sector: cachedSectors[sectorId].id }));
                    } else {
                        // Fetch sector from API
                        const response = await api.get(`/private/sectors/${sectorId}`);
                        const sectorData = {
                            id: response.data.data.id.toString(),
                            name: response.data.data.name
                        };

                        setUserSector(sectorData);
                        setFormData(prev => ({ ...prev, sector: sectorData.id }));

                        // Cache the sector
                        cachedSectors[sectorId] = sectorData;
                        localStorage.setItem('sectors', JSON.stringify(cachedSectors));
                    }
                } catch (err: any) {
                    console.error("Error fetching user sector", err);
                    setError("Não foi possível carregar o setor do usuário.");
                } finally {
                    setSectorLoading(false);
                }
            };

            fetchUserSector();
        }
    }, [open]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const [error, setError] = useState<string | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [showAIComparison, setShowAIComparison] = useState(false);
    const [originalText, setOriginalText] = useState("");
    const [improvedText, setImprovedText] = useState("");

    const DEFAULT_AI_PROMPT = `Você é um assistente de apoio ao Key User da Senior Sistemas. Seu papel é ajudar a estruturar iniciativas corporativas de TI de forma clara e completa, facilitando a análise pela equipe de TIC.

ATENÇÃO:
Caso o usuário envie um texto que não tem informação o suficiente não tente completar. Responda informando o usuário quais os pontos que faltam.

CONTEXTO:
Você receberá uma descrição inicial escrita por um usuário não técnico. Essa descrição pode mencionar sistemas internos da Senior que você não conhece - mantenha os nomes como estão, sem tentar explicá-los.

OBJETIVO:
Transformar a descrição em um texto estruturado, claro e objetivo, pronto para análise técnica.

PROCESSAMENTO:
Analise a descrição e identifique:
- O problema ou necessidade atual
- O objetivo da iniciativa
- Quem será impactado (setores, usuários, sistemas)
- Benefícios esperados
- Escopo (o que está incluído e o que não está)
- Riscos, dependências ou urgências mencionadas
- Dados quantitativos (volumes, tempos, custos)

FORMATO DE SAÍDA:
Gere um texto estruturado com as seguintes seções (use ícones e quebras de linha, mas mantenha formato de texto corrido dentro de cada seção):

🎯 OBJETIVO
[Texto claro e direto sobre o que se quer alcançar]

📋 PROBLEMA ATUAL
[Descrição do cenário atual e suas limitações]

👥 IMPACTO
[Quem será afetado: setores, sistemas, usuários. Quantifique quando possível]

💡 BENEFÍCIOS ESPERADOS
[Lista objetiva dos ganhos esperados: tempo, qualidade, redução de erros, etc.]

🧩 ESCOPO
O que está incluído: [lista]
O que está fora do escopo: [lista, se aplicável]

⚠️ PONTOS DE ATENÇÃO
[Riscos, dependências, urgências ou pré-requisitos identificados. Omita se não houver]

📊 DADOS RELEVANTES
[Volumes, tempos, custos ou métricas mencionadas. Omita se não houver]

REGRAS IMPORTANTES:
- Use linguagem simples e corporativa, sem jargões técnicos desnecessários
- Mantenha nomes de sistemas internos exatamente como mencionados
- Se alguma informação não foi fornecida, não invente - apenas omita a seção
- Preserve dados quantitativos mencionados (volumes, tempos, custos)
- Não faça estimativas técnicas ou defina prioridades
- Não use formatação Markdown dentro das seções (sem **, ##, -, etc)
- Use quebras de linha para separar seções, mas mantenha texto corrido dentro delas

MENSAGEM FINAL:
Finalize com: "Revise as informações acima e ajuste o que for necessário antes de enviar para análise da TIC."

Texto do usuário:`;

    const handleAIImprove = async () => {
        if (!formData.description.trim()) {
            setError("Por favor, preencha a descrição antes de usar a IA.");
            return;
        }

        setAiLoading(true);
        setError(null);
        try {
            const response = await aiService.processText(formData.description, DEFAULT_AI_PROMPT);
            setOriginalText(formData.description);
            setImprovedText(response.data.generated_text);
            setShowAIComparison(true);
        } catch (err: any) {
            console.error("Error improving description with AI", err);
            const errorMessage = err.response?.data?.error || "Ocorreu um erro ao processar o texto com IA.";
            setError(errorMessage);
        } finally {
            setAiLoading(false);
        }
    };

    const handleAcceptAI = () => {
        handleChange("description", improvedText);
        setShowAIComparison(false);
    };

    const handleRejectAI = () => {
        setShowAIComparison(false);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            await initiativesService.create({
                title: formData.title,
                description: formData.description,
                benefits: formData.benefits,
                type: formData.type, // Map value if needed
                priority: formData.priority, // Map value if needed
                sector: formData.sector, // Map value if needed
                deadline: formData.deadline
            });
            onSuccess?.();
            onOpenChange(false);
        } catch (err: any) {
            console.error("Error creating initiative", err);
            const errorMessage = err.response?.data?.error || "Ocorreu um erro ao criar a iniciativa.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* AI Comparison Modal */}
            <Dialog open={showAIComparison} onOpenChange={setShowAIComparison}>
                <DialogContent className="max-w-[1400px] h-[85vh] bg-white flex flex-col gap-0 p-0">
                    <DialogHeader className="px-8 py-5 bg-gradient-to-r from-primary/5 to-primary/10 border-b flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Sparkles className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl">Sugestão de Melhoria com IA</DialogTitle>
                                <DialogDescription className="mt-1">
                                    Compare sua descrição original com a versão estruturada pela IA
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-auto p-8">
                        <div className="grid grid-cols-2 gap-6 h-full">
                            {/* Original Text */}
                            <div className="flex flex-col">
                                <div className="mb-4 flex items-center gap-2">
                                    <div className="w-1 h-6 bg-slate-400 rounded-full"></div>
                                    <h3 className="font-semibold text-slate-700">Texto Original</h3>
                                </div>
                                <div className="flex-1 bg-slate-50 rounded-xl p-6 border border-slate-200 overflow-auto">
                                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                                        {originalText}
                                    </p>
                                </div>
                            </div>

                            {/* Improved Text */}
                            <div className="flex flex-col">
                                <div className="mb-4 flex items-center gap-2">
                                    <div className="w-1 h-6 bg-primary rounded-full"></div>
                                    <h3 className="font-semibold text-slate-700">Versão Melhorada</h3>
                                    <span className="ml-auto text-xs bg-primary/10 text-black px-2 py-1 rounded-full font-medium">
                                        ✨ Sugestão da IA
                                    </span>
                                </div>
                                <div className="flex-1 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20 overflow-auto">
                                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                                        {improvedText}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 py-5 bg-slate-50 border-t flex items-center justify-between flex-shrink-0">
                        <p className="text-sm text-slate-600">
                            💡 Você pode editar o texto depois de aceitar a sugestão
                        </p>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={handleRejectAI}
                                className="h-10"
                            >
                                Manter Original
                            </Button>
                            <Button
                                onClick={handleAcceptAI}
                                className="h-10 bg-primary text-white"
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                Usar Sugestão
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Main Modal */}
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-[1600px] h-[90vh] bg-slate-50/50 flex flex-col gap-0 p-0">
                <DialogHeader className="px-8 py-5 bg-white border-b flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full border border-slate-200"
                            onClick={() => onOpenChange(false)}
                        >
                            <ArrowLeft className="w-4 h-4 text-slate-600" />
                        </Button>
                        <div>
                            <DialogTitle className="text-xl">Nova Iniciativa</DialogTitle>
                            <DialogDescription className="mt-1">
                                Preencha os dados para registrar uma nova iniciativa
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-auto p-8">
                    {/* Error Block */}
                    {error && (
                        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-sm">Não foi possível salvar</h3>
                                <p className="text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Form Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Info Section */}
                            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
                                <div className="flex items-center gap-2 text-slate-800 border-b pb-4">
                                    <div className="p-1.5 bg-green-50 rounded-md">
                                        <span className="text-lg">📄</span> {/* Using emoji as placeholder icon from print */}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Informações Básicas</h3>
                                        <p className="text-sm text-slate-500">Descreva a iniciativa que você deseja registrar</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Título da Iniciativa <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="title"
                                            placeholder="Ex: Automação do processo de admissão"
                                            value={formData.title}
                                            onChange={(e) => handleChange("title", e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="description">Descrição Detalhada <span className="text-red-500">*</span></Label>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                onClick={handleAIImprove}
                                                disabled={aiLoading || !formData.description.trim()}
                                                className="h-8 text-primary hover:text-primary hover:bg-slate-100"
                                            >
                                                {aiLoading ? (
                                                    <>
                                                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                                        Processando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                                                        Melhorar com IA
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                        <Textarea
                                            id="description"
                                            placeholder="Ex: Hoje o processo de liberação de acesso ao portal é manual. Cada solicitação demora 4 minutos e envolve validação de CNPJ, alteração no CRM e retorno por e-mail. Recebemos cerca de 596 solicitações por mês, totalizando 40 horas de trabalho manual..."
                                            className="min-h-[160px]"
                                            value={formData.description}
                                            onChange={(e) => handleChange("description", e.target.value)}
                                        />
                                        <div className="flex items-start gap-2 text-xs text-slate-500 bg-primary/5 p-3 rounded-lg border border-primary/10">
                                            <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                            <p>
                                                <span className="font-medium text-primary">Dica:</span> Escreva livremente sobre o problema, objetivo e impacto esperado. 
                                                Depois clique em "Melhorar com IA" para estruturar automaticamente.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="benefits">Benefício Esperado <span className="text-red-500">*</span></Label>
                                        <Textarea
                                            id="benefits"
                                            placeholder="Descreva os benefícios esperados com a implementação desta iniciativa..."
                                            className="min-h-[100px]"
                                            value={formData.benefits}
                                            onChange={(e) => handleChange("benefits", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Classification Section */}
                            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
                                <div className="flex items-center gap-2 text-slate-800 border-b pb-4">
                                    <div className="p-1.5 bg-green-50 rounded-md">
                                        <span className="text-lg">🏷️</span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Classificação</h3>
                                        <p className="text-sm text-slate-500">Defina o tipo e a criticidade da iniciativa</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Tipo de Iniciativa <span className="text-red-500">*</span></Label>
                                        <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o tipo" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Automação">Automação</SelectItem>
                                                <SelectItem value="Integração">Integração</SelectItem>
                                                <SelectItem value="Melhoria">Melhoria</SelectItem>
                                                <SelectItem value="Novo Projeto">Novo Projeto</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="criticality">Criticidade / Impacto <span className="text-red-500">*</span></Label>
                                        <Select value={formData.priority} onValueChange={(value) => handleChange("priority", value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione a criticidade" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Alta">Alta</SelectItem>
                                                <SelectItem value="Média">Média</SelectItem>
                                                <SelectItem value="Baixa">Baixa</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="deadline">Prazo Desejado <span className="text-slate-400 font-normal">(opcional)</span></Label>
                                        <Input
                                            id="deadline"
                                            type="date"
                                            className="w-full"
                                            value={formData.deadline}
                                            onChange={(e) => handleChange("deadline", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Attachments Section */}
                            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
                                <div className="flex items-center gap-2 text-slate-800 border-b pb-4">
                                    <div className="p-1.5 bg-green-50 rounded-md">
                                        <span className="text-lg">📎</span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Documentos / Anexos</h3>
                                        <p className="text-sm text-slate-500">Adicione arquivos complementares (PDF, Docx, Xlsx)</p>
                                    </div>
                                </div>

                                <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer">
                                    <div className="p-3 bg-slate-100 rounded-full mb-3">
                                        <span className="text-xl">☁️</span>
                                    </div>
                                    <p className="text-sm font-medium text-slate-700">Clique para fazer upload ou arraste arquivos aqui</p>
                                    <p className="text-xs text-slate-500 mt-1">Máximo de 10MB por arquivo</p>
                                    <input type="file" className="hidden" id="file-upload" multiple />
                                    <Button variant="outline" size="sm" className="mt-4" onClick={() => document.getElementById('file-upload')?.click()}>
                                        Selecionar Arquivos
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Column */}
                        <div className="flex flex-col gap-6">
                            {/* Requester Sector */}
                            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                                <Label htmlFor="sector" className="text-base font-semibold">Setor Solicitante</Label>
                                {sectorLoading ? (
                                    <div className="flex items-center justify-center py-3">
                                        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                                    </div>
                                ) : userSector ? (
                                    <Input
                                        value={userSector.name}
                                        readOnly
                                        className="bg-slate-50 text-slate-700 cursor-not-allowed"
                                    />
                                ) : (
                                    <Input
                                        value="Carregando..."
                                        readOnly
                                        className="bg-slate-50 text-slate-400 cursor-not-allowed"
                                    />
                                )}
                                <p className="text-xs text-slate-500">
                                    Você só pode criar iniciativas para o seu setor.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                                <h3 className="font-semibold text-base">Ações</h3>

                                <Button
                                    className="w-full bg-[#7ab035] hover:bg-[#6a992d] text-white font-semibold h-11"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                                    Submeter Iniciativa
                                </Button>

                                <Button variant="outline" className="w-full h-11" disabled={loading}>
                                    <Save className="w-4 h-4 mr-2" />
                                    Salvar como Rascunho
                                </Button>

                                <Button
                                    variant="ghost"
                                    className="w-full text-slate-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => onOpenChange(false)}
                                    disabled={loading}
                                >
                                    Cancelar
                                </Button>
                            </div>

                            {/* Tips */}
                            <div className="bg-[#f0fdf4] p-6 rounded-xl border border-green-100 space-y-4">
                                <div className="flex items-center gap-2 text-green-800 font-semibold">
                                    <Lightbulb className="w-5 h-5" />
                                    <h3>Dicas para uma boa descrição</h3>
                                </div>
                                <ul className="text-sm text-green-700 space-y-2 list-disc pl-4">
                                    <li>Seja claro e objetivo no título</li>
                                    <li>Descreva o problema atual</li>
                                    <li>Explique a solução desejada</li>
                                    <li>Liste os benefícios esperados</li>
                                    <li>Mencione integrações necessárias</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
        </>
    );
}
