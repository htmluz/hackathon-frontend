import { useEffect, useState } from 'react'
import apiClient from '@/api/axios'
import { Loader2, Plus, Pencil, Trash2, Users as UsersIcon, AlertTriangle, Building2 } from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SectorSelect } from "@/components/SectorSelect"
import { sectorsService, type Sector } from "@/services/sectorsService"
import { Switch } from "@/components/ui/switch"

// --- Interfaces ---

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
    sector_id?: number | null
    sector_name?: string
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
    sector_id: number | null
}

interface CreateUserForm {
    name: string
    email: string
    password: string
    type_ids: number[]
    sector_id: number | null
}

interface UserTypesResponse {
    success: boolean
    data: UserType[]
}

// --- Main Component ---

function Users() {
    // --- State: Users ---
    const [users, setUsers] = useState<User[]>([])
    const [userTypes, setUserTypes] = useState<UserType[]>([])
    const [usersLoading, setUsersLoading] = useState(true)
    const [usersError, setUsersError] = useState<string | null>(null)

    // User Modals State
    const [deleteUserModalOpen, setDeleteUserModalOpen] = useState(false)
    const [userToDelete, setUserToDelete] = useState<User | null>(null)
    const [deleteUserLoading, setDeleteUserLoading] = useState(false)

    const [editUserModalOpen, setEditUserModalOpen] = useState(false)
    const [userToEdit, setUserToEdit] = useState<User | null>(null)
    const [editUserForm, setEditUserForm] = useState<EditUserForm>({ name: '', email: '', password: '', sector_id: null })
    const [editUserLoading, setEditUserLoading] = useState(false)

    const [createUserModalOpen, setCreateUserModalOpen] = useState(false)
    const [createUserForm, setCreateUserForm] = useState<CreateUserForm>({ name: '', email: '', password: '', type_ids: [], sector_id: null })
    const [createUserLoading, setCreateUserLoading] = useState(false)

    // --- State: Sectors ---
    const [sectors, setSectors] = useState<Sector[]>([])
    const [sectorsLoading, setSectorsLoading] = useState(true)

    // Sector Modals State
    const [createSectorModalOpen, setCreateSectorModalOpen] = useState(false)
    const [editSectorModalOpen, setEditSectorModalOpen] = useState(false)
    const [deleteSectorModalOpen, setDeleteSectorModalOpen] = useState(false)

    const [sectorForm, setSectorForm] = useState({ name: '', description: '', active: true })
    const [selectedSector, setSelectedSector] = useState<Sector | null>(null)
    const [sectorActionLoading, setSectorActionLoading] = useState(false)

    // --- Fetch Data ---

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
            setUsersLoading(true)
            const response = await apiClient.get<UsersResponse>('/private/users')
            if (response.data.success) {
                setUsers(response.data.data)
            }
        } catch (err) {
            setUsersError(err instanceof Error ? err.message : 'Erro ao carregar usuários')
            console.error('Error fetching users:', err)
        } finally {
            setUsersLoading(false)
        }
    }

    const fetchSectors = async () => {
        try {
            setSectorsLoading(true)
            const data = await sectorsService.getAll()
            setSectors(data)
        } catch (err) {
            console.error('Error fetching sectors:', err)
        } finally {
            setSectorsLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
        fetchUserTypes()
        fetchSectors()
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

    // --- User Actions ---

    const handleEditUser = (user: User) => {
        setUserToEdit(user)
        setEditUserForm({
            name: user.name,
            email: user.email,
            password: '',
            sector_id: user.sector_id ?? null
        })
        setEditUserModalOpen(true)
    }

    const confirmEditUser = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!userToEdit) return
        setEditUserLoading(true)
        try {
            const payload: Partial<EditUserForm> = {
                name: editUserForm.name,
                email: editUserForm.email,
                sector_id: editUserForm.sector_id
            }
            if (editUserForm.password) payload.password = editUserForm.password

            await apiClient.put(`/private/users/${userToEdit.id}`, payload)
            setEditUserModalOpen(false)
            fetchUsers()
        } catch (err) {
            console.error('Error updating user:', err)
        } finally {
            setEditUserLoading(false)
        }
    }

    const handleDeleteUser = (user: User) => {
        setUserToDelete(user)
        setDeleteUserModalOpen(true)
    }

    const confirmDeleteUser = async () => {
        if (!userToDelete) return
        setDeleteUserLoading(true)
        try {
            await apiClient.delete(`/private/users/${userToDelete.id}`)
            setDeleteUserModalOpen(false)
            fetchUsers()
        } catch (err) {
            console.error('Error deleting user:', err)
        } finally {
            setDeleteUserLoading(false)
        }
    }

    const confirmCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreateUserLoading(true)
        try {
            await apiClient.post('/private/users', {
                ...createUserForm,
                sector_id: createUserForm.sector_id
            })
            setCreateUserModalOpen(false)
            setCreateUserForm({ name: '', email: '', password: '', type_ids: [], sector_id: null })
            fetchUsers()
        } catch (err) {
            console.error('Error creating user:', err)
        } finally {
            setCreateUserLoading(false)
        }
    }

    const handleTypeToggle = (typeId: number) => {
        setCreateUserForm((prev) => ({
            ...prev,
            type_ids: prev.type_ids.includes(typeId)
                ? prev.type_ids.filter((id) => id !== typeId)
                : [...prev.type_ids, typeId],
        }))
    }

    // --- Sector Actions ---

    const handleCreateSector = async (e: React.FormEvent) => {
        e.preventDefault()
        setSectorActionLoading(true)
        try {
            await sectorsService.create(sectorForm)
            setCreateSectorModalOpen(false)
            setSectorForm({ name: '', description: '', active: true })
            fetchSectors()
        } catch (error) {
            console.error("Error creating sector", error)
        } finally {
            setSectorActionLoading(false)
        }
    }

    const handleEditSector = (sector: Sector) => {
        setSelectedSector(sector)
        setSectorForm({ name: sector.name, description: sector.description, active: sector.active })
        setEditSectorModalOpen(true)
    }

    const confirmEditSector = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedSector) return
        setSectorActionLoading(true)
        try {
            await sectorsService.update(selectedSector.id, sectorForm)
            setEditSectorModalOpen(false)
            fetchSectors()
            // Refresh users too as names might change
            fetchUsers()
        } catch (error) {
            console.error("Error updating sector", error)
        } finally {
            setSectorActionLoading(false)
        }
    }

    const handleDeleteSector = (sector: Sector) => {
        setSelectedSector(sector)
        setDeleteSectorModalOpen(true)
    }

    const confirmDeleteSector = async () => {
        if (!selectedSector) return
        setSectorActionLoading(true)
        try {
            const result = await sectorsService.delete(selectedSector.id)
            if (result.error) {
                alert(result.error) // Simple alert for now, could be toast
            } else {
                setDeleteSectorModalOpen(false)
                fetchSectors()
            }
        } catch (error) {
            console.error("Error deleting sector", error)
        } finally {
            setSectorActionLoading(false)
        }
    }

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <UsersIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Gerenciamento</h1>
                        <p className="text-sm text-gray-500">Usuários e Setores do sistema</p>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="users" className="w-full">
                <TabsList className="mb-6 grid w-full max-w-[400px] grid-cols-2">
                    <TabsTrigger value="users">Usuários</TabsTrigger>
                    <TabsTrigger value="sectors">Setores</TabsTrigger>
                </TabsList>

                {/* --- USERS TAB --- */}
                <TabsContent value="users">
                    <div className="flex justify-end mb-4">
                        <Button onClick={() => setCreateUserModalOpen(true)} className="flex items-center gap-2">
                            <Plus size={18} /> Novo Usuário
                        </Button>
                    </div>

                    {usersLoading ? (
                        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-400" /></div>
                    ) : (
                        <div className="bg-white rounded-lg border shadow-sm">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Setor</TableHead>
                                        <TableHead>Tipos</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} className="text-center py-8">Nenhum usuário encontrado</TableCell></TableRow>
                                    ) : (
                                        users.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">{user.name}</TableCell>
                                                <TableCell className="text-gray-600">{user.email}</TableCell>
                                                <TableCell>
                                                    {user.sector_name ? (
                                                        <Badge variant="outline" className="font-normal">{user.sector_name}</Badge>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.user_types?.map(t => (
                                                            <Badge key={t.id} variant="secondary" className="text-xs">{t.name}</Badge>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}>
                                                            <Pencil size={16} className="text-gray-500" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user)}>
                                                            <Trash2 size={16} className="text-gray-500 hover:text-red-500" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </TabsContent>

                {/* --- SECTORS TAB --- */}
                <TabsContent value="sectors">
                    <div className="flex justify-end mb-4">
                        <Button onClick={() => setCreateSectorModalOpen(true)} className="flex items-center gap-2">
                            <Plus size={18} /> Novo Setor
                        </Button>
                    </div>

                    {sectorsLoading ? (
                        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-400" /></div>
                    ) : (
                        <div className="bg-white rounded-lg border shadow-sm">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Descrição</TableHead>
                                        <TableHead className="text-center">Usuários</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sectors.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} className="text-center py-8">Nenhum setor encontrado</TableCell></TableRow>
                                    ) : (
                                        sectors.map((sector) => (
                                            <TableRow key={sector.id}>
                                                <TableCell className="font-medium">{sector.name}</TableCell>
                                                <TableCell className="text-gray-600 max-w-[300px] truncate">{sector.description}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="secondary">{sector.user_count || 0}</Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant={sector.active ? "default" : "destructive"} className={sector.active ? "bg-green-500 hover:bg-green-600" : ""}>
                                                        {sector.active ? "Ativo" : "Inativo"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button variant="ghost" size="icon" onClick={() => handleEditSector(sector)}>
                                                            <Pencil size={16} className="text-gray-500" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteSector(sector)} disabled={(sector.user_count || 0) > 0} title={(sector.user_count || 0) > 0 ? "Não é possível excluir setor com usuários" : "Excluir setor"}>
                                                            <Trash2 size={16} className={(sector.user_count || 0) > 0 ? "text-gray-300" : "text-gray-500 hover:text-red-500"} />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* --- MODALS FOR USERS --- */}

            {/* Create User */}
            <Dialog open={createUserModalOpen} onOpenChange={setCreateUserModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Novo Usuário</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={confirmCreateUser} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>Nome</Label>
                            <Input required value={createUserForm.name} onChange={e => setCreateUserForm({ ...createUserForm, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input type="email" required value={createUserForm.email} onChange={e => setCreateUserForm({ ...createUserForm, email: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Senha</Label>
                            <Input type="password" required value={createUserForm.password} onChange={e => setCreateUserForm({ ...createUserForm, password: e.target.value })} />
                        </div>
                        <SectorSelect value={createUserForm.sector_id} onChange={id => setCreateUserForm({ ...createUserForm, sector_id: id })} />
                        <div className="space-y-2">
                            <Label>Tipos de Usuário</Label>
                            <div className="flex gap-2">
                                {userTypes.map(type => (
                                    <Badge
                                        key={type.id}
                                        variant={createUserForm.type_ids.includes(type.id) ? "default" : "outline"}
                                        className="cursor-pointer"
                                        onClick={() => handleTypeToggle(type.id)}
                                    >
                                        {type.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setCreateUserModalOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={createUserLoading}>{createUserLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Criar</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit User */}
            <Dialog open={editUserModalOpen} onOpenChange={setEditUserModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Usuário</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={confirmEditUser} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>Nome</Label>
                            <Input required value={editUserForm.name} onChange={e => setEditUserForm({ ...editUserForm, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input type="email" required value={editUserForm.email} onChange={e => setEditUserForm({ ...editUserForm, email: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Nova Senha (opcional)</Label>
                            <Input type="password" value={editUserForm.password} onChange={e => setEditUserForm({ ...editUserForm, password: e.target.value })} placeholder="Deixe em branco para manter" />
                        </div>
                        <SectorSelect value={editUserForm.sector_id} onChange={id => setEditUserForm({ ...editUserForm, sector_id: id })} />
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setEditUserModalOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={editUserLoading}>{editUserLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete User */}
            <Dialog open={deleteUserModalOpen} onOpenChange={setDeleteUserModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2"><AlertTriangle size={20} /> Confirmar Exclusão</DialogTitle>
                        <DialogDescription>Tem certeza que deseja excluir <b>{userToDelete?.name}</b>?</DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setDeleteUserModalOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={confirmDeleteUser} disabled={deleteUserLoading}>
                            {deleteUserLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Excluir
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>


            {/* --- MODALS FOR SECTORS --- */}

            {/* Create Sector */}
            <Dialog open={createSectorModalOpen} onOpenChange={setCreateSectorModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Building2 className="w-5 h-5" /> Novo Setor</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateSector} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>Nome do Setor</Label>
                            <Input required value={sectorForm.name} onChange={e => setSectorForm({ ...sectorForm, name: e.target.value })} placeholder="Ex: Tecnologia da Informação" />
                        </div>
                        <div className="space-y-2">
                            <Label>Descrição</Label>
                            <Input value={sectorForm.description} onChange={e => setSectorForm({ ...sectorForm, description: e.target.value })} placeholder="Ex: Departamento de TI" />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setCreateSectorModalOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={sectorActionLoading}>{sectorActionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Criar</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Sector */}
            <Dialog open={editSectorModalOpen} onOpenChange={setEditSectorModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Setor</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={confirmEditSector} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>Nome do Setor</Label>
                            <Input required value={sectorForm.name} onChange={e => setSectorForm({ ...sectorForm, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Descrição</Label>
                            <Input value={sectorForm.description} onChange={e => setSectorForm({ ...sectorForm, description: e.target.value })} />
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                            <Label>Setor Ativo?</Label>
                            <Switch checked={sectorForm.active} onCheckedChange={checked => setSectorForm({ ...sectorForm, active: checked })} />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setEditSectorModalOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={sectorActionLoading}>{sectorActionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Sector */}
            <Dialog open={deleteSectorModalOpen} onOpenChange={setDeleteSectorModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2"><AlertTriangle size={20} /> Excluir Setor</DialogTitle>
                        <DialogDescription>
                            Deseja excluir o setor <b>{selectedSector?.name}</b>?
                            {selectedSector?.user_count && selectedSector.user_count > 0 && <span className="block text-red-500 mt-2 font-bold">Atenção: Este setor possui usuários vinculados e não pode ser excluído.</span>}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setDeleteSectorModalOpen(false)}>Cancelar</Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDeleteSector}
                            disabled={sectorActionLoading || (selectedSector?.user_count || 0) > 0}
                        >
                            {sectorActionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Excluir
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    )
}

export default Users
