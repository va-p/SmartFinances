import { format, isValid, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formats an integration's last-sync date for display.
 * Freshly created integrations have no successful sync yet
 * (`lastSyncDate` is null until the first sync completes) — and a
 * malformed value must never crash the render tree (RangeError in
 * `format` is fatal: it takes down the whole app).
 */
export function formatLastSyncDate(value: string | null | undefined): string {
  if (!value) return 'Pendente';
  try {
    const parsed = parseISO(value);
    if (!isValid(parsed)) return 'Pendente';
    return format(parsed, 'dd/MM/yyyy', { locale: ptBR });
  } catch {
    return 'Pendente';
  }
}
