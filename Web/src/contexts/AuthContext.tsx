import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  ReactNode,
} from 'react';

import { hasValidToken } from '@/utils/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  showLoginModal: (message?: string) => void;
  hideLoginModal: () => void;
  isLoginModalOpen: boolean;
  loginModalMessage: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalMessage, setLoginModalMessage] =
    useState('로그인이 필요한 서비스입니다.');

  const isAuthenticated = hasValidToken();

  const showLoginModal = useCallback((message?: string) => {
    if (message) {
      setLoginModalMessage(message);
    }
    setIsLoginModalOpen(true);
  }, []);

  const hideLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
  }, []);

  const value: AuthContextType = {
    isAuthenticated,
    showLoginModal,
    hideLoginModal,
    isLoginModalOpen,
    loginModalMessage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
