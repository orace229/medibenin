"""
MediBenin - Modèles de Données du Domaine Révisés
Spécification Pydantic v2 des objets métier selon le modèle d'acteurs retenu :
- Patient / Représentant (Acteur connecté)
- Médecin Référent (Acteur connecté)
- Partenaires Hors Plateforme (Pharmacies, Hôpitaux, Centres de soins)
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

from models.enums import (
    LocalLanguage,
    TriageUrgency,
    InputMode,
    AgeGroup,
    FacilityType,
)


class LocationInfo(BaseModel):
    """Localisation administrative du patient au Bénin."""
    departement: str = Field(..., description="Ex: Atlantique, Littoral, Borgou, Zou")
    commune: str = Field(..., description="Ex: Abomey-Calavi, Cotonou, Parakou")
    arrondissement: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class PatientProfile(BaseModel):
    """Profil du patient ou de son proche/représentant (Loi APDP Bénin)."""
    patient_id: str = Field(..., description="UUID pseudonymisé non traçable directement")
    first_name_or_nickname: str = Field(..., description="Prénom ou surnom d'usage")
    is_represented_by_relative: bool = Field(
        False, description="True si la saisie est effectuée par un proche/parent pour le patient"
    )
    age_years: float = Field(..., ge=0, description="Âge du patient en années")
    age_group: AgeGroup = Field(..., description="Tranche d'âge déterminée automatiquement")
    gender: str = Field(..., description="M / F")
    phone_number_hash: str = Field(..., description="Hash chiffré AES-256 pour les rappels SMS")
    preferred_language: LocalLanguage = LocalLanguage.FON
    location: Optional[LocationInfo] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class MedecinProfile(BaseModel):
    """Profil du médecin connecté sur la plateforme MediBenin."""
    medecin_id: str = Field(..., description="Identifiant unique du médecin")
    full_name: str = Field(..., description="Ex: Dr KOUANDETE Marc")
    specialty: str = Field("Généraliste", description="Ex: Pédiatre, Généraliste, Urgentiste")
    license_number: str = Field(..., description="Numéro d'inscription à l'Ordre des Médecins du Bénin")
    phone_number: str
    is_available_for_teleconsultation: bool = True


class OffsitePartnerFacility(BaseModel):
    """Établissement partenaire hors-plateforme (Pharmacie, Centre de Santé, Hôpital)."""
    facility_id: str
    name: str = Field(..., description="Ex: Pharmacie Saint-Luc, CHU-MEL Cotonou")
    facility_type: FacilityType
    departement: str
    commune: str
    address: str
    latitude: float
    longitude: float
    phone_number: str
    is_open: bool = True


class DangerSignCheck(BaseModel):
    """Évaluation déterministe des 4 Signes Généraux de Danger (Protocole PCIME Pédiatrique 0-5 ans)."""
    cannot_drink_or_breastfeed: bool = Field(False, description="Incapacité à boire ou téter")
    vomits_everything: bool = Field(False, description="Vomissements de tout ce qui est absorbé")
    convulsions_during_illness: bool = Field(False, description="Convulsions pendant la maladie actuelle")
    lethargic_or_unconscious: bool = Field(False, description="Enfant léthargique ou inconscient")

    @property
    def has_any_danger_sign(self) -> bool:
        return (
            self.cannot_drink_or_breastfeed
            or self.vomits_everything
            or self.convulsions_during_illness
            or self.lethargic_or_unconscious
        )


class SymptomPayload(BaseModel):
    """Symptômes transmis par le patient ou son représentant."""
    session_id: str
    patient_id: str
    input_mode: InputMode = InputMode.VOICE
    raw_audio_url: Optional[str] = None
    raw_transcribed_text: Optional[str] = None
    french_translated_text: str = Field(..., description="Texte pivot en Français via AfriNLLB")
    temperature_celsius: Optional[float] = Field(None, ge=30.0, le=45.0)
    photo_url: Optional[str] = None
    danger_signs: DangerSignCheck = Field(default_factory=DangerSignCheck)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class XAIExplanation(BaseModel):
    """Explication de l'IA (SHAP / LIME) pour transparence auprès du médecin."""
    top_contributing_symptoms: List[Dict[str, Any]] = Field(default_factory=list)
    summary_text_fr: str = Field("")
    model_version: str = Field("MediBenin-NLP-Rules-Engine-v1")


class TriageResult(BaseModel):
    """Résultat du triage et recommandations d'orientation."""
    triage_id: str
    session_id: str
    patient_id: str
    urgency_level: TriageUrgency = TriageUrgency.VERT
    rule_based_override: bool = False
    presumed_icd10_code: Optional[str] = None
    presumed_condition_name: Optional[str] = None
    recommended_facility_type: FacilityType = FacilityType.CENTRE_DE_SANTE
    immediate_advice_fr: str
    immediate_advice_local: Optional[str] = None
    xai_explanation: Optional[XAIExplanation] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
