/**
 * Matilde Cunha • Terapeuta Integrativa – Uberlândia / MG
 * Script Principal: Áudio Ambiente Terapêutico, Interatividade & SEO UX
 */

document.addEventListener('DOMContentLoaded', () => {
  // Inicialização de Módulos
  initHeader();
  initAmbientAudio();
  initFAQ();
  initReviewsCarousel();
  initContactActions();
  initPrivacyModal();
  initScrollAnimations();
});

/* ==========================================================================
   1. Header & Navegação Mobile
   ========================================================================== */
function initHeader() {
  const header = document.querySelector('.header');
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const drawerLinks = document.querySelectorAll('.mobile-drawer-link');

  // Adiciona sombra sutil ao rolar a página
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });

  // Toggle do menu mobile
  if (toggleBtn && drawer) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = toggleBtn.classList.toggle('open');
      drawer.classList.toggle('open');
      toggleBtn.setAttribute('aria-expanded', isOpen);
    });

    drawerLinks.forEach(link => {
      link.addEventListener('click', () => {
        toggleBtn.classList.remove('open');
        drawer.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

/* ==========================================================================
   2. Áudio Ambiente Terapêutico (Início Automático Obrigatório)
   Tenta iniciar imediatamente ao abrir o site. Se o navegador reter o áudio
   por política interna, inicia em buffer e libera o som no primeiro gesto.
   ========================================================================== */
function initAmbientAudio() {
  const audioBtn = document.getElementById('audioToggleBtn');
  const audioBtnText = document.getElementById('audioBtnText');
  const audio = document.getElementById('ambientAudio');

  const TARGET_VOLUME = 0.45; // Volume confortável e suave
  const FADE_IN_MS = 2000;    // Fade in suave de 2 segundos
  const FADE_OUT_MS = 1200;   // Fade out de 1,2 segundos
  
  let fadeTimer = null;
  let isAudible = false;

  if (!audio) return;

  // Início da interface como ligado
  updateUI(true);

  // Atributos de loop e reprodução contínua
  audio.loop = true;
  audio.preload = 'auto';

  // Salvaguarda para loop contínuo sem cortes
  audio.addEventListener('ended', () => {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  });

  function fadeIn(targetVol = TARGET_VOLUME, durationMs = FADE_IN_MS) {
    if (fadeTimer) clearInterval(fadeTimer);
    if (audio.volume < 0.01) audio.volume = 0.01;
    
    const stepTime = 40;
    const totalSteps = durationMs / stepTime;
    const stepVol = (targetVol - audio.volume) / totalSteps;

    fadeTimer = setInterval(() => {
      if (audio.volume + stepVol < targetVol) {
        audio.volume += stepVol;
      } else {
        audio.volume = targetVol;
        clearInterval(fadeTimer);
        fadeTimer = null;
      }
    }, stepTime);
  }

  function fadeOut(durationMs = FADE_OUT_MS, callback) {
    if (fadeTimer) clearInterval(fadeTimer);
    const stepTime = 40;
    const totalSteps = durationMs / stepTime;
    const stepVol = audio.volume / totalSteps;

    fadeTimer = setInterval(() => {
      if (audio.volume - stepVol > 0.01) {
        audio.volume -= stepVol;
      } else {
        audio.volume = 0;
        audio.pause();
        clearInterval(fadeTimer);
        fadeTimer = null;
        if (callback) callback();
      }
    }, stepTime);
  }

  function updateUI(active) {
    if (!audioBtn || !audioBtnText) return;
    if (active) {
      audioBtn.classList.add('playing');
      audioBtnText.textContent = 'Som ambiente';
      audioBtn.setAttribute('title', 'Clique para silenciar o som ambiente');
      audioBtn.setAttribute('aria-label', 'Som ambiente: ligado. Clique para silenciar');
      audioBtn.setAttribute('aria-pressed', 'true');
    } else {
      audioBtn.classList.remove('playing');
      audioBtnText.textContent = 'Som desligado';
      audioBtn.setAttribute('title', 'Clique para ligar o som ambiente');
      audioBtn.setAttribute('aria-label', 'Som ambiente: pausado. Clique para reproduzir');
      audioBtn.setAttribute('aria-pressed', 'false');
    }
  }

  // Lista abrangente de ativação para navegadores restritivos
  const activationEvents = ['pointerdown', 'touchstart', 'touchend', 'click', 'keydown', 'scroll', 'wheel'];

  function removeActivationListeners() {
    activationEvents.forEach(evt => {
      window.removeEventListener(evt, handleFirstActivation, { capture: true, passive: true });
      document.removeEventListener(evt, handleFirstActivation, { capture: true, passive: true });
    });
  }

  function handleFirstActivation() {
    if (!isAudible) {
      audio.muted = false;
      attemptPlay();
    }
  }

  function armActivationListeners() {
    activationEvents.forEach(evt => {
      window.addEventListener(evt, handleFirstActivation, { capture: true, passive: true });
      document.addEventListener(evt, handleFirstActivation, { capture: true, passive: true });
    });
  }

  function attemptPlay() {
    audio.muted = false;
    audio.volume = 0.01;
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise.then(() => {
        isAudible = true;
        updateUI(true);
        removeActivationListeners();
        fadeIn(TARGET_VOLUME, FADE_IN_MS);
      }).catch(() => {
        // Se o navegador barrar o áudio direto no primeiro milissegundo,
        // mantém o elemento rodando em buffer para desmutar no primeiro toque/clique
        audio.muted = true;
        audio.play().catch(() => {});
      });
    }
  }

  function stopAmbient() {
    isAudible = false;
    updateUI(false);
    fadeOut(FADE_OUT_MS);
  }

  // Botão de áudio no topo
  if (audioBtn) {
    audioBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();

      if (isAudible && !audio.paused) {
        stopAmbient();
      } else {
        audio.muted = false;
        attemptPlay();
      }
    });
  }

  // Banner no topo da Hero: clique/toque direto ativa o áudio ambiente
  const heroCalmBanner = document.getElementById('heroCalmBanner');
  if (heroCalmBanner) {
    heroCalmBanner.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!isAudible || audio.paused) {
        audio.muted = false;
        attemptPlay();
      }
    });
    heroCalmBanner.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!isAudible || audio.paused) {
          audio.muted = false;
          attemptPlay();
        }
      }
    });
  }

  // Disparo ao carregar a página
  attemptPlay();
  armActivationListeners();

  if (document.readyState !== 'complete') {
    window.addEventListener('load', () => {
      if (!isAudible) {
        attemptPlay();
      }
    }, { once: true });
  }
}

/* ==========================================================================
   3. Perguntas Frequentes (FAQ Acordeão Suave)
   ========================================================================== */
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (!questionBtn || !answer) return;

    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Fecha outros itens para manter elegância limpa
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherAnswer = otherItem.querySelector('.faq-answer');
          if (otherAnswer) otherAnswer.style.maxHeight = null;
        }
      });

      if (isActive) {
        item.classList.remove('active');
        answer.style.maxHeight = null;
      } else {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

/* ==========================================================================
   4. Ações de Contato: Copiar Endereço, vCard & Compartilhar Site
   ========================================================================== */
function initContactActions() {
  const copyAddressBtn = document.getElementById('btnCopyAddress');
  const saveContactBtn = document.getElementById('btnSaveContact');
  const shareSiteBtn = document.getElementById('btnShareSite');

  const addressText = 'Uberlândia - MG • Atendimento Presencial e Online';

  // Copiar Endereço
  if (copyAddressBtn) {
    copyAddressBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(addressText).then(() => {
        showToast('✓ Endereço copiado com sucesso!');
      }).catch(() => {
        showToast('📍 Uberlândia - MG');
      });
    });
  }

  // Salvar Contato como .vcf (vCard compatível com smartphone e desktop)
  if (saveContactBtn) {
    saveContactBtn.addEventListener('click', () => {
      const vcardData = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        'N:Cunha;Matilde;;Terapeuta Integrativa;',
        'FN:Matilde Cunha - Terapeuta Integrativa',
        'ORG:Espaço de Terapia Integrativa Matilde Cunha',
        'TITLE:Terapeuta Integrativa',
        'TEL;TYPE=CELL,VOICE,PREF:+5534999999999',
        'ADR;TYPE=WORK:;;Uberlândia;Uberlândia;MG;;Brasil',
        'EMAIL;TYPE=INTERNET:contato@matildecunha.com.br',
        'URL:https://www.instagram.com/matilde.dcunha/',
        'NOTE:Atendimento de Terapia Integrativa presencial em Uberlândia - MG e online. Instagram: @matilde.dcunha',
        'END:VCARD'
      ].join('\r\n');

      const blob = new Blob([vcardData], { type: 'text/vcard;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Matilde_Cunha_Terapeuta.vcf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('✓ Contato preparado para salvar no seu celular!');
    });
  }

  // Compartilhar Site (Web Share API com fallback)
  if (shareSiteBtn) {
    shareSiteBtn.addEventListener('click', () => {
      const shareData = {
        title: 'Matilde Cunha • Terapeuta Integrativa em Uberlândia – MG',
        text: 'Conheça o espaço acolhedor de terapia integrativa e equilíbrio emocional com Matilde Cunha em Uberlândia – MG:',
        url: window.location.href
      };

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        navigator.share(shareData).catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href).then(() => {
          showToast('✓ Link do site copiado para você compartilhar!');
        }).catch(() => {
          showToast('Link do site: ' + window.location.href);
        });
      }
    });
  }
}

/* ==========================================================================
   5. Sistema de Notificação Toast
   ========================================================================== */
let toastTimeout = null;
function showToast(message) {
  let toast = document.getElementById('systemToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'systemToast';
    toast.className = 'toast-message';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('show');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3600);
}

/* ==========================================================================
   6. Modal LGPD & Política de Privacidade
   ========================================================================== */
function initPrivacyModal() {
  const openLinks = document.querySelectorAll('.open-privacy-modal');
  const modalBackdrop = document.getElementById('privacyModal');
  const closeBtn = document.getElementById('closePrivacyModal');

  if (!modalBackdrop) return;

  openLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      modalBackdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  const closeModal = () => {
    modalBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('open')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   7. Animações de Scroll Suave (IntersectionObserver)
   ========================================================================== */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.reveal-on-scroll');
  if (!elements.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.12
    });

    elements.forEach(el => observer.observe(el));
  } else {
    elements.forEach(el => el.classList.add('revealed'));
  }
}

/* ==========================================================================
   8. Carrossel de Avaliações (Sincronização de Dots e Navegação)
   ========================================================================== */
function initReviewsCarousel() {
  const grid = document.getElementById('reviewsGrid');
  const dots = document.querySelectorAll('.review-dot');
  const prevBtn = document.getElementById('reviewsPrevBtn');
  const nextBtn = document.getElementById('reviewsNextBtn');
  const counterBadge = document.getElementById('reviewsCounterBadge');

  if (!grid || !dots.length) return;

  const cards = grid.querySelectorAll('.review-card');
  if (!cards.length) return;

  function updateActiveUI(activeIdx) {
    const safeIdx = Math.max(0, Math.min(activeIdx, cards.length - 1));
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === safeIdx);
    });
    if (counterBadge) {
      counterBadge.textContent = `${safeIdx + 1} de ${cards.length}`;
    }
  }

  function scrollToIndex(targetIdx) {
    const safeIdx = Math.max(0, Math.min(targetIdx, cards.length - 1));
    const targetCard = cards[safeIdx];
    if (targetCard) {
      const targetLeft = targetCard.offsetLeft - grid.offsetLeft;
      grid.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: 'smooth'
      });
      updateActiveUI(safeIdx);
    }
  }

  // Atualiza dots e contador conforme a rolagem do usuário (touch ou arrasto)
  let scrollTimeout = null;
  grid.addEventListener('scroll', () => {
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const scrollLeft = grid.scrollLeft;
      const cardWidth = cards[0].offsetWidth;
      const gap = 18;
      const calculatedIdx = Math.round(scrollLeft / (cardWidth + gap));
      updateActiveUI(calculatedIdx);
    }, 50);
  }, { passive: true });

  // Clique nos dots para navegar diretamente
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const targetIdx = parseInt(dot.getAttribute('data-index'), 10);
      scrollToIndex(targetIdx);
    });
  });

  // Botão Próximo
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const currentActive = Array.from(dots).findIndex(d => d.classList.contains('active'));
      const nextIdx = (currentActive + 1) % cards.length;
      scrollToIndex(nextIdx);
    });
  }

  // Botão Anterior
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const currentActive = Array.from(dots).findIndex(d => d.classList.contains('active'));
      const prevIdx = (currentActive - 1 + cards.length) % cards.length;
      scrollToIndex(prevIdx);
    });
  }
}

