import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import type { SermonNote } from '../types/sermon';

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

export async function shareSermonNoteAsPdf(note: SermonNote): Promise<string> {
  const logoDataUri = await getLogoDataUri();
  const html = buildSermonPdfHtml(note, logoDataUri);
  const fileName = `${safeFileName(note.sermonTitle)}-${note.sermonDate}.pdf`;
  return shareHtmlAsPdf({ html, fileName });
}

async function getLogoDataUri(): Promise<string> {
  const asset = Asset.fromModule(require('../../img/logo.png'));
  if (!asset.localUri) {
    await asset.downloadAsync();
  }

  const uri = asset.localUri ?? asset.uri;
  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  return `data:image/png;base64,${base64}`;
}

function buildSermonPdfHtml(note: SermonNote, logoDataUri: string): string {
  const secondaryVerses = note.secondaryVerses?.length ? note.secondaryVerses : [];
  const points = note.keyPoints?.length ? note.keyPoints : [];
  const phrases = note.highlightedPhrases?.length ? note.highlightedPhrases : [];

  const metaLine = `${escapeHtml(note.preacherName)} • ${escapeHtml(note.churchName)} • ${escapeHtml(note.sermonDate)}${
    note.sermonTime ? ` • ${escapeHtml(note.sermonTime)}` : ''
  }`;

  return `
  <!DOCTYPE html>
  <html lang="pt-BR">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${escapeHtml(note.sermonTitle)}</title>
      <style>
        :root {
          --primary: #1E6FDB;
          --text: #121417;
          --muted: #5E6872;
          --border: #E6E8EB;
          --bg: #FFFFFF;
          --soft: #E7F0FF;
        }

        * { box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          background: var(--bg);
          color: var(--text);
          margin: 0;
          padding: 0;
        }

        .page {
          padding: 36px 34px;
        }

        .cover {
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 34px 28px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
        }

        .logo {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: var(--soft);
          padding: 6px;
        }

        .brand-name {
          font-size: 14px;
          font-weight: 700;
          color: var(--primary);
          letter-spacing: 0.2px;
        }

        .title {
          font-size: 28px;
          line-height: 1.15;
          margin: 6px 0 10px;
          font-weight: 800;
          letter-spacing: 0.2px;
        }

        .meta {
          font-size: 12px;
          color: var(--muted);
          margin-bottom: 18px;
        }

        .pill {
          display: inline-block;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 12px;
          border: 1px solid var(--border);
          color: var(--text);
          background: #fff;
          margin-right: 8px;
          margin-top: 6px;
        }

        .section {
          margin-top: 22px;
          border-top: 1px solid var(--border);
          padding-top: 18px;
        }

        .section-title {
          font-size: 14px;
          font-weight: 800;
          margin: 0 0 10px;
          letter-spacing: 0.2px;
        }

        .text {
          font-size: 12.5px;
          line-height: 1.55;
          color: var(--text);
          margin: 0;
          white-space: pre-wrap;
        }

        .muted {
          color: var(--muted);
        }

        ul { margin: 0; padding-left: 18px; }
        li { margin: 6px 0; font-size: 12.5px; line-height: 1.45; }

        .point {
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 12px 12px;
          margin: 10px 0;
        }
        .point-title {
          font-size: 13px;
          font-weight: 800;
          margin: 0 0 6px;
        }
        .footer {
          margin-top: 22px;
          font-size: 11px;
          color: var(--muted);
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="cover">
          <div class="brand">
            <img class="logo" src="${logoDataUri}" />
            <div class="brand-name">Mensagem Transformadora</div>
          </div>

          <div class="title">${escapeHtml(note.sermonTitle)}</div>
          <div class="meta">${metaLine}</div>

          <div>
            <span class="pill"><b>Versículo base:</b> ${escapeHtml(note.mainVerse)}</span>
            ${secondaryVerses.map((v) => `<span class="pill">${escapeHtml(v)}</span>`).join('')}
          </div>

          ${
            points.length
              ? `
              <div class="section">
                <div class="section-title">Pontos principais</div>
                ${points
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map(
                    (p) => `
                      <div class="point">
                        <div class="point-title">${escapeHtml(String(p.order))}. ${escapeHtml(p.title || 'Sem título')}</div>
                        ${p.content ? `<div class="text">${escapeHtml(p.content)}</div>` : `<div class="text muted">Sem conteúdo.</div>`}
                      </div>
                    `
                  )
                  .join('')}
              </div>
            `
              : ''
          }

          ${
            note.personalObservations || note.introduction || note.practicalApplications || note.conclusion
              ? `
              <div class="section">
                <div class="section-title">Anotações</div>
                ${note.introduction ? `<p class="text"><b>Introdução:</b>\n${escapeHtml(note.introduction)}</p>` : ''}
                ${note.personalObservations ? `<p class="text"><b>Observações:</b>\n${escapeHtml(note.personalObservations)}</p>` : ''}
                ${note.practicalApplications ? `<p class="text"><b>Aplicações práticas:</b>\n${escapeHtml(note.practicalApplications)}</p>` : ''}
                ${note.conclusion ? `<p class="text"><b>Conclusão:</b>\n${escapeHtml(note.conclusion)}</p>` : ''}
              </div>
            `
              : ''
          }

          ${
            phrases.length
              ? `
              <div class="section">
                <div class="section-title">Frases marcantes</div>
                <ul>
                  ${phrases.map((p) => `<li>${escapeHtml(p)}</li>`).join('')}
                </ul>
              </div>
            `
              : ''
          }

          <div class="section">
            <div class="section-title">Resumo final</div>
            ${
              note.finalSummary
                ? `<p class="text">${escapeHtml(note.finalSummary)}</p>`
                : `<p class="text muted">Em branco.</p>`
            }
          </div>

          <div class="footer">Gerado localmente • ${escapeHtml(new Date().toISOString().slice(0, 10))}</div>
        </div>
      </div>
    </body>
  </html>
  `;
}

function safeFileName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s]+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .slice(0, 60) || 'mensagem';
}

function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
