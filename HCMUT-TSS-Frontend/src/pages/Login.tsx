import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeyRound } from 'lucide-react';
// 1. Switched to relative path for Footer
import Footer from '../components/Footer';
// 2. Switched to relative path for logo
import hcmutLogo from '../assets/logo_BK.png';

// BACK-END constants are still needed
const BACKEND_URL = 'http://localhost:10001';
const SSO_REGISTRATION_ID = 'sso-server'; // This should match your backend's provider ID

const Login = () => {

  /**
   * This function now directly triggers the SSO redirect.
   */
  const handleLogin = () => {
    // Perform the redirect to start the SSO flow
    window.location.href = `${BACKEND_URL}/oauth2/authorization/${SSO_REGISTRATION_ID}`;
  };

  return (
      <div>
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
          <Card className="w-full max-w-lg shadow-xl">
            <CardHeader className="text-center space-y-4">
              <a href="https://www.hcmut.edu.vn" target="_blank" rel="noopener noreferrer">
                <img
                    src={hcmutLogo} // 3. Use the imported logo variable
                    alt="HCMUT Logo"
                    className="mx-auto w-32 h-auto"
                />
              </a>
              <div>
                <CardTitle className="text-3xl md:text-4xl font-bold text-primary">
                  HCMUT Tutor Supporting System
                </CardTitle>
                <CardDescription className="text-lg">
                  Đăng nhập bằng tài khoản trường của bạn để tiếp tục
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center pt-4">
                <Button
                    size="lg"
                    onClick={handleLogin}
                    className="w-full md:w-auto px-12"
                >
                  <KeyRound className="mr-2 h-5 w-5" />
                  Sign in with SSO
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
  );
};

export default Login;

