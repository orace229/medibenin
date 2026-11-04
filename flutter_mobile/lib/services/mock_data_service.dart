import 'package:flutter/foundation.dart';
import '../core/models/enums.dart';
import '../core/models/triage_models.dart';

/// Service Central de Mock & Gestion d'État - MediBenin
/// Permet l'interactivité complète des 22 écrans en mode déconnecté.
class MockDataService extends ChangeNotifier {
  // Singleton
  static final MockDataService _instance = MockDataService._internal();
  factory MockDataService() => _instance;
  MockDataService._internal() {
    _initSampleData();
  }

  // 1. État Actuel du Patient & Session
  LocalLanguage _currentLanguage = LocalLanguage.fon;
  LocalLanguage get currentLanguage => _currentLanguage;

  PatientData _currentPatient = PatientData(
    id: 'PAT-BENIN-2026-001',
    nameOrNickname: 'Koffi & Maman',
    age: 3,
    gender: 'M',
    isRepresentedByRelative: true,
    phoneNumber: '+229 97 00 11 22',
    departement: 'Atlantique',
    commune: 'Abomey-Calavi',
    preferredLanguage: LocalLanguage.fon,
  );
  PatientData get currentPatient => _currentPatient;

  // 2. Symptômes de la consultation en cours
  String _symptomInputText = '';
  String get symptomInputText => _symptomInputText;

  double? _measuredTemperature = 39.2;
  double? get measuredTemperature => _measuredTemperature;

  DangerSignsPCIME _dangerSigns = const DangerSignsPCIME(
    cannotDrinkOrBreastfeed: true,
  );
  DangerSignsPCIME get dangerSigns => _dangerSigns;

  // 3. Triage Actif
  TriageOutput? _activeTriage;
  TriageOutput? get activeTriage => _activeTriage;

  // 4. Données d'annuaire et référentiels
  late List<HealthFacilityItem> _hospitals;
  List<HealthFacilityItem> get hospitals => _hospitals;

  late List<HealthFacilityItem> _pharmacies;
  List<HealthFacilityItem> get pharmacies => _pharmacies;

  late List<DoctorProfile> _doctors;
  List<DoctorProfile> get doctors => _doctors;

  late List<AuditCaseItem> _auditCases;
  List<AuditCaseItem> get auditCases => _auditCases;

  late List<TriageOutput> _consultationHistory;
  List<TriageOutput> get consultationHistory => _consultationHistory;

  void setLanguage(LocalLanguage lang) {
    _currentLanguage = lang;
    notifyListeners();
  }

  void updatePatientProfile({
    required String name,
    required int age,
    required String gender,
    required bool isRelative,
    required String phone,
    required String commune,
    required String departement,
  }) {
    _currentPatient = PatientData(
      id: _currentPatient.id,
      nameOrNickname: name,
      age: age,
      gender: gender,
      isRepresentedByRelative: isRelative,
      phoneNumber: phone,
      departement: departement,
      commune: commune,
      preferredLanguage: _currentLanguage,
    );
    notifyListeners();
  }

  void setSymptoms({
    String? text,
    double? temperature,
    DangerSignsPCIME? danger,
  }) {
    if (text != null) _symptomInputText = text;
    if (temperature != null) _measuredTemperature = temperature;
    if (danger != null) _dangerSigns = danger;
    notifyListeners();
  }

  /// Exécute une simulation de triage clinique réaliste
  TriageOutput computeTriage() {
    TriageUrgencyLevel urgency;
    bool override = false;
    String condName;
    String icd10;
    String adviceFr;
    String adviceLocal;
    String facility;

    // Règle 1: Danger PCIME ou Temp >= 39.5 -> ROUGE
    if (_dangerSigns.hasAnyDangerSign || (_measuredTemperature != null && _measuredTemperature! >= 39.5)) {
      urgency = TriageUrgencyLevel.rouge;
      override = true;
      condName = 'Urgence Pédiatrique Majeure (PCIME)';
      icd10 = 'R56.0';
      adviceFr = 'URGENCE VITALE : Signe général de danger détecté. Rendez-vous immédiatement aux urgences hospitalières.';
      adviceLocal = 'ALODO ! Vi mitɔn ɖo tagba syɛnsyɛn mɛ. Mi hɛn yi dotoxwe klewun !';
      facility = 'CHU-MEL Cotonou (Urgences Pédiatriques)';
    } else if ((_measuredTemperature != null && _measuredTemperature! >= 38.5) ||
        _symptomInputText.toLowerCase().contains('fièvre') ||
        _symptomInputText.toLowerCase().contains('palu')) {
      urgency = TriageUrgencyLevel.orange;
      condName = 'Suspicions Paludisme Simple / Accès Fébrile';
      icd10 = 'B54';
      adviceFr = 'Consultation recommandée sous 24h à 48h dans un centre de santé ou via téléconsultation.';
      adviceLocal = 'Mi ɖo na mɔ doto ɖo azan we gblamɛ bo na d’alɔ palu tɔn.';
      facility = 'Centre de Santé de Calavi Centre';
    } else {
      urgency = TriageUrgencyLevel.vert;
      condName = 'Affection Fébrile Légère / Fatigue';
      icd10 = 'R53';
      adviceFr = 'Symptômes bénins. Repos, bonne hydratation et conseils de votre pharmacien partenaire.';
      adviceLocal = 'Nuɖe syɛn ɖe a. Gbɔjɛ bo nu sin ganji.';
      facility = 'Pharmacie Sainte-Trinité Calavi';
    }

    _activeTriage = TriageOutput(
      id: 'TRG-${DateTime.now().millisecondsSinceEpoch}',
      patientName: _currentPatient.nameOrNickname,
      urgency: urgency,
      ruleBasedOverride: override,
      conditionName: condName,
      icd10Code: icd10,
      adviceFrench: adviceFr,
      adviceLocalLanguage: adviceLocal,
      recommendedFacility: facility,
      xaiExplanation: 'Détection basée sur : Température ${_measuredTemperature ?? 37}°C + Signes cliniques',
      timestamp: DateTime.now(),
    );

    _consultationHistory.insert(0, _activeTriage!);
    notifyListeners();
    return _activeTriage!;
  }

  void reviewAuditCase(String caseId, bool approved, String notes) {
    final idx = _auditCases.indexWhere((c) => c.caseId == caseId);
    if (idx != -1) {
      _auditCases[idx].isReviewed = true;
      _auditCases[idx].isApproved = approved;
      _auditCases[idx].doctorNotes = notes;
      notifyListeners();
    }
  }

  void _initSampleData() {
    _consultationHistory = [
      TriageOutput(
        id: 'TRG-HIST-01',
        patientName: 'Koffi (Enfant 3 ans)',
        urgency: TriageUrgencyLevel.rouge,
        ruleBasedOverride: true,
        conditionName: 'Fièvre et refus de téter (PCIME)',
        icd10Code: 'R56.0',
        adviceFrench: 'Transfert hôpital d\'urgence effectué.',
        recommendedFacility: 'Hôpital de Mènon',
        xaiExplanation: 'Convulsion fébrile suspectée',
        timestamp: DateTime.now().subtract(const Duration(days: 3)),
      ),
      TriageOutput(
        id: 'TRG-HIST-02',
        patientName: 'Maman (Adulte 32 ans)',
        urgency: TriageUrgencyLevel.vert,
        ruleBasedOverride: false,
        conditionName: 'Courbatures légères',
        icd10Code: 'R53',
        adviceFrench: 'Hydratation et repos.',
        recommendedFacility: 'Pharmacie du Marché',
        xaiExplanation: 'Fatigue physique sans fièvre',
        timestamp: DateTime.now().subtract(const Duration(days: 12)),
      ),
    ];

    _hospitals = [
      HealthFacilityItem(
        id: 'HOSP-01',
        name: 'CHU Mère-Enfant (CHU-MEL)',
        type: 'Hôpital Universitaire de Référence',
        commune: 'Cotonou',
        departement: 'Littoral',
        distanceKm: 4.2,
        phoneNumber: '+229 21 31 23 45',
        isOpen247: true,
        hasEmergencyService: true,
      ),
      HealthFacilityItem(
        id: 'HOSP-02',
        name: 'Hôpital de Zone d\'Abomey-Calavi',
        type: 'Hôpital de Zone (Urgences)',
        commune: 'Abomey-Calavi',
        departement: 'Atlantique',
        distanceKm: 2.8,
        phoneNumber: '+229 21 36 00 12',
        isOpen247: true,
        hasEmergencyService: true,
      ),
      HealthFacilityItem(
        id: 'HOSP-03',
        name: 'Centre Hospitalier Départemental du Borgou',
        type: 'Hôpital Départemental',
        commune: 'Parakou',
        departement: 'Borgou',
        distanceKm: 380.0,
        phoneNumber: '+229 23 61 02 34',
        isOpen247: true,
        hasEmergencyService: true,
      ),
      HealthFacilityItem(
        id: 'HOSP-04',
        name: 'Hôpital Évangélique de Bembèrèkè',
        type: 'Centre Spécialisé & Urgences',
        commune: 'Bembèrèkè',
        departement: 'Borgou',
        distanceKm: 440.0,
        phoneNumber: '+229 23 63 00 10',
        isOpen247: true,
        hasEmergencyService: true,
      ),
    ];

    _pharmacies = [
      HealthFacilityItem(
        id: 'PHARM-01',
        name: 'Pharmacie Akassato',
        type: 'Pharmacie Partenaire',
        commune: 'Abomey-Calavi',
        departement: 'Atlantique',
        distanceKm: 1.1,
        phoneNumber: '+229 97 12 34 56',
        isOpen247: true,
      ),
      HealthFacilityItem(
        id: 'PHARM-02',
        name: 'Pharmacie Camp Guézo',
        type: 'Pharmacie Partenaire',
        commune: 'Cotonou',
        departement: 'Littoral',
        distanceKm: 5.4,
        phoneNumber: '+229 21 31 45 78',
        isOpen247: false,
      ),
      HealthFacilityItem(
        id: 'PHARM-03',
        name: 'Pharmacie La Madone',
        type: 'Pharmacie Partenaire',
        commune: 'Porto-Novo',
        departement: 'Ouémé',
        distanceKm: 32.0,
        phoneNumber: '+229 20 22 10 09',
        isOpen247: true,
      ),
    ];

    _doctors = [
      DoctorProfile(
        id: 'DOC-01',
        fullName: 'Dr Sègla ADANHOUNDO',
        specialty: 'Pédiatre urgentiste',
        hospital: 'CHU-MEL Cotonou',
        languages: ['Français', 'Fongbé'],
        feeFcfa: 1500,
        rating: 4.9,
      ),
      DoctorProfile(
        id: 'DOC-02',
        fullName: 'Dr Aminata BIO GUERRA',
        specialty: 'Médecin Généraliste',
        hospital: 'Hôpital de Parakou',
        languages: ['Français', 'Bariba', 'Yorùbá'],
        feeFcfa: 1000,
        rating: 4.8,
      ),
      DoctorProfile(
        id: 'DOC-03',
        fullName: 'Dr Marcellin HOUNGBO',
        specialty: 'Santé Publique & Infectiologie',
        hospital: 'Clinique Bon Samaritain',
        languages: ['Français', 'Fongbé', 'Gungbè'],
        feeFcfa: 2000,
        rating: 5.0,
      ),
    ];

    _auditCases = [
      AuditCaseItem(
        caseId: 'CAS-ROUGE-894',
        patientAgeGender: '3 ans, Garçon (Mère représentante)',
        reportedSymptoms: 'Fièvre très forte à 39.8°C, vomissements systématiques, convulsion observée il y a 1 heure.',
        temperature: 39.8,
        systemUrgency: TriageUrgencyLevel.rouge,
        shapSummary: 'PCIME : 2 Signes Généraux de Danger confirmés (Convulsion + Vomit tout) -> ROUGE immédiat.',
        createdAt: DateTime.now().subtract(const Duration(hours: 2)),
      ),
      AuditCaseItem(
        caseId: 'CAS-ORANGE-321',
        patientAgeGender: '28 ans, Femme',
        reportedSymptoms: 'Frissons violents, maux de tête intenses, fatigue au réveil depuis 3 jours.',
        temperature: 38.7,
        systemUrgency: TriageUrgencyLevel.orange,
        shapSummary: 'Suspicion Paludisme simple -> consultation sous 24h.',
        createdAt: DateTime.now().subtract(const Duration(hours: 5)),
      ),
      AuditCaseItem(
        caseId: 'CAS-VERT-102',
        patientAgeGender: '45 ans, Homme',
        reportedSymptoms: 'Léger mal de gorge et écoulement nasal après la pluie.',
        temperature: 37.2,
        systemUrgency: TriageUrgencyLevel.vert,
        shapSummary: 'Rhinopharyngite bénigne sans signe de détresse.',
        createdAt: DateTime.now().subtract(const Duration(hours: 14)),
      ),
    ];
  }
}
