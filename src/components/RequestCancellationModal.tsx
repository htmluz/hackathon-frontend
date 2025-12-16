import { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
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

interface RequestCancellationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initiativeId: string | null;
    onSuccess?: () => void;
}

export function RequestCancellationModal({ open, onOpenChange, initiativeId, onSuccess }: RequestCancellationModalProps) {
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!initiativeId || !reason.trim()) return;

        setLoading(true);
        setError(null);
        try {
            await initiativesService.requestCancellation(initiativeId, reason);
            onSuccess?.();
            onOpenChange(false);
            setReason(""); // Reset form
        } catch (err: any) {
            console.error("Error requesting cancellation", err);
            const errorMessage = err.response?.data?.error || "Ocorreu um erro ao solicitar o cancelamento.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange} className="sm:max-w-[500px]">
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-700">
                        <AlertTriangle className="h-5 w-5" />
                        Solicitar Cancelamento
                    </DialogTitle>
                    <DialogDescription>
                        Tem certeza que deseja solicitar o cancelamento desta iniciativa?
                        Por favor, justifique o motivo abaixo.
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
                        <Label htmlFor="reason">Motivo do Cancelamento</Label>
                        <Textarea
                            id="reason"
                            placeholder="Descreva o motivo..."
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
                        variant="destructive"
                        onClick={handleSubmit}
                        disabled={loading || !reason.trim()}
                    >
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Confirmar Solicitação
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
