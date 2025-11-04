import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Lock, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SSO = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // const { login } = useAuth();
  const { toast } = useToast();
  
  const role = (location.state as { role?: UserRole })?.role || 'student';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập đầy đủ thông tin",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Simulate API call - Replace this with actual API call later
    setTimeout(() => {
      // Mock JWT token generation
      const mockToken = `mock_jwt_token_${Date.now()}_${role}`;
      
      // Mock user data
      const mockUser = {
        id: `user_${Date.now()}`,
        email: email,
        name: email.split('@')[0],
        role: role,
      };

      // Save to context and localStorage
      // login(mockToken, mockUser);

      toast({
        title: "Đăng nhập thành công",
        description: `Chào mừng ${mockUser.name}!`,
      });

      setIsLoading(false);

      // Redirect to home page
      navigate('/');
    }, 1500);
  };

  const handleBack = () => {
    navigate('/login');
  };

  const getRoleDisplay = (role: UserRole) => {
    const roleMap = {
      admin: 'Admin',
      tutor: 'Tutor (Gia sư)',
      student: 'Student (Sinh viên)',
    };
    return roleMap[role];
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Button>
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold text-center">
            Đăng nhập SSO
          </CardTitle>
          <CardDescription className="text-center">
            Vai trò: <span className="font-semibold text-primary">{getRoleDisplay(role)}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <AlertDescription className="text-sm text-blue-800">
              <strong>Chế độ giả lập:</strong> Nhập bất kỳ email và mật khẩu nào để đăng nhập. 
              Tích hợp API thực tế sẽ được thêm sau.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="example@hcmut.edu.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>Quên mật khẩu? Liên hệ quản trị viên</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SSO;
