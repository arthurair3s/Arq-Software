import React, { useState } from 'react';
import RestaurantList from './components/RestaurantList';
import RestaurantMenu from './components/RestaurantMenu';
import ActiveOrderTracking from './components/ActiveOrderTracking';

function App() {
  const [activePedidoId, setActivePedidoId] = useState(null);
  const [selectedRestaurante, setSelectedRestaurante] = useState(null);

  // mostra o rastreador se tiver pedido ativo
  if (activePedidoId) {
    return (
      <div className="min-h-screen pt-4">
        <ActiveOrderTracking 
          pedidoId={activePedidoId} 
          restaurante={selectedRestaurante} 
          onCancel={() => {
            setActivePedidoId(null);
            setSelectedRestaurante(null);
          }} 
        />
      </div>
    );
  }

  // mostra o menu do restaurante selecionado
  if (selectedRestaurante) {
    return (
      <div className="min-h-screen pt-4">
        <RestaurantMenu 
          restaurante={selectedRestaurante} 
          onBack={() => setSelectedRestaurante(null)}
          onOrderCreated={(pedidoId, rest) => {
            setSelectedRestaurante(rest);
            setActivePedidoId(pedidoId);
          }}
        />
      </div>
    );
  }

  // view principal: lista de restaurantes
  return (
    <div className="min-h-screen pt-4">
      <div className="max-w-5xl mx-auto px-4 mb-4 flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🛵</span>
          <h1 className="text-2xl font-bold text-ifoodRed tracking-tight">Express Delivery</h1>
        </div>
        <div className="text-sm font-medium text-gray-500">
          Você está em: <span className="text-slate-800">Centro - RJ</span>
        </div>
      </div>

      <RestaurantList onSelectRestaurant={setSelectedRestaurante} />
    </div>
  );
}

export default App;
