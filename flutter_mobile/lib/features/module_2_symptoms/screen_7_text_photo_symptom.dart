import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/widgets/medi_big_button.dart';
import '../../services/mock_data_service.dart';
import 'screen_8_temperature_pcime.dart';

class Screen7TextPhotoSymptom extends StatefulWidget {
  const Screen7TextPhotoSymptom({super.key});

  @override
  State<Screen7TextPhotoSymptom> createState() => _Screen7TextPhotoSymptomState();
}

class _Screen7TextPhotoSymptomState extends State<Screen7TextPhotoSymptom> {
  final MockDataService _service = MockDataService();
  late TextEditingController _textController;
  bool _photoAttached = false;

  @override
  void initState() {
    super.initState();
    _textController = TextEditingController(
      text: _service.symptomInputText.isEmpty
          ? 'Forte fièvre depuis hier soir, grande fatigue et douleurs dans tout le corps.'
          : _service.symptomInputText,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Description Texte & Photo'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(22),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Écrivez vos symptômes en détail :',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _textController,
                maxLines: 5,
                decoration: InputDecoration(
                  filled: true,
                  fillColor: Colors.white,
                  hintText: 'Ex: Fièvre, maux de tête, frissons, toux, diarrhée...',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                ),
              ),
              const SizedBox(height: 20),

              const Text(
                'Photo complémentaire (Optionnelle) :',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 6),
              const Text(
                'Prenez en photo une lésion cutanée, une ordonnance ou une boîte de médicament.',
                style: TextStyle(fontSize: 13, color: AppColors.textMuted),
              ),
              const SizedBox(height: 12),

              InkWell(
                onTap: () {
                  setState(() {
                    _photoAttached = !_photoAttached;
                  });
                },
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  width: double.infinity,
                  height: 140,
                  decoration: BoxDecoration(
                    color: _photoAttached ? AppColors.primaryGreenLight : Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: _photoAttached ? AppColors.primaryGreen : AppColors.borderSubtle,
                      width: 2,
                    ),
                  ),
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          _photoAttached ? Icons.check_circle_rounded : Icons.add_a_photo_rounded,
                          size: 42,
                          color: _photoAttached ? AppColors.primaryGreen : AppColors.textMuted,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          _photoAttached ? 'Photo de la lésion ajoutée (Appuyer pour changer)' : 'Prendre une photo avec la caméra',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                            color: _photoAttached ? AppColors.primaryGreenDark : AppColors.textDark,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 28),

              MediBigButton(
                label: 'Continuer vers Température',
                icon: Icons.thermostat_rounded,
                onTap: () {
                  _service.setSymptoms(text: _textController.text.trim());
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const Screen8TemperaturePcime()),
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
