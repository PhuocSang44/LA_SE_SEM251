import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
      <Card className="w-full max-w-md shadow-xl text-center">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-red-100 rounded-full">
              <ShieldAlert className="w-16 h-16 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold">
            Không có quyền truy cập
          </CardTitle>
          <CardDescription className="text-base">
            Bạn không có quyền truy cập trang này với vai trò hiện tại.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => navigate('/')}
            className="w-full"
            size="lg"
          >
            Quay về trang chủ
          </Button>
          <Button
            onClick={() => navigate('/login')}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Đăng nhập lại
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Unauthorized;
