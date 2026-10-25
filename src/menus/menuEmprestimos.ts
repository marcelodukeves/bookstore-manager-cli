import { EmprestimoController } from "../controllers/EmprestimoController";
import { Menu } from "./Menu";

export function criarMenuEmprestimos(emprestimoController: EmprestimoController): Menu {
  return new Menu("🔄 Módulo de Empréstimos", [
    { codigo: "1", titulo: "Registrar empréstimo", acao: () => emprestimoController.registrar() },
    { codigo: "2", titulo: "Registrar devolução", acao: () => emprestimoController.devolver() },
    { codigo: "3", titulo: "Listar todos os empréstimos", acao: () => emprestimoController.listarTodos() },
    { codigo: "4", titulo: "Listar empréstimos ativos", acao: () => emprestimoController.listarAtivos() },
  ]);
}