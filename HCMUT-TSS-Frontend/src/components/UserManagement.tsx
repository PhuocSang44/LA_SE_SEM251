import { useEffect, useState } from 'react';
import { adminApi, AdminUser } from '@/lib/adminApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Ban, UserCheck, AlertCircle, RefreshCw } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const UserManagement = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    
    // Alert dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogAction, setDialogAction] = useState<'delete' | 'ban' | 'unban' | null>(null);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await adminApi.getAllUsers();
            setUsers(data);
        } catch (err: any) {
            setError(err.response?.data || 'Failed to fetch users');
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const openDialog = (action: 'delete' | 'ban' | 'unban', user: AdminUser) => {
        setDialogAction(action);
        setSelectedUser(user);
        setDialogOpen(true);
    };

    const handleConfirmAction = async () => {
        if (!selectedUser || !dialogAction) return;

        try {
            setActionLoading(selectedUser.userId);
            
            if (dialogAction === 'delete') {
                await adminApi.deleteUser(selectedUser.userId);
            } else if (dialogAction === 'ban') {
                await adminApi.banUser(selectedUser.userId);
            } else if (dialogAction === 'unban') {
                await adminApi.unbanUser(selectedUser.userId);
            }

            await fetchUsers();
        } catch (err: any) {
            setError(err.response?.data || `Failed to ${dialogAction} user`);
            console.error(`Error ${dialogAction}ing user:`, err);
        } finally {
            setActionLoading(null);
            setDialogOpen(false);
            setSelectedUser(null);
            setDialogAction(null);
        }
    };

    const getDialogContent = () => {
        if (!selectedUser || !dialogAction) return { title: '', description: '' };

        const userName = `${selectedUser.firstName} ${selectedUser.lastName}`;
        
        switch (dialogAction) {
            case 'delete':
                return {
                    title: 'Delete User',
                    description: `Are you sure you want to permanently delete ${userName} (${selectedUser.email})? This action cannot be undone.`,
                };
            case 'ban':
                return {
                    title: 'Ban User',
                    description: `Are you sure you want to ban ${userName} (${selectedUser.email})? They will not be able to access the system.`,
                };
            case 'unban':
                return {
                    title: 'Unban User',
                    description: `Are you sure you want to unban ${userName} (${selectedUser.email})? They will regain access to the system.`,
                };
            default:
                return { title: '', description: '' };
        }
    };

    const dialogContent = getDialogContent();

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>
                            Manage all users in the system - view, ban, or delete users
                        </CardDescription>
                    </div>
                    <Button 
                        onClick={fetchUsers} 
                        variant="outline" 
                        size="sm"
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-800">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            No users found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                        <TableRow key={user.userId}>
                                            <TableCell className="font-mono text-sm">
                                                {user.studentId || user.staffId || user.userId}
                                            </TableCell>
                                            <TableCell>
                                                {user.firstName} {user.middleName} {user.lastName}
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Badge variant={user.userType === 'STUDENT' ? 'default' : 'secondary'}>
                                                    {user.userType}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {user.role || 'N/A'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {user.departmentName || 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant={user.status === 'ACTIVE' ? 'default' : 'destructive'}
                                                    className={user.status === 'ACTIVE' ? 'bg-green-500' : ''}
                                                >
                                                    {user.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex gap-2 justify-end">
                                                    {user.status === 'ACTIVE' ? (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => openDialog('ban', user)}
                                                            disabled={actionLoading === user.userId}
                                                        >
                                                            <Ban className="h-4 w-4 mr-1" />
                                                            Ban
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => openDialog('unban', user)}
                                                            disabled={actionLoading === user.userId}
                                                        >
                                                            <UserCheck className="h-4 w-4 mr-1" />
                                                            Unban
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => openDialog('delete', user)}
                                                        disabled={actionLoading === user.userId}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                        Delete
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
            </CardContent>

            {/* Confirmation Dialog */}
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{dialogContent.title}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {dialogContent.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmAction}
                            className={dialogAction === 'delete' ? 'bg-red-600 hover:bg-red-700' : ''}
                        >
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
};

export default UserManagement;
