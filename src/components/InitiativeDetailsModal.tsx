import { useState, useEffect } from "react";
import { ArrowLeft, Lightbulb, Save, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { initiativesService, type Initiative, type InitiativeHistory, type Comment } from "@/services/initiativesService";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface InitiativeDetailsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initiative: Initiative | null;
    onSuccess?: () => void;
}

export function InitiativeDetailsModal({ open, onOpenChange, initiative, onSuccess }: InitiativeDetailsModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        benefits: "",
        type: "",
        priority: "",
        deadline: "",
        sector: ""
    });



    // History state
    const [history, setHistory] = useState<InitiativeHistory[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    // Comments state
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [commentSending, setCommentSending] = useState(false);

    useEffect(() => {
        if (initiative) {
            setFormData({
                title: initiative.title || "",
                description: initiative.description || "",
                benefits: initiative.benefits || "",
                type: initiative.type || "",
                priority: initiative.priority || "",
                deadline: initiative.deadline || "",
                sector: initiative.sector || "rh"
            });

            // Fetch History
            const fetchHistory = async () => {
                setHistoryLoading(true);
                try {
                    const data = await initiativesService.getHistory(initiative.id);
                    setHistory(data.data || []);
                } catch (error) {
                    console.error("Failed to fetch history", error);
                } finally {
                    setHistoryLoading(false);
                }
            };

            // Fetch Comments
            const fetchComments = async () => {
                setCommentsLoading(true);
                try {
                    const data = await initiativesService.getComments(initiative.id);
                    setComments(data.data || []);
                } catch (error) {
                    console.error("Failed to fetch comments", error);
                } finally {
                    setCommentsLoading(false);
                }
            };

            if (open) {
                fetchHistory();
                fetchComments();
            }
        }
    }, [initiative, open]);

    const handleSendComment = async () => {
        if (!initiative || !newComment.trim()) return;
        setCommentSending(true);
        try {
            await initiativesService.createComment(initiative.id, newComment);
            setNewComment("");
            // Refresh comments
            const data = await initiativesService.getComments(initiative.id);
            setComments(data.data || []);
        } catch (error) {
            console.error("Failed to send comment", error);
        } finally {
            setCommentSending(false);
        }
    };

    const isEditable = initiative
        ? ["Submetida", "Devolvida"].includes(initiative.status)
        : false;

    const handleChange = (field: string, value: string) => {
        if (!isEditable) return;
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!initiative) return;
        setLoading(true);
        try {
            await initiativesService.update(initiative.id, {
                title: formData.title,
                description: formData.description,
                benefits: formData.benefits,
                type: formData.type,
                priority: formData.priority,
                sector: formData.sector,
                deadline: formData.deadline
            });
            onSuccess?.();
            onOpenChange(false);
        } catch (error) {
            console.error("Error updating initiative", error);
        } finally {
            setLoading(false);
        }
    };

    if (!initiative) return null;

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
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <DialogTitle className="text-xl">
                                    {isEditable ? "Editar Iniciativa" : "Visualizar Iniciativa"}
                                </DialogTitle>
                                {!isEditable && (
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                        Modo Visualização
                                    </span>
                                )}
                            </div>
                            <DialogDescription className="mt-1">
                                {isEditable
                                    ? "Edite as informações da iniciativa abaixo"
                                    : "Detalhes completos da iniciativa registrada"}
                            </DialogDescription>
                        </div>
                        <div className={cn(
                            "px-3 py-1 rounded-full text-sm font-medium border",
                            initiative.status === "Submetida" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                initiative.status === "Devolvida" ? "bg-orange-50 text-orange-700 border-orange-200" :
                                    "bg-slate-100 text-slate-700 border-slate-200"
                        )}>
                            {initiative.status}
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
                                        <span className="text-lg">📄</span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Informações Básicas</h3>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="sector" className="text-base">Setor Solicitante</Label>
                                        <Select
                                            value={formData.sector}
                                            onChange={(e) => handleChange("sector", e.target.value)}
                                            disabled={!isEditable}
                                        >
                                            <option value="rh">Recursos Humanos</option>
                                            <option value="comercial">Comercial</option>
                                            <option value="ti">Tecnologia da Informação</option>
                                            <option value="financeiro">Financeiro</option>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Título da Iniciativa</Label>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) => handleChange("title", e.target.value)}
                                            readOnly={!isEditable}
                                            className={!isEditable ? "bg-slate-50 text-slate-600" : ""}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Descrição Detalhada</Label>
                                        <Textarea
                                            id="description"
                                            className={cn("min-h-[120px]", !isEditable && "bg-slate-50 text-slate-600")}
                                            value={formData.description}
                                            onChange={(e) => handleChange("description", e.target.value)}
                                            readOnly={!isEditable}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="benefits">Benefício Esperado</Label>
                                        <Textarea
                                            id="benefits"
                                            className={cn("min-h-[100px]", !isEditable && "bg-slate-50 text-slate-600")}
                                            value={formData.benefits}
                                            onChange={(e) => handleChange("benefits", e.target.value)}
                                            readOnly={!isEditable}
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
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Tipo de Iniciativa</Label>
                                        <Select
                                            value={formData.type}
                                            onChange={(e) => handleChange("type", e.target.value)}
                                            disabled={!isEditable}
                                        >
                                            <option value="" disabled>Selecione o tipo</option>
                                            <option value="Automação">Automação</option>
                                            <option value="Integração">Integração</option>
                                            <option value="Melhoria">Melhoria</option>
                                            <option value="Novo Projeto">Novo Projeto</option>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="criticality">Criticidade / Impacto</Label>
                                        <Select
                                            value={formData.priority}
                                            onChange={(e) => handleChange("priority", e.target.value)}
                                            disabled={!isEditable}
                                        >
                                            <option value="" disabled>Selecione a criticidade</option>
                                            <option value="Alta">Alta</option>
                                            <option value="Média">Média</option>
                                            <option value="Baixa">Baixa</option>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="deadline">Prazo Desejado</Label>
                                        <Input
                                            id="deadline"
                                            type="date"
                                            className={cn("w-full", !isEditable && "bg-slate-50 text-slate-600")}
                                            value={formData.deadline}
                                            onChange={(e) => handleChange("deadline", e.target.value)}
                                            readOnly={!isEditable}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* History Section */}
                            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
                                <div className="flex items-center gap-2 text-slate-800 border-b pb-4">
                                    <div className="p-1.5 bg-green-50 rounded-md">
                                        <span className="text-lg">📜</span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Histórico de Alterações</h3>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {historyLoading ? (
                                        <div className="text-center py-4">
                                            <Loader2 className="w-6 h-6 animate-spin text-slate-400 mx-auto" />
                                            <p className="text-xs text-slate-400 mt-2">Carregando histórico...</p>
                                        </div>
                                    ) : history.length === 0 ? (
                                        <div className="text-center py-4 text-slate-500 text-sm">
                                            Nenhum histórico encontrado.
                                        </div>
                                    ) : (
                                        <div className="relative pl-4 border-l-2 border-slate-100 space-y-6">
                                            {history.map((entry) => (
                                                <div key={entry.id} className="relative">
                                                    <div className="absolute -left-[21px] top-1 bg-white border-2 border-slate-200 w-3 h-3 rounded-full" />
                                                    <div className="flex bg-slate-50 rounded-lg p-3">
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-start">
                                                                <span className="font-medium text-slate-900 text-sm">{entry.action}</span>
                                                                <span className="text-xs text-slate-400">{entry.created_at}</span>
                                                            </div>
                                                            {(entry.old_status || entry.new_status) && (
                                                                <div className="text-xs text-slate-600 mt-1">
                                                                    {entry.old_status && <span className="line-through mr-1 text-slate-400">{entry.old_status}</span>}
                                                                    {entry.old_status && entry.new_status && <span className="mr-1">➜</span>}
                                                                    {entry.new_status && <span className="font-medium text-slate-700">{entry.new_status}</span>}
                                                                </div>
                                                            )}
                                                            {entry.user_name && (
                                                                <div className="text-xs text-slate-400 mt-1">
                                                                    Por: {entry.user_name}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Comments Section (Trâmites) */}
                        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
                            <div className="flex items-center gap-2 text-slate-800 border-b pb-4">
                                <div className="p-1.5 bg-green-50 rounded-md">
                                    <span className="text-lg">💬</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Trâmites</h3>
                                </div>
                            </div>

                            {/* Comments List */}
                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                {commentsLoading ? (
                                    <div className="text-center py-4">
                                        <Loader2 className="w-6 h-6 animate-spin text-slate-400 mx-auto" />
                                        <p className="text-xs text-slate-400 mt-2">Carregando trâmites...</p>
                                    </div>
                                ) : comments.length === 0 ? (
                                    <div className="text-center py-4 text-slate-500 text-sm bg-slate-50 rounded-lg">
                                        Nenhum trâmite registrado.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {comments.map((comment) => (
                                            <div key={comment.id} className="bg-slate-50 rounded-lg p-3 space-y-2">
                                                <div className="flex justify-between items-start">
                                                    <span className="font-semibold text-slate-900 text-sm">{comment.user_name}</span>
                                                    <span className="text-xs text-slate-400">{new Date(comment.created_at).toLocaleString()}</span>
                                                </div>
                                                <p className="text-sm text-slate-600 whitespace-pre-wrap">{comment.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* New Comment Input */}
                            <div className="space-y-3 pt-4 border-t">
                                <Textarea
                                    placeholder="Digite um novo trâmite/comentário..."
                                    className="min-h-[80px] bg-slate-50"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                />
                                <div className="flex justify-end">
                                    <Button
                                        size="sm"
                                        className="bg-[#7ab035] hover:bg-[#6a992d] text-white"
                                        onClick={handleSendComment}
                                        disabled={commentSending || !newComment.trim()}
                                    >
                                        {commentSending ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Send className="w-3 h-3 mr-2" />}
                                        Enviar Trâmite
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="flex flex-col gap-6">


                        {/* Actions */}
                        <div className="bg-white mt-6 p-6 rounded-xl border shadow-sm space-y-4">
                            <h3 className="font-semibold text-base">Ações</h3>

                            {isEditable ? (
                                <>
                                    <Button
                                        className="w-full bg-[#7ab035] hover:bg-[#6a992d] text-white font-semibold h-11"
                                        onClick={handleSubmit}
                                        disabled={loading}
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                        Salvar Alterações
                                    </Button>
                                </>
                            ) : (
                                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-500 text-center">
                                    Esta iniciativa não pode ser editada pois seu status é <strong>{initiative.status}</strong>.
                                </div>
                            )}

                            <Button
                                variant="outline"
                                className="w-full text-slate-600 h-11"
                                onClick={() => onOpenChange(false)}
                            >
                                Fechar
                            </Button>
                        </div>

                        {isEditable && (
                            <div className="bg-[#f0fdf4] p-6 rounded-xl border border-green-100 space-y-4">
                                <div className="flex items-center gap-2 text-green-800 font-semibold">
                                    <Lightbulb className="w-5 h-5" />
                                    <h3>Dicas</h3>
                                </div>
                                <p className="text-sm text-green-700">
                                    Mantenha as informações atualizadas para facilitar a aprovação.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog >
    );
}
