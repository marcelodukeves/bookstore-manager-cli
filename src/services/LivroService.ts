import { DadosNovoLivro, Livro } from "../models/Livro";
import { EmprestimoRepository } from "../repositories/EmprestimoRepository";
import { LivroRepository } from "../repositories/LivroRepository";
import { ErroDeNegocio } from "../utils/ErroDeNegocio";
import {
  validarAnoPublicacao,
  validarInteiroPositivo,
  validarTextoObrigatorio,
} from "../utils/validacoes";
import { AutorService } from "./AutorService";

/** Regras de negócio do módulo de livros. */
export class LivroService {
  constructor(
    private readonly livroRepository: LivroRepository,
    private readonly autorService: AutorService,
    private readonly emprestimoRepository: EmprestimoRepository
  ) {}

  async cadastrar(dados: DadosNovoLivro): Promise<Livro> {
    const dadosValidados = this.validarDados(dados);
    await this.autorService.buscarPorId(dadosValidados.autorId);
    await this.garantirIsbnDisponivel(dadosValidados.isbn);
    return this.livroRepository.inserir(dadosValidados);
  }

  async listar(): Promise<Livro[]> {
    return this.livroRepository.listarTodos();
  }

  /** Busca um livro e lança erro se ele não existir. */
  async buscarPorId(id: number): Promise<Livro> {
    const livro = await this.livroRepository.buscarPorId(id);
    if (!livro) {
      throw new ErroDeNegocio(`Livro com id ${id} não encontrado.`);
    }
    return livro;
  }

  async atualizar(id: number, dados: DadosNovoLivro): Promise<Livro> {
    const livro = await this.buscarPorId(id);
    const dadosValidados = this.validarDados(dados);
    await this.autorService.buscarPorId(dadosValidados.autorId);
    await this.garantirIsbnDisponivel(dadosValidados.isbn, id);

    const quantidadeEmprestada = livro.quantidadeTotal - livro.quantidadeDisponivel;
    if (dadosValidados.quantidadeTotal < quantidadeEmprestada) {
      throw new ErroDeNegocio(
        `Não é possível reduzir a quantidade total para ${dadosValidados.quantidadeTotal}: ${quantidadeEmprestada} unidade(s) estão emprestadas.`
      );
    }

    livro.titulo = dadosValidados.titulo;
    livro.isbn = dadosValidados.isbn;
    livro.anoPublicacao = dadosValidados.anoPublicacao;
    livro.autorId = dadosValidados.autorId;
    livro.quantidadeTotal = dadosValidados.quantidadeTotal;
    livro.quantidadeDisponivel = dadosValidados.quantidadeTotal - quantidadeEmprestada;

    await this.livroRepository.atualizar(livro);
    return livro;
  }

  /** Remove o livro, desde que ele não tenha empréstimos registrados (RF13). */
  async remover(id: number): Promise<void> {
    const livro = await this.buscarPorId(id);
    const emprestimosDoLivro = await this.emprestimoRepository.listarPorLivro(id);

    if (emprestimosDoLivro.length > 0) {
      throw new ErroDeNegocio(
        `Não é possível remover "${livro.titulo}": o livro possui ${emprestimosDoLivro.length} empréstimo(s) registrado(s).`
      );
    }

    await this.livroRepository.remover(id);
  }

  /** Retira um exemplar do estoque disponível. Lança erro se não houver nenhum (RF10 e RF13). */
  async reservarExemplar(id: number): Promise<Livro> {
    const livro = await this.buscarPorId(id);
    if (!livro.estaDisponivel()) {
      throw new ErroDeNegocio(`O livro "${livro.titulo}" não possui exemplares disponíveis no momento.`);
    }

    livro.quantidadeDisponivel--;
    await this.livroRepository.atualizar(livro);
    return livro;
  }

  /** Devolve um exemplar ao estoque disponível (RF11). */
  async reporExemplar(id: number): Promise<Livro> {
    const livro = await this.buscarPorId(id);
    if (livro.quantidadeDisponivel < livro.quantidadeTotal) {
      livro.quantidadeDisponivel++;
      await this.livroRepository.atualizar(livro);
    }
    return livro;
  }

  /** Valida os campos e devolve os dados já limpos. */
  private validarDados(dados: DadosNovoLivro): DadosNovoLivro {
    return {
      titulo: validarTextoObrigatorio(dados.titulo, "Título"),
      isbn: validarTextoObrigatorio(dados.isbn, "ISBN"),
      anoPublicacao: validarAnoPublicacao(String(dados.anoPublicacao)),
      autorId: validarInteiroPositivo(String(dados.autorId), "ID do autor"),
      quantidadeTotal: validarInteiroPositivo(String(dados.quantidadeTotal), "Quantidade"),
    };
  }

  /** Impede dois livros com o mesmo ISBN (RF13). Na atualização, ignora o próprio livro. */
  private async garantirIsbnDisponivel(isbn: string, idIgnorado?: number): Promise<void> {
    const livroExistente = await this.livroRepository.buscarPorIsbn(isbn);
    if (livroExistente && livroExistente.id !== idIgnorado) {
      throw new ErroDeNegocio(`Já existe um livro cadastrado com o ISBN "${isbn}".`);
    }
  }
}