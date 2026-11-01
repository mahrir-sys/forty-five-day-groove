export function personalText(text: string, firstName?: string): string {
  const name = firstName?.trim();
  return name ? `${name}, ${text.charAt(0).toLocaleLowerCase()}${text.slice(1)}` : text;
}
