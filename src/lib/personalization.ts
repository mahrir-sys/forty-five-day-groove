export function personalText(text: string | undefined, firstName?: string): string {
  if (!text) return '';
  const name = firstName?.trim();
  return name ? `${name}, ${text.charAt(0).toLocaleLowerCase()}${text.slice(1)}` : text;
}
