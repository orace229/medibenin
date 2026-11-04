import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/widgets/medi_big_button.dart';
import '../../services/mock_data_service.dart';
import 'screen_6_voice_symptom.dart';
import '../module_3_results/screen_12_triage_red.dart';
import '../module_4_directory/screen_13_hospitals_directory.dart';
import '../module_4_directory/screen_14_pharmacies_directory.dart';
import '../module_6_followup/screen_18_consultation_history.dart';
import '../module_7_audit_admin/screen_20_audit_queue.dart';
import '../module_7_audit_admin/screen_22_settings_legal.dart';

class Screen5HomeDashboard extends StatelessWidget {
  const Screen5HomeDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    final service = MockDataService();
    final patient = service.currentPatient;
    final lang = service.currentLanguage;

    return Scaffold(
      appBar: AppBar(
        title: const Text('MediBenin • Accueil'),
        actions: [
          // Sélecteur de langue rapide
          Padding(
            padding: const EdgeInsets.only(right: 14),
            child: Chip(
              backgroundColor: AppColors.primaryGreenLight,
              avatar: Text(lang.flag),
              label: Text(
                lang.displayName,
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
              ),
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Carte Profil Actif
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.borderSubtle),
                ),
                child: Row(
                  children: [
                    const CircleAvatar(
                      radius: 26,
                      backgroundColor: AppColors.primaryGreenLight,
                      child: Icon(Icons.person, color: AppColors.primaryGreen, size: 30),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            patient.nameOrNickname,
                            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                          Text(
                            '${patient.age} ans • ${patient.commune} (${patient.departement})',
                            style: const TextStyle(fontSize: 13, color: AppColors.textMuted),
                          ),
                          if (patient.isRepresentedByRelative)
                            const Text(
                              '👨‍👩‍👧 Rempli par un proche',
                              style: TextStyle(fontSize: 12, color: AppColors.earthAccent, fontWeight: FontWeight.bold),
                            ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.settings_outlined, color: AppColors.textMuted),
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const Screen22SettingsLegal()),
                        );
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 22),

              // Action Principale : Lancer une consultation
              MediBigButton(
                label: 'Décrire mes Symptômes',
                subtitle: 'Parlez en ${lang.displayName} ou écrivez',
                icon: Icons.mic_rounded,
                backgroundColor: AppColors.primaryGreen,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const Screen6VoiceSymptom()),
                  );
                },
              ),
              const SizedBox(height: 14),

              // Raccourci SOS Urgence
              MediBigButton(
                label: 'SOS Urgence Vitale',
                subtitle: 'Besoin d\'un hôpital ou du SAMU immédiatement',
                icon: Icons.emergency_rounded,
                backgroundColor: AppColors.statusRed,
                onTap: () {
                  service.computeTriage();
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const Screen12TriageRed()),
                  );
                },
              ),
              const SizedBox(height: 24),

              const Text(
                'Services & Accès Rapide',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),

              // Grille de services
              Row(
                children: [
                  Expanded(
                    child: _buildServiceCard(
                      icon: Icons.local_hospital_rounded,
                      title: 'Hôpitaux',
                      subtitle: 'Centres de santé proches',
                      color: Colors.blue.shade700,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const Screen13HospitalsDirectory()),
                        );
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildServiceCard(
                      icon: Icons.local_pharmacy_rounded,
                      title: 'Pharmacies',
                      subtitle: 'Officines partenaires',
                      color: Colors.teal.shade700,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const Screen14PharmaciesDirectory()),
                        );
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _buildServiceCard(
                      icon: Icons.history_rounded,
                      title: 'Historique',
                      subtitle: 'Mes triages passés',
                      color: AppColors.earthAccent,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const Screen18ConsultationHistory()),
                        );
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildServiceCard(
                      icon: Icons.verified_user_rounded,
                      title: 'Comité Médical',
                      subtitle: 'Espace audit a posteriori',
                      color: Colors.purple.shade700,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const Screen20AuditQueue()),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildServiceCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(16),
      elevation: 1,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CircleAvatar(
                radius: 20,
                backgroundColor: color.withOpacity(0.12),
                child: Icon(icon, color: color, size: 22),
              ),
              const SizedBox(height: 10),
              Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
              const SizedBox(height: 2),
              Text(subtitle, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
            ],
          ),
        ),
      ),
    );
  }
}
