import React, { useState, useEffect } from 'react'
import RestaurantList from './components/RestaurantList'
import RestaurantMenu from './components/RestaurantMenu'
import ActiveOrderTracking from './components/ActiveOrderTracking'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import { POVOAR_FROTA } from './graphql/queries'
import { API_URL } from './config'

function App() {
  const [usuario, setUsuario] = useState(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [view, setView] = useState('login')
  const [activePedidoId, setActivePedidoId] = useState(null)
  const [selectedRestaurante, setSelectedRestaurante] = useState(null)
  const [povoando, setPovoando] = useState(false)
  const [userLocation, setUserLocation] = useState({
    lat: -22.9035,
    lon: -43.1730,
    label: "Centro, Rio de Janeiro"
  })
  const [showLocationPicker, setShowLocationPicker] = useState(false)

  // Verifica se já existe um token salvo ao carregar o app
  useEffect(() => {
    const savedUser = localStorage.getItem('usuario')
    const savedToken = localStorage.getItem('token')
    if (savedUser && savedToken) {
      try {
        setUsuario(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('usuario')
        localStorage.removeItem('token')
      }
    }
    setCheckingAuth(false)
  }, [])

  const handleLogin = (user) => {
    setUsuario(user)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setUsuario(null)
    setActivePedidoId(null)
    setSelectedRestaurante(null)
  }

  const handlePovoarMapa = async () => {
    setPovoando(true)
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: POVOAR_FROTA })
      })
      alert('frota povoada com sucesso!')
    } catch (e) {
      console.error(e)
      alert('erro ao povoar mapa')
    } finally {
      setPovoando(false)
    }
  }

  const PRESETS = [
    { label: "Centro, RJ", lat: -22.9035, lon: -43.1730 },
    { label: "Cachambi, RJ", lat: -22.8861, lon: -43.2778 },
    { label: "Copacabana, RJ", lat: -22.9711, lon: -43.1843 }
  ];

  // Tela de carregamento enquanto verifica auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  // Se não estiver logado, mostra o login
  if (!usuario) {
    if (view === 'register') {
      return (
        <RegisterPage 
          onBackToLogin={() => setView('login')} 
          onRegisterSuccess={() => setView('login')}
        />
      )
    }
    return <LoginPage onLogin={handleLogin} onRegister={() => setView('register')} />
  }

  // mostra o rastreador se tiver pedido ativo
  if (activePedidoId) {
    return (
      <div className="min-h-screen pt-4">
        <ActiveOrderTracking
          pedidoId={activePedidoId}
          restaurante={selectedRestaurante}
          onCancel={() => {
            setActivePedidoId(null)
            setSelectedRestaurante(null)
          }}
        />
      </div>
    )
  }

  // mostra o menu do restaurante selecionado
  if (selectedRestaurante) {
    return (
      <div className="min-h-screen pt-4">
        <RestaurantMenu
          restaurante={selectedRestaurante}
          userLocation={userLocation}
          onBack={() => setSelectedRestaurante(null)}
          onOrderCreated={(pedidoId, rest) => {
            setSelectedRestaurante(rest)
            setActivePedidoId(pedidoId)
          }}
        />
      </div>
    )
  }

  // view principal: lista de restaurantes
  return (
    <div className="min-h-screen pt-4">
      <div className="max-w-5xl mx-auto px-4 mb-4 flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🛵</span>
          <h1 className="text-2xl font-bold text-ifoodRed tracking-tight">
            Express Delivery
          </h1>
        </div>
        <div className="flex items-center gap-4 relative">
          <button
            onClick={handlePovoarMapa}
            disabled={povoando}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 font-medium transition"
          >
            {povoando ? 'povoando...' : '🚀 povoar mapa'}
          </button>

          <div
            className="text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-50 p-1 rounded transition"
            onClick={() => setShowLocationPicker(!showLocationPicker)}
          >
            Você está em:{' '}
            <span className="text-ifoodRed font-bold border-b border-dashed border-ifoodRed">
              {userLocation.label}
            </span>
          </div>

          {showLocationPicker && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-white shadow-2xl rounded-xl border border-gray-100 p-4 z-50 animate-in fade-in zoom-in duration-200">
              <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 px-1">Selecione seu local:</h4>
              <div className="space-y-1">
                {PRESETS.map(p => (
                  <button
                    key={p.label}
                    onClick={() => {
                      setUserLocation(p);
                      setShowLocationPicker(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${userLocation.label === p.label ? 'bg-red-50 text-ifoodRed font-bold' : 'hover:bg-gray-50 text-gray-700'}`}
                  >
                    📍 {p.label}
                  </button>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t text-[10px] text-gray-400 text-center">
                Coordenadas: {userLocation.lat}, {userLocation.lon}
              </div>
            </div>
          )}

          {/* Info do usuário logado + Logout */}
          <div className="flex items-center gap-2 border-l pl-4 ml-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
              {usuario.nome.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-gray-800 leading-tight">{usuario.nome}</p>
              <p className="text-[10px] text-gray-400 leading-tight">{usuario.email}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sair"
              className="text-gray-400 hover:text-red-500 transition ml-1 p-1 rounded-lg hover:bg-red-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <RestaurantList onSelectRestaurant={setSelectedRestaurante} />
    </div>
  )
}

export default App
