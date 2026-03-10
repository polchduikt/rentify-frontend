import api from './api'
import type {
    AuthenticationRequestDto,
    AuthenticationResponseDto,
    RegisterRequestDto,
    GoogleOAuthRequestDto
} from '@/types/auth'

export const authService = {
    login: async (data: AuthenticationRequestDto): Promise<AuthenticationResponseDto> => {
        const response = await api.post('/auth/login', data)
        return response.data
    },

    register: async (data: RegisterRequestDto): Promise<AuthenticationResponseDto> => {
        const response = await api.post('/auth/register', data)
        return response.data
    },

    loginWithGoogle: async (data: GoogleOAuthRequestDto): Promise<AuthenticationResponseDto> => {
        const response = await api.post('/auth/google', data)
        return response.data
    },
}