import React, { useState } from 'react';
import { MapPin, Edit3, Check, X, Navigation } from 'lucide-react';
import { ATUALIZAR_ENDERECO, ME } from '../graphql/queries';
import { API_URL } from '../config';

export default function AddressBar({ usuario, setUsuario }) {
  const [isEditing, setIsEditing] = useState(false);
  const [endereco, setEndereco] = useState(usuario?.endereco || '');
  const [loading, setLoading] = useState(false);

  // Sincroniza o estado local com o usuário quando ele mudar (ex: após salvar ou GPS)
  React.useEffect(() => {
    setEndereco(usuario?.endereco || '');
  }, [usuario?.endereco]);

  const handleSave = async (lat, lon, addr) => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          query: ATUALIZAR_ENDERECO,
          variables: {
            latitude: lat,
            longitude: lon,
            endereco: addr
          }
        })
      });

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      const updatedUserData = result.data.atualizarEndereco;
      const updatedUser = { ...usuario, ...updatedUserData };
      
      setUsuario(updatedUser);
      localStorage.setItem('usuario', JSON.stringify(updatedUser));
      setIsEditing(false);
    } catch (err) {
      alert("Erro ao atualizar endereço: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const useCurrentLocation = () => {
    setLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          // Simulação de geocodificação reversa para propósitos do MVP
          const simulatedAddress = `Meu Local Atual (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
          handleSave(latitude, longitude, simulatedAddress);
        },
        (error) => {
          console.error(error);
          // Fallback para um local aleatório se o usuário negar permissão (como sugerido pelo USER)
          const randomLat = -22.9035 + (Math.random() - 0.5) * 0.1;
          const randomLon = -43.1730 + (Math.random() - 0.5) * 0.1;
          handleSave(randomLat, randomLon, "Endereço Aleatório Selecionado");
        }
      );
    } else {
      alert("Geolocalização não suportada no seu navegador.");
      setLoading(false);
    }
  };

  const hasAddress = usuario?.latitude && usuario?.longitude;

  return (
    <div className={`w-full p-4 mb-6 rounded-2xl border transition-all duration-300 ${!hasAddress ? 'bg-red-50 border-red-200 shadow-lg shadow-red-100' : 'bg-white border-gray-100 shadow-sm'}`}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${!hasAddress ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
            <MapPin size={20} />
          </div>
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider ${!hasAddress ? 'text-red-600' : 'text-gray-400'}`}>
              {!hasAddress ? '⚠️ Endereço não definido' : 'Entregar em:'}
            </h4>
            {isEditing ? (
              <div className="flex items-center gap-2 mt-1">
                <input 
                  type="text" 
                  className="text-sm p-1 border rounded"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Digite seu endereço"
                />
                <button onClick={() => useCurrentLocation()} disabled={loading} className="text-xs bg-gray-100 p-1 rounded hover:bg-gray-200">
                  <Navigation size={14} className="inline" /> GPS
                </button>
              </div>
            ) : (
              <p className={`text-sm font-semibold ${!hasAddress ? 'text-red-700' : 'text-gray-800'}`}>
                {usuario?.endereco || "Você precisa definir um endereço antes de pedir!"}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className={`btn btn-sm flex items-center gap-1 ${!hasAddress ? 'btn-danger' : 'btn-secondary text-xs'}`}
            >
              <Edit3 size={14} /> {hasAddress ? 'Alterar' : 'Definir Agora'}
            </button>
          ) : (
            <>
              <button 
                onClick={() => {
                  const lat = parseFloat(usuario?.latitude || -22.9068);
                  const lon = parseFloat(usuario?.longitude || -43.1729);
                  handleSave(lat, lon, endereco);
                }}
                disabled={loading}
                className="btn btn-sm btn-primary bg-green-600 hover:bg-green-700"
                title="Salvar Endereço"
              >
                <Check size={14} />
              </button>
              <button 
                onClick={() => setIsEditing(false)}
                className="btn btn-sm btn-secondary"
                title="Cancelar"
              >
                <X size={14} />
              </button>
            </>
          )}
        </div>
      </div>
      
      {!hasAddress && !isEditing && (
        <div className="mt-4 pt-4 border-t border-red-100">
          <button 
            onClick={() => useCurrentLocation()}
            disabled={loading}
            className="w-full btn btn-primary flex items-center justify-center gap-2"
          >
            <Navigation size={18} /> {loading ? 'Localizando...' : 'Usar Minha Localização Atual'}
          </button>
        </div>
      )}
    </div>
  );
}
