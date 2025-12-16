import { useEffect, useState } from 'react';
import apiClient from '@/api/axios';
import { Loader2, User, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface UserType {
    id: number;
    name: string;
    description: string;
}

interface UserData {
    id: number;
    email: string;
    name: string;
    user_types: UserType[] | null;
    sector_id?: number | null;
    sector_name?: string;
    created_at: string;
}

export default function KeyUsersPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/private/users');
            // Check structure based on Users.tsx
            if (response.data.success && Array.isArray(response.data.data)) {
                setUsers(response.data.data);
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.sector_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto p-6 space-y-6 max-w-7xl">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Key Users e Colaboradores</h1>
                <p className="text-slate-500">Listagem completa de usuários do sistema para consulta.</p>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex justify-between items-center gap-4">
                        <div className="space-y-1">
                            <CardTitle>Usuários Cadastrados</CardTitle>
                            <CardDescription>Visualize informações de contato e setor.</CardDescription>
                        </div>
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Buscar por nome, email ou setor..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Setor</TableHead>
                                        <TableHead>Permissões</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                                                Nenhum usuário encontrado.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                            <User className="w-4 h-4" />
                                                        </div>
                                                        {user.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    {user.sector_name ? (
                                                        <Badge variant="outline" className="bg-slate-50">
                                                            {user.sector_name}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-slate-400 text-sm italic">Sem setor</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.user_types && user.user_types.length > 0 ? (
                                                            user.user_types.map(type => (
                                                                <Badge key={type.id} className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                                                                    {type.description.split(' ')[0]}
                                                                </Badge>
                                                            ))
                                                        ) : (
                                                            <span className="text-slate-400 text-xs">Padrão</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
