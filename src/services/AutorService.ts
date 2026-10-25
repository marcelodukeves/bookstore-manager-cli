import { Autor, DadosNovoAutor } from "../models/Autor";
import { AutorRepository } from "../repositories/AutorRepository";
import { ErroDeNegocio } from "../utils/ErroDeNegocio";
import { validarTextoObrigatorio } from "../utils/validacoes";

/** Regras de negócio do módulo de autores. */
export class AutorService {
  constructor(private readonly autorRepository: AutorRepository) {}

  async cadastrar(dados: DadosNovoAutor): Promise<Autor> {
    const dadosValidados = this.validarDados(dados);
    await this.garantirNomeDisponivel(dadosValidados.nome);
    return this.autorRepository.inserir(dadosValidados);
  }

  async listar(): Promise<Autor[]> {
    return this.autorRepository.listarTodos();
  }

  /** Busca um autor e lança erro se ele não existir. */
  async buscarPorId(id: number): Promise<Autor> {
    const autor = await this.autorRepository.buscarPorId(id);
    if (!autor) {
      throw new ErroDeNegocio(`Autor com id ${id} não encontrado.`);
    }
    return autor;
  }

  async atualizar(id: number, dados: DadosNovoAutor): Promise<Autor> {
    const autor = await this.buscarPorId(id);
    const dadosValidados = this.validarDados(dados);
    await this.garantirNomeDisponivel(dadosValidados.nome, id);

    autor.nome = dadosValidados.nome;
    autor.nacionalidade = dadosValidados.nacionalidade;
    await this.autorRepository.atualizar(autor);
    return autor;
  }

  async remover(id: number): Promise<void> {
    await this.buscarPorId(id);
    await this.autorRepository.remover(id);
  }

  /** Valida os campos obrigatórios e devolve os dados já limpos. */
  private validarDados(dados: DadosNovoAutor): DadosNovoAutor {
    return {
      nome: validarTextoObrigatorio(dados.nome, "Nome"),
      nacionalidade: validarTextoObrigatorio(dados.nacionalidade, "Nacionalidade"),
    };
  }

  /**
   * Impede dois autores com o mesmo nome (RF13).
   * Na atualização, o próprio autor é ignorado na comparação.
   */
  private async garantirNomeDisponivel(nome: string, idIgnorado?: number): Promise<void> {
    const autorExistente = await this.autorRepository.buscarPorNome(nome);
    if (autorExistente && autorExistente.id !== idIgnorado) {
      throw new ErroDeNegocio(`Já existe um autor cadastrado com o nome "${nome}".`);
    }
  }
}