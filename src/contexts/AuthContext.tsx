import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService } from '@/services/authService'
import type { RegisterRequestDto, AuthenticationRequestDto } from '@/types/auth'
import type { User } from '@/types/user'
import api from '@/services/api'

interface AuthContextType {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (data: AuthenticationRequestDto) => Promise<void>
    register: (data: RegisterRequestDto) => Promise<void>
    logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(
        localStorage.getItem('token')
    )
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchUser = async () => {
            if (!token) {
                setIsLoading(false)
                return
            }
            try {
                const response = await api.get('/users/profile')
                setUser(response.data)
            } catch {
                localStorage.removeItem('token')
                setToken(null)
            } finally {
                setIsLoading(false)
            }
        }
        fetchUser()
    }, [token])

    const login = async (data: AuthenticationRequestDto) => {
        const response = await authService.login(data)
        localStorage.setItem('token', response.token)
        setToken(response.token)
    }

    const register = async (data: RegisterRequestDto) => {
        const response = await authService.register(data)
        localStorage.setItem('token', response.token)
        setToken(response.token)
    }

    const logout = () => {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{
            user, token, isAuthenticated: !!token,
            isLoading, login, register, logout
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within AuthProvider')
    return context
}