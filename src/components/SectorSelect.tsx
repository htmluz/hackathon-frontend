import { useEffect, useState } from "react";
import { sectorsService, type Sector } from "@/services/sectorsService";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface SectorSelectProps {
    value: number | null;
    onChange: (sectorId: number | null) => void;
    disabled?: boolean;
}

export function SectorSelect({ value, onChange, disabled }: SectorSelectProps) {
    const [sectors, setSectors] = useState<Sector[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSectors = async () => {
            try {
                const data = await sectorsService.getAll(true); // Get only active sectors
                setSectors(data);
            } catch (error) {
                console.error("Failed to load sectors", error);
            } finally {
                setLoading(false);
            }
        };
        loadSectors();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-3 w-3 animate-spin" />
                Carregando setores...
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <Label>Setor</Label>
            <Select
                value={value?.toString() || "no-sector"}
                onValueChange={(val) => onChange(val === "no-sector" ? null : Number(val))}
                disabled={disabled}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Selecione um setor" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="no-sector">Sem setor</SelectItem>
                    {sectors.map((sector) => (
                        <SelectItem key={sector.id} value={sector.id.toString()}>
                            {sector.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
