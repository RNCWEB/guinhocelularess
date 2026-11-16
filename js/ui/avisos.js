import { elemento, botao } from "./dom.js";
export function avisar(texto, tipo = "sucesso") {
  let area = document.querySelector("#avisos");
  if (!area) {
    area = elemento("div", "avisos");
    area.id = "avisos";
    area.setAttribute("aria-live", "polite");
    document.body.append(area);
  }
  const aviso = elemento("div", "aviso aviso--" + tipo);
  aviso.append(elemento("span", "", texto), botao("×", "aviso-fechar", () => aviso.remove()));
  aviso.lastElementChild.setAttribute("aria-label", "Fechar aviso");
  area.append(aviso);
  while (area.children.length > 3) area.firstElementChild.remove();
  setTimeout(() => aviso.remove(), 5500);
}
export function prepararAvisos() {
  let informado = false;
  window.addEventListener("guinho:armazenamento-indisponivel", () => {
    if (informado) return;
    informado = true;
    const faixa = elemento("p", "aviso-persistencia", "O armazenamento do navegador está indisponível. As alterações ficarão apenas nesta página; mantenha uma cópia do pedido.");
    faixa.setAttribute("role", "status");
    document.body.prepend(faixa);
  });
  window.addEventListener("guinho:dados-invalidos", () => {
    if (document.querySelector(".aviso-dados")) return;
    const faixa = elemento("p", "aviso-persistencia aviso-dados", "Os dados locais estão inválidos. Exibindo o catálogo de demonstração sem sobrescrever os registros salvos.");
    document.body.prepend(faixa);
  });
}
export async function copiarTexto(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    avisar("Mensagem copiada.");
    return true;
  } catch {
    const campo = elemento("textarea", "copia-alternativa");
    campo.value = texto;
    campo.setAttribute("aria-label", "Texto para copiar");
    document.body.append(campo);
    campo.select();
    let copiado = false;
    try {
      copiado = document.execCommand("copy");
    } catch {
    }
    if (copiado) {
      campo.remove();
      avisar("Mensagem copiada.");
    } else {
      avisar("Selecione o texto e copie com Ctrl+C ou pelo menu do celular.", "informacao");
      campo.focus();
      campo.addEventListener("blur", () => campo.remove(), { once: true });
    }
    return copiado;
  }
}
