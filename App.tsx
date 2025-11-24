import React, { useState } from 'react';
import { UserIcon, MapPinIcon, ClockIcon, CarIcon, SearchIcon, ArrowRightIcon, UsersIcon, WalletIcon, TrashIcon, AlertCircleIcon } from './components/Icons';
import { Ride, UserSession, RideStatus } from './types';
import { findRidesWithAI, getCostInsight } from './services/geminiService';

// --- Mock Initial Data ---
const MOCK_USER: UserSession = {
  id: 'u1',
  name: '',
  isLoggedIn: false,
};

// --- Extracted Components ---

interface LoginViewProps {
  user: UserSession;
  setUser: React.Dispatch<React.SetStateAction<UserSession>>;
  handleLogin: (e: React.FormEvent) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ user, setUser, handleLogin }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
    <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
      <div className="text-center mb-8">
        <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <CarIcon className="text-indigo-600 w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">RotaJunto AI</h1>
        <p className="text-gray-500 mt-2">Divida caronas, economize e conheça pessoas.</p>
      </div>
      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Como devemos te chamar?</label>
          <input
            type="text"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            placeholder="Seu nome"
            value={user.name}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-md"
        >
          Entrar
        </button>
      </form>
    </div>
  </div>
);

interface DashboardViewProps {
  user: UserSession;
  searchOrigin: string;
  setSearchOrigin: (val: string) => void;
  searchDestination: string;
  setSearchDestination: (val: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  loading: boolean;
  rides: Ride[];
  handleJoinRide: (ride: Ride) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  searchOrigin,
  setSearchOrigin,
  searchDestination,
  setSearchDestination,
  handleSearch,
  loading,
  rides,
  handleJoinRide
}) => (
  <div className="min-h-screen bg-gray-50 pb-20">
    {/* Header */}
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <CarIcon className="text-indigo-600" />
          <span className="font-bold text-xl text-gray-800">RotaJunto</span>
        </div>
        <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1.5 rounded-full">
          <UserIcon className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">{user.name}</span>
        </div>
      </div>
    </header>

    <main className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
      {/* Search Box */}
      <section className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Para onde vamos hoje?</h2>
        <form onSubmit={handleSearch} className="space-y-4 md:space-y-0 md:flex md:space-x-4">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-3.5 text-gray-400">
              <MapPinIcon className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Ponto de partida (Ex: Centro)"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={searchOrigin}
              onChange={(e) => setSearchOrigin(e.target.value)}
            />
          </div>
          <div className="hidden md:flex items-center text-gray-400">
            <ArrowRightIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 relative">
            <div className="absolute left-3 top-3.5 text-gray-400">
              <SearchIcon className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Destino (Ex: Faculdade, Shopping...)"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={searchDestination}
              onChange={(e) => setSearchDestination(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
      </section>

      {/* Results List */}
      <section className="space-y-4">
          <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-700">
                  {rides.length > 0 ? `Rotas encontradas: ${rides.length}` : 'Rotas recentes ou sugeridas'}
              </h3>
          </div>
        
        {rides.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
             <MapPinIcon className="w-10 h-10 mx-auto mb-3 text-gray-300" />
             <p>Digite um destino para encontrar caronas disponíveis.</p>
          </div>
        )}

        {rides.map((ride) => (
          <div key={ride.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center space-x-2 text-indigo-600 mb-1">
                    <ClockIcon className="w-4 h-4" />
                    <span className="font-semibold">{ride.time}</span>
                    <span className="text-gray-400 text-sm">• Hoje</span>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">{ride.destination}</h4>
                  <p className="text-sm text-gray-500">Saindo de {ride.origin}</p>
                </div>
                <div className="text-right">
                  <span className="block text-2xl font-bold text-gray-800">R$ {(ride.totalCost / (ride.passengers.length + 1)).toFixed(2)}</span>
                  <span className="text-xs text-gray-400">por pessoa (estimado)</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                      {ride.driverName.charAt(0)}
                  </div>
                  <div>
                      <p className="text-sm font-medium text-gray-800">{ride.driverName}</p>
                      <p className="text-xs text-gray-500">{ride.vehicle}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 text-gray-600 text-sm">
                      <UsersIcon className="w-4 h-4" />
                      <span>{ride.passengers.length}/{ride.capacity}</span>
                  </div>
                  <button 
                      onClick={() => handleJoinRide(ride)}
                      disabled={ride.status === RideStatus.FULL && !ride.passengers.some(p => p.id === user.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${ride.status === RideStatus.FULL && !ride.passengers.some(p => p.id === user.id) ? 'bg-gray-100 text-gray-400' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                      {ride.passengers.some(p => p.id === user.id) ? 'Ver Minha Viagem' : (ride.status === RideStatus.FULL ? 'Lotado' : 'Ver Detalhes')}
                  </button>
                </div>
              </div>
              {ride.description && (
                   <div className="mt-3 bg-blue-50 p-2 rounded text-xs text-blue-700 italic">
                      🤖 "{ride.description}"
                   </div>
              )}
            </div>
          </div>
        ))}
      </section>
    </main>
  </div>
);

interface RideDetailViewProps {
  selectedRide: Ride | null;
  user: UserSession;
  aiInsight: string;
  setView: (view: 'login' | 'dashboard' | 'details') => void;
  confirmBooking: () => void;
  cancelBooking: () => void;
}

const RideDetailView: React.FC<RideDetailViewProps> = ({
  selectedRide,
  user,
  aiInsight,
  setView,
  confirmBooking,
  cancelBooking
}) => {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (!selectedRide) return null;

  const isAlreadyPassenger = selectedRide.passengers.some(p => p.id === user.id);
  const passengerCount = selectedRide.passengers.length + (isAlreadyPassenger ? 0 : 1);
  const individualCost = (selectedRide.totalCost / passengerCount).toFixed(2);

  // --- Tela de Cancelamento (Overlay) ---
  if (showCancelConfirm) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6 animate-fadeIn">
        <div className="max-w-sm w-full bg-white text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircleIcon className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Desmarcar Viagem?</h2>
            <p className="text-gray-500 mb-8">
              Ao cancelar, sua vaga ficará disponível e o valor para os outros passageiros será recalculado.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  cancelBooking();
                  setShowCancelConfirm(false);
                  setView('dashboard');
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition"
              >
                Sim, cancelar minha vaga
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl transition"
              >
                Voltar, mudei de ideia
              </button>
            </div>
        </div>
      </div>
    );
  }
  
  // --- Tela Normal de Detalhes ---
  return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
          <div className="bg-indigo-600 text-white p-4 flex items-center shadow-lg">
              <button onClick={() => setView('dashboard')} className="mr-4 p-2 hover:bg-indigo-700 rounded-full">
                  <ArrowRightIcon className="w-6 h-6 rotate-180" />
              </button>
              <h2 className="text-lg font-bold">Detalhes da Carona</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-2xl mx-auto w-full">
              {/* Route Info */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                  <div className="flex flex-col space-y-6">
                      <div className="flex items-start justify-between">
                           <div>
                              <p className="text-sm text-gray-500 mb-1">Motorista</p>
                              <h3 className="text-xl font-bold text-gray-800">{selectedRide.driverName}</h3>
                              <p className="text-indigo-600 font-medium">{selectedRide.vehicle}</p>
                           </div>
                           <div className="text-right">
                              <p className="text-sm text-gray-500 mb-1">Horário</p>
                              <h3 className="text-xl font-bold text-gray-800">{selectedRide.time}</h3>
                              <p className="text-gray-500 text-sm">{selectedRide.date}</p>
                           </div>
                      </div>

                      {/* Timeline */}
                      <div className="relative pl-6 border-l-2 border-indigo-100 space-y-8">
                          <div className="relative">
                              <span className="absolute -left-[31px] bg-white border-2 border-indigo-500 w-4 h-4 rounded-full"></span>
                              <p className="text-xs text-gray-400 uppercase font-bold">Partida</p>
                              <p className="text-gray-800 font-medium">{selectedRide.origin}</p>
                          </div>
                          <div className="relative">
                              <span className="absolute -left-[31px] bg-indigo-600 w-4 h-4 rounded-full shadow-md"></span>
                              <p className="text-xs text-gray-400 uppercase font-bold">Destino</p>
                              <p className="text-gray-800 font-medium text-lg">{selectedRide.destination}</p>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Passengers & Cost */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                   <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                      <UsersIcon className="w-5 h-5 mr-2 text-indigo-500" />
                      Passageiros ({passengerCount})
                   </h4>
                   <div className="space-y-3 mb-6">
                       {selectedRide.passengers.map(p => (
                           <div key={p.id} className="flex items-center justify-between text-sm">
                               <div className="flex items-center space-x-3">
                                   <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold">
                                       {p.name.charAt(0)}
                                   </div>
                                   <span className="text-gray-700">{p.name} {p.id === user.id && "(Você)"}</span>
                               </div>
                               <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-medium">Confirmado</span>
                           </div>
                       ))}
                       {!isAlreadyPassenger && (
                           <div className="flex items-center justify-between text-sm opacity-50">
                               <div className="flex items-center space-x-3">
                                   <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
                                       {user.name.charAt(0)}
                                   </div>
                                   <span className="text-gray-700">{user.name} (Você)</span>
                               </div>
                               <span className="text-gray-500 text-xs font-medium">Pendente</span>
                           </div>
                       )}
                   </div>

                   <div className="border-t border-gray-100 pt-4">
                      <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Custo Total da Viagem</span>
                          <span className="font-medium text-gray-900">R$ {selectedRide.totalCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-lg font-bold text-indigo-700">
                          <span className="flex items-center"><WalletIcon className="w-5 h-5 mr-2"/> Custo para Você</span>
                          <span>R$ {individualCost}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 text-right">Valor dividido igualmente ({selectedRide.totalCost} / {passengerCount})</p>
                      
                      {/* Gemini Insight */}
                      {aiInsight && !isAlreadyPassenger && (
                          <div className="mt-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-3 rounded-lg">
                              <p className="text-sm text-emerald-800 flex gap-2">
                                  <span>✨</span> {aiInsight}
                              </p>
                          </div>
                      )}
                   </div>
              </div>
          </div>

          {/* Action Bar */}
          <div className="bg-white p-4 border-t border-gray-200 safe-area-bottom">
               {!isAlreadyPassenger ? (
                   <button 
                      onClick={confirmBooking}
                      disabled={selectedRide.status === RideStatus.FULL}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition transform active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                   >
                      Confirmar Vaga (R$ {individualCost})
                   </button>
               ) : (
                   <div className="flex gap-2">
                       <div className="flex-1 bg-green-50 text-green-700 font-bold py-4 rounded-xl text-center flex items-center justify-center border border-green-200">
                           <span>Vaga Confirmada ✅</span>
                       </div>
                       <button 
                          onClick={() => setShowCancelConfirm(true)}
                          className="w-16 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-xl flex items-center justify-center transition"
                          title="Cancelar Viagem"
                       >
                           <TrashIcon className="w-6 h-6" />
                       </button>
                   </div>
               )}
          </div>
      </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<UserSession>(MOCK_USER);
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchDestination, setSearchDestination] = useState('');
  const [searchOrigin, setSearchOrigin] = useState('Centro');
  const [view, setView] = useState<'login' | 'dashboard' | 'details'>('login');
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [aiInsight, setAiInsight] = useState<string>('');

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (user.name.trim()) {
      setUser({ ...user, isLoggedIn: true });
      setView('dashboard');
    }
  };

  // Handle Search for Rides
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchDestination.trim()) return;

    setLoading(true);
    // Use Gemini to simulate finding routes in a database
    const newRides = await findRidesWithAI(searchDestination, searchOrigin);
    
    // Cast partials to full rides with default mock data if needed
    const fullRides = newRides.map(r => ({
      ...r,
      passengers: [
        // Simulate existing passengers
        { id: 'p_mock_1', name: 'Ana Silva' },
        { id: 'p_mock_2', name: 'Carlos Reis' }
      ]
    } as Ride));

    setRides(fullRides);
    setLoading(false);
  };

  // Join a Ride
  const handleJoinRide = async (ride: Ride) => {
    setSelectedRide(ride);
    
    // Calculate initial insight
    const newPassengerCount = ride.passengers.length + 1;
    const insight = await getCostInsight(ride.totalCost, newPassengerCount);
    setAiInsight(insight);
    
    setView('details');
  };

  const confirmBooking = () => {
    if (!selectedRide) return;

    const updatedRide = {
      ...selectedRide,
      passengers: [...selectedRide.passengers, { id: user.id, name: user.name }]
    };

    if (updatedRide.passengers.length >= updatedRide.capacity) {
        updatedRide.status = RideStatus.FULL;
    }

    // Update local state list
    setRides(prev => prev.map(r => r.id === updatedRide.id ? updatedRide : r));
    setSelectedRide(updatedRide);
    
    alert("Vaga reservada com sucesso! O valor será dividido igualmente no final da corrida.");
  };

  const cancelBooking = () => {
    if (!selectedRide) return;

    // Remove current user
    const updatedPassengers = selectedRide.passengers.filter(p => p.id !== user.id);

    const updatedRide = {
        ...selectedRide,
        passengers: updatedPassengers,
        // Always set to OPEN if someone leaves, unless logic dictates otherwise (simplification)
        status: RideStatus.OPEN 
    };

    setRides(prev => prev.map(r => r.id === updatedRide.id ? updatedRide : r));
    setSelectedRide(null); // Clear selected ride or update it
    
    // We return to dashboard automatically in the UI logic call, but let's ensure feedback
  };

  return (
    <>
      {view === 'login' && (
        <LoginView 
          user={user} 
          setUser={setUser} 
          handleLogin={handleLogin} 
        />
      )}
      {view === 'dashboard' && (
        <DashboardView 
          user={user}
          searchOrigin={searchOrigin}
          setSearchOrigin={setSearchOrigin}
          searchDestination={searchDestination}
          setSearchDestination={setSearchDestination}
          handleSearch={handleSearch}
          loading={loading}
          rides={rides}
          handleJoinRide={handleJoinRide}
        />
      )}
      {view === 'details' && (
        <RideDetailView 
          selectedRide={selectedRide}
          user={user}
          aiInsight={aiInsight}
          setView={setView}
          confirmBooking={confirmBooking}
          cancelBooking={cancelBooking}
        />
      )}
    </>
  );
};

export default App;