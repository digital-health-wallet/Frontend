import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss' 
})
export class SidebarComponent {

  private readonly router = inject(Router);


  menuItems = [
    { link: '/agendamentos',  label: 'Agendamentos',   icon: 'pi pi-calendar' },
    { link: '/contatos',      label: 'Contatos',       icon: 'pi pi-phone' },
    { link: '/documentos',    label: 'Documentos',     icon: 'pi pi-file' },
    { link: '/prontuario',    label: 'Meu Prontuário', icon: 'pi pi-clipboard' },
    { link: '/profissionais', label: 'Profissionais',  icon: 'pi pi-users' }
  ];

  logout(){
    localStorage.removeItem('token');

    this.router.navigate(['login']);
  }
}
