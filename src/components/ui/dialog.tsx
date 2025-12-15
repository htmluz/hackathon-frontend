import * as React from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    children: React.ReactNode
}

function Dialog({ open, onOpenChange, children }: DialogProps) {
    if (!open) return null

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                onClick={() => onOpenChange(false)}
            />
            {/* Content */}
            <div className="relative z-50 w-full max-w-5xl bg-white rounded-xl shadow-lg animate-in zoom-in-95 duration-200 p-0 m-4 overflow-hidden flex flex-col max-h-[90vh]">
                {children}
            </div>
        </div>,
        document.body
    )
}

function DialogContent({ className, children, ...props }: React.ComponentProps<"div">) {
    return (
        <div className={cn("p-6 overflow-y-auto", className)} {...props}>
            {children}
        </div>
    )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            className={cn("flex flex-col space-y-1.5 text-center sm:text-left border-b p-6 bg-slate-50/50", className)}
            {...props}
        />
    )
}

function DialogTitle({ className, ...props }: React.ComponentProps<"h2">) {
    return (
        <h2
            className={cn("text-lg font-semibold leading-none tracking-tight text-slate-900", className)}
            {...props}
        />
    )
}

function DialogDescription({ className, ...props }: React.ComponentProps<"p">) {
    return (
        <p
            className={cn("text-sm text-muted-foreground", className)}
            {...props}
        />
    )
}

function DialogClose({ onClick, className, ...props }: React.ComponentProps<"button">) {
    return (
        <button
            onClick={onClick}
            className={cn("absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", className)}
            {...props}
        >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
        </button>
    )
}

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose }
