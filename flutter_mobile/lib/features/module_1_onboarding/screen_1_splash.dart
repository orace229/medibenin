import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/widgets/medi_big_button.dart';
import 'screen_2_language_selection.dart';

class Screen1Splash extends StatelessWidget {
  const Screen1Splash({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(),
              // Logo CareX & MediBenin
              Container(
                width: 110,
                height: 110,
                decoration: BoxDecoration(
                  color: AppColors.primaryGreen,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primaryGreen.withOpacity(0.3),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: const Center(
                  child: Icon(
                    Icons.health_and_safety_rounded,
                    size: 64,
                    color: Colors.white,
                  ),
                ),
              ),
              const SizedBox(height: 28),
              const Text(
                'MEDIBENIN',
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1.5,
                  color: AppColors.primaryGreenDark,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'CareX • Télémédecine Intelligente',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: AppColors.earthAccent,
                ),
              ),
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                decoration: BoxDecoration(
                  color: AppColors.primaryGreenLight,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Text(
                  '« La santé est un droit, pas un privilège urbain »',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14,
                    fontStyle: FontStyle.italic,
                    color: AppColors.primaryGreenDark,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const Spacer(),
              MediBigButton(
                label: 'Commencer • Bǐ bǐ',
                subtitle: 'Votre santé à portée de clic',
                icon: Icons.arrow_forward_rounded,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const Screen2LanguageSelection(),
                    ),
                  );
                },
              ),
              const SizedBox(height: 16),
              const Text(
                'Accessible sans abonnement • Gratuit pour le triage',
                style: TextStyle(fontSize: 12, color: AppColors.textMuted),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
