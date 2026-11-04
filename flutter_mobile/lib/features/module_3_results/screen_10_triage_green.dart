import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/models/enums.dart';
import '../../core/widgets/medi_big_button.dart';
import '../../core/widgets/triage_status_badge.dart';
import '../../services/mock_data_service.dart';
import '../module_2_symptoms/screen_5_home_dashboard.dart';
import '../module_4_directory/screen_14_pharmacies_directory.dart';

class Screen10TriageGreen extends StatefulWidget {
  const Screen10TriageGreen({super.key});

  @override
  State<Screen10TriageGreen> createState() => _Screen10TriageGreenState();
}

class _Screen10TriageGreenState extends State<Screen10TriageGreen> {
  final MockDataService _service = MockDataService();
  bool _isPlayingAudio = false;

  @override
  Widget build(BuildContext context) {
    final triage = _service.activeTriage ?? _service.computeTriage();
    final lang = _service.currentLanguage;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Résultat d\'Orientation'),
        automaticallyImplyLeading: false,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(22),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Statut Carte Verte
              TriageStatusCard(
                urgency: TriageUrgencyLevel.vert,
                conditionName: triage.conditionName,
                ruleBasedOverride: triage.ruleBasedOverride,
              ),
              const SizedBox(height: 18),

              // Bouton Écouter le conseil vocal dans sa langue
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.borderSubtle),
                ),
                child: Row(
                  children: [
                    IconButton.filled(
                      style: IconButton.styleFrom(backgroundColor: AppColors.primaryGreen),
                      icon: Icon(_isPlayingAudio ? Icons.pause : Icons.volume_up_rounded, color: Colors.white),
                      onPressed: () {
                        setState(() {
                          _isPlayingAudio = !_isPlayingAudio;
                        });
                      },
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _isPlayingAudio ? 'Lecture audio en ${lang.displayName}...' : 'Écouter le conseil en ${lang.displayName}',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                          ),
                          Text(
                            triage.adviceLocalLanguage ?? 'Gbɔjɛ bo nu sin ganji.',
                            style: const TextStyle(fontSize: 12, color: AppColors.textMuted, fontStyle: FontStyle.italic),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              const Text(
                'Conseils d\'Auto-Soins Immédiats :',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.borderSubtle),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      triage.adviceFrench,
                      style: const TextStyle(fontSize: 15, height: 1.4),
                    ),
                    const SizedBox(height: 14),
                    const Text('• Boire beaucoup d\'eau propre ou de tisane légère.'),
                    const Text('• Se reposer et éviter les gros efforts sous le soleil.'),
                    const Text('• Consulter si la température monte au-dessus de 38.5°C.'),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              MediBigButton(
                label: 'Pharmacies Partenaires Proches',
                subtitle: 'Pour vos conseils ou médicaments de confort',
                icon: Icons.local_pharmacy_rounded,
                backgroundColor: Colors.teal.shade700,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const Screen14PharmaciesDirectory()),
                  );
                },
              ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 50),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                icon: const Icon(Icons.home_rounded),
                label: const Text('Retour à l\'Accueil'),
                onPressed: () {
                  Navigator.pushAndRemoveUntil(
                    context,
                    MaterialPageRoute(builder: (_) => const Screen5HomeDashboard()),
                    (route) => false,
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
