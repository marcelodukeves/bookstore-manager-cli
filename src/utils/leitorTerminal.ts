import { createInterface, Interface } from "readline/promises";
import { stdin as entrada, stdout as saida } from "process";

/**
 * Responsável por toda a leitura de dados digitados no terminal.
 * Centraliza o uso do readline para que as demais camadas não dependam dele.
 */
export class LeitorTerminal {
  private readonly interfaceLeitura: Interface;

  constructor() {
    this.interfaceLeitura = createInterface({ input: entrada, output: saida });
  }

  /** Exibe uma pergunta e devolve o texto digitado, sem espaços nas pontas. */
  async perguntar(pergunta: string): Promise<string> {
    const resposta = await this.interfaceLeitura.question(pergunta);
    return resposta.trim();
  }

  /** Pausa a execução até o usuário apertar Enter. */
  async aguardarEnter(): Promise<void> {
    await this.interfaceLeitura.question("\nPressione Enter para continuar...");
  }

  /** Encerra a leitura do terminal. Deve ser chamado ao fechar a aplicação. */
  fechar(): void {
    this.interfaceLeitura.close();
  }
}

/** Instância única compartilhada por toda a aplicação. */
export const leitorTerminal = new LeitorTerminal();