import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/widgets/medi_big_button.dart';
import 'screen_4_patient_profile.dart';

class Screen3AuthPhone extends StatefulWidget {
  const Screen3AuthPhone({super.key});

  @override
  State<Screen3AuthPhone> createState() => _Screen3AuthPhoneState();
}

class _Screen3AuthPhoneState extends State<Screen3AuthPhone> {
  final _phoneController = TextEditingController(text: '97 00 11 22');
  final _otpController = TextEditingController(text: '4821');
  bool _otpSent = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Identification Simple'),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(22),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Votre Numéro de Téléphone',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              const Text(
                'Nécessaire uniquement pour recevoir vos conseils de santé et le suivi SMS à 48h. Aucun mot de passe à retenir.',
                style: TextStyle(fontSize: 14, color: AppColors.textMuted),
              ),
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.borderSubtle),
                ),
                child: Row(
                  children: [
                    const Text('🇧🇯 +229', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(width: 14),
                    const VerticalDivider(width: 1),
                    const SizedBox(width: 14),
                    Expanded(
                      child: TextField(
                        controller: _phoneController,
                        keyboardType: TextInputType.phone,
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
                        decoration: const InputDecoration(
                          border: InputBorder.none,
                          hintText: 'Ex: 97 12 34 56',
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.mtnYellow.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Text('MTN MoMo', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  ),
                  const SizedBox(width: 10),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.moovBlue.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Text('Moov Money', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
              if (_otpSent) ...[
                const SizedBox(height: 24),
                const Text(
                  'Code de confirmation reçu par SMS :',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _otpController,
                  keyboardType: TextInputType.number,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 26, letterSpacing: 8, fontWeight: FontWeight.bold),
                  decoration: InputDecoration(
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
              ],
              const Spacer(),
              MediBigButton(
                label: _otpSent ? 'Valider et Continuer' : 'Recevoir le Code SMS',
                icon: _otpSent ? Icons.check_circle_outline : Icons.sms_outlined,
                onTap: () {
                  if (!_otpSent) {
                    setState(() {
                      _otpSent = true;
                    });
                  } else {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const Screen4PatientProfile(),
                      ),
                    );
                  }
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
