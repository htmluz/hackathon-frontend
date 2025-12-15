import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Login from './pages/Login'
import { ProtectedRoute } from './components/ProtectedRoute'

function App() {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'

  return (
    <div className="min-h-screen">
      {!isLoginPage && (
        <nav className="bg-gray-800 text-white p-4">
          <div className="container mx-auto flex gap-4">
            <Link to="/" className="hover:text-gray-300 px-4 py-2 rounded-md">
              Home
            </Link>
            <Link to="/about" className="hover:text-gray-300 px-4 py-2 rounded-md">
              About
            </Link>
          </div>
        </nav>
      )}

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
        </Routes>
      </main>
    </div>
  )
}

export default App
