export function getDashboardInsights(transactions) {

    const hoje = new Date();

    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    const mesAnterior =
        mesAtual === 0 ? 11 : mesAtual - 1;

    const anoAnterior =
        mesAtual === 0
            ? anoAtual - 1
            : anoAtual;

    const atual = {
        entrada:0,
        saida:0,
        investimento:0,
    };

    const anterior = {
        entrada:0,
        saida:0,
        investimento:0,
    };

    transactions.forEach((item)=>{

        const data = new Date(item.data);

        const mes = data.getMonth();
        const ano = data.getFullYear();

        let destino = null;

        if(mes===mesAtual && ano===anoAtual){

            destino = atual;

        }

        if(mes===mesAnterior && ano===anoAnterior){

            destino = anterior;

        }

        if(!destino) return;

        destino[item.tipo] =
            (destino[item.tipo] || 0) + item.valor;

    });

    function percentual(atual, anterior){

        if(anterior===0){

            return null;

        }

        return ((atual-anterior)/anterior)*100;

    }

    return{

        entrada: percentual(atual.entrada,anterior.entrada),

        saida: percentual(atual.saida,anterior.saida),

        investimento: percentual(
            atual.investimento,
            anterior.investimento
        ),

    };

}