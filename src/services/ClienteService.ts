import { Cliente, DadosNovoCliente } from "../models/Cliente";
import { ClienteRepository } from "../repositories/ClienteRepository";
import { EmprestimoRepository } from "../repositories/EmprestimoRepository";
import { ErroDeNegocio } from "../utils/ErroDeNegocio";
import { validarEmail, validarTextoObrigatorio } from "../utils/validacoes";

/** Regras de negócio do módulo de clientes. */
export class ClienteService {
  constructor(
    private readonly clienteRepository: ClienteRepository,
    private readonly emprestimoRepository: EmprestimoRepository
  ) {}

  async cadastrar(dados: DadosNovoCliente): Promise<Cliente> {
    const dadosValidados = this.validarDados(dados);
    await this.garantirEmailDisponivel(dadosValidados.email);
    return this.clienteRepository.inserir(dadosValidados);
  }

  async listar(): Promise<Cliente[]> {
    return this.clienteRepository.listarTodos();
  }

  /** Busca um cliente e lança erro se ele não existir. */
  async buscarPorId(id: number): Promise<Cliente> {
    const cliente = await this.clienteRepository.buscarPorId(id);
    if (!cliente) {
      throw new ErroDeNegocio(`Cliente com id ${id} não encontrado.`);
    }
    return cliente;
  }

  async atualizar(id: number, dados: DadosNovoCliente): Promise<Cliente> {
    const cliente = await this.buscarPorId(id);
    const dadosValidados = this.validarDados(dados);
    await this.garantirEmailDisponivel(dadosValidados.email, id);

    cliente.nome = dadosValidados.nome;
    cliente.email = dadosValidados.email;
    cliente.telefone = dadosValidados.telefone;
    await this.clienteRepository.atualizar(cliente);
    return cliente;
  }

  /** Remove o cliente, desde que ele não tenha empréstimos registrados (RF13). */
  async remover(id: number): Promise<void> {
    const cliente = await this.buscarPorId(id);
    const emprestimosDoCliente = await this.emprestimoRepository.listarPorCliente(id);

    if (emprestimosDoCliente.length > 0) {
      throw new ErroDeNegocio(
        `Não é possível remover "${cliente.nome}": o cliente possui ${emprestimosDoCliente.length} empréstimo(s) registrado(s).`
      );
    }

    await this.clienteRepository.remover(id);
  }

  /** Valida os campos e devolve os dados já limpos. */
  private validarDados(dados: DadosNovoCliente): DadosNovoCliente {
    return {
      nome: validarTextoObrigatorio(dados.nome, "Nome"),
      email: validarEmail(dados.email),
      telefone: validarTextoObrigatorio(dados.telefone, "Telefone"),
    };
  }

  /**
   * Impede dois clientes com o mesmo e-mail (RF13).
   * Na atualização, o próprio cliente é ignorado na comparação.
   */
  private async garantirEmailDisponivel(email: string, idIgnorado?: number): Promise<void> {
    const clienteExistente = await this.clienteRepository.buscarPorEmail(email);
    if (clienteExistente && clienteExistente.id !== idIgnorado) {
      throw new ErroDeNegocio(`Já existe um cliente cadastrado com o e-mail "${email}".`);
    }
  }
}