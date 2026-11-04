import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/models/triage_models.dart';
import '../../core/widgets/medi_big_button.dart';
import '../module_3_results/screen_12_triage_red.dart';

class Screen19FollowupJ2 extends StatefulWidget {
  final TriageOutput triage;

  const Screen19FollowupJ2({super.key, required this.triage});

  @override
  State<Screen19FollowupJ2> createState() => _Screen19FollowupJ2State();
}

class _Screen19FollowupJ2State extends State<Screen19FollowupJ2> {
  int _stateChoice = 1; // 0: Guéri, 1: Amélioré, 2: Stable, 3: Aggravé
  bool _tookMeds = true;
  bool _feverGone = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Suivi Automatique (J+2)'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(22),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.primaryGreenLight,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('SMS Automatique MediBenin (48h après triage) :', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.primaryGreenDark)),
                    const SizedBox(height: 4),
                    Text(
                      '« Bonjour ! Comment va ${widget.triage.patientName} aujourd\'hui ? Ses symptômes ont-ils diminué ? »',
                      style: const TextStyle(fontSize: 14, fontStyle: FontStyle.italic),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 22),

              const Text('Comment évolue votre état de santé ?', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 10),

              _buildRadioTile(0, 'Complètement guéri(e)', Icons.sentiment_very_satisfied_rounded, Colors.green),
              _buildRadioTile(1, 'En nette amélioration', Icons.sentiment_satisfied_rounded, Colors.lightGreen.shade700),
              _buildRadioTile(2, 'État stationnaire (sans changement)', Icons.sentiment_neutral_rounded, Colors.orange),
              _buildRadioTile(3, 'Aggravation des symptômes', Icons.sentiment_very_dissatisfied_rounded, AppColors.statusRed),

              const SizedBox(height: 10),
              SwitchListTile(
                value: _tookMeds,
                activeColor: AppColors.primaryGreen,
                title: const Text('Avez-vous pris des médicaments prescrits ?'),
                onChanged: (v) => setState(() => _tookMeds = v),
              ),
              const SizedBox(height: 10),

              const Text('La fièvre a-t-elle complètement baissé ?', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              SwitchListTile(
                value: _feverGone,
                activeColor: AppColors.primaryGreen,
                title: const Text('Oui, la température est redevenue normale'),
                onChanged: (v) => setState(() => _feverGone = v),
              ),

              const SizedBox(height: 24),

              if (_stateChoice == 3) ...[
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.statusRedLight,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.statusRed),
                  ),
                  child: const Text(
                    '⚠️ ATTENTION : Une aggravation à 48 heures nécessite une prise en charge urgente dans un hôpital.',
                    style: TextStyle(color: AppColors.statusRed, fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                ),
                const SizedBox(height: 16),
                MediBigButton(
                  label: 'Transférer aux Urgences',
                  icon: Icons.emergency_rounded,
                  backgroundColor: AppColors.statusRed,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const Screen12TriageRed()),
                    );
                  },
                ),
              ] else ...[
                MediBigButton(
                  label: 'Enregistrer mon Bilan de Santé',
                  icon: Icons.check_circle_rounded,
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        backgroundColor: AppColors.primaryGreen,
                        content: Text('Merci pour vos nouvelles ! Votre dossier de suivi a été mis à jour.'),
                      ),
                    );
                    Navigator.pop(context);
                  },
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRadioTile(int value, String title, IconData icon, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: _stateChoice == value ? color.withOpacity(0.12) : Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: _stateChoice == value ? color : AppColors.borderSubtle,
          width: _stateChoice == value ? 2 : 1,
        ),
      ),
      child: RadioListTile<int>(
        value: value,
        groupValue: _stateChoice,
        activeColor: color,
        secondary: Icon(icon, color: color),
        title: Text(title, style: TextStyle(fontWeight: _stateChoice == value ? FontWeight.bold : FontWeight.normal, fontSize: 14)),
        onChanged: (v) => setState(() => _stateChoice = v ?? 1),
      ),
    );
  }
}
