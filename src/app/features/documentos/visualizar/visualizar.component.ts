import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DocumentosService } from '../../../core/services/documentos.service';
import { Exame, Receita, Diagnostico } from '../../../core/models';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-visualizar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visualizar.component.html',
  styleUrl: './visualizar.component.scss'
})
export class VisualizarComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private documentosService = inject(DocumentosService);

  tabAtiva = signal<'exames' | 'receitas' | 'diagnosticos'>('exames');
  idAgendamento = signal<number | null>(null);

  exames = signal<Exame[]>([]);
  receitas = signal<Receita[]>([]);
  diagnosticos = signal<Diagnostico[]>([]);
  carregando = signal(false);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    
    if (idParam) {
      this.idAgendamento.set(Number(idParam));
      this.carregarDadosDoAgendamento(this.idAgendamento()!);
    } else {
      this.carregarDadosGlobais();
    }
  }

  carregarDadosDoAgendamento(id: number): void {
    this.carregando.set(true);
    
    forkJoin({
      exames: this.documentosService.buscarExamesPorAgendamento(id).pipe(catchError(() => of([]))),
      receitas: this.documentosService.buscarReceitasPorAgendamento(id).pipe(catchError(() => of([]))),
      diagnosticos: this.documentosService.buscarDiagnosticosPorAgendamento(id).pipe(catchError(() => of([])))
    }).pipe(
      finalize(() => this.carregando.set(false)) 
    ).subscribe(res => {
      this.exames.set(res.exames);
      this.receitas.set(res.receitas);
      this.diagnosticos.set(res.diagnosticos);
    });
  }

  carregarDadosGlobais(): void {
    this.carregando.set(true);
    const idPacientePadrao = 1;

    forkJoin({
      exames: this.documentosService.listarExamesGerais(idPacientePadrao).pipe(catchError(() => of([]))),
      receitas: this.documentosService.listarReceitasGerais(idPacientePadrao).pipe(catchError(() => of([]))),
      diagnosticos: this.documentosService.listarDiagnosticosGerais(idPacientePadrao).pipe(catchError(() => of([])))
    }).pipe(
      finalize(() => this.carregando.set(false))
    ).subscribe(res => {
      this.exames.set(res.exames);
      this.receitas.set(res.receitas);
      this.diagnosticos.set(res.diagnosticos);
    });
  }
}