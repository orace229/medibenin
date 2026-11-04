"""
MediBenin - Tests du Moteur de Règles Cliniques & Matrice de Triage
Vérification des règles déterministes PCIME et du scénario PoC ("Fièvre chez un enfant de 3 ans").
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from models.enums import AgeGroup, InputMode, LocalLanguage, TriageUrgency, FacilityType
from models.domain_models import SymptomPayload, DangerSignCheck
from core.triage_matrix import ClinicalTriageMatrix


def test_poc_child_fever_danger_sign():
    """Test Scénario PoC : Enfant de 3 ans avec fièvre et refus de téter/boire (Danger PCIME)."""
    matrix = ClinicalTriageMatrix()

    payload = SymptomPayload(
        session_id="SESS-001",
        patient_id="PAT-BENIN-101",
        input_mode=InputMode.VOICE,
        raw_transcribed_text="Vi 3 ans tɔn ce ɖo asɔ yɔyɔ sin zɔn, é nyí nǔ nu ǎ",
        french_translated_text="Mon enfant de 3 ans a une forte fièvre et refuse de boire ou de téter.",
        temperature_celsius=39.2,
        danger_signs=DangerSignCheck(cannot_drink_or_breastfeed=True)
    )

    result = matrix.evaluate_triage(payload, AgeGroup.INFANT_0_5)

    print("\n--- TEST SCÉNARIO POC PCIME ---")
    print(f"Session ID : {result.session_id}")
    print(f"Urgence : {result.urgency_level.value}")
    print(f"Imposé par règle déterministe : {result.rule_based_override}")
    print(f"Structure recommandée : {result.recommended_facility_type.value}")
    print(f"Conseil immédiat : {result.immediate_advice_fr}")
    print(f"Explication XAI : {result.xai_explanation.summary_text_fr}")

    assert result.urgency_level == TriageUrgency.ROUGE
    assert result.rule_based_override is True
    assert result.recommended_facility_type == FacilityType.HOPITAL_URGENCES
    print("[OK] TEST POC VALIDE : Le cas de danger PCIME bascule a 100% en ROUGE.")


def test_mild_symptoms_no_danger():
    """Test Cas Léger : Adulte avec fébricule (37.9°C), pas de signe de danger."""
    matrix = ClinicalTriageMatrix()

    payload = SymptomPayload(
        session_id="SESS-002",
        patient_id="PAT-BENIN-102",
        input_mode=InputMode.TEXT,
        french_translated_text="Un peu fatigué et légère courbature.",
        temperature_celsius=37.9,
        danger_signs=DangerSignCheck()
    )

    result = matrix.evaluate_triage(
        payload,
        AgeGroup.ADULT,
        llm_suggested_urgency=TriageUrgency.VERT,
        llm_condition_name="Syndrome grippal bénin",
        llm_icd10="J11"
    )

    print("\n--- TEST CAS LEGER ---")
    print(f"Urgence : {result.urgency_level.value}")
    print(f"Structure recommandée : {result.recommended_facility_type.value}")
    assert result.urgency_level == TriageUrgency.VERT
    assert result.rule_based_override is False
    print("[OK] TEST CAS LEGER VALIDE : Triage en VERT.")



if __name__ == "__main__":
    test_poc_child_fever_danger_sign()
    test_mild_symptoms_no_danger()
