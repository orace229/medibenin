import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/models/triage_models.dart';
import '../../core/widgets/medi_big_button.dart';
import '../../services/mock_data_service.dart';
import 'screen_9_triage_loading.dart';

class Screen8TemperaturePcime extends StatefulWidget {
  const Screen8TemperaturePcime({super.key});

  @override
  State<Screen8TemperaturePcime> createState() => _Screen8TemperaturePcimeState();
}

class _Screen8TemperaturePcimeState extends State<Screen8TemperaturePcime> {
  final MockDataService _service = MockDataService();
  double _temperature = 39.2;
  bool _cannotDrink = true;
  bool _vomitsAll = false;
  bool _convulsions = false;
  bool _lethargic = false;

  @override
  void initState() {
    super.initState();
    _temperature = _service.measuredTemperature ?? 38.5;
    final d = _service.dangerSigns;
    _cannotDrink = d.cannotDrinkOrBreastfeed;
    _vomitsAll = d.vomitsEverything;
    _convulsions = d.convulsions;
    _lethargic = d.lethargicOrUnconscious;
  }

  @override
  Widget build(BuildContext context) {
    final patient = _service.currentPatient;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Température & Signes de Danger'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(22),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Cadre Température
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: AppColors.borderSubtle),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.thermostat_rounded, size: 36, color: AppColors.statusRed),
                        const SizedBox(width: 10),
                        Text(
                          '${_temperature.toStringAsFixed(1)} °C',
                          style: TextStyle(
                            fontSize: 36,
                            fontWeight: FontWeight.w900,
                            color: _temperature >= 39.5
                                ? AppColors.statusRed
                                : (_temperature >= 38.5 ? AppColors.statusOrangeDark : AppColors.primaryGreen),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      _temperature >= 39.5
                          ? 'Hyperthermie sévère (Risque convulsion fébrile)'
                          : (_temperature >= 38.5 ? 'Fièvre élevée (Paludisme suspecté)' : 'Température normale / Fébricule'),
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                    const SizedBox(height: 12),
                    Slider(
                      value: _temperature,
                      min: 35.0,
                      max: 42.0,
                      divisions: 70,
                      activeColor: _temperature >= 39.5 ? AppColors.statusRed : AppColors.primaryGreen,
                      onChanged: (val) {
                        setState(() {
                          _temperature = val;
                        });
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 22),

              // Alerte PCIME Déterministe
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: AppColors.earthAccent.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.security_rounded, color: AppColors.earthAccent, size: 24),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Contrôle déterministe PCIME (${patient.ageCategory.protocolName})',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.earthAccent),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              const Text(
                'L\'un de ces 4 signes majeurs est-il présent ?',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),

              _buildDangerTile(
                title: 'Incapable de boire ou de téter',
                value: _cannotDrink,
                onChanged: (v) => setState(() => _cannotDrink = v),
              ),
              _buildDangerTile(
                title: 'Vomit absolument tout ce qu\'il absorbe',
                value: _vomitsAll,
                onChanged: (v) => setState(() => _vomitsAll = v),
              ),
              _buildDangerTile(
                title: 'A eu des convulsions pendant la maladie',
                value: _convulsions,
                onChanged: (v) => setState(() => _convulsions = v),
              ),
              _buildDangerTile(
                title: 'Léthargique ou inconscient (ne réagit pas)',
                value: _lethargic,
                onChanged: (v) => setState(() => _lethargic = v),
              ),

              const SizedBox(height: 26),

              MediBigButton(
                label: 'Lancer l\'Analyse Clinique',
                subtitle: 'Triage instantané en 15-30s',
                icon: Icons.auto_awesome_rounded,
                onTap: () {
                  _service.setSymptoms(
                    temperature: _temperature,
                    danger: DangerSignsPCIME(
                      cannotDrinkOrBreastfeed: _cannotDrink,
                      vomitsEverything: _vomitsAll,
                      convulsions: _convulsions,
                      lethargicOrUnconscious: _lethargic,
                    ),
                  );
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const Screen9TriageLoading()),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDangerTile({
    required String title,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: value ? AppColors.statusRedLight : Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: value ? AppColors.statusRed : AppColors.borderSubtle,
          width: value ? 2 : 1,
        ),
      ),
      child: CheckboxListTile(
        value: value,
        activeColor: AppColors.statusRed,
        title: Text(
          title,
          style: TextStyle(
            fontWeight: value ? FontWeight.bold : FontWeight.w600,
            fontSize: 14,
            color: value ? AppColors.statusRed : AppColors.textDark,
          ),
        ),
        onChanged: (v) => onChanged(v ?? false),
      ),
    );
  }
}
