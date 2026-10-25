import { AutorController } from "../controllers/AutorController";
import { Menu } from "./Menu";

export function criarMenuAutores(autorController: AutorController): Menu {
  return new Menu("👤 Módulo de Autores", [
    { codigo: "1", titulo: "Cadastrar autor", acao: () => autorController.cadastrar() },
    { codigo: "2", titulo: "Listar autores", acao: () => autorController.listar() },
    { codigo: "3", titulo: "Consultar autor por ID", acao: () => autorController.consultarPorId() },
    { codigo: "4", titulo: "Atualizar autor", acao: () => autorController.atualizar() },
    { codigo: "5", titulo: "Remover autor", acao: () => autorController.remover() },
  ]);
}