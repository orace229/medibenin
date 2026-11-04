import React, { useState } from 'react';
import { Building2, Pill, Phone, Navigation, Clock, ShieldCheck, MapPin } from 'lucide-react';
import { Facility } from '../types';
import { FACILITIES } from '../data/mockData';

export const FacilitiesDirectory: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'Hôpital' | 'Pharmacie'>('all');

  const filtered = FACILITIES.filter(
    (f) => filter === 'all' || f.type === filter
  );

  return (
    <section className="py-8 bg-white border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-medigreen-700" />
              <span>Établissements de Santé & Pharmacies au Bénin</span>
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Cartographie des centres de soins de référence et des pharmacies partenaires conventionnées.
            </p>
          </div>

          {/* Filtres de sélection */}
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-2xl w-fit">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                filter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Tous ({FACILITIES.length})
            </button>
            <button
              onClick={() => setFilter('Hôpital')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                filter === 'Hôpital' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Hôpitaux</span>
            </button>
            <button
              onClick={() => setFilter('Pharmacie')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                filter === 'Pharmacie' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Pill className="w-3.5 h-3.5" />
              <span>Pharmacies</span>
            </button>
          </div>
        </div>

        {/* Grille Responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item: Facility) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl border border-gray-200/90 hover:border-medigreen-300 hover:shadow-lg transition bg-white flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        item.type === 'Hôpital'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-teal-50 text-teal-700'
                      }`}
                    >
                      {item.type === 'Hôpital' ? (
                        <Building2 className="w-5 h-5" />
                      ) : (
                        <Pill className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-gray-400">
                        {item.commune} • {item.departement}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-gray-500 whitespace-nowrap">
                    {item.distanceKm} km
                  </span>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {item.isOpen247 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-medigreen-50 text-medigreen-700">
                      <Clock className="w-3 h-3" />
                      <span>Ouvert 24h/24</span>
                    </span>
                  )}
                  {item.hasPediatricEmergency && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-medired-50 text-medired-700">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Urgences Pédiatriques</span>
                    </span>
                  )}
                  {item.type === 'Pharmacie' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700">
                      Partenaire CareX Agréé
                    </span>
                  )}
                </div>
              </div>

              {/* Boutons d'Action */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => alert(`📞 Appel vers ${item.name} : ${item.phone}`)}
                  className="py-2 px-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700 flex items-center justify-center gap-1.5 transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Appeler</span>
                </button>
                <button
                  onClick={() => alert(`📍 Calcul d'itinéraire GPS vers ${item.name}...`)}
                  className="py-2 px-3 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Itinéraire</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
