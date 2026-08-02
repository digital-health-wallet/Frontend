import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PacienteService } from '@core/services/paciente.service';
import { PacienteUpdateRequest } from '@core/models';

@Component({
  selector: 'app-gerenciar-paciente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './gerenciar-paciente.component.html',
  styleUrl: './gerenciar-paciente.component.scss'
})
export class GerenciarPacienteComponent implements OnInit {
  private fb = inject(FormBuilder);
  private pacienteService = inject(PacienteService);
  private router = inject(Router);

  form!: FormGroup;
  carregando = signal(false);
  idPaciente: number | null = null;
  codigoEmergencia = signal<string | null>(null);
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
        this.codigoEmergencia.set(paciente.codigoEmergencia ?? null);
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
        this.carregando.set(false);
        this.pacienteService.atualizarNomeNaSidebar(paciente.nome);
        this.codigoEmergencia.set(paciente.codigoEmergencia ?? null);
        this.possuiAlergiaOriginal = paciente.possuiAlergia;
        alert('Dados do paciente atualizados com sucesso!');
      },
      error: (err) => {
        console.error('Erro ao atualizar paciente:', err);
        this.carregando.set(false);
        alert('Erro ao atualizar os dados. Verifique o console.');
      }
    });
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
