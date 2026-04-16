import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// correcao de icones padrao do leaflet no react
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// icones personalizados com imagens
const motoristaIcon = L.icon({
  iconUrl: '/icons/entregador-icon.png',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const restauranteIcon = L.icon({
  iconUrl: '/icons/restaurante-icon.png',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const clienteIcon = L.icon({
  iconUrl: '/icons/cliente-icon.png',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// componente para ajustar o zoom automaticamente
function RecenterMap({ bounds }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize(); // Garante que o leaflet reconheça o novo tamanho do container (importante para o Modal)
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [bounds, map]);
  return null;
}

export default function TrackingMap({ status, rotaColeta, rotaEntrega, motoPos, restaurantePos, clientePos, candidatos = [] }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  const coletaCoords = rotaColeta?.caminho?.map(p => [p.latitude, p.longitude]) || [];
  const entregaCoords = rotaEntrega?.caminho?.map(p => [p.latitude, p.longitude]) || [];

  const restPos = (restaurantePos && restaurantePos.latitude != null && !isNaN(restaurantePos.latitude)) 
    ? [Number(restaurantePos.latitude), Number(restaurantePos.longitude)] : null;
  const destPos = (clientePos && clientePos.latitude != null && !isNaN(clientePos.latitude)) 
    ? [Number(clientePos.latitude), Number(clientePos.longitude)] : null;

  const visiblePoints = [];
  if (motoPos) visiblePoints.push([motoPos.latitude, motoPos.longitude]);
  if (restPos) visiblePoints.push(restPos);
  if (destPos) visiblePoints.push(destPos);
  
  candidatos.forEach(c => {
    if (c.latitude && c.longitude) {
      visiblePoints.push([Number(c.latitude), Number(c.longitude)]);
    }
  });

  const showColeta = !status || status === 'ATRIBUIDA' || status === 'PENDENTE';
  const showEntrega = status === 'EM_TRANSITO';

  if (showColeta) visiblePoints.push(...coletaCoords);
  if (showEntrega) visiblePoints.push(...entregaCoords);
  
  const bounds = visiblePoints.length > 0 ? L.latLngBounds(visiblePoints) : null;

  return (
    <div className={`transition-all duration-500 ease-in-out ${
      isExpanded 
        ? 'fixed inset-4 z-[9999] bg-white rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)]' 
        : 'h-[400px] w-full rounded-2xl overflow-hidden glass-card border-none shadow-2xl relative'
    }`}>
      
      {/* Botão de Expandir/Fechar */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute top-4 right-4 z-[10000] bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-xl backdrop-blur-md shadow-lg transition-transform active:scale-90"
        title={isExpanded ? "Reduzir Mapa" : "Expandir Mapa"}
      >
        {isExpanded ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v5H3M21 8h-5V3M3 16h5v5M16 21v-5h5"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 3 6 6M9 21l-6-6M21 3l-6 6M3 21l6-6"/></svg>
        )}
      </button>

      <MapContainer 
        center={motoPos ? [motoPos.latitude, motoPos.longitude] : (restPos || [-22.9068, -43.1729])} 
        zoom={13} 
        style={{ height: '100%', width: '100%', borderRadius: isExpanded ? '24px' : '0' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {coletaCoords.length > 0 && showColeta && (
          <Polyline positions={coletaCoords} color="#38bdf8" weight={4} opacity={0.8} dashArray="10, 10" />
        )}

        {entregaCoords.length > 0 && showEntrega && (
          <Polyline positions={entregaCoords} color="#10b981" weight={5} opacity={0.9} />
        )}

        {candidatos.map(c => (
          c.latitude && c.longitude && (
            <Marker key={c.id} position={[Number(c.latitude), Number(c.longitude)]} icon={motoristaIcon} opacity={0.7} />
          )
        ))}

        {motoPos && (
          <Marker position={[motoPos.latitude, motoPos.longitude]} icon={motoristaIcon} />
        )}

        {restPos && (
          <Marker position={restPos} icon={restauranteIcon} />
        )}

        {destPos && (
          <Marker position={destPos} icon={clienteIcon} />
        )}

        {bounds && <RecenterMap bounds={bounds} />}
      </MapContainer>

      {/* legenda simples */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-700 text-[10px] text-slate-300 flex flex-col gap-2 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-sky-400 rounded-full"></div>
          <span>Coleta (Motorista → Loja)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-emerald-500 rounded-full"></div>
          <span>Entrega (Loja → Cliente)</span>
        </div>
      </div>
    </div>
  );
}
