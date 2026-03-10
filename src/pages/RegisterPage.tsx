import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

const RegisterPage = () => {
    const { register } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', password: '', phone: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await register(form)
            navigate('/')
        } catch (err: any) {
            setError(err.response?.data?.message || 'Помилка реєстрації')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Реєстрація</h1>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {[
                        { name: 'firstName', label: "Ім'я", type: 'text' },
                        { name: 'lastName', label: 'Прізвище', type: 'text' },
                        { name: 'email', label: 'Email', type: 'email' },
                        { name: 'phone', label: 'Телефон', type: 'tel' },
                        { name: 'password', label: 'Пароль', type: 'password' },
                    ].map(field => (
                        <div key={field.name}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {field.label}
                            </label>
                            <input
                                type={field.type}
                                name={field.name}
                                value={form[field.name as keyof typeof form]}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required={field.name !== 'phone'}
                            />
                        </div>
                    ))}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
                    >
                        {loading ? 'Реєстрація...' : 'Зареєструватись'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-600 mt-4">
                    Вже є акаунт?{' '}
                    <Link to="/login" className="text-blue-600 hover:underline">
                        Увійти
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default RegisterPage