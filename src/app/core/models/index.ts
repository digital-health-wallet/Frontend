
export interface Endereco {
  id?: number;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  complemento?: string;
}

export interface Usuario {
  id?: number;
  email: string;
  ativo: boolean;
  dataDesativacao?: string;
  googleAccessToken?: string;
  googleRefreshToken?: string;
  googleTokenExpiration?: string;
}

export interface Profissional {
  id?: number;
  endereco?: Endereco;
  nomeProfissional: string;
  numeroIdentificacaoProfissional: string;
  contato: string;
  nomeClinica: string;
  email: string;
  especialidade: string;
}

export interface Paciente {
  id?: number;
  usuario?: Usuario;
  endereco?: Endereco;
  nome: string;
  dataNascimento: string;
  codigoEmergencia?: string;
  fichaEmergencialAtiva: boolean;
  tipoSanguineo: string;
}

export type TipoConsulta = 'CONSULTA' | 'RETORNO' | 'EXAME' | 'EMERGENCIA';
export type StatusAgendamento = 'CONFIRMADO' | 'AGENDADO' | 'FINALIZADO' | 'CANCELADO';

export interface Agendamento {
  id?: number;
  profissional: Profissional;
  paciente?: Paciente;
  tipoConsulta: TipoConsulta;
  dataAgendamento: string;
  horaAgendamento: string;
  horaFim?: string;
  status: StatusAgendamento;
  arquivado: boolean;
  googleEventId?: string;
}

export interface Diagnostico {
  id?: number;
  agendamento: Agendamento;
  nome: string;
  cid: string;
  descricao: string;
  doencaCronica: boolean;
}

export interface Exame {
  id?: number;
  agendamento?: Agendamento;
  nomeExame: string;
  dataHoraExame: string;
  observacoes?: string;
}

export interface Medicamento {
  id?: number;
  nomeMedicamento: string;
  laboratorio: string;
  feedback?: string;
}

export interface Receita {
  id?: number;
  agendamento?: Agendamento;
  dataEmissao: string;
  orientacoesGerais?: string;
}

export interface ItemReceita {
  id?: number;
  receita?: Receita;
  medicamento: Medicamento;
  posologia: string;
  usoContinuo: boolean;
}

export type TipoAlergia = 'M' | 'A';

export interface Alergia {
  id?: number;
  paciente?: Paciente;
  medicamento?: Medicamento;
  tipo: TipoAlergia;
  descricao: string;
}

export interface Upload {
  id?: number;
  exame?: Exame;
  receita?: Receita;
  base64: string;
}

// ---- DTOs auxiliares ----
export interface LoginRequest {
  email: string;
  senha: string;
}

export interface AgendamentoResumo {
  id: number;
  especialidade: string;
  nomeClinica: string;
  data: string;
  hora: string;
  status: StatusAgendamento;
  favorito: boolean;
  selecionado?: boolean;
}
