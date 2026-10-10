import { Component, OnInit, inject, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PacienteService } from '@core/services/paciente.service';
import { PacienteUpdateRequest, MedicamentoContinuoRequest, PacienteResponse } from '@core/models';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { urlImagemQrCode, urlPublicaFicha } from '@core/url-ficha';
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
  private messageService = inject(MessageService);

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
      alergias: this.fb.array([])
    });
  }

  get alergias(): FormArray {
    return this.form.get('alergias') as FormArray;
  }

  private novaAlergiaGroup(id: number | null = null, tipo = '', descricao = ''): FormGroup {
    return this.fb.group({
      id: [id],
      tipo: [tipo, [Validators.required]],
      descricao: [descricao, [Validators.required]]
    });
  }

  adicionarAlergia(): void {
    this.alergias.push(this.novaAlergiaGroup());
  }

  removerAlergia(index: number): void {
    this.alergias.removeAt(index);
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
      if (possui) {
        if (this.alergias.length === 0) {
          this.adicionarAlergia();
        }
      } else {
        this.alergias.clear();
      }
    });
  }

  /** Recarrega a lista de alergias a partir do que o servidor devolveu. */
  private preencherAlergias(paciente: PacienteResponse): void {
    this.alergias.clear();
    (paciente.alergias ?? []).forEach(a =>
      this.alergias.push(this.novaAlergiaGroup(a.id ?? null, a.tipo ?? '', a.descricao)));
    if (paciente.possuiAlergia && this.alergias.length === 0) {
      this.adicionarAlergia();
    }
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
          possuiAlergia: paciente.possuiAlergia
        });
        this.preencherAlergias(paciente);
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
    const codigo = this.codigoEmergencia();
    return codigo ? urlImagemQrCode(codigo) : null;
  }

  /** Endereço que o QR Code carrega — exibido para conferência ao lado do código. */
  get urlFicha(): string | null {
    const codigo = this.codigoEmergencia();
    return codigo ? urlPublicaFicha(codigo) : null;
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

      this.messageService.add({ severity: 'success', summary: 'PDF gerado', detail: 'O arquivo foi salvo no seu dispositivo.' });
      this.exibirModalQrCode.set(false);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      this.messageService.add({ severity: 'error', summary: 'Erro ao gerar PDF', detail: 'Não foi possível gerar o arquivo. Tente novamente.' });
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
      alergias: valores.possuiAlergia ? valores.alergias : []
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
            this.messageService.add({ severity: 'warn', summary: 'Dados salvos', detail: 'O medicamento de uso contínuo não pôde ser adicionado.' });
          }
        });
      },
      error: (err) => {
        console.error('Erro ao atualizar paciente:', err);
        this.carregando.set(false);
        this.messageService.add({ severity: 'error', summary: 'Erro ao salvar', detail: err?.error?.mensagem ?? 'Não foi possível atualizar os dados. Tente novamente.' });
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
    this.preencherAlergias(paciente);
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
        this.messageService.add({ severity: 'error', summary: 'Erro ao desativar', detail: err?.error?.mensagem ?? 'Não foi possível desativar o paciente. Tente novamente.' });
      }
    });
  }
}
