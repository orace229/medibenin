import 'enums.dart';

/// Profil Patient ou Représentant
class PatientData {
  final String id;
  final String nameOrNickname;
  final int age;
  final String gender;
  final bool isRepresentedByRelative;
  final String phoneNumber;
  final String departement;
  final String commune;
  final LocalLanguage preferredLanguage;

  PatientData({
    required this.id,
    required this.nameOrNickname,
    required this.age,
    required this.gender,
    this.isRepresentedByRelative = false,
    required this.phoneNumber,
    required this.departement,
    required this.commune,
    this.preferredLanguage = LocalLanguage.fon,
  });

  AgeCategory get ageCategory {
    if (age <= 5) return AgeCategory.infant05;
    if (age <= 11) return AgeCategory.child511;
    if (age <= 18) return AgeCategory.teen1218;
    return AgeCategory.adult18Plus;
  }
}

/// Évaluation des 4 Signes Généraux de Danger PCIME
class DangerSignsPCIME {
  final bool cannotDrinkOrBreastfeed;
  final bool vomitsEverything;
  final bool convulsions;
  final bool lethargicOrUnconscious;

  const DangerSignsPCIME({
    this.cannotDrinkOrBreastfeed = false,
    this.vomitsEverything = false,
    this.convulsions = false,
    this.lethargicOrUnconscious = false,
  });

  bool get hasAnyDangerSign =>
      cannotDrinkOrBreastfeed ||
      vomitsEverything ||
      convulsions ||
      lethargicOrUnconscious;
}

/// Résultat complet de Triage
class TriageOutput {
  final String id;
  final String patientName;
  final TriageUrgencyLevel urgency;
  final bool ruleBasedOverride;
  final String conditionName;
  final String icd10Code;
  final String adviceFrench;
  final String? adviceLocalLanguage;
  final String recommendedFacility;
  final String xaiExplanation;
  final DateTime timestamp;

  TriageOutput({
    required this.id,
    required this.patientName,
    required this.urgency,
    required this.ruleBasedOverride,
    required this.conditionName,
    required this.icd10Code,
    required this.adviceFrench,
    this.adviceLocalLanguage,
    required this.recommendedFacility,
    required this.xaiExplanation,
    required this.timestamp,
  });
}

/// Établissement de Santé (Hôpital ou Pharmacie partenaire)
class HealthFacilityItem {
  final String id;
  final String name;
  final String type; // Hôpital, Centre de Santé, Pharmacie
  final String commune;
  final String departement;
  final double distanceKm;
  final String phoneNumber;
  final bool isOpen247;
  final bool hasEmergencyService;

  HealthFacilityItem({
    required this.id,
    required this.name,
    required this.type,
    required this.commune,
    required this.departement,
    required this.distanceKm,
    required this.phoneNumber,
    this.isOpen247 = true,
    this.hasEmergencyService = false,
  });
}

/// Médecin Référent Téléconsultation
class DoctorProfile {
  final String id;
  final String fullName;
  final String specialty;
  final String hospital;
  final List<String> languages;
  final int feeFcfa;
  final double rating;
  final bool isAvailableNow;

  DoctorProfile({
    required this.id,
    required this.fullName,
    required this.specialty,
    required this.hospital,
    required this.languages,
    required this.feeFcfa,
    required this.rating,
    this.isAvailableNow = true,
  });
}

/// Cas de la File d'Audit du Comité Médical
class AuditCaseItem {
  final String caseId;
  final String patientAgeGender;
  final String reportedSymptoms;
  final double? temperature;
  final TriageUrgencyLevel systemUrgency;
  final String shapSummary;
  final DateTime createdAt;
  bool isReviewed;
  bool? isApproved;
  String? doctorNotes;

  AuditCaseItem({
    required this.caseId,
    required this.patientAgeGender,
    required this.reportedSymptoms,
    this.temperature,
    required this.systemUrgency,
    required this.shapSummary,
    required this.createdAt,
    this.isReviewed = false,
    this.isApproved,
    this.doctorNotes,
  });
}
