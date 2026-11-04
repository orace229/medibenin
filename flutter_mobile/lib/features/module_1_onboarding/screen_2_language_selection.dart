import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/models/enums.dart';
import '../../core/widgets/medi_big_button.dart';
import '../../services/mock_data_service.dart';
import 'screen_3_auth_phone.dart';

class Screen2LanguageSelection extends StatefulWidget {
  const Screen2LanguageSelection({super.key});

  @override
  State<Screen2LanguageSelection> createState() => _Screen2LanguageSelectionState();
}

class _Screen2LanguageSelectionState extends State<Screen2LanguageSelection> {
  final MockDataService _service = MockDataService();
  late LocalLanguage _selectedLang;

  @override
  void initState() {
    super.initState();
    _selectedLang = _service.currentLanguage;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Sélection de la Langue'),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Dans quelle langue souhaitez-vous vous exprimer ?',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textDark,
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'L\'application vous parlera et vous écoutera dans cette langue.',
                style: TextStyle(fontSize: 14, color: AppColors.textMuted),
              ),
              const SizedBox(height: 18),
              Expanded(
                child: ListView.separated(
                  itemCount: LocalLanguage.values.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final lang = LocalLanguage.values[index];
                    final isSelected = _selectedLang == lang;
                    return InkWell(
                      onTap: () {
                        setState(() {
                          _selectedLang = lang;
                        });
                        _service.setLanguage(lang);
                      },
                      borderRadius: BorderRadius.circular(16),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
                        decoration: BoxDecoration(
                          color: isSelected ? AppColors.primaryGreenLight : Colors.white,
                          border: Border.all(
                            color: isSelected ? AppColors.primaryGreen : AppColors.borderSubtle,
                            width: isSelected ? 2.5 : 1,
                          ),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Row(
                          children: [
                            Text(lang.flag, style: const TextStyle(fontSize: 28)),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    lang.displayName,
                                    style: TextStyle(
                                      fontSize: 17,
                                      fontWeight: FontWeight.bold,
                                      color: isSelected ? AppColors.primaryGreenDark : AppColors.textDark,
                                    ),
                                  ),
                                  Text(
                                    lang.localName,
                                    style: const TextStyle(fontSize: 13, color: AppColors.textMuted),
                                  ),
                                ],
                              ),
                            ),
                            if (isSelected)
                              const Icon(Icons.check_circle_rounded, color: AppColors.primaryGreen, size: 28)
                            else
                              const Icon(Icons.volume_up_outlined, color: AppColors.textMuted, size: 24),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
              MediBigButton(
                label: 'Continuer • Yi nukɔn',
                icon: Icons.arrow_forward_rounded,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const Screen3AuthPhone(),
                    ),
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
