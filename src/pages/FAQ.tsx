import { HelpCircle } from 'lucide-react'

function FAQ() {
    return (
        <div className="p-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <HelpCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Perguntas Frequentes</h1>
                        <p className="text-sm text-gray-500">Encontre respostas para as dúvidas mais comuns</p>
                    </div>
                </div>

                {/* FAQ Content Skeleton */}
                <div className="space-y-4">
                    {/* Skeleton FAQ Items */}
                    {[1, 2, 3, 4, 5].map((item) => (
                        <div
                            key={item}
                            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
                        >
                            <div className="animate-pulse">
                                <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                                <div className="space-y-2">
                                    <div className="h-3 bg-gray-100 rounded w-full"></div>
                                    <div className="h-3 bg-gray-100 rounded w-5/6"></div>
                                    <div className="h-3 bg-gray-100 rounded w-4/6"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Coming Soon Notice */}
                <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-sm text-primary font-medium">
                        🚧 Esta página está em construção. Em breve você encontrará aqui as respostas para as perguntas mais frequentes sobre o sistema.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default FAQ

