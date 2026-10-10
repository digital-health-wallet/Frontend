import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PacienteService } from '../../core/services/paciente.service';
import { CadastroProntuarioRequest } from '../../core/models';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { urlPublicaFicha } from '../../core/url-ficha';
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
    private router: Router,
    private messageService: MessageService
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
      alergias: this.fb.array([]),
      tipoSanguineo: ['', [Validators.required]],
      fichaEmergencialAtiva: [true],
      usaMedicamentoContinuo: [false],
      medicamentosContinuos: this.fb.array([])
    });
  }

  get medicamentosContinuos(): FormArray {
    return this.prontuarioForm.get('medicamentosContinuos') as FormArray;
  }

  get alergias(): FormArray {
    return this.prontuarioForm.get('alergias') as FormArray;
  }

  private novaAlergiaGroup(): FormGroup {
    return this.fb.group({
      id: [null],
      tipo: ['', [Validators.required]],
      descricao: ['', [Validators.required]]
    });
  }

  adicionarAlergia(): void {
    this.alergias.push(this.novaAlergiaGroup());
  }

  removerAlergia(index: number): void {
    this.alergias.removeAt(index);
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
      if (possui) {
        if (this.alergias.length === 0) {
          this.adicionarAlergia();
        }
      } else {
        this.alergias.clear();
      }
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

  /** Campo obrigatório não preenchido e já tocado pelo usuário (UC02 - destaque em vermelho). */
  campoInvalido(campo: string): boolean {
    const controle = this.prontuarioForm.get(campo);
    return !!controle && controle.invalid && controle.touched;
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
      alergias: formValue.possuiAlergia ? formValue.alergias : [],
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
        this.qrCodeData = urlPublicaFicha(pacienteSalvo.codigoEmergencia!);
        this.exibirModalQrCode = true;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro ao salvar',
          detail: err?.error?.mensagem ?? 'Não foi possível salvar o prontuário. Tente novamente.'
        });
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

      this.messageService.add({ severity: 'success', summary: 'PDF gerado', detail: 'O arquivo foi salvo no seu dispositivo.' });
      this.exibirModalQrCode = false;
      this.router.navigate(['/agendamentos']);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      this.messageService.add({ severity: 'error', summary: 'Erro ao gerar PDF', detail: 'Não foi possível gerar o arquivo. Tente novamente.' });
    } finally {
      this.baixandoPdf = false;
    }
  }
}