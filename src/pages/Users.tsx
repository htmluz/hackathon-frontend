import { useEffect, useState } from 'react'
import apiClient from '@/api/axios'
import { Loader2, Plus, Pencil, Trash2, Users as UsersIcon, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'

interface UserType {
    id: number
    name: string
    description: string
    created_at: string
    updated_at: string
}

interface User {
    id: number
    email: string
    name: string
    user_types: UserType[] | null
    created_at: string
}

interface UsersResponse {
    count: number
    data: User[]
    success: boolean
}

interface EditUserForm {
    name: string
    email: string
    password: string
}

interface CreateUserForm {
    name: string
    email: string
    password: string
    type_ids: number[]
}

interface UserTypesResponse {
    success: boolean
    data: UserType[]
}

function Users() {
    const [users, setUsers] = useState<User[]>([])
    const [userTypes, setUserTypes] = useState<UserType[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Delete modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [userToDelete, setUserToDelete] = useState<User | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [deleteError, setDeleteError] = useState<string | null>(null)

    // Edit modal state
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [userToEdit, setUserToEdit] = useState<User | null>(null)
    const [editForm, setEditForm] = useState<EditUserForm>({ name: '', email: '', password: '' })
    const [editLoading, setEditLoading] = useState(false)
    const [editError, setEditError] = useState<string | null>(null)

    // Create modal state
    const [createModalOpen, setCreateModalOpen] = useState(false)
    const [createForm, setCreateForm] = useState<CreateUserForm>({ name: '', email: '', password: '', type_ids: [] })
    const [createLoading, setCreateLoading] = useState(false)
    const [createError, setCreateError] = useState<string | null>(null)

    const fetchUserTypes = async () => {
        try {
            const response = await apiClient.get<UserTypesResponse>('/private/user-types')
            if (response.data.success) {
                setUserTypes(response.data.data)
            }
        } catch (err) {
            console.error('Error fetching user types:', err)
        }
    }

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const response = await apiClient.get<UsersResponse>('/private/users')
            if (response.data.success) {
                setUsers(response.data.data)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar usuários')
            console.error('Error fetching users:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
        fetchUserTypes()
    }, [])

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const handleEdit = (user: User) => {
        setUserToEdit(user)
        setEditForm({
            name: user.name,
            email: user.email,
            password: '', // Password is optional for updates
        })
        setEditError(null)
        setEditModalOpen(true)
    }

    const confirmEdit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!userToEdit) return

        setEditLoading(true)
        setEditError(null)

        try {
            // Only send password if it was changed
            const payload: Partial<EditUserForm> = {
                name: editForm.name,
                email: editForm.email,
            }
            if (editForm.password) {
                payload.password = editForm.password
            }

            const response = await apiClient.put(`/private/users/${userToEdit.id}`, payload)
            
            if (response.data.success) {
                setEditModalOpen(false)
                setUserToEdit(null)
                // Refresh users list
                await fetchUsers()
            } else {
                setEditError(response.data.message || 'Erro ao atualizar usuário')
            }
        } catch (err) {
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response?: { data?: { message?: string } } }
                setEditError(axiosError.response?.data?.message || 'Erro ao atualizar usuário')
            } else {
                setEditError('Erro ao conectar com o servidor')
            }
            console.error('Error updating user:', err)
        } finally {
            setEditLoading(false)
        }
    }

    const handleDelete = (user: User) => {
        setUserToDelete(user)
        setDeleteError(null)
        setDeleteModalOpen(true)
    }

    const confirmDelete = async () => {
        if (!userToDelete) return

        setDeleteLoading(true)
        setDeleteError(null)

        try {
            const response = await apiClient.delete(`/private/users/${userToDelete.id}`)
            
            if (response.data.success) {
                setDeleteModalOpen(false)
                setUserToDelete(null)
                // Refresh users list
                await fetchUsers()
            } else {
                setDeleteError(response.data.message || 'Erro ao deletar usuário')
            }
        } catch (err) {
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response?: { data?: { message?: string } } }
                setDeleteError(axiosError.response?.data?.message || 'Erro ao deletar usuário')
            } else {
                setDeleteError('Erro ao conectar com o servidor')
            }
            console.error('Error deleting user:', err)
        } finally {
            setDeleteLoading(false)
        }
    }

    const handleAddUser = () => {
        setCreateForm({ name: '', email: '', password: '', type_ids: [] })
        setCreateError(null)
        setCreateModalOpen(true)
    }

    const confirmCreate = async (e: React.FormEvent) => {
        e.preventDefault()

        setCreateLoading(true)
        setCreateError(null)

        try {
            const response = await apiClient.post('/private/users', {
                email: createForm.email,
                name: createForm.name,
                password: createForm.password,
                type_ids: createForm.type_ids,
            })

            if (response.data.success) {
                setCreateModalOpen(false)
                setCreateForm({ name: '', email: '', password: '', type_ids: [] })
                // Refresh users list
                await fetchUsers()
            } else {
                setCreateError(response.data.message || 'Erro ao criar usuário')
            }
        } catch (err) {
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response?: { data?: { message?: string } } }
                setCreateError(axiosError.response?.data?.message || 'Erro ao criar usuário')
            } else {
                setCreateError('Erro ao conectar com o servidor')
            }
            console.error('Error creating user:', err)
        } finally {
            setCreateLoading(false)
        }
    }

    const handleTypeToggle = (typeId: number) => {
        setCreateForm((prev) => ({
            ...prev,
            type_ids: prev.type_ids.includes(typeId)
                ? prev.type_ids.filter((id) => id !== typeId)
                : [...prev.type_ids, typeId],
        }))
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <UsersIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
                        <p className="text-sm text-gray-500">Gerencie os usuários do sistema</p>
                    </div>
                </div>
                <Button onClick={handleAddUser} className="flex items-center gap-2">
                    <Plus size={18} />
                    Novo Usuário
                </Button>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-3 text-gray-500">
                        <Loader2 className="animate-spin" size={24} />
                        <span>Carregando usuários...</span>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Users Table */}
            {!loading && !error && (
                <div className="bg-white rounded-lg border shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50">
                                <TableHead className="w-[80px]">ID</TableHead>
                                <TableHead>Nome</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Tipos</TableHead>
                                <TableHead>Criado em</TableHead>
                                <TableHead className="text-right w-[120px]">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                        Nenhum usuário encontrado
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id} className="hover:bg-gray-50">
                                        <TableCell className="font-mono text-sm text-gray-500">
                                            #{user.id}
                                        </TableCell>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell className="text-gray-600">{user.email}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {user.user_types && user.user_types.length > 0 ? (
                                                    user.user_types.map((type) => (
                                                        <Badge
                                                            key={type.id}
                                                            variant={type.name === 'admin' ? 'default' : 'secondary'}
                                                            className="text-xs"
                                                        >
                                                            {type.name}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-400 text-xs">Sem tipo</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-500 text-sm">
                                            {formatDate(user.created_at)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(user)}
                                                    className="h-8 w-8 text-gray-500 hover:text-primary"
                                                >
                                                    <Pencil size={16} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(user)}
                                                    className="h-8 w-8 text-gray-500 hover:text-red-500"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Footer with count */}
                    <div className="px-4 py-3 border-t bg-gray-50 text-sm text-gray-500">
                        {users.length} usuário{users.length !== 1 ? 's' : ''} encontrado{users.length !== 1 ? 's' : ''}
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle size={20} />
                            Confirmar Exclusão
                        </DialogTitle>
                        <DialogDescription>
                            Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <p className="text-gray-700">
                            Tem certeza que deseja excluir o usuário{' '}
                            <span className="font-semibold">{userToDelete?.name}</span>?
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Email: {userToDelete?.email}
                        </p>
                    </div>

                    {deleteError && (
                        <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
                            {deleteError}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDeleteModalOpen(false)}
                            disabled={deleteLoading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={deleteLoading}
                        >
                            {deleteLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Excluindo...
                                </>
                            ) : (
                                'Excluir Usuário'
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit User Modal */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Usuário</DialogTitle>
                        <DialogDescription>
                            Atualize as informações do usuário
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={confirmEdit} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Nome</Label>
                            <Input
                                id="edit-name"
                                type="text"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                placeholder="Nome completo"
                                required
                                disabled={editLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                placeholder="email@exemplo.com"
                                required
                                disabled={editLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-password">Nova Senha (opcional)</Label>
                            <Input
                                id="edit-password"
                                type="password"
                                value={editForm.password}
                                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                placeholder="Deixe em branco para manter a senha atual"
                                disabled={editLoading}
                            />
                            <p className="text-xs text-gray-500">
                                Preencha apenas se desejar alterar a senha
                            </p>
                        </div>

                        {editError && (
                            <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
                                {editError}
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditModalOpen(false)}
                                disabled={editLoading}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={editLoading}>
                                {editLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    'Salvar Alterações'
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Create User Modal */}
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Novo Usuário</DialogTitle>
                        <DialogDescription>
                            Preencha os dados para criar um novo usuário
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={confirmCreate} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="create-name">Nome</Label>
                            <Input
                                id="create-name"
                                type="text"
                                value={createForm.name}
                                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                placeholder="Nome completo"
                                required
                                disabled={createLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-email">Email</Label>
                            <Input
                                id="create-email"
                                type="email"
                                value={createForm.email}
                                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                                placeholder="email@exemplo.com"
                                required
                                disabled={createLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-password">Senha</Label>
                            <Input
                                id="create-password"
                                type="password"
                                value={createForm.password}
                                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                                placeholder="Digite a senha"
                                required
                                disabled={createLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Tipos de Usuário</Label>
                            <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-gray-50">
                                {userTypes.length === 0 ? (
                                    <span className="text-sm text-gray-500">Carregando tipos...</span>
                                ) : (
                                    userTypes.map((type) => (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => handleTypeToggle(type.id)}
                                            disabled={createLoading}
                                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                                createForm.type_ids.includes(type.id)
                                                    ? 'bg-primary text-white'
                                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            {type.name}
                                        </button>
                                    ))
                                )}
                            </div>
                            <p className="text-xs text-gray-500">
                                Clique para selecionar um ou mais tipos
                            </p>
                        </div>

                        {createError && (
                            <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
                                {createError}
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setCreateModalOpen(false)}
                                disabled={createLoading}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={createLoading}>
                                {createLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Criando...
                                    </>
                                ) : (
                                    'Criar Usuário'
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default Users
