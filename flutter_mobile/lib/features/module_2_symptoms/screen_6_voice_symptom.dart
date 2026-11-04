import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/widgets/voice_mic_button.dart';
import '../../core/widgets/medi_big_button.dart';
import '../../services/mock_data_service.dart';
import 'screen_7_text_photo_symptom.dart';
import 'screen_8_temperature_pcime.dart';

class Screen6VoiceSymptom extends StatefulWidget {
  const Screen6VoiceSymptom({super.key});

  @override
  State<Screen6VoiceSymptom> createState() => _Screen6VoiceSymptomState();
}

class _Screen6VoiceSymptomState extends State<Screen6VoiceSymptom> {
  final MockDataService _service = MockDataService();
  bool _isRecording = false;
  bool _hasRecorded = false;

  final String _rawSpeechText = 'Vi 3 ans tɔn ce ɖo asɔ yɔyɔ sin zɔn, é gbɛ́ nǔ nu bo ɖo hwi jɛ wɛ...';
  final String _frenchText = 'Mon enfant de 3 ans a une très forte fièvre, refuse de téter et vomit.';

  @override
  Widget build(BuildContext context) {
    final lang = _service.currentLanguage;

    return Scaffold(
      appBar: AppBar(
        title: Text('Saisie Vocale (${lang.displayName})'),
        actions: [
          TextButton.icon(
            icon: const Icon(Icons.edit_note_rounded, size: 20),
            label: const Text('Mode Texte'),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const Screen7TextPhotoSymptom()),
              );
            },
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 16),
          child: Column(
            children: [
              const SizedBox(height: 10),
              Text(
                'Touchez le micro et parlez librement en ${lang.displayName}',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 6),
              const Text(
                'Décrivez ce que ressent le malade, depuis quand, et la fièvre.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: AppColors.textMuted),
              ),
              const Spacer(),

              // Gros Bouton Micro Animé
              VoiceMicButton(
                isRecording: _isRecording,
                statusText: _isRecording
                    ? 'Écoute en cours... Parlez maintenant'
                    : (_hasRecorded ? 'Enregistrement terminé (0:24s)' : 'Appuyez pour commencer à parler'),
                onToggleRecord: () {
                  setState(() {
                    _isRecording = !_isRecording;
                    if (!_isRecording) {
                      _hasRecorded = true;
                      _service.setSymptoms(text: _frenchText);
                    }
                  });
                },
              ),

              const Spacer(),

              if (_hasRecorded) ...[
                // Aperçu de la transcription multilingue (Meta MMS + AfriNLLB)
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.all(Radius.circular(16)),
                    border: Border.fromBorderSide(BorderSide(color: AppColors.primaryGreenLight, width: 2)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.record_voice_over_rounded, color: AppColors.primaryGreen, size: 20),
                          const SizedBox(width: 8),
                          Text(
                            'Transcription ${lang.displayName} (Meta MMS) :',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _rawSpeechText,
                        style: const TextStyle(fontSize: 14, fontStyle: FontStyle.italic),
                      ),
                      const Divider(height: 16),
                      Row(
                        children: [
                          const Icon(Icons.translate_rounded, color: AppColors.earthAccent, size: 20),
                          const SizedBox(width: 8),
                          const Text(
                            'Traduction Pivot Français (AfriNLLB) :',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _frenchText,
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
              ],

              MediBigButton(
                label: 'Préciser Température & Signes',
                subtitle: 'Contrôle déterministe PCIME pédiatrique',
                icon: Icons.thermostat_rounded,
                onTap: () {
                  _service.setSymptoms(text: _frenchText);
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
