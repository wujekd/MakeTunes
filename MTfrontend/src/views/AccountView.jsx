import { useState } from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';

export const AccountView = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                isLogin
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                !isLogin
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Register
            </button>
          </div>
        </div>
        
        {isLogin ? (
          <LoginForm />
        ) : (
          <RegisterForm onSuccess={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
}; 