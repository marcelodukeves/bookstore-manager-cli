import { Menu } from "./Menu";

/** Ações que o menu principal dispara, uma para cada módulo do sistema. */
export interface AcoesMenuPrincipal {
  abrirAutores: () => Promise<void>;
  abrirLivros: () => Promise<void>;
  abrirClientes: () => Promise<void>;
  abrirEmprestimos: () => Promise<void>;
}

export function criarMenuPrincipal(acoes: AcoesMenuPrincipal): Menu {
  return new Menu(
    "📚 BookStore Manager CLI - Menu Principal",
    [
      { codigo: "1", titulo: "Autores", acao: acoes.abrirAutores },
      { codigo: "2", titulo: "Livros", acao: acoes.abrirLivros },
      { codigo: "3", titulo: "Clientes", acao: acoes.abrirClientes },
      { codigo: "4", titulo: "Empréstimos", acao: acoes.abrirEmprestimos },
    ],
    "Encerrar aplicação"
  );
}