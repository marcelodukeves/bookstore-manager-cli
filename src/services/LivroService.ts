import { DadosNovoLivro, Livro } from "../models/Livro";
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
    private readonly autorService: AutorService
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

  async remover(id: number): Promise<void> {
    await this.buscarPorId(id);
    await this.livroRepository.remover(id);
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