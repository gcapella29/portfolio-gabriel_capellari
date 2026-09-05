export type LocalizedText={pt:string;en:string};
export type PortfolioLink={name:string;description:LocalizedText;href:string};
export type CareerItem={role:LocalizedText;years:string;organization:string;description:LocalizedText};

export const portfolioDefaults={
  identity:{
    name:'Gabriel Capellari',
    location:'Ibitinga · SP · Brasil',
    role:{pt:'Jornalista de poker · Repórter de torneios ao vivo · Redator SEO · Aprendiz .·.',en:'Poker journalist · Live tournament reporter · SEO writer · Lifelong learner .·.'},
    languages:[{pt:'🇧🇷 Português — nativo',en:'🇧🇷 Portuguese — native'},{pt:'🇬🇧 Inglês — C1',en:'🇬🇧 English — C1'},{pt:'🇪🇸 Espanhol — B1',en:'🇪🇸 Spanish — B1'}]
  },
  ticker:['WSOP Las Vegas','WSOP Brasil','BSOP Millions','LAPT Panamá','BSOP/LAPT Rio','LAPT Montevidéu','WPT World Championship'],
  stats:[
    {number:'4+',label:{pt:'anos de cobertura de poker ao vivo',en:'years covering live poker'}},
    {number:'4',label:{pt:'países cobertos — Brasil · EUA · Panamá · Uruguai',en:'countries covered — Brazil · USA · Panama · Uruguay'}},
    {number:'4',label:{pt:'grandes circuitos — WSOP · WPT · BSOP · LAPT',en:'major circuits — WSOP · WPT · BSOP · LAPT'}},
    {number:'3',label:{pt:'idiomas — Português · Inglês · Espanhol',en:'languages — Portuguese · English · Spanish'}}
  ],
  about:{
    eyebrow:{pt:'Perfil',en:'Profile'},title:{pt:'Da sala de aula aos feltros',en:'From the classroom to the felt'},
    paragraphs:[
      {pt:'Formado em Letras (Português/Inglês) pela UNESP, Gabriel construiu uma carreira que une domínio de idioma, disciplina de sala de aula e faro jornalístico. Foram oito anos ensinando inglês e literatura antes da migração para a cobertura de eventos ao vivo — uma transição que trouxe para o poker o rigor didático e a clareza de quem já formou centenas de alunos.',en:'With a degree in Languages (Portuguese/English) from UNESP, Gabriel built a career that blends language mastery, classroom discipline and journalistic instinct. He spent eight years teaching English and literature before moving into live-event coverage — a transition that brought teaching rigor and clarity to poker journalism.'},
      {pt:'Hoje soma mais de quatro anos cobrindo eventos em países que incluem Brasil, Estados Unidos, Panamá e Uruguai, produzindo conteúdo editorial e SEO para os principais veículos do setor.',en:'He now has more than four years of event coverage across Brazil, the United States, Panama and Uruguay, producing editorial and SEO content for leading outlets in the industry.'}
    ]
  },
  featured:{
    eyebrow:{pt:'Cobertura em destaque',en:'Featured coverage'},title:'WSOP Las Vegas',
    description:{pt:'Quatro edições consecutivas da World Series of Poker em Las Vegas, de 2022 a 2025 — com cobertura também do WPT World Championship em 2022. Experiência internacional em reportagem ao vivo, produção editorial e conteúdo para a audiência brasileira de poker.',en:'Four consecutive editions of the World Series of Poker in Las Vegas, from 2022 to 2025 — also covering the WPT World Championship in 2022. International experience in live reporting, editorial production and content for Brazilian poker audiences.'},
    years:['2022','2023','2024','2025','Las Vegas · EUA']
  },
  coverage:[
    ['WSOP — Las Vegas','2022 · 2023 · 2024 · 2025'],['WSOP & WPT World Championship — Las Vegas','2022'],['WSOP Brasil','2022'],['BSOP Millions','2022 · 2023 · 2025'],['BSOP São Paulo','2023 · 2024'],['BSOP Winter Millions','2023 · 2025 (remoto)'],['BSOP / LAPT Foz do Iguaçu','2023'],['BSOP / LAPT Rio','2024'],['LAPT Montevidéu','2023'],['LAPT Panamá','2024']
  ] as Array<[string,string]>,
  links:[
    {name:'SuperPoker',description:{pt:'Notícias, cobertura ao vivo e entrevistas exclusivas · 2022–2024',en:'News, live coverage and exclusive interviews · 2022–2024'},href:'https://superpoker.com.br/info/staff/gabrielcapellari'},
    {name:'PokerNews',description:{pt:'Conteúdo editorial para o maior veículo de poker do mundo · 2025–2026',en:'Editorial content for the world’s largest poker media outlet · 2025–2026'},href:'https://br.pokernews.com/editores/gabriel-capellari/'},
    {name:'Canalhas Games',description:{pt:'Produção de conteúdo de mídia esportiva',en:'Sports-media content production'},href:'https://www.canalhasgames.com.br/pages/quem-somos'}
  ] as PortfolioLink[],
  career:[
    {role:{pt:'Poker Footage Researcher',en:'Poker Footage Researcher'},years:'2026',organization:'World Series of Poker (WSOP) / GGPoker',description:{pt:'Pesquisei imagens de torneios de poker e documentei mãos-chave, histórias de jogadores e marcações de tempo para apoiar a produção de conteúdo de uma das maiores empresas de mídia de poker do mundo.',en:'Researched poker-tournament footage and documented key hands, player stories and timestamps to support content production for one of the world’s largest poker media companies.'}},
    {role:{pt:'Remote Player Researcher',en:'Remote Player Researcher'},years:'2026',organization:'World Series of Poker (WSOP) / GGPoker',description:{pt:'Pesquisei jogadores profissionais de poker, levantando históricos, destaques de carreira e conquistas relevantes para apoiar a produção de conteúdo.',en:'Researched professional poker players, gathering backgrounds, career highlights and relevant achievements to support content production.'}},
    {role:{pt:'Content Writer',en:'Content Writer'},years:'2025 — 2026',organization:'PokerNews Brasil',description:{pt:'Produzo conteúdo editorial e cobertura jornalística para um dos maiores veículos de poker do mundo, unindo precisão informativa a SEO estratégico.',en:'Produce editorial content and journalistic coverage for one of the world’s largest poker outlets, combining accuracy with strategic SEO.'}},
    {role:{pt:'Copywriter',en:'Copywriter'},years:'2025',organization:'RegLife',description:{pt:'Desenvolvi conteúdo de marketing e editorial voltado à indústria do poker, com foco em conversão e engajamento.',en:'Developed marketing and editorial content for the poker industry, focused on conversion and engagement.'}},
    {role:{pt:'Jornalista / Content Writer',en:'Journalist / Content Writer'},years:'2022 — 2024',organization:'SuperPoker Group',description:{pt:'Conduzi cobertura ao vivo de torneios, entrevistas e produção de notícias para uma das maiores plataformas de mídia de poker do Brasil.',en:'Led live tournament coverage, interviews and news production for one of Brazil’s largest poker media platforms.'}},
    {role:{pt:'Professor de Literatura',en:'Literature Teacher'},years:'2020 — 2022',organization:'Colégio Max Beny Macena',description:{pt:'Lecionei literatura brasileira e portuguesa para turmas do ensino médio.',en:'Taught Brazilian and Portuguese literature to high-school classes.'}},
    {role:{pt:'Corretor de Redação',en:'Essay Evaluator'},years:'2019 — 2021',organization:'ENEM / ENCCEJA',description:{pt:'Avaliei redações de candidatos em exames nacionais, aplicando critérios técnicos de coesão, argumentação e norma culta.',en:'Evaluated candidate essays in national examinations, applying technical standards for cohesion, argumentation and formal language.'}},
    {role:{pt:'Professor de Inglês',en:'English Teacher'},years:'2014 — 2022',organization:'Escola LYVA',description:{pt:'Lecionei inglês para turmas do fundamental ao médio.',en:'Taught English from elementary through high-school levels.'}},
    {role:{pt:'Professor de Inglês',en:'English Teacher'},years:'2017 — 2022',organization:'Escola EDUCARE',description:{pt:'Conduzi aulas de inglês para o ensino fundamental.',en:'Taught English in elementary school.'}},
    {role:{pt:'Assistente de Laboratório de TI',en:'IT Lab Assistant'},years:'2011 — 2013',organization:'Prescon Informática Assessoria LTDA',description:{pt:'Prestei suporte técnico e apoio operacional em laboratórios de informática.',en:'Provided technical and operational support in computer labs.'}}
  ] as CareerItem[],
  education:[['Bacharelado e Licenciatura em Letras (Português/Inglês)','UNESP — Araraquara · 2018/2019'],['Técnico em Informática','Centro Paula Souza — ETEC Ibitinga · 2010'],['Certificação em SEO Best Practices','Better Collective · 2024']] as Array<[string,string]>,
  skills:['Inglês C1','Espanhol B1','SEO','Cobertura ao vivo','ChatGPT · Gemini · Claude','Canva','CapCut','Google Workspace','Microsoft Office','CNH categoria AB'],
  media:{hero:'/assets/media/hero-gabriel.jpg',about:'/assets/media/about-gabriel.jpg',profile:'/assets/media/portfolio-gabriel.jpg',instagram:'/assets/media/instagram-gabriel.jpg',contact:'/assets/media/contact-gabriel.jpg',wsop:['/assets/media/wsop-01.jpg','/assets/media/wsop-02.jpg','/assets/media/wsop-03.png','/assets/media/wsop-04.jpg','/assets/media/wsop-05.jpg','/assets/media/wsop-06.jpg','/assets/media/wsop-07.jpg']},
  contact:{email:'gcapellari@hotmail.com',emailAlt:'gcapellari1@gmail.com',whatsapp:'5516997168229',whatsappLabel:'+55 16 99716-8229',instagram:'gabrielcapellari',linkedin:'https://www.linkedin.com/in/gabriel-capellari-5347ba14b/',reel:'https://www.instagram.com/p/DZK3eH_uRzP/embed',cv:'/legacy-portfolio/CV-Gabriel-Capellari.pdf'}
};
