"""
MediBenin - Analyseur de Symptômes & Clinical NLP Engine
Module d'analyse automatique du texte des symptômes (Français / Traduit des langues locales béninoises).
Permet une analyse intelligente immédiate même hors-ligne / sans appel LLM distant.
"""

import re
from typing import Dict, List, Any, Tuple
from models.enums import TriageUrgency, FacilityType, AgeGroup
from models.domain_models import SymptomPayload, TriageResult, DangerSignCheck, XAIExplanation


class SymptomNLPAnalyzer:
    """
    Moteur NLP d'analyse clinique des symptômes pour MediBenin.
    Extrait les symptômes clés, détecte les drapeaux rouges (Red Flags) et produit une recommandation.
    """

    # Mots-clés et expressions d'urgence vitale (CAS ROUGE)
    RED_FLAG_PATTERNS = {
        "respiratory_distress": r"\b(difficulté.*respirer|étouffement|respire.*vite|essoufflement.*sévère|asphyxie|manque.*air)\b",
        "neurological_crisis": r"\b(convulsion|inconscient|perte.*connaissance|comas|confusion|évanouissement|léthargie)\b",
        "hemorrhage": r"\b(saignement.*abondant|vomit.*sang|crache.*sang|selle.*sanglante|hémorragie)\b",
        "severe_dehydration": r"\b(refuse.*boire|refuse.*téter|vomit.*tout|yeux.*enfoncés|plie.*pas|inconsolable)\b",
        "severe_pain": r"\b(douleur.*poitrine|douleur.*thoracique.*intense|raideur.*nuque)\b"
    }

    # Mots-clés de gravité modérée (CAS ORANGE - Consultation 24-48h)
    ORANGE_FLAG_PATTERNS = {
        "malaria_fever": r"\b(fièvre|chaud|frissons|courbatures|paludisme|palu|accès.*fébrile)\b",
        "gastrointestinal": r"\b(diarrhée|vomissement|maux.*ventre|douleur.*abdominale|nausée)\b",
        "respiratory_moderate": r"\b(toux.*grasse|toux.*sèche|bronchite|mal.*gorge|maux.*gorge)\b",
        "headache_intense": r"\b(maux.*tête|mal.*tête|migraine|céphalée)\b"
    }

    def analyze_text(self, text: str) -> Dict[str, Any]:
        """
        Analyse le texte des symptômes et retourne les symptômes détectés avec leur score de gravité.
        """
        text_lower = text.lower()
        detected_red_flags = []
        detected_orange_flags = []

        # Recherche des Red Flags (Urgence ROUGE)
        for category, pattern in self.RED_FLAG_PATTERNS.items():
            matches = re.findall(pattern, text_lower)
            if matches:
                detected_red_flags.append({"category": category, "match": matches[0]})

        # Recherche des Orange Flags (Gravité ORANGE)
        for category, pattern in self.ORANGE_FLAG_PATTERNS.items():
            matches = re.findall(pattern, text_lower)
            if matches:
                detected_orange_flags.append({"category": category, "match": matches[0]})

        return {
            "red_flags": detected_red_flags,
            "orange_flags": detected_orange_flags,
            "has_red_flags": len(detected_red_flags) > 0,
            "has_orange_flags": len(detected_orange_flags) > 0
        }

    def process_triage(
        self,
        payload: SymptomPayload,
        patient_age_group: AgeGroup = AgeGroup.ADULT
    ) -> TriageResult:
        """
        Exécute l'analyse complète d'une session de symptômes et produit le TriageResult.
        """
        analysis = self.analyze_text(payload.french_translated_text)

        # 1. Vérification prioritaire des 4 signes généraux de danger PCIME
        ds = payload.danger_signs
        if ds.has_any_danger_sign:
            reasons = []
            if ds.cannot_drink_or_breastfeed: reasons.append("Incapacité à téter/boire")
            if ds.vomits_everything: reasons.append("Vomissements de tout ce qui est absorbé")
            if ds.convulsions_during_illness: reasons.append("Convulsions pendant la maladie")
            if ds.lethargic_or_unconscious: reasons.append("Léthargie ou inconscience")

            reason_str = ", ".join(reasons)
            return TriageResult(
                triage_id=f"TRG-{payload.session_id}",
                session_id=payload.session_id,
                patient_id=payload.patient_id,
                urgency_level=TriageUrgency.ROUGE,
                rule_based_override=True,
                presumed_icd10_code="R56.0",
                presumed_condition_name="Urgence Vitale Pédiatrique (Signe Danger PCIME)",
                recommended_facility_type=FacilityType.HOPITAL_URGENCES,
                immediate_advice_fr=f"URGENCE VITALE : {reason_str}. Rendez-vous immédiatement à l'hôpital le plus proche.",
                xai_explanation=XAIExplanation(
                    top_contributing_symptoms=[{"symptom": reason_str, "score": 1.0}],
                    summary_text_fr=f"Déclenché par règle déterministe PCIME : {reason_str}",
                    model_version="MediBenin-NLP-Rules-Engine-v1"
                )
            )

        # 2. Vérification de la température corporelle
        if payload.temperature_celsius is not None and payload.temperature_celsius >= 39.5:
            return TriageResult(
                triage_id=f"TRG-{payload.session_id}",
                session_id=payload.session_id,
                patient_id=payload.patient_id,
                urgency_level=TriageUrgency.ROUGE,
                rule_based_override=True,
                presumed_icd10_code="B54",
                presumed_condition_name="Hyperthermie Majeure / Paludisme Grave Suspecté",
                recommended_facility_type=FacilityType.HOPITAL_URGENCES,
                immediate_advice_fr=f"ALERTE : Température très élevée ({payload.temperature_celsius}°C). Risque de convulsion fébrile. Hôpital immédiat.",
                xai_explanation=XAIExplanation(
                    top_contributing_symptoms=[{"symptom": f"Température {payload.temperature_celsius}°C", "score": 0.95}],
                    summary_text_fr=f"Déclenché par hyperthermie majeure ({payload.temperature_celsius}°C)",
                    model_version="MediBenin-NLP-Rules-Engine-v1"
                )
            )

        # 3. Analyse textuelle Red Flags
        if analysis["has_red_flags"]:
            matched_terms = [rf["match"] if isinstance(rf["match"], str) else rf["match"][0] for rf in analysis["red_flags"]]
            matched_str = ", ".join(matched_terms)
            return TriageResult(
                triage_id=f"TRG-{payload.session_id}",
                session_id=payload.session_id,
                patient_id=payload.patient_id,
                urgency_level=TriageUrgency.ROUGE,
                rule_based_override=True,
                presumed_icd10_code="R06.0",
                presumed_condition_name="Urgence Médicale Majeure (Symptôme Critique)",
                recommended_facility_type=FacilityType.HOPITAL_URGENCES,
                immediate_advice_fr=f"URGENCE VITALE : Symptôme critique détecté ({matched_str}). Rendez-vous immédiatement aux urgences.",
                xai_explanation=XAIExplanation(
                    top_contributing_symptoms=[{"symptom": matched_str, "score": 0.9}],
                    summary_text_fr=f"Détection de mot-clé critique d'urgence : {matched_str}",
                    model_version="MediBenin-NLP-Rules-Engine-v1"
                )
            )

        # 4. Analyse textuelle Orange Flags (Fièvre, paludisme, vomissements, etc.)
        if analysis["has_orange_flags"] or (payload.temperature_celsius and payload.temperature_celsius >= 38.5):
            matched_terms = [of["match"] if isinstance(of["match"], str) else of["match"][0] for of in analysis["orange_flags"]]
            matched_str = ", ".join(matched_terms) if matched_terms else "Fièvre modérée"
            
            # Présomption de paludisme si fièvre + courbatures/maux de tête (fréquent au Bénin)
            is_malaria = any("fièvre" in m or "palu" in m or "frisson" in m for m in matched_terms) or (payload.temperature_celsius and payload.temperature_celsius >= 38.5)
            icd10 = "B54" if is_malaria else "R50.9"
            cond_name = "Suspicions de Paludisme Simple / Accès Fébrile" if is_malaria else "Affection Modérée Nécessitant Soins"

            return TriageResult(
                triage_id=f"TRG-{payload.session_id}",
                session_id=payload.session_id,
                patient_id=payload.patient_id,
                urgency_level=TriageUrgency.ORANGE,
                rule_based_override=False,
                presumed_icd10_code=icd10,
                presumed_condition_name=cond_name,
                recommended_facility_type=FacilityType.CENTRE_DE_SANTE,
                immediate_advice_fr="Consultez un centre de santé ou effectuez une téléconsultation médicale dans les 24 à 48h.",
                xai_explanation=XAIExplanation(
                    top_contributing_symptoms=[{"symptom": matched_str, "score": 0.7}],
                    summary_text_fr=f"Symptômes modérés identifiés : {matched_str}",
                    model_version="MediBenin-NLP-Rules-Engine-v1"
                )
            )

        # 5. Cas Léger (CAS VERT)
        return TriageResult(
            triage_id=f"TRG-{payload.session_id}",
            session_id=payload.session_id,
            patient_id=payload.patient_id,
            urgency_level=TriageUrgency.VERT,
            rule_based_override=False,
            presumed_icd10_code="R53",
            presumed_condition_name="Affection Légère / État Fébrile Bénin",
            recommended_facility_type=FacilityType.PHARMACIE_PARTENAIRE,
            immediate_advice_fr="Symptômes légers. Repos, bonne hydratation et conseils de votre pharmacien partenaire.",
            xai_explanation=XAIExplanation(
                top_contributing_symptoms=[{"symptom": payload.french_translated_text, "score": 0.5}],
                summary_text_fr="Aucun signe de gravité modérée ou majeure détecté.",
                model_version="MediBenin-NLP-Rules-Engine-v1"
            )
        )
