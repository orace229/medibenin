import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../services/mock_data_service.dart';
import '../module_1_onboarding/screen_2_language_selection.dart';

class Screen22SettingsLegal extends StatelessWidget {
  const Screen22SettingsLegal({super.key});

  @override
  Widget build(BuildContext context) {
    final service = MockDataService();
    final lang = service.currentLanguage;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Paramètres & Conformité'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(22),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Langue active
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.borderSubtle),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Langue de l\'Application :', style: TextStyle(color: AppColors.textMuted, fontSize: 13)),
                        const SizedBox(height: 4),
                        Text('${lang.flag} ${lang.displayName} (${lang.localName})', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      ],
                    ),
                    OutlinedButton(
                      child: const Text('Changer'),
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const Screen2LanguageSelection()),
                        );
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 22),

              // Disclaimer Médical Obligatoire
              const Text('Avertissement Médical Légal :', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.primaryGreenLight,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.primaryGreen),
                ),
                child: const Text(
                  '« MediBenin est un dispositif numérique d\'orientation et de triage médical. Cet outil ne remplace pas une consultation médicale présentielle et ne délivre aucun diagnostic définitif autonome. En cas de doute ou d\'urgence vitale, contactez immédiatement les services d\'urgence ou rendez-vous au centre de santé le plus proche. »',
                  style: TextStyle(fontSize: 13, height: 1.4, color: AppColors.primaryGreenDark, fontWeight: FontWeight.w600),
                ),
              ),
              const SizedBox(height: 22),

              // Conformité APDP Bénin
              const Text('Protection des Données de Santé (APDP Bénin) :', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.borderSubtle),
                ),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('• Conformité stricte à la Loi n° 2017-20 portant Code du Numérique en République du Bénin.'),
                    SizedBox(height: 6),
                    Text('• Pseudonymisation intégrale des identités patients avant toute analyse clinique.'),
                    SizedBox(height: 6),
                    Text('• Chiffrement de bout en bout (AES-256) des communications vocales et écrites.'),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Crédits de l'Équipe
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.backgroundLight,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.borderSubtle),
                ),
                child: const Column(
                  children: [
                    Text('Plateforme MediBenin • Équipe CareX', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    SizedBox(height: 4),
                    Text('Membres fondateurs : Orace ATTINMAWASSONOU & Bienderan EGBO', style: TextStyle(fontSize: 12, color: AppColors.earthAccent)),
                    SizedBox(height: 2),
                    Text('« La santé est un droit, pas un privilège urbain »', style: TextStyle(fontSize: 11, fontStyle: FontStyle.italic, color: AppColors.textMuted)),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
