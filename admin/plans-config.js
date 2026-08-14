(() => {
  window.WebAppCapPlans = {
    essential: {
      name: 'Essencial',
      description: 'Presença profissional simples e segura.',
      limits: {
        client_users: 1,
        custom_domain: false,
        templates: false,
        advanced_theme: false,
        media_gallery: 8
      }
    },
    pro: {
      name: 'Pro',
      description: 'Site completo para profissionais e pequenos negócios.',
      limits: {
        client_users: 1,
        custom_domain: true,
        templates: true,
        advanced_theme: true,
        media_gallery: 20
      }
    },
    business: {
      name: 'Business',
      description: 'Mais usuários, flexibilidade e operação para equipes.',
      limits: {
        client_users: 5,
        custom_domain: true,
        templates: true,
        advanced_theme: true,
        media_gallery: 60
      }
    }
  };

  window.WebAppCapPlanLabel = code =>
    window.WebAppCapPlans[code]?.name || code || 'Não definido';
})();