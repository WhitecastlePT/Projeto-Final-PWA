import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { CONFIG_SESSAO } from '../config/sessao.js';

/**
 * Composable para gestão de sessão com timeout por inatividade
 */
export function useSessao(autenticacaoStore) {
    const router = useRouter();
    const ultimaAtividade = ref(Date.now());
    const tempoRestante = ref(null);
    const mostrarCountdown = ref(false);
    const emAlerta = ref(false); // true quando está nos últimos segundos (vermelho/pulsante)

    let intervaloVerificacao = null;

    const tempoExpiracaoMs = CONFIG_SESSAO.TEMPO_EXPIRACAO_MINUTOS * 60 * 1000;
    const intervaloVerificacaoMs = 1000; // Verificar a cada segundo para countdown preciso
    const limiteCountdownMs = CONFIG_SESSAO.TEMPO_AVISO_SEGUNDOS * 1000;

    /**
     * Atualiza o timestamp da última atividade
     */
    const registarAtividade = () => {
        ultimaAtividade.value = Date.now();
        emAlerta.value = false;
    };

    /**
     * Formata segundos para mm:ss
     */
    const formatarTempo = (segundos) => {
        const mins = Math.floor(segundos / 60);
        const segs = segundos % 60;
        return `${mins}:${segs.toString().padStart(2, '0')}`;
    };

    /**
     * Verifica se a sessão expirou por inatividade
     */
    const verificarExpiracao = () => {
        if (!autenticacaoStore.estaAutenticado) {
            pararMonitorizacao();
            return;
        }

        const tempoInativo = Date.now() - ultimaAtividade.value;
        const tempoRestanteMs = tempoExpiracaoMs - tempoInativo;

        if (tempoRestanteMs <= 0) {
            terminarSessao();
        } else {
            // Mostrar sempre o countdown
            mostrarCountdown.value = true;
            tempoRestante.value = Math.ceil(tempoRestanteMs / 1000);
            // Ativar alerta visual nos últimos segundos
            emAlerta.value = tempoRestanteMs <= limiteCountdownMs;
        }
    };

    /**
     * Termina a sessão e redireciona para a página inicial
     */
    const terminarSessao = () => {
        pararMonitorizacao();
        autenticacaoStore.terminarSessao();
        router.push('/');
    };

    /**
     * Inicia a monitorização de atividade
     */
    const iniciarMonitorizacao = () => {
        if (!autenticacaoStore.estaAutenticado) return;

        // Registar timestamp inicial
        registarAtividade();

        // Adicionar listeners para eventos de atividade
        CONFIG_SESSAO.EVENTOS_ATIVIDADE.forEach(evento => {
            document.addEventListener(evento, registarAtividade, { passive: true });
        });

        // Iniciar verificação periódica
        intervaloVerificacao = setInterval(verificarExpiracao, intervaloVerificacaoMs);
    };

    /**
     * Para a monitorização de atividade
     */
    const pararMonitorizacao = () => {
        // Remover listeners
        CONFIG_SESSAO.EVENTOS_ATIVIDADE.forEach(evento => {
            document.removeEventListener(evento, registarAtividade);
        });

        // Parar intervalo
        if (intervaloVerificacao) {
            clearInterval(intervaloVerificacao);
            intervaloVerificacao = null;
        }

        // Reset estado
        mostrarCountdown.value = false;
        tempoRestante.value = null;
        emAlerta.value = false;
    };

    return {
        iniciarMonitorizacao,
        pararMonitorizacao,
        registarAtividade,
        tempoRestante,
        mostrarCountdown,
        emAlerta,
        formatarTempo
    };
}
