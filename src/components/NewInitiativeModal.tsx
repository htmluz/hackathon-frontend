import { ArrowLeft, Lightbulb, Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose
} from "@/components/ui/dialog";

interface NewInitiativeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function NewInitiativeModal({ open, onOpenChange }: NewInitiativeModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[1100px] h-[90vh] bg-slate-50/50 flex flex-col gap-0 p-0">
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
                                        <Input id="title" placeholder="Ex: Automação do processo de admissão" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Descrição Detalhada <span className="text-red-500">*</span></Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Descreva em detalhes a iniciativa, seus objetivos e escopo..."
                                            className="min-h-[120px]"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="benefits">Benefício Esperado <span className="text-red-500">*</span></Label>
                                        <Textarea
                                            id="benefits"
                                            placeholder="Descreva os benefícios esperados com a implementação desta iniciativa..."
                                            className="min-h-[100px]"
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
                                        <Select id="type">
                                            <option value="" disabled selected>Selecione o tipo</option>
                                            <option value="automacao">Automação</option>
                                            <option value="integracao">Integração</option>
                                            <option value="melhoria">Melhoria</option>
                                            <option value="novo_projeto">Novo Projeto</option>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="criticality">Criticidade / Impacto <span className="text-red-500">*</span></Label>
                                        <Select id="criticality">
                                            <option value="" disabled selected>Selecione a criticidade</option>
                                            <option value="alta">Alta</option>
                                            <option value="media">Média</option>
                                            <option value="baixa">Baixa</option>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="deadline">Prazo Desejado <span className="text-slate-400 font-normal">(opcional)</span></Label>
                                        <Input id="deadline" type="date" className="w-full" />
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
                                <Select id="sector" defaultValue="rh">
                                    <option value="rh">Recursos Humanos</option>
                                    <option value="comercial">Comercial</option>
                                    <option value="ti">Tecnologia da Informação</option>
                                    <option value="financeiro">Financeiro</option>
                                </Select>
                            </div>

                            {/* Actions */}
                            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                                <h3 className="font-semibold text-base">Ações</h3>

                                <Button className="w-full bg-[#7ab035] hover:bg-[#6a992d] text-white font-semibold h-11">
                                    <Send className="w-4 h-4 mr-2" />
                                    Submeter Iniciativa
                                </Button>

                                <Button variant="outline" className="w-full h-11">
                                    <Save className="w-4 h-4 mr-2" />
                                    Salvar como Rascunho
                                </Button>

                                <Button
                                    variant="ghost"
                                    className="w-full text-slate-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => onOpenChange(false)}
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
    );
}
