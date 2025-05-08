/**
 * Copia un texto al portapapeles y devuelve un booleano indicando si la operación fue exitosa
 * @param text Texto a copiar al portapapeles
 * @returns Promise<boolean> Indica si la operación fue exitosa
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      // Para navegadores modernos en contextos seguros (HTTPS)
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback para navegadores más antiguos o contextos no seguros
      const textArea = document.createElement('textarea');
      textArea.value = text;
      
      // Hacer que el textarea no sea visible
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      
      textArea.focus();
      textArea.select();
      
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (err) {
    console.error('Error al copiar al portapapeles:', err);
    return false;
  }
}
