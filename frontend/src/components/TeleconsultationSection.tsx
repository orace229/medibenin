import React, { useState } from 'react';
import { Video, Star, CreditCard, Mic, MicOff, PhoneOff, VideoOff, Clock } from 'lucide-react';
import { Doctor } from '../types';
import { DOCTORS } from '../data/mockData';

export const TeleconsultationSection: React.FC = () => {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [paymentStep, setPaymentStep] = useState<'select' | 'payment' | 'call'>('select');
  const [momoOperator, setMomoOperator] = useState<'mtn' | 'moov'>('mtn');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const handleStartPayment = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setPaymentStep('payment');
  };

  const handleConfirmPayment = () => {
    setPaymentStep('call');
  };

  return (
    <section id="teleconsultation" className="py-10 bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-medigreen-50 text-medigreen-700 text-xs font-bold mb-2">
              <Video className="w-3.5 h-3.5" />
              <span>Service Premium Optionnel</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
              Téléconsultation Médicale (15 minutes)
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Consultez un médecin béninois diplômé sans vous déplacer. Règlement simplifié par Mobile Money.
            </p>
          </div>
        </div>

        {/* Étape 1 : Choix du médecin */}
        {paymentStep === 'select' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DOCTORS.map((doc: Doctor) => (
              <div
                key={doc.id}
                className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-sm hover:shadow-xl transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-medigreen-50 text-medigreen-700 flex items-center justify-center font-bold text-lg border border-medigreen-200">
                      {doc.name.split(' ').map((n) => n[0]).slice(1, 3).join('')}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-gray-900">{doc.name}</h4>
                      <p className="text-xs font-semibold text-medigreen-700">{doc.specialty}</p>
                      <p className="text-xs text-gray-400">{doc.hospital}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold mb-3">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{doc.rating} / 5</span>
                    <span className="text-gray-300 mx-1">•</span>
                    <span className="text-gray-500">Disponible maintenant</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {doc.languages.map((l: string) => (
                      <span key={l} className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                        {l}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-gray-400 font-medium block">Tarif forfaitaire</span>
                    <span className="text-xl font-black text-gray-900">{doc.feeFcfa} FCFA</span>
                  </div>
                  <button
                    onClick={() => handleStartPayment(doc)}
                    className="py-2.5 px-4 rounded-xl bg-medigreen-700 hover:bg-medigreen-800 text-white font-bold text-xs shadow-md transition active:scale-95"
                  >
                    Choisir ce médecin
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Étape 2 : Règlement Mobile Money */}
        {paymentStep === 'payment' && selectedDoctor && (
          <div className="max-w-md mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xl animate-in zoom-in-95">
            <h3 className="text-xl font-black text-gray-900 mb-1">Règlement Mobile Money</h3>
            <p className="text-xs text-gray-500 mb-6">
              Téléconsultation de 15 min avec {selectedDoctor.name}
            </p>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex justify-between items-center mb-6">
              <span className="text-xs font-bold text-gray-600">Montant net à débiter :</span>
              <span className="text-2xl font-black text-medigreen-800">{selectedDoctor.feeFcfa} FCFA</span>
            </div>

            <div className="space-y-3 mb-6">
              <div className="text-xs font-bold text-gray-700">Sélectionnez votre réseau :</div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMomoOperator('mtn')}
                  className={`p-3.5 rounded-2xl border-2 flex items-center justify-center gap-2 font-bold text-xs transition ${
                    momoOperator === 'mtn'
                      ? 'border-[#FFCC00] bg-[#FFCC00]/10 text-gray-900'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-amber-500" />
                  <span>MTN MoMo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMomoOperator('moov')}
                  className={`p-3.5 rounded-2xl border-2 flex items-center justify-center gap-2 font-bold text-xs transition ${
                    momoOperator === 'moov'
                      ? 'border-[#005BAC] bg-[#005BAC]/10 text-gray-900'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Moov Money</span>
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Numéro de téléphone ({momoOperator === 'mtn' ? 'MTN Bénin' : 'Moov Bénin'}) :
              </label>
              <input
                type="text"
                defaultValue="97 00 11 22"
                className="w-full p-3 rounded-xl border border-gray-200 font-bold text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-medigreen-500 outline-none"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                Un message push USSD s'affichera pour valider votre code PIN secret.
              </span>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleConfirmPayment}
                className="w-full py-3.5 rounded-xl bg-medigreen-700 hover:bg-medigreen-800 text-white font-extrabold text-sm shadow-md transition"
              >
                Valider et rejoindre la consultation
              </button>
              <button
                onClick={() => setPaymentStep('select')}
                className="w-full py-2.5 rounded-xl text-gray-500 hover:text-gray-700 font-bold text-xs transition"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Étape 3 : Salle Vidéo Interactive */}
        {paymentStep === 'call' && selectedDoctor && (
          <div className="max-w-3xl mx-auto bg-gray-950 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 text-white relative animate-in fade-in">
            <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-gray-400">
                  En direct • 14:48 restantes
                </span>
              </div>
              <div className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Liaison Chiffrée AES-256
              </div>
            </div>

            {/* Écran central de la consultation */}
            <div className="relative h-72 sm:h-96 rounded-2xl bg-gray-900 border border-white/10 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-24 h-24 rounded-full bg-medigreen-700/30 border-2 border-medigreen-500 flex items-center justify-center mb-4">
                <Video className="w-10 h-10 text-medigreen-400" />
              </div>
              <h3 className="text-xl font-bold">{selectedDoctor.name}</h3>
              <p className="text-xs text-gray-400 mt-1">{selectedDoctor.specialty} • {selectedDoctor.hospital}</p>
              <div className="mt-4 px-3 py-1 rounded-full bg-white/10 text-xs font-mono text-gray-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Consultation démarrée</span>
              </div>

              {/* Petite vignette patient (PIP) */}
              <div className="absolute bottom-4 right-4 w-28 h-20 rounded-xl bg-gray-800 border border-white/20 flex items-center justify-center text-xs text-gray-400">
                <span>{isVideoOff ? 'Caméra coupée' : 'Votre vidéo'}</span>
              </div>
            </div>

            {/* Barre de commandes */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3.5 rounded-full transition ${
                  isMuted ? 'bg-red-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={() => {
                  alert('Consultation terminée. Le compte-rendu a été transmis par SMS !');
                  setPaymentStep('select');
                }}
                className="px-6 py-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 transition active:scale-95"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Terminer l'appel</span>
              </button>

              <button
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-3.5 rounded-full transition ${
                  isVideoOff ? 'bg-red-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
