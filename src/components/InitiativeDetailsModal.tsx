import { useState, useEffect } from "react";
import { ArrowLeft, Lightbulb, Save, Loader2, Send, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { initiativesService, type Initiative, type InitiativeHistory, type Comment, type CancellationRequest } from "@/services/initiativesService";
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
    cancellationRequest?: CancellationRequest | null;
    onReviewCancellation?: (requestId: number, approved: boolean) => void;
}

export function InitiativeDetailsModal({
    open,
    onOpenChange,
    initiative,
    onSuccess,
    cancellationRequest,
    onReviewCancellation
}: InitiativeDetailsModalProps) {
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

    const [history, setHistory] = useState<InitiativeHistory[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);

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

    // Role check logic
    const [canReview, setCanReview] = useState(false);
    useEffect(() => {
        if (open) {
            const storedUserTypes = localStorage.getItem('user_types');
            if (storedUserTypes) {
                try {
                    const types = JSON.parse(storedUserTypes);
                    const hasPermission = Array.isArray(types) && types.some((t: any) => {
                        const name = (t.name || "").toLowerCase();
                        return name.includes('admin') || name.includes('gestor') || name.includes('manager');
                    });
                    setCanReview(hasPermission);
                } catch (error) {
                    console.error("Failed to parse user types", error);
                    setCanReview(false);
                }
            } else {
                setCanReview(false);
            }
        }
    }, [open]);

    const [statusUpdating, setStatusUpdating] = useState(false);
    const STEPS = ["Submetida", "Aprovada", "Em Análise", "Em Execução", "Concluída"];

    const handleStatusUpdate = async (newStatus: string) => {
        if (!initiative || statusUpdating) return;

        // If clicking the same status, do nothing
        if (initiative.status === newStatus) return;

        setStatusUpdating(true);
        try {
            await initiativesService.updateStatus(initiative.id, newStatus, "Alteração de status via roadmap");
            onSuccess?.();
        } catch (error) {
            console.error("Failed to update status", error);
        } finally {
            setStatusUpdating(false);
        }
    };

    if (!initiative) return null;

    // Use cancellationRequest prop if provided (from direct cancellation list), otherwise check embedded
    const effectiveCancellationRequest = cancellationRequest || (initiative?.cancellation_request?.status === 'Pendente' ? initiative.cancellation_request : null);

    const currentStepIndex = STEPS.indexOf(initiative.status);
    const isOffRoadmap = currentStepIndex === -1;

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
                    {/* Roadmap Section */}
                    <div className="bg-white p-6 rounded-xl border shadow-sm mb-8">
                        <div className="flex items-center gap-2 text-slate-800 mb-6">
                            <div className="p-1.5 bg-blue-50 rounded-md">
                                <span className="text-lg">🗺️</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Roadmap de Execução</h3>
                                <p className="text-sm text-slate-500">Acompanhe a evolução da iniciativa</p>
                            </div>
                        </div>

                        <div className="relative flex justify-between items-center px-4">
                            {/* Connecting Line */}
                            <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-100 -z-0" />
                            <div
                                className="absolute top-4 left-0 h-0.5 bg-green-600 transition-all duration-500 -z-0"
                                style={{ width: isOffRoadmap ? '0%' : `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
                            />

                            {STEPS.map((step, index) => {
                                const isCompleted = !isOffRoadmap && index <= currentStepIndex;
                                const isActive = !isOffRoadmap && index === currentStepIndex;
                                const isClickable = canReview && !statusUpdating;

                                return (
                                    <div key={step} className="relative z-10 flex flex-col items-center gap-2 group">
                                        <button
                                            disabled={!isClickable}
                                            onClick={() => handleStatusUpdate(step)}
                                            className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-white",
                                                isActive ? "border-green-600 text-green-600 scale-110 shadow-md ring-4 ring-green-50" :
                                                    isCompleted ? "bg-green-600 border-green-600 text-white" :
                                                        "border-slate-200 text-slate-300",
                                                isClickable && !isActive && "group-hover:border-green-400 group-hover:text-green-400 cursor-pointer"
                                            )}
                                        >
                                            {statusUpdating && isActive ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : isCompleted ? (
                                                <CheckCircle className="w-5 h-5" />
                                            ) : (
                                                <span className="text-xs font-semibold">{index + 1}</span>
                                            )}
                                        </button>
                                        <span className={cn(
                                            "text-xs font-medium whitespace-nowrap transition-colors duration-300",
                                            isActive ? "text-green-700" :
                                                isCompleted ? "text-slate-600" : "text-slate-400"
                                        )}>
                                            {step}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {isOffRoadmap && (
                            <div className="mt-6 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-center gap-2 text-orange-800 text-sm">
                                <AlertTriangle className="w-4 h-4" />
                                <span>Status atual: <strong>{initiative.status}</strong> (Fora do fluxo padrão)</span>
                            </div>
                        )}
                    </div>

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
                                        <Select value={formData.sector} onValueChange={(value) => handleChange("sector", value)} disabled={!isEditable}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o setor" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="rh">Recursos Humanos</SelectItem>
                                                <SelectItem value="comercial">Comercial</SelectItem>
                                                <SelectItem value="ti">Tecnologia da Informação</SelectItem>
                                                <SelectItem value="financeiro">Financeiro</SelectItem>
                                            </SelectContent>
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
                                        <Select value={formData.type} onValueChange={(value) => handleChange("type", value)} disabled={!isEditable}>
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
                                        <Label htmlFor="criticality">Criticidade / Impacto</Label>
                                        <Select value={formData.priority} onValueChange={(value) => handleChange("priority", value)} disabled={!isEditable}>
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
                                                            {entry.reason && (
                                                                <div className="text-xs text-slate-600 mt-1 bg-white p-2 rounded border border-slate-100 italic">
                                                                    "{entry.reason}"
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

                        {/* Sidebar Column */}
                        <div className="flex flex-col gap-6">

                            {/* Actions */}
                            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                                <h3 className="font-semibold text-base">Ações</h3>

                                {effectiveCancellationRequest ? (
                                    <div className="space-y-4">
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm space-y-2">
                                            <div className="flex items-center gap-2 text-red-800 font-semibold">
                                                <AlertTriangle className="w-4 h-4" />
                                                <span>Solicitação de Cancelamento</span>
                                            </div>
                                            <p className="text-red-700 italic">"{effectiveCancellationRequest.reason}"</p>
                                            <div className="text-xs text-red-600">
                                                Por: {effectiveCancellationRequest.requested_by_name}
                                                {effectiveCancellationRequest.time_ago && ` • ${effectiveCancellationRequest.time_ago}`}
                                                {effectiveCancellationRequest.created_at && !effectiveCancellationRequest.time_ago && ` • ${new Date(effectiveCancellationRequest.created_at).toLocaleDateString()}`}
                                            </div>
                                        </div>

                                        {canReview && onReviewCancellation && (
                                            <div className="grid grid-cols-2 gap-3">
                                                <Button
                                                    className="bg-green-600 hover:bg-green-700 text-white w-full"
                                                    onClick={() => onReviewCancellation(effectiveCancellationRequest.id, true)}
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    Aprovar
                                                </Button>
                                                <Button
                                                    className="bg-red-600 hover:bg-red-700 text-white w-full"
                                                    onClick={() => onReviewCancellation(effectiveCancellationRequest.id, false)}
                                                >
                                                    <XCircle className="w-4 h-4 mr-2" />
                                                    Reprovar
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ) : isEditable ? (
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

                            {/* Tips Section */}
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
                </div>
            </DialogContent>
        </Dialog>
    );
}
