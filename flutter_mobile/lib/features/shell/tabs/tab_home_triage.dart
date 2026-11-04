import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../services/mock_data_service.dart';
import '../../module_1_onboarding/screen_4_patient_profile.dart';
import '../../module_2_symptoms/screen_6_voice_symptom.dart';
import '../../module_2_symptoms/screen_7_text_photo_symptom.dart';
import '../../module_2_symptoms/screen_8_temperature_pcime.dart';
import '../../module_5_teleconsultation/screen_15_doctor_selection.dart';

class TabHomeTriage extends StatelessWidget {
  final VoidCallback onEmergencyTap;

  const TabHomeTriage({super.key, required this.onEmergencyTap});

  @override
  Widget build(BuildContext context) {
    final service = MockDataService();
    final patient = service.currentPatient;
    final lang = service.currentLanguage;

    return LayoutBuilder(
      builder: (context, constraints) {
        final isWide = constraints.maxWidth >= 768;

        if (isWide) {
          // Disposition Desktop / Tablette (2 Colonnes Équilibrées)
          return SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Colonne Gauche : Hero Vocal & Profil
                Expanded(
                  flex: 5,
                  child: Column(
                    children: [
                      _buildPatientCard(context, patient),
                      const SizedBox(height: 18),
                      _buildHeroVoiceCard(context, lang),
                    ],
                  ),
                ),
                const SizedBox(width: 20),
                // Colonne Droite : Modes complémentaires & Téléconsultation
                Expanded(
                  flex: 4,
                  child: Column(
                    children: [
                      _buildTeleconsultationCard(context),
                      const SizedBox(height: 16),
                      _buildActionTile(
                        icon: Icons.edit_note_rounded,
                        title: 'Description Texte & Photo',
                        subtitle: 'Saisie détaillée ou photo d\'une lésion cutanée',
                        color: Colors.teal.shade700,
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const Screen7TextPhotoSymptom()),
                          );
                        },
                      ),
                      const SizedBox(height: 12),
                      _buildActionTile(
                        icon: Icons.thermostat_rounded,
                        title: 'Température & Signes de Danger',
                        subtitle: 'Contrôle déterministe PCIME (0-18 ans)',
                        color: Colors.deepOrange.shade700,
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const Screen8TemperaturePcime()),
                          );
                        },
                      ),
                      const SizedBox(height: 16),
                      // SOS Urgence Shortcut
                      InkWell(
                        onTap: onEmergencyTap,
                        borderRadius: BorderRadius.circular(16),
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppColors.statusRedLight,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppColors.statusRed.withOpacity(0.5)),
                          ),
                          child: const Row(
                            children: [
                              Icon(Icons.emergency_rounded, color: AppColors.statusRed, size: 28),
                              SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('Urgence Vitale Immédiate ?', style: TextStyle(color: AppColors.statusRed, fontWeight: FontWeight.bold, fontSize: 14)),
                                    Text('Appel direct SAMU 112 & envoi position GPS', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
                                  ],
                                ),
                              ),
                              Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppColors.statusRed),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        }

        // Disposition Mobile Native (< 768px)
        return SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildPatientCard(context, patient),
              const SizedBox(height: 18),
              _buildHeroVoiceCard(context, lang),
              const SizedBox(height: 18),
              Row(
                children: [
                  Expanded(
                    child: _buildActionTile(
                      icon: Icons.edit_note_rounded,
                      title: 'Texte & Photo',
                      subtitle: 'Écrire ou photo',
                      color: Colors.teal.shade700,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const Screen7TextPhotoSymptom()),
                        );
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildActionTile(
                      icon: Icons.thermostat_rounded,
                      title: 'Température',
                      subtitle: 'Signes PCIME',
                      color: Colors.deepOrange.shade700,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const Screen8TemperaturePcime()),
                        );
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              _buildTeleconsultationCard(context),
            ],
          ),
        );
      },
    );
  }

  Widget _buildPatientCard(BuildContext context, dynamic patient) {
    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const Screen4PatientProfile()),
        );
      },
      borderRadius: BorderRadius.circular(18),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: AppColors.borderSubtle),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.03),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
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
                  Row(
                    children: [
                      Flexible(
                        child: Text(
                          patient.nameOrNickname,
                          style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 6),
                      const Icon(Icons.edit_outlined, size: 16, color: AppColors.textMuted),
                    ],
                  ),
                  Text(
                    '${patient.age} ans • ${patient.commune} (${patient.departement})',
                    style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                  ),
                  if (patient.isRepresentedByRelative)
                    const Text(
                      '👨‍👩‍👧 Rempli pour un proche',
                      style: TextStyle(fontSize: 11, color: AppColors.earthAccent, fontWeight: FontWeight.bold),
                    ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: AppColors.primaryGreenLight,
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Text('Modifier', style: TextStyle(color: AppColors.primaryGreenDark, fontWeight: FontWeight.bold, fontSize: 12)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeroVoiceCard(BuildContext context, dynamic lang) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF2E7D32), Color(0xFF1B5E20)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: AppColors.primaryGreen.withOpacity(0.35),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        children: [
          Text(
            'Décrivez vos symptômes en ${lang.displayName}',
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            '« Parlez simplement comme à un médecin au village »',
            style: TextStyle(
              color: Colors.white.withOpacity(0.88),
              fontSize: 13,
              fontStyle: FontStyle.italic,
            ),
          ),
          const SizedBox(height: 22),
          Material(
            color: Colors.white,
            shape: const CircleBorder(),
            elevation: 6,
            child: InkWell(
              customBorder: const CircleBorder(),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const Screen6VoiceSymptom()),
                );
              },
              child: const Padding(
                padding: EdgeInsets.all(26),
                child: Icon(
                  Icons.mic_rounded,
                  size: 58,
                  color: AppColors.primaryGreen,
                ),
              ),
            ),
          ),
          const SizedBox(height: 18),
          const Text(
            'Touchez le micro pour parler',
            style: TextStyle(
              color: Colors.white,
              fontSize: 15,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTeleconsultationCard(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Row(
        children: [
          const CircleAvatar(
            backgroundColor: AppColors.primaryGreenLight,
            radius: 22,
            child: Icon(Icons.video_call_rounded, color: AppColors.primaryGreen, size: 26),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Téléconsultation Médecin',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                ),
                Text(
                  '15 min en vidéo avec un médecin béninois',
                  style: TextStyle(fontSize: 12, color: AppColors.textMuted),
                ),
              ],
            ),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryGreen,
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: const Text('Consulter', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const Screen15DoctorSelection()),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildActionTile({
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
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CircleAvatar(
                radius: 18,
                backgroundColor: color.withOpacity(0.12),
                child: Icon(icon, color: color, size: 20),
              ),
              const SizedBox(height: 10),
              Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              const SizedBox(height: 2),
              Text(subtitle, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
            ],
          ),
        ),
      ),
    );
  }
}
