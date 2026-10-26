import { ClienteController } from "../controllers/ClienteController";
import { Menu } from "./Menu";

export function criarMenuClientes(clienteController: ClienteController): Menu {
  return new Menu("🧑 Módulo de Clientes", [
    { codigo: "1", titulo: "Cadastrar cliente", acao: () => clienteController.cadastrar() },
    { codigo: "2", titulo: "Listar clientes", acao: () => clienteController.listar() },
    { codigo: "3", titulo: "Consultar cliente por ID", acao: () => clienteController.consultarPorId() },
    { codigo: "4", titulo: "Atualizar cliente", acao: () => clienteController.atualizar() },
    { codigo: "5", titulo: "Remover cliente", acao: () => clienteController.remover() },
  ]);
}