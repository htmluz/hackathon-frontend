import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Login from './pages/Login'
import Users from './pages/Users'
import InitiativesPage from './pages/InitiativesPage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Navbar } from './components/Navbar'

function App() {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'

  return (
    <div className="min-h-screen">
      {!isLoginPage && <Navbar />}

      <main>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/about" element={
            <ProtectedRoute>
              <About />
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          } />
          <Route path="/iniciativas" element={
            <ProtectedRoute>
              <InitiativesPage />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  )
}

export default App
