
export interface Endereco {
  id?: number;
  cep: string;
  logradouro: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
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
  nomeProfissional: string;
  numeroIdentificacaoProfissional?: string;
  contato?: string;
  nomeClinica?: string;
  email?: string;
  especialidade: string;
  endereco?: Endereco;
}

export interface Paciente {
  id?: number;
  idUsuario: number;
  nome: string;
  cpf?: string;
  dataNascimento: string;
  codigoEmergencia?: string;
  fichaEmergencialAtiva: boolean;
  tipoSanguineo: string;
  ativo?: boolean;
}

// Retorno de GET/PUT /api/pacientes/{id} e POST /api/pacientes/prontuario: não traz idUsuario, mas já inclui a alergia atual.
export interface PacienteResponse {
  id: number;
  nome: string;
  cpf?: string;
  dataNascimento: string;
  tipoSanguineo: string;
  fichaEmergencialAtiva: boolean;
  ativo: boolean;
  codigoEmergencia?: string;
  possuiAlergia: boolean;
  tipoAlergia?: TipoAlergia;
  descricaoAlergia?: string;
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
  idAgendamento: number;
  nome: string;
  cid?: string;
  descricao?: string;
  doencaCronica: boolean;
}

export interface Exame {
  id?: number;
  idAgendamento?: number | null; 
  nomeExame: string;
  dataHoraExame?: string;
  observacoes?: string;
  uploads?: Upload[];
}

export interface Medicamento {
  id?: number;
  nomeMedicamento: string;
  laboratorio?: string;
  feedback?: string;
}

export interface Receita {
  id?: number;
  idAgendamento?: number | null;
  dataEmissao?: string;
  orientacoesGerais?: string;
  itens: ItemReceita[];
  uploads?: Upload[];
}

export interface ItemReceita {
  id?: number;
  idReceita?: number;
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
  base64: string;
}

export interface EmergenciaResponse {
  nome: string;
  tipoSanguineo: string;
  alergias: { tipo: TipoAlergia; descricao: string }[];
  diagnosticosCronicos: { nome: string; cid?: string; descricao?: string }[];
  medicamentosUsoContinuo: { nomeMedicamento: string; posologia: string }[];
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

export interface CadastroProntuarioRequest {
  cpf: string;
  nome: string;
  dataNascimento: string;
  tipoSanguineo: string;
  fichaEmergencialAtiva: boolean;
  possuiAlergia: boolean;
  tipoAlergia?: TipoAlergia;
  descricaoAlergia?: string;
}

export interface PacienteUpdateRequest {
  nome: string;
  cpf?: string;
  dataNascimento: string;
  tipoSanguineo: string;
  fichaEmergencialAtiva: boolean;
  possuiAlergia: boolean;
  tipoAlergia?: TipoAlergia;
  descricaoAlergia?: string;
}