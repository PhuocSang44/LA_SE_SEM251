import { useEffect, useState } from 'react';
import { adminApi, ActivityLog } from '@/lib/adminApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Calendar, User, FileText } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';

const LogsViewer = () => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState<string>('all');

    const fetchLogs = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await adminApi.getAllLogs();
            setLogs(data);
            setFilteredLogs(data);
        } catch (err: any) {
            setError(err.response?.data || 'Failed to fetch logs');
            console.error('Error fetching logs:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    useEffect(() => {
        let filtered = logs;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(log =>
                log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.action.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by action type
        if (filterAction !== 'all') {
            filtered = filtered.filter(log => log.action === filterAction);
        }

        setFilteredLogs(filtered);
    }, [searchTerm, filterAction, logs]);

    const getActionBadgeVariant = (action: string) => {
        if (action.includes('DELETE')) return 'destructive';
        if (action.includes('BAN')) return 'destructive';
        if (action.includes('UNBAN')) return 'default';
        if (action.includes('CREATE')) return 'default';
        if (action.includes('UPDATE')) return 'secondary';
        return 'outline';
    };

    const uniqueActions = Array.from(new Set(logs.map(log => log.action)));

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Activity Logs</CardTitle>
                        <CardDescription>
                            View all system activity and user actions
                        </CardDescription>
                    </div>
                    <Button 
                        onClick={fetchLogs} 
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

                {/* Filters */}
                <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Search logs (email, name, action, description)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <select
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                        <option value="all">All Actions</option>
                        {uniqueActions.map(action => (
                            <option key={action} value={action}>{action}</option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Time</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Entity</TableHead>
                                    <TableHead>Description</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLogs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            {searchTerm || filterAction !== 'all' 
                                                ? 'No logs match your filters' 
                                                : 'No activity logs found'}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <TableRow key={log.logId}>
                                            <TableCell className="text-sm text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    {formatDate(log.createdAt)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    <div>
                                                        <div className="font-medium">{log.userName}</div>
                                                        <div className="text-xs text-muted-foreground">{log.userEmail}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getActionBadgeVariant(log.action)}>
                                                    {log.action}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                    <div>
                                                        <div className="text-sm">{log.entityType}</div>
                                                        {log.entityId && (
                                                            <div className="text-xs text-muted-foreground">ID: {log.entityId}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-md">
                                                <div className="text-sm text-muted-foreground truncate" title={log.description}>
                                                    {log.description}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* Summary */}
                {!loading && filteredLogs.length > 0 && (
                    <div className="mt-4 text-sm text-muted-foreground">
                        Showing {filteredLogs.length} of {logs.length} logs
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default LogsViewer;
