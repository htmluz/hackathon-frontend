import { useEffect, useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
    LayoutGrid,
    FileText,
    Users,
    ListOrdered,
    HelpCircle,
    Bell,
    ChevronDown,
    LogOut,
    Key,
    Loader2,
    X,
    CheckSquare
} from 'lucide-react'
import { authApi } from '@/api/auth'
import apiClient from '@/api/axios'
import logoSenior from '@/assets/logo_senior.svg'

interface User {
    id: number
    email: string
    name: string
    created_at: string
    updated_at: string
}

interface UserType {
    id: number
    name: string
    description: string
    created_at: string
    updated_at: string
}

export function Navbar() {
    const navigate = useNavigate()
    const location = useLocation()
    const [user, setUser] = useState<User | null>(null)
    const [userTypes, setUserTypes] = useState<UserType[]>([])
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Change password modal state
    const [changePasswordOpen, setChangePasswordOpen] = useState(false)
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [changePasswordLoading, setChangePasswordLoading] = useState(false)
    const [changePasswordError, setChangePasswordError] = useState<string | null>(null)
    const [changePasswordSuccess, setChangePasswordSuccess] = useState(false)

    const isAdmin = userTypes.some((type) => type.name === 'admin')
    const isAdminOrManager = userTypes.some((type) => type.name === 'admin' || type.name === 'manager')

    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser))
            } catch (e) {
                console.error('Failed to parse user from local storage:', e)
            }
        }

        const storedUserTypes = localStorage.getItem('user_types')
        if (storedUserTypes) {
            try {
                setUserTypes(JSON.parse(storedUserTypes))
            } catch (e) {
                console.error('Failed to parse user types from local storage:', e)
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

    const handleOpenChangePassword = () => {
        setIsDropdownOpen(false)
        setOldPassword('')
        setNewPassword('')
        setChangePasswordError(null)
        setChangePasswordSuccess(false)
        setChangePasswordOpen(true)
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setChangePasswordLoading(true)
        setChangePasswordError(null)
        setChangePasswordSuccess(false)

        try {
            const response = await apiClient.post('/private/change-password', {
                old_password: oldPassword,
                new_password: newPassword,
            })

            if (response.data.success) {
                setChangePasswordSuccess(true)
                setOldPassword('')
                setNewPassword('')
                // Close modal after 2 seconds on success
                setTimeout(() => {
                    setChangePasswordOpen(false)
                    setChangePasswordSuccess(false)
                }, 2000)
            } else {
                setChangePasswordError(response.data.message || 'Erro ao alterar senha')
            }
        } catch (err) {
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response?: { data?: { message?: string } } }
                setChangePasswordError(axiosError.response?.data?.message || 'Erro ao alterar senha')
            } else {
                setChangePasswordError('Erro ao conectar com o servidor')
            }
        } finally {
            setChangePasswordLoading(false)
        }
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
                    <img
                        src={logoSenior}
                        alt="Senior Logo"
                        className="h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => navigate('/')}
                    />
                    <div className="flex items-center gap-3">
                        {/* <span className="text-[var(--primary)] font-bold text-xl tracking-tight leading-none">Senior</span> */}
                        <div className="h-5 w-px bg-gray-600 hidden md:block"></div>
                        <span className="text-gray-300 text-sm hidden lg:block font-medium">
                            Portal de Iniciativas - TI Corporativa
                        </span>
                    </div>
                </div>

                {/* Middle Section: Navigation */}
                <nav className="flex items-center gap-1 xl:gap-2">
                    <NavItem
                        icon={<LayoutGrid size={18} />}
                        label="Página Inicial"
                        active={location.pathname === '/'}
                        onClick={() => navigate('/')}
                    />
                    <NavItem
                        icon={<FileText size={18} />}
                        label="Lista de Iniciativas"
                        active={location.pathname === '/iniciativas'}
                        onClick={() => navigate('/iniciativas')}
                    />
                    <NavItem
                        icon={<ListOrdered size={18} />}
                        label="Priorização"
                        active={location.pathname === '/priorizacao'}
                        onClick={() => navigate('/priorizacao')}
                    />
                    {isAdminOrManager && (
                        <NavItem
                            icon={<CheckSquare size={18} />}
                            label="Aprovação"
                            active={location.pathname === '/aprovacao'}
                            onClick={() => navigate('/aprovacao')}
                        />
                    )}
                    {isAdmin && (
                        <NavItem
                            icon={<Users size={18} />}
                            label="Usuários"
                            active={location.pathname === '/users'}
                            onClick={() => navigate('/users')}
                        />
                    )}
                </nav>

                {/* Right Section: Actions & Profile */}
                <div className="flex items-center gap-4 shrink-0">
                    <button
                        className="text-gray-400 hover:text-white transition-colors"
                        title="Ajuda"
                        onClick={() => navigate('/faq')}
                    >
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
                                    <span className="text-[10px] text-gray-400 leading-tight truncate max-w-[100px]">
                                        {userTypes.length > 0 ? userTypes.map(t => t.name).join(', ') : 'Usuário'}
                                    </span>
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
                                        onClick={handleOpenChangePassword}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                                    >
                                        <Key size={16} />
                                        Alterar Senha
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors border-t border-gray-600"
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

            {/* Change Password Modal */}
            {changePasswordOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                        <div className="flex items-center justify-between px-6 py-4 border-b">
                            <h2 className="text-lg font-semibold text-gray-900">Alterar Senha</h2>
                            <button
                                onClick={() => setChangePasswordOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                            {changePasswordSuccess ? (
                                <div className="text-sm text-green-600 bg-green-50 border border-green-200 px-4 py-3 rounded-lg text-center">
                                    Senha alterada com sucesso!
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <label htmlFor="old-password" className="block text-sm font-medium text-gray-700">
                                            Senha Atual
                                        </label>
                                        <input
                                            id="old-password"
                                            type="password"
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            placeholder="Digite sua senha atual"
                                            required
                                            disabled={changePasswordLoading}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent disabled:bg-gray-100"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                                            Nova Senha
                                        </label>
                                        <input
                                            id="new-password"
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Digite a nova senha"
                                            required
                                            disabled={changePasswordLoading}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent disabled:bg-gray-100"
                                        />
                                    </div>

                                    {changePasswordError && (
                                        <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
                                            {changePasswordError}
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setChangePasswordOpen(false)}
                                            disabled={changePasswordLoading}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={changePasswordLoading}
                                            className="px-4 py-2 text-sm font-medium text-white bg-[var(--primary)] rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {changePasswordLoading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Alterando...
                                                </>
                                            ) : (
                                                'Alterar Senha'
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </header>
    )
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={label}
            className={`
             flex items-center justify-center gap-2 p-2 xl:px-4 xl:py-2 rounded-md text-sm font-medium transition-all duration-200
             ${active
                    ? 'bg-[var(--primary)] text-white shadow-sm hover:opacity-90'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }
           `}
        >
            {icon}
            <span className="hidden xl:inline whitespace-nowrap">{label}</span>
        </button>
    )
}
