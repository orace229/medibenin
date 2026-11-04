"""
MediBenin - Tests du Moteur d'Analyse NLP des Symptômes
Vérification des classifications Vert / Orange / Rouge sur des cas de symptômes réels.
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from models.enums import AgeGroup, InputMode, TriageUrgency, FacilityType
from models.domain_models import SymptomPayload, DangerSignCheck
from core.symptom_analyzer import SymptomNLPAnalyzer


def test_malaria_symptoms_orange():
    """Test Cas Paludisme / Fièvre + Maux de tête (CAS ORANGE)."""
    analyzer = SymptomNLPAnalyzer()
    payload = SymptomPayload(
        session_id="SESS-101",
        patient_id="PAT-101",
        input_mode=InputMode.TEXT,
        french_translated_text="J'ai une forte fièvre, des frissons et de grands maux de tête depuis 2 jours.",
        temperature_celsius=38.8
    )

    result = analyzer.process_triage(payload, AgeGroup.ADULT)

    print("\n--- TEST PALUDISME / FIEVRE ---")
    print(f"Urgence : {result.urgency_level.value}")
    print(f"Pathologie suspectée : {result.presumed_condition_name} ({result.presumed_icd10_code})")
    print(f"Structure recommandée : {result.recommended_facility_type.value}")
    print(f"Conseils : {result.immediate_advice_fr}")

    assert result.urgency_level == TriageUrgency.ORANGE
    assert result.recommended_facility_type == FacilityType.CENTRE_DE_SANTE
    print("[OK] TEST PALUDISME VALIDE : Triage correctement classé en ORANGE.")


def test_respiratory_distress_red():
    """Test Cas Détresse Respiratoire (CAS ROUGE)."""
    analyzer = SymptomNLPAnalyzer()
    payload = SymptomPayload(
        session_id="SESS-102",
        patient_id="PAT-102",
        input_mode=InputMode.VOICE,
        raw_transcribed_text="Nya kpe è, é nyí nǔ gbɔ ǎ...",
        french_translated_text="L'enfant a une grande difficulté à respirer et étouffe.",
        temperature_celsius=38.5
    )

    result = analyzer.process_triage(payload, AgeGroup.INFANT_0_5)

    print("\n--- TEST DETRESSE RESPIRATOIRE ---")
    print(f"Urgence : {result.urgency_level.value}")
    print(f"Structure recommandée : {result.recommended_facility_type.value}")
    print(f"Conseils : {result.immediate_advice_fr}")

    assert result.urgency_level == TriageUrgency.ROUGE
    assert result.recommended_facility_type == FacilityType.HOPITAL_URGENCES
    print("[OK] TEST DETRESSE RESPIRATOIRE VALIDE : Triage correctement classé en ROUGE.")


def test_mild_cold_green():
    """Test Cas Rhume / Fatigue Légère (CAS VERT)."""
    analyzer = SymptomNLPAnalyzer()
    payload = SymptomPayload(
        session_id="SESS-103",
        patient_id="PAT-103",
        input_mode=InputMode.TEXT,
        french_translated_text="Petit nez qui coule et courbature légère après le travail.",
        temperature_celsius=37.1
    )

    result = analyzer.process_triage(payload, AgeGroup.ADULT)

    print("\n--- TEST RHUME LEGER ---")
    print(f"Urgence : {result.urgency_level.value}")
    print(f"Structure recommandée : {result.recommended_facility_type.value}")

    assert result.urgency_level == TriageUrgency.VERT
    assert result.recommended_facility_type == FacilityType.PHARMACIE_PARTENAIRE
    print("[OK] TEST RHUME LEGER VALIDE : Triage correctement classé en VERT.")


if __name__ == "__main__":
    test_malaria_symptoms_orange()
    test_respiratory_distress_red()
    test_mild_cold_green()
