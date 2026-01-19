import { useEffect, useRef, useCallback } from 'react';
import { USER_STATUS, AUTO_AWAY_TIMEOUT } from '../config/userStatus';

/**
 * Hook para detectar inatividade e mudar status automaticamente
 */
export function useAutoAway(currentStatus, onStatusChange) {
  const inactivityTimerRef = useRef(null);
  const wasAwayRef = useRef(false);
  const previousStatusRef = useRef(currentStatus);

  /**
   * Reseta o timer de inatividade
   */
  const resetInactivityTimer = useCallback(() => {
    // Limpar timer existente
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    // Se estava ausente por inatividade, voltar ao status anterior
    if (wasAwayRef.current && currentStatus === USER_STATUS.AWAY) {
      onStatusChange(previousStatusRef.current);
      wasAwayRef.current = false;
    }

    // Não aplicar auto-away se está em DND
    if (currentStatus === USER_STATUS.DO_NOT_DISTURB) {
      return;
    }

    // Criar novo timer
    inactivityTimerRef.current = setTimeout(() => {
      // Só mudar para "ausente" se não estiver em DND
      if (currentStatus !== USER_STATUS.DO_NOT_DISTURB && currentStatus !== USER_STATUS.AWAY) {
        previousStatusRef.current = currentStatus;
        wasAwayRef.current = true;
        onStatusChange(USER_STATUS.AWAY);
      }
    }, AUTO_AWAY_TIMEOUT);
  }, [currentStatus, onStatusChange]);

  /**
   * Configurar event listeners para atividade
   */
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    // Reset timer em qualquer atividade
    events.forEach(event => {
      window.addEventListener(event, resetInactivityTimer, { passive: true });
    });

    // Iniciar timer
    resetInactivityTimer();

    return () => {
      // Limpar event listeners
      events.forEach(event => {
        window.removeEventListener(event, resetInactivityTimer);
      });

      // Limpar timer
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [resetInactivityTimer]);

  /**
   * Atualizar status anterior quando status muda manualmente
   */
  useEffect(() => {
    if (!wasAwayRef.current) {
      previousStatusRef.current = currentStatus;
    }
  }, [currentStatus]);

  return { resetInactivityTimer };
}

export default useAutoAway;
