import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function formatDatePtBr() {
  return {
    extensive(date: Date) {
      const formatted_date = format(new Date(date), "dd 'de' MMMM 'de' yyyy", {
        locale: ptBR,
      });
      return formatted_date;
    },
    short(date: Date) {
      const formatted_date = format(new Date(date), 'dd/MM/yyyy', {
        locale: ptBR,
      });
      return formatted_date;
    },
  };
}

export default formatDatePtBr;
