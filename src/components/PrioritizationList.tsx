
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { PrioritizationItem, type PrioritizationItemData } from "./PrioritizationItem";

interface PrioritizationListProps {
    items: PrioritizationItemData[];
    onReorder: (newItems: PrioritizationItemData[]) => void;
}

export function PrioritizationList({ items, onReorder }: PrioritizationListProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);

            onReorder(arrayMove(items, oldIndex, newIndex));
        }
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={items.map(item => item.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="w-full">
                    {/* Header Row */}
                    <div className="grid grid-cols-[auto_auto_1fr] gap-4 px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        <div className="w-5"></div> {/* Spacer for Grip */}
                        <div className="w-20 text-center">Prioridade</div>
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4 pl-4">Título</div>
                            <div className="col-span-2">Tipo</div>
                            <div className="col-span-1">Criticidade</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-1">Prazo Desejado</div>
                            <div className="col-span-2 text-right">Cancelamento</div>
                        </div>
                    </div>

                    {items.map((item, index) => (
                        <PrioritizationItem key={item.id} id={item.id} item={item} index={index} />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
