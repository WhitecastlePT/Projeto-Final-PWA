/**
 * Configuração da sessão
 * Altere estes valores para ajustar o comportamento da sessão
 */

export const CONFIG_SESSAO = {
    // Tempo de inatividade em minutos até a sessão expirar
    TEMPO_EXPIRACAO_MINUTOS: 30,

    // Tempo em segundos antes da expiração para mostrar o countdown
    TEMPO_AVISO_SEGUNDOS: 60,

    // Eventos que contam como atividade do utilizador
    EVENTOS_ATIVIDADE: ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click']
};
