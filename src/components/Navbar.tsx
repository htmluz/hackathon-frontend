
import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    LayoutGrid,
    FileText,
    Users,
    PlusCircle,
    ListOrdered,
    HelpCircle,
    Bell,
    ChevronDown,
    LogOut
} from 'lucide-react'
import { authApi } from '@/api/auth'

interface User {
    id: number
    email: string
    name: string
    created_at: string
    updated_at: string
}

export function Navbar() {
    const navigate = useNavigate()
    const [user, setUser] = useState<User | null>(null)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser))
            } catch (e) {
                console.error('Failed to parse user from local storage:', e)
            }
        }
    }, [])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLogout = () => {
        authApi.logout()
        setIsDropdownOpen(false)
        navigate('/login', { replace: true })
    }

    // Helper to get initials
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <header className="bg-[#1e2329] text-white shadow-md">
            <div className="w-full px-4 h-16 flex items-center justify-between gap-4">
                {/* Left Section: Logo & Brand */}
                <div className="flex items-center gap-3 shrink-0">
                    <div className="bg-[var(--primary)] w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-lg select-none">
                        S
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[var(--primary)] font-bold text-xl tracking-tight leading-none">Senior</span>
                        <div className="h-5 w-px bg-gray-600 hidden md:block"></div>
                        <span className="text-gray-300 text-sm hidden lg:block font-medium">
                            Portal de Iniciativas - TI Corporativa
                        </span>
                    </div>
                </div>

                {/* Middle Section: Navigation */}
                <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    <NavItem icon={<LayoutGrid size={18} />} label="Página Inicial" active onClick={() => navigate('/')} />
                    <NavItem icon={<FileText size={18} />} label="Lista de Iniciativas" />
                    <NavItem icon={<Users size={18} />} label="Usuários" onClick={() => navigate('/users')} />
                    <NavItem icon={<PlusCircle size={18} />} label="Novo Cadastro" />
                    <NavItem icon={<ListOrdered size={18} />} label="Priorização" />
                </nav>

                {/* Right Section: Actions & Profile */}
                <div className="flex items-center gap-4 shrink-0">
                    <button className="text-gray-400 hover:text-white transition-colors" title="Ajuda">
                        <HelpCircle size={20} />
                    </button>
                    <button className="text-gray-400 hover:text-white transition-colors relative" title="Notificações">
                        <Bell size={20} />
                        <span className="absolute top-0 right-1 block w-2 h-2 rounded-full bg-[var(--primary)] ring-2 ring-[#1e2329]"></span>
                    </button>

                    <div className="h-6 w-px bg-gray-600 hidden sm:block"></div>

                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <div 
                                className="flex items-center gap-3 border border-gray-600 rounded-full pl-1.5 pr-4 py-1.5 cursor-pointer hover:bg-gray-700/50 transition-colors group"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <div className="bg-[var(--primary)] text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-transparent group-hover:ring-[var(--primary)]/50 transition-all">
                                    {getInitials(user.name)}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold leading-tight text-white">{user.name}</span>
                                    <span className="text-[10px] text-gray-400 leading-tight truncate max-w-[80px]">Gestor</span>
                                </div>
                                <ChevronDown 
                                    size={14} 
                                    className={`text-gray-400 group-hover:text-white transition-all duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                                />
                            </div>
                            
                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-[#2a3038] border border-gray-600 rounded-lg shadow-xl z-50 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-gray-600">
                                        <p className="text-sm font-medium text-white">{user.name}</p>
                                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                                    >
                                        <LogOut size={16} />
                                        Sair
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-xs text-gray-500 animate-pulse">Carregando...</div>
                    )}
                </div>
            </div>
        </header>
    )
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
             flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
             ${active
                    ? 'bg-[var(--primary)] text-white shadow-sm hover:opacity-90'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }
           `}
        >
            {icon}
            <span className="whitespace-nowrap">{label}</span>
        </button>
    )
}
