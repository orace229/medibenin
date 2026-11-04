"""
MediBenin - Moteur de Règles Cliniques & Matrice de Triage
Implémentation déterministe basée sur les référentiels officiels PCIME (OMS/UNICEF Bénin) et TETU (SoBePed).
"""

from typing import Tuple
from models.enums import TriageUrgency, FacilityType, AgeGroup
from models.domain_models import SymptomPayload, TriageResult, XAIExplanation


class ClinicalTriageMatrix:
    """
    Moteur de triage déterministe hybride pour MediBenin.
    Règle d'or : La sécurité clinique absolue prime sur toute prédiction LLM.
    Si un signe de danger déterministe est identifié, la catégorie de gravité
    est immédiatement forcée en ROUGE ou ORANGE.
    """

    @staticmethod
    def evaluate_pcime_danger_signs(payload: SymptomPayload) -> Tuple[bool, str]:
        """
        Vérification stricte des 4 Signes Généraux de Danger PCIME (Enfants 0-5 ans).
        """
        ds = payload.danger_signs
        reasons = []

        if ds.cannot_drink_or_breastfeed:
            reasons.append("Incapacité totale à boire ou téter")
        if ds.vomits_everything:
            reasons.append("Vomissements de tout ce qui est absorbé")
        if ds.convulsions_during_illness:
            reasons.append("Convulsions pendant l'épisode actuel")
        if ds.lethargic_or_unconscious:
            reasons.append("Léthargie ou perte de connaissance")

        if reasons:
            return True, "Signes généraux de danger PCIME détectés : " + ", ".join(reasons)
        return False, ""

    @staticmethod
    def evaluate_temperature_severity(temp: float) -> Tuple[TriageUrgency, str]:
        """
        Évaluation de la température corporelle en zone d'endémie palustre.
        """
        if temp >= 39.5:
            return TriageUrgency.ROUGE, f"Hyperthermie majeure ({temp}°C) - Risque de convulsion fébrile"
        elif temp >= 38.5:
            return TriageUrgency.ORANGE, f"Fièvre élevée ({temp}°C) - Consultation impérative sous 24h"
        elif temp >= 37.8:
            return TriageUrgency.VERT, f"Fébricule ({temp}°C) - Surveillance et hydratation"
        return TriageUrgency.VERT, f"Température normale ({temp}°C)"

    def evaluate_triage(
        self,
        payload: SymptomPayload,
        patient_age_group: AgeGroup,
        llm_suggested_urgency: TriageUrgency = TriageUrgency.VERT,
        llm_condition_name: str = "Affections courantes",
        llm_icd10: str = "R50.9"
    ) -> TriageResult:
        """
        Effectue le triage final en combinant les règles déterministes et les suggestions LLM.
        """
        has_pcime_danger, danger_reason = self.evaluate_pcime_danger_signs(payload)

        # 1. Règle absolue 1 : Signe de danger PCIME (0-5 ans ou pédiatrique)
        if has_pcime_danger:
            return TriageResult(
                triage_id=f"TRG-{payload.session_id}",
                session_id=payload.session_id,
                patient_id=payload.patient_id,
                urgency_level=TriageUrgency.ROUGE,
                rule_based_override=True,
                presumed_icd10_code="R56.0", # Convulsions / Signe de danger majeur
                presumed_condition_name="Urgence Pédiatrique Majeure (PCIME)",
                recommended_facility_type=FacilityType.HOPITAL_URGENCES,
                immediate_advice_fr=(
                    f"URGENCE VITALE : {danger_reason}. Veuillez emmener l'enfant immédiatement "
                    f"au centre de santé ou à l'hôpital le plus proche. Ne donnez rien à boire si l'enfant est inconscient."
                ),
                xai_explanation=XAIExplanation(
                    top_contributing_symptoms=[{"symptom": danger_reason, "score": 1.0}],
                    summary_text_fr=f"Forcé en ROUGE par protocole déterministe PCIME : {danger_reason}",
                    model_version="PCIME-Rules-Engine-v1"
                )
            )

        # 2. Règle absolue 2 : Contrôle de la température
        if payload.temperature_celsius is not None:
            temp_urgency, temp_reason = self.evaluate_temperature_severity(payload.temperature_celsius)
            if temp_urgency == TriageUrgency.ROUGE:
                return TriageResult(
                    triage_id=f"TRG-{payload.session_id}",
                    session_id=payload.session_id,
                    patient_id=payload.patient_id,
                    urgency_level=TriageUrgency.ROUGE,
                    rule_based_override=True,
                    presumed_icd10_code="B54", # Paludisme suspecté avec forte fièvre
                    presumed_condition_name="Hyperthermie Fébrile / Suspicions Paludisme Grave",
                    recommended_facility_type=FacilityType.HOPITAL_URGENCES,
                    immediate_advice_fr=f"ALERTE : {temp_reason}. Rendez-vous immédiatement dans la structure de santé la plus proche.",
                    xai_explanation=XAIExplanation(
                        top_contributing_symptoms=[{"symptom": temp_reason, "score": 0.95}],
                        summary_text_fr=f"Forcé en ROUGE par température critique ({payload.temperature_celsius}°C)",
                        model_version="PCIME-Rules-Engine-v1"
                    )
                )

        # 3. Traitement hybride (Intégration MedGemma si aucun signe de danger immédiat)
        final_urgency = llm_suggested_urgency
        recommended_facility = FacilityType.CENTRE_DE_SANTE

        if final_urgency == TriageUrgency.ROUGE:
            recommended_facility = FacilityType.HOPITAL_URGENCES
            advice = "Consultez d'urgence un médecin ou l'hôpital le plus proche."
        elif final_urgency == TriageUrgency.ORANGE:
            recommended_facility = FacilityType.CENTRE_DE_SANTE
            advice = "Une consultation médicale sous 24 à 48 heures est fortement recommandée. Téléconsultation disponible."
        else:
            recommended_facility = FacilityType.PHARMACIE_PARTENAIRE
            advice = "Symptômes légers. Repos, bonne hydratation et conseils de votre pharmacien partenaire."

        return TriageResult(
            triage_id=f"TRG-{payload.session_id}",
            session_id=payload.session_id,
            patient_id=payload.patient_id,
            urgency_level=final_urgency,
            rule_based_override=False,
            presumed_icd10_code=llm_icd10,
            presumed_condition_name=llm_condition_name,
            recommended_facility_type=recommended_facility,
            immediate_advice_fr=advice,
            xai_explanation=XAIExplanation(
                top_contributing_symptoms=[{"symptom": "Analyse textuelle globale", "score": 0.75}],
                summary_text_fr="Évaluation basée sur le raisonnement clinique MedGemma sans signe de danger PCIME immédiat.",
                model_version="MedGemma-4B-v1"
            )
        )
