import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { prioritizationService, type ChangeRequest } from '@/services/prioritizationService';
import { Badge } from "@/components/ui/badge";

interface ChangeRequestsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onRequestProcessed: () => void;
}

export function ChangeRequestsModal({ open, onOpenChange, onRequestProcessed }: ChangeRequestsModalProps) {
    const [requests, setRequests] = useState<ChangeRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Review State
    const [reviewingRequest, setReviewingRequest] = useState<{ id: number; approved: boolean } | null>(null);
    const [reviewReason, setReviewReason] = useState("");

    useEffect(() => {
        if (open) {
            fetchRequests();
            setReviewingRequest(null);
            setReviewReason("");
        }
    }, [open]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await prioritizationService.getPendingRequests();
            setRequests(data.data || []);
        } catch (error) {
            console.error(error);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenReview = (id: number, approved: boolean) => {
        setReviewingRequest({ id, approved });
        setReviewReason("");
    };

    const handleConfirmReview = async () => {
        if (!reviewingRequest) return;
        if (reviewReason.trim().length < 5) return; // Basic validation based on backend rules

        setProcessing(true);
        try {
            await prioritizationService.reviewRequest(reviewingRequest.id, reviewingRequest.approved, reviewReason);
            // Remove from list
            setRequests(prev => prev.filter(r => r.id !== reviewingRequest.id));
            onRequestProcessed();
            setReviewingRequest(null);
        } catch (error) {
            console.error(error);
            // Handle error (maybe toast)
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange} className="sm:max-w-[800px]">
            <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {reviewingRequest
                            ? (reviewingRequest.approved ? "Aprovar Solicitação" : "Recusar Solicitação")
                            : "Solicitações de Mudança Pendentes"}
                    </DialogTitle>
                    <DialogDescription>
                        {reviewingRequest
                            ? "Insira uma justificativa para esta ação (mínimo 5 caracteres)."
                            : "Gerencie as solicitações de desbloqueio de priorização dos usuários."}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {reviewingRequest ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Justificativa da {reviewingRequest.approved ? "Aprovação" : "Reprovação"}</label>
                                <Textarea
                                    value={reviewReason}
                                    onChange={(e) => setReviewReason(e.target.value)}
                                    placeholder={reviewingRequest.approved ? "Ex: Aprovado conforme alinhamento..." : "Ex: Reprovado pois..."}
                                    className="min-h-[100px]"
                                />
                                {reviewReason.trim().length > 0 && reviewReason.trim().length < 5 && (
                                    <p className="text-xs text-red-500">Mínimo de 5 caracteres.</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        loading ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                            </div>
                        ) : requests.length === 0 ? (
                            <div className="text-center p-8 border border-dashed rounded-lg text-slate-500">
                                Nenhuma solicitação pendente no momento.
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Solicitante</TableHead>
                                        <TableHead>Data</TableHead>
                                        <TableHead className="w-[40%]">Justificativa</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {requests.map(req => (
                                        <TableRow key={req.id} className="align-middle">
                                            <TableCell>
                                                <div className="font-medium">{req.requested_by_name}</div>
                                                <div className="text-xs text-slate-500">ID: {req.requested_by_user_id}</div>
                                            </TableCell>
                                            <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                                                {new Date(req.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-sm italic text-slate-600">
                                                "{req.reason}"
                                            </TableCell>
                                            <TableCell className="text-right whitespace-nowrap space-x-2">
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700 h-8"
                                                    onClick={() => handleOpenReview(req.id, true)}
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                    Aprovar
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    className="h-8"
                                                    onClick={() => handleOpenReview(req.id, false)}
                                                >
                                                    <XCircle className="w-4 h-4 mr-1" />
                                                    Recusar
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )
                    )}
                </div>

                <DialogFooter className="flex justify-between items-center w-full">
                    {reviewingRequest ? (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => setReviewingRequest(null)}
                                disabled={processing}
                            >
                                Voltar
                            </Button>
                            <Button
                                onClick={handleConfirmReview}
                                disabled={processing || reviewReason.trim().length < 5}
                                className={reviewingRequest.approved ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                            >
                                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Confirmar {reviewingRequest.approved ? "Aprovação" : "Reprovação"}
                            </Button>
                        </>
                    ) : (
                        <>
                            <div className="text-xs text-slate-400 self-center">
                                Total pendente: {requests.length}
                            </div>
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                Fechar
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
