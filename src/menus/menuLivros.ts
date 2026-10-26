import { LivroController } from "../controllers/LivroController";
import { Menu } from "./Menu";

export function criarMenuLivros(livroController: LivroController): Menu {
  return new Menu("📖 Módulo de Livros", [
    { codigo: "1", titulo: "Cadastrar livro", acao: () => livroController.cadastrar() },
    { codigo: "2", titulo: "Listar livros", acao: () => livroController.listar() },
    { codigo: "3", titulo: "Consultar livro por ID", acao: () => livroController.consultarPorId() },
    { codigo: "4", titulo: "Atualizar livro", acao: () => livroController.atualizar() },
    { codigo: "5", titulo: "Remover livro", acao: () => livroController.remover() },
  ]);
}