"""
MediBenin - Enums & Constantes du Domaine
Définition des types énumérés principaux pour le système de triage et d'orientation médicale.
"""

from enum import Enum


class LocalLanguage(str, Enum):
    """Langues gérées par le pipeline PNL/ASR Meta MMS & AfriNLLB."""
    FON = "fon"          # Fongbe (Centre / Sud - ~44% population)
    YORUBA = "yor"       # Nago / Yoruba (Sud-Est)
    BARIBA = "bba"       # Baatonum / Bariba (Nord - ~13% population)
    GOUN = "gun"         # Gungbe (Porto-Novo)
    ADJA = "adj"         # Adjagbe (Couffo / Sud-Ouest)
    FRENCH = "fra"       # Français (Langue administrative / pivot)


class TriageUrgency(str, Enum):
    """Niveaux de gravité issus du triage clinique (Code Couleurs MediBenin)."""
    VERT = "VERT"       # Léger (70%) - Auto-soins, conseils, pharmacie
    ORANGE = "ORANGE"   # Modéré (20%) - Consultation 24-48h, téléconsultation
    ROUGE = "ROUGE"     # Urgence vitale (10%) - Transfert immédiat hôpital/SAMU


class InputMode(str, Enum):
    """Modes de description des symptômes par l'utilisateur."""
    VOICE = "VOICE"             # Description orale (transcription MMS)
    TEXT = "TEXT"               # Saisie libre texte
    PHOTO = "PHOTO"             # Photo de lésion cutanée / ordonnance
    TEMPERATURE = "TEMPERATURE" # Saisie numérique de la température (°C)


class AgeGroup(str, Enum):
    """Tranches d'âge associées aux référentiels cliniques officiels."""
    INFANT_0_5 = "0-5_ans"     # Protocole PCIME (OMS/UNICEF Bénin)
    PEDIATRIC_5_11 = "5-11_ans" # Référentiels Pédiatriques ARS Bénin
    ADOLESCENT_12_18 = "12-18_ans" # TETU (SoBePed Bénin)
    ADULT = ">=18_ans"         # Référentiel IITT / Consultation Générale


class FacilityType(str, Enum):
    """Types de structures de soins pour la recommandation d'orientation."""
    HOPITAL_URGENCES = "HOPITAL_URGENCES"
    CENTRE_DE_SANTE = "CENTRE_DE_SANTE"
    MATERNITE = "MATERNITE"
    PHARMACIE_PARTENAIRE = "PHARMACIE_PARTENAIRE"
    TELECONSULTATION = "TELECONSULTATION"
