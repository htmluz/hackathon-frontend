import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { prioritizationService } from '@/services/prioritizationService';
// import { toast } from '@/components/ui/use-toast';

interface RequestChangeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    year: number;
    newPriorityOrder: number[];
    onSuccess: () => void;
}

export function RequestChangeModal({ open, onOpenChange, year, newPriorityOrder, onSuccess }: RequestChangeModalProps) {
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!reason.trim()) return;

        setLoading(true);
        try {
            await prioritizationService.requestChange(year, newPriorityOrder, reason);
            onOpenChange(false);
            onSuccess();
        } catch (error) {
            console.error(error);
            // toast({ title: "Erro", description: "Falha ao solicitar mudança", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange} className="sm:max-w-[500px]">
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Solicitar Mudança na Priorização</DialogTitle>
                    <DialogDescription>
                        A priorização está atualmente bloqueada. Descreva o motivo da alteração para solicitar aprovação ao gestor.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Justificativa obrigatória
                        </label>
                        <Textarea
                            placeholder="Descreva por que a ordem de prioridade precisa ser alterada..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={!reason.trim() || loading} className="bg-[#7ab035] hover:bg-[#6a992d] text-white">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enviar Solicitação
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
