import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { authApi } from '../api/auth'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import logoSenior from '@/assets/logo_senior.svg'

interface LocationState {
  from?: { pathname: string }
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null
  const from = state?.from?.pathname || '/'
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // If user is already logged in, redirect to home
  const user = localStorage.getItem('user')
  if (user) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await authApi.login({ email, password })

      if (response.success && response.user) {
        // Fetch personal information after successful login
        try {
          const personalInfo = await authApi.getPersonalInfo()
          
          if (personalInfo.success && personalInfo.data) {
            // Store complete user info and user types
            localStorage.setItem('user', JSON.stringify(personalInfo.data.user))
            localStorage.setItem('user_types', JSON.stringify(personalInfo.data.user_types))
          } else {
            // Fallback to login response user if personal info fails
            localStorage.setItem('user', JSON.stringify(response.user))
          }
        } catch {
          // Fallback to login response user if personal info request fails
          localStorage.setItem('user', JSON.stringify(response.user))
        }
        
        // Navigate to the original destination or home
        navigate(from, { replace: true })
      } else {
        setError(response.error || 'Falha no login')
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <img src={logoSenior} alt="Senior Logo" className="h-16 w-auto mx-auto mb-6" />
        </div>

        <Card className="border-border/40 shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">Portal de Iniciativas - TIC</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="text-sm text-destructive font-medium text-center bg-destructive/10 py-2 px-4 rounded-lg">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t p-0">
            <p className="text-xs text-muted-foreground">
              Hackathon Senior Sistemas - 2025
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
