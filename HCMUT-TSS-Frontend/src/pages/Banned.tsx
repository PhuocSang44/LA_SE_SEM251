import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Ban } from 'lucide-react';
import { useEffect } from 'react';
import { api } from '@/lib/api';

const Banned = () => {
  const navigate = useNavigate();

  // Clear the session when the banned page loads
  useEffect(() => {
    const clearSession = async () => {
      try {
        await api.post('/auth/logout');
      } catch (error) {
        console.error('Error clearing session:', error);
      }
    };
    clearSession();
  }, []);

  const handleBackToLogin = () => {
    // Navigate to login and force a full page reload to clear any remaining state
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
      <Card className="w-full max-w-md shadow-xl text-center">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-red-100 rounded-full">
              <Ban className="w-16 h-16 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold text-red-600">
            Tài khoản đã bị khóa
          </CardTitle>
          <CardDescription className="text-base">
            Tài khoản của bạn đã bị quản trị viên khóa. Vui lòng liên hệ với bộ phận hỗ trợ để biết thêm thông tin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
            <p className="font-semibold mb-2">Lý do có thể do:</p>
            <ul className="text-left list-disc list-inside space-y-1">
              <li>Vi phạm điều khoản sử dụng</li>
              <li>Hoạt động bất thường</li>
              <li>Yêu cầu từ quản trị viên</li>
            </ul>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
            <p className="font-semibold">📧 Liên hệ hỗ trợ:</p>
            <p className="mt-1">Email: support@hcmut.edu.vn</p>
            <p>Điện thoại: (028) 3864 5000</p>
          </div>

          <Button
            onClick={handleBackToLogin}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Đăng nhập tài khoản khác
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Banned;
