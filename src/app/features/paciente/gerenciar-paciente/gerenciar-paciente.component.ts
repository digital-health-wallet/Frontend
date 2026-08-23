import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PacienteService } from '@core/services/paciente.service';
import { PacienteUpdateRequest, MedicamentoContinuoRequest, PacienteResponse } from '@core/models';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-gerenciar-paciente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink, DialogModule, ButtonModule],
  templateUrl: './gerenciar-paciente.component.html',
  styleUrl: './gerenciar-paciente.component.scss'
})
export class GerenciarPacienteComponent implements OnInit {
  private fb = inject(FormBuilder);
  private pacienteService = inject(PacienteService);
  private router = inject(Router);

  novosMedicamentos: MedicamentoContinuoRequest[] = [{ nome: '', posologia: '' }];
  exibirModalQrCode = signal(false);
  baixandoPdf = signal(false);
  private nomePaciente = '';

  form!: FormGroup;
  carregando = signal(false);
  idPaciente: number | null = null;
  codigoEmergencia = signal<string | null>(null);
  diagnosticosCronicos = signal<{ nome: string; cid?: string; descricao?: string }[]>([]);
  medicamentosUsoContinuo = signal<{ nomeMedicamento: string; posologia: string }[]>([]);
  private possuiAlergiaOriginal = false;

  tiposSanguineos: string[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  ngOnInit(): void {
    this.idPaciente = this.pacienteService.getIdPacienteSelecionado();

    if (!this.idPaciente) {
      this.router.navigate(['/meus-pacientes']);
      return;
    }

    this.initForm();
    this.watchAlergiaChanges();
    this.carregarPaciente(this.idPaciente);
  }

  private initForm(): void {
    this.form = this.fb.group({
      nome: ['', [Validators.required]],
      cpf: [''],
      dataNascimento: ['', [Validators.required]],
      tipoSanguineo: ['', [Validators.required]],
      fichaEmergencialAtiva: [true],
      possuiAlergia: [false],
      tipoAlergia: [{ value: '', disabled: true }],
      descricaoAlergia: [{ value: '', disabled: true }]
    });
  }

  adicionarLinhaMedicamento(): void {
    this.novosMedicamentos.push({ nome: '', posologia: '' });
  }

  removerLinhaMedicamento(index: number): void {
    this.novosMedicamentos.splice(index, 1);
    if (this.novosMedicamentos.length === 0) {
      this.novosMedicamentos.push({ nome: '', posologia: '' });
    }
  }

  private watchAlergiaChanges(): void {
    this.form.get('possuiAlergia')?.valueChanges.subscribe((possui: boolean) => {
      const tipoCtrl = this.form.get('tipoAlergia');
      const descCtrl = this.form.get('descricaoAlergia');

      if (possui) {
        tipoCtrl?.enable();
        descCtrl?.enable();
      } else {
        tipoCtrl?.disable();
        descCtrl?.disable();
      }
    });
  }

  private carregarPaciente(id: number): void {
    this.pacienteService.buscarPorId(id).subscribe({
      next: (paciente) => {
        this.form.patchValue({
          nome: paciente.nome,
          cpf: paciente.cpf ?? '',
          dataNascimento: paciente.dataNascimento,
          tipoSanguineo: paciente.tipoSanguineo,
          fichaEmergencialAtiva: paciente.fichaEmergencialAtiva,
          possuiAlergia: paciente.possuiAlergia,
          tipoAlergia: paciente.tipoAlergia ?? '',
          descricaoAlergia: paciente.descricaoAlergia ?? ''
        });
        this.possuiAlergiaOriginal = paciente.possuiAlergia;
        this.nomePaciente = paciente.nome;
        this.codigoEmergencia.set(paciente.codigoEmergencia ?? null);
        this.diagnosticosCronicos.set(paciente.diagnosticosCronicos ?? []);
        this.medicamentosUsoContinuo.set(paciente.medicamentosUsoContinuo ?? []);
      },
      error: (err) => console.error('Erro ao carregar paciente:', err)
    });
  }

  get linkFicha(): string | null {
    const codigo = this.codigoEmergencia();
    return codigo ? `/emergencia/${codigo}` : null;
  }

  get qrCodeUrl(): string | null {
    const link = this.linkFicha;
    if (!link) {
      return null;
    }
    const urlCompleta = `${window.location.origin}${link}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(urlCompleta)}`;
  }

  fecharModalQrCode(): void {
    this.exibirModalQrCode.set(false);
  }

  async baixarPdf(): Promise<void> {
    if (!this.qrCodeUrl) {
      return;
    }

    this.baixandoPdf.set(true);
    try {
      const resposta = await fetch(this.qrCodeUrl);
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
      pdf.text(`Paciente: ${this.nomePaciente}`, 20, 32);
      pdf.text('Escaneie o QR Code abaixo para acessar a ficha de emergência:', 20, 42);
      pdf.addImage(qrBase64, 'PNG', 20, 50, 80, 80);
      pdf.save('ficha-emergencia.pdf');

      alert('PDF salvo com sucesso!');
      this.exibirModalQrCode.set(false);
      this.router.navigate(['/agendamentos']);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      alert('Erro ao gerar o PDF. Tente novamente.');
    } finally {
      this.baixandoPdf.set(false);
    }
  }

  toggleFichaEmergencia(): void {
    const atual = this.form.get('fichaEmergencialAtiva')?.value;
    this.form.get('fichaEmergencialAtiva')?.setValue(!atual);
  }

  salvar(): void {
    if (!this.idPaciente || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.value;

    if (this.possuiAlergiaOriginal && !valores.possuiAlergia) {
      const confirmou = confirm(
        'Marcar "Não" e salvar remove definitivamente o registro de alergia deste paciente. Deseja continuar?'
      );
      if (!confirmou) {
        return;
      }
    }

    const request: PacienteUpdateRequest = {
      nome: valores.nome,
      cpf: valores.cpf || undefined,
      dataNascimento: valores.dataNascimento,
      tipoSanguineo: valores.tipoSanguineo,
      fichaEmergencialAtiva: valores.fichaEmergencialAtiva,
      possuiAlergia: valores.possuiAlergia,
      tipoAlergia: valores.possuiAlergia ? valores.tipoAlergia : undefined,
      descricaoAlergia: valores.possuiAlergia ? valores.descricaoAlergia : undefined
    };

    this.carregando.set(true);
    this.pacienteService.atualizar(this.idPaciente, request).subscribe({
      next: (paciente) => {
        this.aplicarPacienteSalvo(paciente);

        const medicamentos = this.novosMedicamentos.filter(m => m.nome.trim() && m.posologia.trim());
        if (medicamentos.length === 0) {
          this.finalizarSalvamento();
          return;
        }

        this.pacienteService.adicionarMedicamentosContinuos(this.idPaciente!, medicamentos).subscribe({
          next: (atualizado) => {
            this.aplicarPacienteSalvo(atualizado);
            this.novosMedicamentos = [{ nome: '', posologia: '' }];
            this.finalizarSalvamento();
          },
          error: (err) => {
            console.error('Erro ao adicionar medicamento:', err);
            this.carregando.set(false);
            alert('Dados salvos, mas houve erro ao adicionar o medicamento.');
          }
        });
      },
      error: (err) => {
        console.error('Erro ao atualizar paciente:', err);
        this.carregando.set(false);
        alert('Erro ao atualizar os dados. Verifique o console.');
      }
    });
  }

  private aplicarPacienteSalvo(paciente: PacienteResponse): void {
    this.pacienteService.atualizarNomeNaSidebar(paciente.nome);
    this.nomePaciente = paciente.nome;
    this.codigoEmergencia.set(paciente.codigoEmergencia ?? null);
    this.diagnosticosCronicos.set(paciente.diagnosticosCronicos ?? []);
    this.medicamentosUsoContinuo.set(paciente.medicamentosUsoContinuo ?? []);
    this.possuiAlergiaOriginal = paciente.possuiAlergia;
  }

  private finalizarSalvamento(): void {
    this.carregando.set(false);
    this.exibirModalQrCode.set(true);
  }

  desativarPaciente(): void {
    if (!this.idPaciente) {
      return;
    }

    if (!confirm('Tem certeza que deseja desativar este paciente? Essa ação não pode ser desfeita por aqui.')) {
      return;
    }

    this.pacienteService.inativar(this.idPaciente).subscribe({
      next: () => {
        localStorage.removeItem('idPaciente');
        this.router.navigate(['/meus-pacientes']);
      },
      error: (err) => {
        console.error('Erro ao desativar paciente:', err);
        alert('Erro ao desativar o paciente. Verifique o console.');
      }
    });
  }
}
