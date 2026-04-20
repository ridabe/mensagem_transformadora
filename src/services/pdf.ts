import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export type SharePdfParams = {
  html: string;
  fileName?: string;
};

export async function shareHtmlAsPdf({ html, fileName = 'mensagem-transformadora.pdf' }: SharePdfParams): Promise<string> {
  const { uri } = await Print.printToFileAsync({ html, base64: false });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Compartilhar PDF',
      UTI: 'com.adobe.pdf'
    });
  }

  return uri;
}
