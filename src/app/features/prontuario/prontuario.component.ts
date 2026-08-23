import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PacienteService } from '../../core/services/paciente.service';
import { CadastroProntuarioRequest } from '../../core/models';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-prontuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, DialogModule, ButtonModule],
  templateUrl: './prontuario.component.html',
  styleUrl: './prontuario.component.scss'
})
export class ProntuarioComponent implements OnInit {
  prontuarioForm!: FormGroup;
  qrCodeData: string | null = null;
  linkAcesso: string | null = null;
  exibirModalQrCode = false;
  baixandoPdf = false;
  private nomePacienteSalvo = '';

  tiposSanguineos: string[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  constructor(
    private fb: FormBuilder,
    private pacienteService: PacienteService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.watchAlergiaChanges();
    this.watchMedicamentoContinuoChanges();

    const cpf = this.route.snapshot.queryParamMap.get('cpf');
    if (cpf) {
      this.prontuarioForm.get('cpf')?.setValue(cpf);
    }
  }

  private initForm(): void {
    this.prontuarioForm = this.fb.group({
      nome: ['', [Validators.required]],
      cpf: [''],
      dataNascimento: ['', [Validators.required]],
      possuiAlergia: [false, [Validators.required]],
      tipoAlergia: [{ value: '', disabled: true }], 
      descricaoAlergia: [{ value: '', disabled: true }],
      tipoSanguineo: ['', [Validators.required]],
      fichaEmergencialAtiva: [true],
      usaMedicamentoContinuo: [false],
      medicamentosContinuos: this.fb.array([])
    });
  }

  get medicamentosContinuos(): FormArray {
    return this.prontuarioForm.get('medicamentosContinuos') as FormArray;
  }

  private novoMedicamentoGroup(): FormGroup {
    return this.fb.group({
      nome: ['', [Validators.required]],
      posologia: ['', [Validators.required]]
    });
  }

  adicionarMedicamento(): void {
    this.medicamentosContinuos.push(this.novoMedicamentoGroup());
  }

  removerMedicamento(index: number): void {
    this.medicamentosContinuos.removeAt(index);
  }

  private watchAlergiaChanges(): void {
    this.prontuarioForm.get('possuiAlergia')?.valueChanges.subscribe((possui: boolean) => {
      const tipoCtrl = this.prontuarioForm.get('tipoAlergia');
      const descCtrl = this.prontuarioForm.get('descricaoAlergia');

      if (possui) {
        tipoCtrl?.enable();
        descCtrl?.enable();
        tipoCtrl?.setValidators([Validators.required]);
      } else {
        tipoCtrl?.disable();
        descCtrl?.disable();
        tipoCtrl?.clearValidators();
        tipoCtrl?.setValue('');
        descCtrl?.setValue('');
      }
      tipoCtrl?.updateValueAndValidity();
    });
  }

  private watchMedicamentoContinuoChanges(): void {
    this.prontuarioForm.get('usaMedicamentoContinuo')?.valueChanges.subscribe((usa: boolean) => {
      if (usa) {
        if (this.medicamentosContinuos.length === 0) {
          this.adicionarMedicamento();
        }
      } else {
        this.medicamentosContinuos.clear();
      }
    });
  }

  toggleFichaEmergencia(): void {
    const current = this.prontuarioForm.get('fichaEmergencialAtiva')?.value;
    this.prontuarioForm.get('fichaEmergencialAtiva')?.setValue(!current);
  }

  salvar(): void {
    if (this.prontuarioForm.invalid) {
      this.prontuarioForm.markAllAsTouched();
      return;
    }

    const formValue = this.prontuarioForm.value;
    const request: CadastroProntuarioRequest = {
      cpf: formValue.cpf || '333.333.333-90',
      nome: formValue.nome,
      dataNascimento: formValue.dataNascimento,
      tipoSanguineo: formValue.tipoSanguineo,
      fichaEmergencialAtiva: formValue.fichaEmergencialAtiva,
      possuiAlergia: formValue.possuiAlergia,
      tipoAlergia: formValue.possuiAlergia ? formValue.tipoAlergia : undefined,
      descricaoAlergia: formValue.possuiAlergia ? formValue.descricaoAlergia : undefined,
      usaMedicamentoContinuo: formValue.usaMedicamentoContinuo,
      medicamentosContinuos: formValue.usaMedicamentoContinuo ? formValue.medicamentosContinuos : undefined
    };

    this.pacienteService.salvarProntuarioCompleto(request).subscribe({
      next: (pacienteSalvo) => {
        if (pacienteSalvo.id) {
          localStorage.setItem('idPaciente', String(pacienteSalvo.id));
        }
        this.pacienteService.atualizarNomeNaSidebar(pacienteSalvo.nome);
        this.nomePacienteSalvo = pacienteSalvo.nome;
        this.linkAcesso = `/emergencia/${pacienteSalvo.codigoEmergencia}`;
        this.qrCodeData = `${window.location.origin}${this.linkAcesso}`;
        this.exibirModalQrCode = true;
      },
      error: (err) => {
        console.error('Erro ao salvar prontuário:', err);
        alert('Erro ao salvar os dados. Verifique o console.');
      }
    });
  }

  fecharModalQrCode(): void {
    this.exibirModalQrCode = false;
  }

  async baixarPdf(): Promise<void> {
    if (!this.qrCodeData) {
      return;
    }

    this.baixandoPdf = true;
    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(this.qrCodeData)}`;
      const resposta = await fetch(qrUrl);
      const blob = await resposta.blob();
      const qrBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const pdf = new jsPDF();
      pdf.setFontSize(16);
      pdf.text('Ficha de Emergência', 20, 20);
      pdf.setFontSize(12);
      pdf.text(`Paciente: ${this.nomePacienteSalvo}`, 20, 32);
      pdf.text('Escaneie o QR Code abaixo para acessar a ficha de emergência:', 20, 42);
      pdf.addImage(qrBase64, 'PNG', 20, 50, 80, 80);
      pdf.save('ficha-emergencia.pdf');

      alert('PDF salvo com sucesso!');
      this.exibirModalQrCode = false;
      this.router.navigate(['/agendamentos']);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      alert('Erro ao gerar o PDF. Tente novamente.');
    } finally {
      this.baixandoPdf = false;
    }
  }
}