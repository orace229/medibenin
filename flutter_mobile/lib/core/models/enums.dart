/// Langues prises en charge par MediBenin
enum LocalLanguage {
  fon('Fongbé', 'Fɔngbè', '🇧🇯'),
  yoruba('Yorùbá', 'Yorùbá', '🇧🇯'),
  bariba('Bariba', 'Baatɔnum', '🇧🇯'),
  goun('Goun', 'Gungbè', '🇧🇯'),
  adja('Adja', 'Aja-gbe', '🇧🇯'),
  french('Français', 'Français', '🇫🇷');

  final String displayName;
  final String localName;
  final String flag;

  const LocalLanguage(this.displayName, this.localName, this.flag);
}

/// Niveaux d'Urgence du Triage Clinique
enum TriageUrgencyLevel {
  vert('VERT', 'Cas Léger (70%)', 'Auto-soins & conseils pharmacie'),
  orange('ORANGE', 'Cas Modéré (20%)', 'Consultation sous 24-48h'),
  rouge('ROUGE', 'Urgence Vitale (10%)', 'Prise en charge immédiate');

  final String code;
  final String label;
  final String description;

  const TriageUrgencyLevel(this.code, this.label, this.description);
}

/// Tranches d'âge et référentiels
enum AgeCategory {
  infant05('0 - 5 ans', 'Protocole PCIME (Bénin)'),
  child511('5 - 11 ans', 'Référentiel Pédiatrique ARS'),
  teen1218('12 - 18 ans', 'Protocole TETU SoBePed'),
  adult18Plus('18 ans et plus', 'Consultation Générale');

  final String label;
  final String protocolName;

  const AgeCategory(this.label, this.protocolName);
}

/// Mode de saisie des symptômes
enum SymptomInputType {
  voice,
  text,
  photo,
  temperature,
}

/// Opérateurs Mobile Money au Bénin
enum MobileMoneyOperator {
  mtn('MTN Mobile Money', '*880#'),
  moov('Moov Money (Flooz)', '*155#');

  final String name;
  final String ussdCode;

  const MobileMoneyOperator(this.name, this.ussdCode);
}
