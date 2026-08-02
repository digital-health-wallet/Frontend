import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PacienteService } from '../../core/services/paciente.service';
import { CadastroProntuarioRequest } from '../../core/models';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-prontuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './prontuario.component.html',
  styleUrl: './prontuario.component.scss'
})
export class ProntuarioComponent implements OnInit {
  prontuarioForm!: FormGroup;
  qrCodeData: string | null = null;
  linkAcesso: string | null = null;

  tiposSanguineos: string[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  constructor(
    private fb: FormBuilder,
    private pacienteService: PacienteService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.watchAlergiaChanges();

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
      fichaEmergencialAtiva: [true]
    });
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
      descricaoAlergia: formValue.possuiAlergia ? formValue.descricaoAlergia : undefined
    };

    this.pacienteService.salvarProntuarioCompleto(request).subscribe({
      next: (pacienteSalvo) => {
        alert('Prontuário salvo com sucesso!');
        this.pacienteService.atualizarNomeNaSidebar(pacienteSalvo.nome);
        this.linkAcesso = `/emergencia/${pacienteSalvo.codigoEmergencia}`;
        this.qrCodeData = `${window.location.origin}${this.linkAcesso}`;
      },
      error: (err) => {
        console.error('Erro ao salvar prontuário:', err);
        alert('Erro ao salvar os dados. Verifique o console.');
      }
    });
  }
}