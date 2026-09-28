import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function formatDatePtBr(date: Date) {
  return {
    extensive() {
      const formattedDate = format(new Date(date), "dd 'de' MMMM 'de' yyyy", {
        locale: ptBR,
      });
      return formattedDate;
    },
    medium() {
      const formattedDate = format(new Date(date), "dd 'de' MMM 'de' yyyy", {
        locale: ptBR,
      });
      return formattedDate;
    },
    short() {
      const formattedDate = format(new Date(date), 'dd/MM/yyyy', {
        locale: ptBR,
      });
      return formattedDate;
    },
    cashFlowChartMonth() {
      const formattedDate = format(new Date(date), "MMM '\n' yyyy", {
        locale: ptBR,
      });
      return formattedDate;
    },
  };
}

export default formatDatePtBr;
