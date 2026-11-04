import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/models/enums.dart';
import '../../core/models/triage_models.dart';
import '../../core/widgets/medi_big_button.dart';
import '../../services/mock_data_service.dart';
import 'screen_17_video_call.dart';

class Screen16MobileMoneyPayment extends StatefulWidget {
  final DoctorProfile doctor;

  const Screen16MobileMoneyPayment({super.key, required this.doctor});

  @override
  State<Screen16MobileMoneyPayment> createState() => _Screen16MobileMoneyPaymentState();
}

class _Screen16MobileMoneyPaymentState extends State<Screen16MobileMoneyPayment> {
  final MockDataService _service = MockDataService();
  MobileMoneyOperator _selectedOp = MobileMoneyOperator.mtn;
  late TextEditingController _phoneController;
  bool _isProcessing = false;

  @override
  void initState() {
    super.initState();
    _phoneController = TextEditingController(text: _service.currentPatient.phoneNumber);
  }

  void _triggerPayment() {
    setState(() {
      _isProcessing = true;
    });

    // Simulation du push USSD MoMo / Flooz
    Timer(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          _isProcessing = false;
        });
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) => Screen17VideoCall(doctor: widget.doctor),
          ),
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Paiement Mobile Money'),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(22),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Récapitulatif
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.borderSubtle),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Téléconsultation (15 min) :', style: TextStyle(color: AppColors.textMuted)),
                        Text(widget.doctor.fullName, style: const TextStyle(fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const Divider(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Montant total à payer :', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                        Text(
                          '${widget.doctor.feeFcfa} FCFA',
                          style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: AppColors.primaryGreenDark),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              const Text('Choisissez votre opérateur au Bénin :', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),

              Row(
                children: [
                  Expanded(
                    child: _buildOperatorCard(
                      operator: MobileMoneyOperator.mtn,
                      title: 'MTN MoMo',
                      color: AppColors.mtnYellow,
                      isSelected: _selectedOp == MobileMoneyOperator.mtn,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: _buildOperatorCard(
                      operator: MobileMoneyOperator.moov,
                      title: 'Moov Money',
                      color: AppColors.moovBlue,
                      isSelected: _selectedOp == MobileMoneyOperator.moov,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              const Text('Numéro de débit Mobile Money :', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              TextField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                decoration: InputDecoration(
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Un message automatique va s\'afficher sur votre téléphone pour valider avec votre code PIN secret.',
                style: TextStyle(fontSize: 12, color: AppColors.textMuted),
              ),

              const Spacer(),

              if (_isProcessing) ...[
                const Center(
                  child: Column(
                    children: [
                      CircularProgressIndicator(color: AppColors.primaryGreen),
                      SizedBox(height: 12),
                      Text('Envoi du push USSD sur votre téléphone...', style: TextStyle(fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
                const Spacer(),
              ] else ...[
                MediBigButton(
                  label: 'Confirmer et Payer ${widget.doctor.feeFcfa} FCFA',
                  subtitle: 'Connexion directe avec le médecin',
                  icon: Icons.lock_outline_rounded,
                  onTap: _triggerPayment,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildOperatorCard({
    required MobileMoneyOperator operator,
    required String title,
    required Color color,
    required bool isSelected,
  }) {
    return InkWell(
      onTap: () => setState(() => _selectedOp = operator),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 18),
        decoration: BoxDecoration(
          color: isSelected ? color.withOpacity(0.18) : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? color : AppColors.borderSubtle,
            width: isSelected ? 3 : 1,
          ),
        ),
        child: Column(
          children: [
            CircleAvatar(
              radius: 18,
              backgroundColor: color,
              child: const Icon(Icons.payment_rounded, color: Colors.black87, size: 20),
            ),
            const SizedBox(height: 8),
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          ],
        ),
      ),
    );
  }
}
