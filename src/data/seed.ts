import { DadosNovoAutor } from "../models/Autor";
import { DadosNovoCliente } from "../models/Cliente";
import { DadosNovoLivro } from "../models/Livro";
import { AutorRepository } from "../repositories/AutorRepository";
import { ClienteRepository } from "../repositories/ClienteRepository";
import { EmprestimoRepository } from "../repositories/EmprestimoRepository";
import { LivroRepository } from "../repositories/LivroRepository";

/** Repositórios que recebem os dados iniciais. */
export interface RepositoriosDoSeed {
  autorRepository: AutorRepository;
  livroRepository: LivroRepository;
  clienteRepository: ClienteRepository;
  emprestimoRepository: EmprestimoRepository;
}

/** Empréstimo inicial: sem data de devolução significa que o empréstimo está ativo. */
interface DadosEmprestimoSeed {
  livroId: number;
  clienteId: number;
  dataEmprestimo: Date;
  dataDevolucao?: Date;
}

/** Cria uma data a partir de ano, mês (1 a 12) e dia. */
function criarData(ano: number, mes: number, dia: number): Date {
  return new Date(ano, mes - 1, dia);
}

const autores: DadosNovoAutor[] = [
  { nome: "Machado de Assis", nacionalidade: "Brasileira" },
  { nome: "Clarice Lispector", nacionalidade: "Brasileira" },
  { nome: "Jorge Amado", nacionalidade: "Brasileira" },
  { nome: "George Orwell", nacionalidade: "Britânica" },
  { nome: "Gabriel García Márquez", nacionalidade: "Colombiana" },
  { nome: "Cecília Meireles", nacionalidade: "Brasileira" },
];

const livros: DadosNovoLivro[] = [
  { titulo: "Dom Casmurro", isbn: "978-85-359-0277-5", anoPublicacao: 1899, autorId: 1, quantidadeTotal: 3 },
  { titulo: "Memórias Póstumas de Brás Cubas", isbn: "978-85-359-0278-2", anoPublicacao: 1881, autorId: 1, quantidadeTotal: 2 },
  { titulo: "A Hora da Estrela", isbn: "978-85-325-1000-1", anoPublicacao: 1977, autorId: 2, quantidadeTotal: 2 },
  { titulo: "Capitães da Areia", isbn: "978-85-359-0300-0", anoPublicacao: 1937, autorId: 3, quantidadeTotal: 2 },
  { titulo: "1984", isbn: "978-85-359-0301-7", anoPublicacao: 1949, autorId: 4, quantidadeTotal: 3 },
  { titulo: "A Revolução dos Bichos", isbn: "978-85-359-0302-4", anoPublicacao: 1945, autorId: 4, quantidadeTotal: 1 },
  { titulo: "Cem Anos de Solidão", isbn: "978-85-359-0303-1", anoPublicacao: 1967, autorId: 5, quantidadeTotal: 2 },
];

const clientes: DadosNovoCliente[] = [
  { nome: "Maria Silva", email: "maria@email.com", telefone: "49 99999-0001" },
  { nome: "João Souza", email: "joao@email.com", telefone: "49 99999-0002" },
  { nome: "Ana Pereira", email: "ana@email.com", telefone: "49 99999-0003" },
  { nome: "Carlos Lima", email: "carlos@email.com", telefone: "49 99999-0004" },
  { nome: "Fernanda Costa", email: "fernanda@email.com", telefone: "49 99999-0005" },
];

const emprestimos: DadosEmprestimoSeed[] = [
  { livroId: 1, clienteId: 1, dataEmprestimo: criarData(2026, 10, 1), dataDevolucao: criarData(2026, 10, 8) },
  { livroId: 1, clienteId: 2, dataEmprestimo: criarData(2026, 10, 5) },
  { livroId: 3, clienteId: 3, dataEmprestimo: criarData(2026, 10, 10) },
  { livroId: 5, clienteId: 1, dataEmprestimo: criarData(2026, 10, 12), dataDevolucao: criarData(2026, 10, 19) },
  { livroId: 5, clienteId: 4, dataEmprestimo: criarData(2026, 10, 15) },
  { livroId: 6, clienteId: 2, dataEmprestimo: criarData(2026, 10, 20) },
];

/**
 * Carrega os dados iniciais da aplicação.
 * Os mesmos dados são inseridos no script.sql do banco (RF16).
 * A ordem de inserção define os ids sequenciais, então não deve ser alterada.
 */
export async function carregarDadosIniciais(repositorios: RepositoriosDoSeed): Promise<void> {
  const { autorRepository, livroRepository, clienteRepository, emprestimoRepository } = repositorios;

  for (const dados of autores) {
    await autorRepository.inserir(dados);
  }

  for (const dados of livros) {
    await livroRepository.inserir(dados);
  }

  for (const dados of clientes) {
    await clienteRepository.inserir(dados);
  }

  for (const dados of emprestimos) {
    const emprestimo = await emprestimoRepository.inserir({
      livroId: dados.livroId,
      clienteId: dados.clienteId,
      dataEmprestimo: dados.dataEmprestimo,
    });

    if (dados.dataDevolucao) {
      emprestimo.dataDevolucao = dados.dataDevolucao;
      await emprestimoRepository.atualizar(emprestimo);
    } else {
      const livro = await livroRepository.buscarPorId(dados.livroId);
      if (livro) {
        livro.quantidadeDisponivel--;
        await livroRepository.atualizar(livro);
      }
    }
  }
}