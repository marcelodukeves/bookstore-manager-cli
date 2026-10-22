/** Converte uma data para o formato brasileiro: dd/mm/aaaa. */
export function formatarData(data: Date): string {
  return data.toLocaleDateString("pt-BR");
}

/** Converte uma data para o formato brasileiro com hora: dd/mm/aaaa HH:mm. */
export function formatarDataHora(data: Date): string {
  const dataFormatada = data.toLocaleDateString("pt-BR");
  const horaFormatada = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${dataFormatada} ${horaFormatada}`;
}

/** Exibe uma linha separadora no terminal para organizar as listagens. */
export function linhaSeparadora(tamanho: number = 50): string {
  return "-".repeat(tamanho);
}