import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/models/enums.dart';
import '../../services/mock_data_service.dart';
import '../module_3_results/screen_10_triage_green.dart';
import '../module_3_results/screen_11_triage_orange.dart';
import '../module_3_results/screen_12_triage_red.dart';

class Screen9TriageLoading extends StatefulWidget {
  const Screen9TriageLoading({super.key});

  @override
  State<Screen9TriageLoading> createState() => _Screen9TriageLoadingState();
}

class _Screen9TriageLoadingState extends State<Screen9TriageLoading> {
  final MockDataService _service = MockDataService();
  int _currentStep = 0;
  Timer? _timer;

  final List<String> _steps = [
    'Analyse vocale et transcription (Meta MMS)...',
    'Traduction pivot vers le français (AfriNLLB)...',
    'Vérification des 4 signes de danger PCIME / TETU...',
    'Raisonnement clinique MedGemma & calcul SHAP...',
    'Génération de l\'orientation et synthèse vocale...',
  ];

  @override
  void initState() {
    super.initState();
    _startPipelineSimulation();
  }

  void _startPipelineSimulation() {
    _timer = Timer.periodic(const Duration(milliseconds: 900), (timer) {
      if (_currentStep < _steps.length - 1) {
        setState(() {
          _currentStep++;
        });
      } else {
        _timer?.cancel();
        _navigateResult();
      }
    });
  }

  void _navigateResult() {
    final result = _service.computeTriage();
    Widget targetScreen;
    switch (result.urgency) {
      case TriageUrgencyLevel.vert:
        targetScreen = const Screen10TriageGreen();
        break;
      case TriageUrgencyLevel.orange:
        targetScreen = const Screen11TriageOrange();
        break;
      case TriageUrgencyLevel.rouge:
        targetScreen = const Screen12TriageRed();
        break;
    }

    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => targetScreen),
    );
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final lang = _service.currentLanguage;

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 36),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(),
              Container(
                width: 100,
                height: 100,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.primaryGreenLight,
                ),
                child: const Center(
                  child: CircularProgressIndicator(
                    strokeWidth: 5,
                    color: AppColors.primaryGreen,
                  ),
                ),
              ),
              const SizedBox(height: 32),
              const Text(
                'Analyse Clinique en Cours...',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900),
              ),
              const SizedBox(height: 8),
              Text(
                'Votre description est en cours d\'évaluation en ${lang.displayName}',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 14, color: AppColors.textMuted),
              ),
              const SizedBox(height: 36),

              // Liste d'étapes animées
              Column(
                children: List.generate(_steps.length, (index) {
                  final isDone = index < _currentStep;
                  final isCurrent = index == _currentStep;
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 6),
                    child: Row(
                      children: [
                        Icon(
                          isDone
                              ? Icons.check_circle_rounded
                              : (isCurrent ? Icons.hourglass_top_rounded : Icons.radio_button_unchecked),
                          size: 20,
                          color: isDone
                              ? AppColors.primaryGreen
                              : (isCurrent ? AppColors.statusOrangeDark : Colors.grey.shade400),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            _steps[index],
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: isCurrent ? FontWeight.bold : FontWeight.normal,
                              color: isCurrent ? AppColors.textDark : AppColors.textMuted,
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                }),
              ),

              const Spacer(),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.backgroundLight,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Text(
                  '💡 Rappel : En cas de malaise immédiat, n\'attendez pas l\'application et rendez-vous aux urgences.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
