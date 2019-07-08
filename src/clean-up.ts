const ODD_CHAR_MAPPINGS = {
  θ: '0',
};

export default function cleanUp(text: string): string {
  let cleanedText = text;
  Object.entries(ODD_CHAR_MAPPINGS).forEach(([odd, replacement]) => {
    cleanedText = cleanedText.replace(new RegExp(odd, 'gi'), replacement);
  });
  return cleanedText;
}
