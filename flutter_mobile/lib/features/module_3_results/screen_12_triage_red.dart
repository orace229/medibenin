import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/models/enums.dart';
import '../../core/widgets/medi_big_button.dart';
import '../../core/widgets/triage_status_badge.dart';
import '../../services/mock_data_service.dart';
import '../module_2_symptoms/screen_5_home_dashboard.dart';
import '../module_4_directory/screen_13_hospitals_directory.dart';

class Screen12TriageRed extends StatefulWidget {
  const Screen12TriageRed({super.key});

  @override
  State<Screen12TriageRed> createState() => _Screen12TriageRedState();
}

class _Screen12TriageRedState extends State<Screen12TriageRed> {
  final MockDataService _service = MockDataService();
  bool _smsSent = false;

  @override
  Widget build(BuildContext context) {
    final triage = _service.activeTriage ?? _service.computeTriage();
    final patient = _service.currentPatient;

    return Scaffold(
      backgroundColor: const Color(0xFFFFF5F5),
      appBar: AppBar(
        title: const Text('ALERTE URGENCE VITALE', style: TextStyle(color: AppColors.statusRed, fontWeight: FontWeight.w900)),
        backgroundColor: Colors.white,
        automaticallyImplyLeading: false,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(22),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Statut Carte Rouge Majeure
              TriageStatusCard(
                urgency: TriageUrgencyLevel.rouge,
                conditionName: triage.conditionName,
                ruleBasedOverride: true,
              ),
              const SizedBox(height: 18),

              // Alerte sonore & visuelle
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.statusRed,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.warning_amber_rounded, color: Colors.white, size: 36),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Text(
                        triage.adviceFrench,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          height: 1.3,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 22),

              // Bouton 1 : Appel direct SAMU / Urgences
              MediBigButton(
                label: 'Appeler le SAMU Bénin (112)',
                subtitle: 'Numéro d\'urgence médicale gratuit',
                icon: Icons.phone_in_talk_rounded,
                backgroundColor: AppColors.statusRed,
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      backgroundColor: AppColors.statusRed,
                      content: Text('📞 Appel du SAMU Bénin (112) en cours...'),
                    ),
                  );
                },
              ),
              const SizedBox(height: 14),

              // Bouton 2 : Envoi GPS à un proche par SMS
              MediBigButton(
                label: _smsSent ? 'Position GPS envoyée au proche' : 'Partager ma Position GPS',
                subtitle: 'Envoie un SMS d\'urgence avec le lieu exact',
                icon: _smsSent ? Icons.check_circle_rounded : Icons.share_location_rounded,
                backgroundColor: Colors.deepOrange.shade800,
                onTap: () {
                  setState(() {
                    _smsSent = true;
                  });
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      backgroundColor: Colors.deepOrange.shade800,
                      content: Text(
                        '📍 SMS d\'urgence envoyé avec position GPS (${patient.commune}) aux proches !',
                      ),
                    ),
                  );
                },
              ),
              const SizedBox(height: 14),

              // Bouton 3 : Itinéraire hôpital le plus proche
              MediBigButton(
                label: 'Voir l\'Hôpital le Plus Proche',
                subtitle: 'CHU-MEL / Hôpital de Zone (Urgences pédiatriques)',
                icon: Icons.navigation_rounded,
                backgroundColor: Colors.blue.shade900,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const Screen13HospitalsDirectory()),
                  );
                },
              ),
              const SizedBox(height: 20),

              Center(
                child: TextButton.icon(
                  icon: const Icon(Icons.arrow_back),
                  label: const Text('Quitter et revenir à l\'accueil'),
                  onPressed: () {
                    Navigator.pushAndRemoveUntil(
                      context,
                      MaterialPageRoute(builder: (_) => const Screen5HomeDashboard()),
                      (route) => false,
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
