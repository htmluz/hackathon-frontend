import { useState } from "react";
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { initiativesService } from "@/services/initiativesService";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";

interface ReviewCancellationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    requestId: number | null;
    approved: boolean; // Pre-determined action
    onSuccess?: () => void;
}

export function ReviewCancellationModal({ open, onOpenChange, requestId, approved, onSuccess }: ReviewCancellationModalProps) {
    const [reason, setReason] = useState(""); // Restored
    const [loading, setLoading] = useState(false); // Restored
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!requestId || !reason.trim()) return;

        setLoading(true);
        setError(null);
        try {
            await initiativesService.reviewCancellation(requestId, approved, reason);
            onSuccess?.();
            onOpenChange(false);
            setReason("");
        } catch (err: any) {
            console.error("Error reviewing cancellation", err);
            const errorMessage = err.response?.data?.error || "Ocorreu um erro ao processar a revisão.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange} className="sm:max-w-[500px]">
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    {/* ... (header content same) ... */}
                    <DialogTitle className="flex items-center gap-2">
                        {approved ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        {approved ? "Aprovar Cancelamento" : "Reprovar Cancelamento"}
                    </DialogTitle>
                    <DialogDescription>
                        {approved
                            ? "Você está prestes a aprovar o cancelamento desta iniciativa. Por favor, confirme o motivo."
                            : "Você está prestes a reprovar o cancelamento e manter a iniciativa ativa. Por favor, forneça o motivo."
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {error && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="review-reason">
                            {approved ? "Justificativa da Aprovação" : "Motivo da Reprovação"}
                        </Label>
                        <Textarea
                            id="review-reason"
                            placeholder={approved ? "Ex: Cancelamento aprovado conforme alinhamento..." : "Ex: Projeto crítico, cancelamento negado..."}
                            className="min-h-[60px]"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        className={approved ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}
                        onClick={handleSubmit}
                        disabled={loading || !reason.trim()}
                    >
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Confirmar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
