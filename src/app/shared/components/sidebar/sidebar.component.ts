import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';
import { PacienteService } from '../../../core/services/paciente.service';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss' 
})
export class SidebarComponent {

  private readonly router = inject(Router);
  private readonly pacienteService = inject(PacienteService);

  nomeExibido: string = 'Nome';


  menuItems = [
    { link: '/agendamentos',  label: 'Agendamentos',   icon: 'pi pi-calendar' },
    { link: '/contatos',      label: 'Contatos',       icon: 'pi pi-phone' },
    { link: '/documentos',    label: 'Documentos',     icon: 'pi pi-file' },
    { link: '/prontuario',    label: 'Meu Prontuário', icon: 'pi pi-clipboard' },
    { link: '/profissionais', label: 'Profissionais',  icon: 'pi pi-users' }
  ];

  ngOnInit(): void {
    this.pacienteService.nomePaciente$.subscribe((novoNome) => {
      this.nomeExibido = novoNome;
    });
  }

  logout(){
    localStorage.removeItem('token');

    this.router.navigate(['login']);
  }
}
