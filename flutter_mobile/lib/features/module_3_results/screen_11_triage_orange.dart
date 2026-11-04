import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/models/enums.dart';
import '../../core/widgets/medi_big_button.dart';
import '../../core/widgets/triage_status_badge.dart';
import '../../services/mock_data_service.dart';
import '../module_2_symptoms/screen_5_home_dashboard.dart';
import '../module_4_directory/screen_13_hospitals_directory.dart';
import '../module_5_teleconsultation/screen_15_doctor_selection.dart';

class Screen11TriageOrange extends StatefulWidget {
  const Screen11TriageOrange({super.key});

  @override
  State<Screen11TriageOrange> createState() => _Screen11TriageOrangeState();
}

class _Screen11TriageOrangeState extends State<Screen11TriageOrange> {
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
              // Statut Carte Orange
              TriageStatusCard(
                urgency: TriageUrgencyLevel.orange,
                conditionName: triage.conditionName,
                ruleBasedOverride: triage.ruleBasedOverride,
              ),
              const SizedBox(height: 18),

              // Audio conseil local
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
                      style: IconButton.styleFrom(backgroundColor: AppColors.statusOrangeDark),
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
                            _isPlayingAudio ? 'Lecture audio en ${lang.displayName}...' : 'Écouter l\'orientation en ${lang.displayName}',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                          ),
                          Text(
                            triage.adviceLocalLanguage ?? 'Mi ɖo na mɔ doto ɖo azan we gblamɛ.',
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
                'Recommandation Médicale :',
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
                    const SizedBox(height: 12),
                    const Text('⚠️ Ne pratiquez pas l\'automédication sans avis médical.'),
                    const Text('⚠️ En cas de pic fébrile brutal, surveillez les convulsions.'),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Action 1 : Téléconsultation Immédiate
              MediBigButton(
                label: 'Téléconsultation Vidéo',
                subtitle: 'Médecin en ligne (1 000 - 2 000 FCFA)',
                icon: Icons.video_camera_front_rounded,
                backgroundColor: AppColors.primaryGreen,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const Screen15DoctorSelection()),
                  );
                },
              ),
              const SizedBox(height: 12),

              // Action 2 : Centre de santé physique
              MediBigButton(
                label: 'Centres de Santé Proches',
                subtitle: 'Consultation sur place sous 24-48h',
                icon: Icons.local_hospital_rounded,
                backgroundColor: Colors.blue.shade800,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const Screen13HospitalsDirectory()),
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
