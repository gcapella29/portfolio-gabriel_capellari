export type LocalizedText={pt:string;en:string};
export type PortfolioLink={name:string;description:LocalizedText;href:string};
export type CareerItem={role:LocalizedText;years:string;organization:string;description:LocalizedText};

export const portfolioDefaults={
  identity:{
    name:'Gabriel Capellari',
    location:'Ibitinga · SP · BR',
    role:{pt:'Jornalista de Poker · Professor · Redator · Curioso · Aprendiz .\'.',en:'Poker journalist · Live tournament reporter · SEO writer · Learner .·.'},
    languages:[{country:'br',pt:'Português — nativo',en:'Portuguese — native'},{country:'gb',pt:'Inglês — B2',en:'English — B2'},{country:'es',pt:'Espanhol — C2',en:'Spanish — C2'}]
  },
  ticker:['WSOP Las Vegas','WSOP Brasil','BSOP Millions','LAPT Panamá','BSOP/LAPT Rio','LAPT Montevidéu','WPT World Championship'],
  stats:[
    {number:'4+',label:{pt:'anos de cobertura de poker ao vivo',en:'years covering live poker'}},
    {number:'4',label:{pt:'países cobertos — Brasil · EUA · Panamá · Uruguai',en:'countries covered — Brazil · USA · Panama · Uruguay'}},
    {number:'4',label:{pt:'grandes circuitos — WSOP · WPT · BSOP · LAPT',en:'major circuits — WSOP · WPT · BSOP · LAPT'}},
    {number:'3',label:{pt:'idiomas — Português · Inglês (B2) · Espanhol (C2)',en:'languages — Portuguese · English (B2) · Spanish (C2)'}}
  ],
  about:{
    eyebrow:{pt:'Perfil',en:'Profile'},title:{pt:'Da sala de aula aos grandes feltros do mundo',en:'From the classroom to the world’s greatest felt tables'},
    paragraphs:[
      {pt:'Formado em Letras (Português/Inglês) pela Universidade Estadual Paulista - UNESP, construí minha carreira misturando o estudo dos idiomas, a experiência em sala de aula e, posteriormente, o olhar jornalístico. Foram oito anos ensinando inglês e dois como professor de literatura brasileira antes de migrar para a cobertura de eventos ao vivo e redação de artigos jornalísticos especializados em poker.',en:'With a degree in Languages (Portuguese/English) from UNESP, I built my career by combining language study, classroom experience and, later, a journalistic perspective. I taught English for eight years and Brazilian literature for two before moving into live-event coverage and specialized poker journalism.'},
      {pt:'No poker, trouxe comigo muito do que aprendi como professor: didática, clareza e atenção aos detalhes, habilidades desenvolvidas ao longo de anos trabalhando com centenas de alunos. Hoje, já são mais de quatro anos cobrindo eventos em países como Brasil, Estados Unidos, Panamá e Uruguai, produzindo conteúdo editorial e SEO para alguns dos principais veículos do setor.',en:'In poker, I brought much of what I learned as a teacher: clarity, attention to detail and an educational approach developed over years working with hundreds of students. I now have more than four years covering events in Brazil, the United States, Panama and Uruguay, producing editorial and SEO content for leading outlets in the industry.'}
    ]
  },
  featured:{
    eyebrow:{pt:'Cobertura em destaque',en:'Featured coverage'},title:'WSOP Las Vegas',
    description:{pt:'Quatro edições consecutivas da World Series of Poker em Las Vegas, de 2022 a 2025 — com cobertura também do WPT World Championship em 2022. Experiência internacional em reportagem ao vivo, produção editorial e conteúdo para a audiência brasileira de poker.',en:'Four consecutive editions of the World Series of Poker in Las Vegas, from 2022 to 2025 — also covering the WPT World Championship in 2022. International experience in live reporting, editorial production and content for Brazilian poker audiences.'},
    years:[{pt:'2022',en:'2022'},{pt:'2023',en:'2023'},{pt:'2024',en:'2024'},{pt:'2025',en:'2025'},{pt:'Las Vegas · EUA',en:'Las Vegas · USA'}]
  },
  coverage:[
    ['WSOP — Las Vegas','2022 · 2023 · 2024 · 2025'],['WSOP & WPT World Championship — Las Vegas','2022'],['WSOP Brasil','2022'],['BSOP Millions','2022 · 2023 · 2025'],['BSOP São Paulo','2023 · 2024'],['BSOP Winter Millions','2023 · 2025 (remoto)'],['BSOP / LAPT Foz do Iguaçu','2023'],['BSOP / LAPT Rio','2024'],['LAPT Montevidéu','2023'],['LAPT Panamá','2024']
  ] as Array<[string,string]>,
  links:[
    {name:'SuperPoker',description:{pt:'Notícias, cobertura ao vivo e entrevistas exclusivas · 2022–2024',en:'News, live coverage and exclusive interviews · 2022–2024'},href:'https://superpoker.com.br/info/staff/gabrielcapellari'},
    {name:'PokerNews',description:{pt:'Conteúdo editorial para o maior veículo de poker do mundo · 2025–2026',en:'Editorial content for the world’s largest poker media outlet · 2025–2026'},href:'https://br.pokernews.com/editores/gabriel-capellari/'},
    {name:'Canalhas Games',description:{pt:'Produção de conteúdo de mídia e-sports',en:'E-sports media content production'},href:'https://www.canalhasgames.com.br/pages/quem-somos'}
  ] as PortfolioLink[],
  career:[
    {role:{pt:'Poker Footage Researcher',en:'Poker Footage Researcher'},years:'2026',organization:'World Series of Poker (WSOP) / GGPoker',description:{pt:'Pesquisei imagens de torneios de poker e documentei mãos-chave, histórias de jogadores e marcações de tempo para apoiar a produção de conteúdo de uma das maiores empresas de mídia de poker do mundo.',en:'Researched poker-tournament footage and documented key hands, player stories and timestamps to support content production for one of the world’s largest poker media companies.'}},
    {role:{pt:'Remote Player Researcher',en:'Remote Player Researcher'},years:'2026',organization:'World Series of Poker (WSOP) / GGPoker',description:{pt:'Pesquisei jogadores profissionais de poker, levantando históricos, destaques de carreira e conquistas relevantes para apoiar a produção de conteúdo.',en:'Researched professional poker players, gathering backgrounds, career highlights and relevant achievements to support content production.'}},
    {role:{pt:'Content Writer',en:'Content Writer'},years:'2025 — 2026',organization:'PokerNews Brasil',description:{pt:'Produzo conteúdo editorial e cobertura jornalística para um dos maiores veículos de poker do mundo, unindo precisão informativa a SEO estratégico.',en:'Produce editorial content and journalistic coverage for one of the world’s largest poker outlets, combining accuracy with strategic SEO.'}},
    {role:{pt:'Copywriter',en:'Copywriter'},years:'2025',organization:'RegLife',description:{pt:'Desenvolvi conteúdo de marketing e editorial voltado à indústria do poker, com foco em conversão e engajamento.',en:'Developed marketing and editorial content for the poker industry, focused on conversion and engagement.'}},
    {role:{pt:'Jornalista / Content Writer',en:'Journalist / Content Writer'},years:'2022 — 2024',organization:'SuperPoker Group',description:{pt:'Conduzi cobertura ao vivo de torneios, entrevistas e produção de notícias para uma das maiores plataformas de mídia de poker do Brasil, consolidando presença editorial no setor.',en:'Led live tournament coverage, interviews and news production for one of Brazil’s largest poker media platforms, building a strong editorial presence in the sector.'}},
    {role:{pt:'Professor de Literatura (Ensino Médio)',en:'High School Literature Teacher'},years:'2020 — 2022',organization:'Colégio Max Beny Macena',description:{pt:'Lecionei literatura brasileira e portuguesa para turmas do ensino médio, desenvolvendo habilidades de comunicação e didática que hoje sustentam meu trabalho como redator e repórter.',en:'Taught Brazilian and Portuguese literature to high-school classes, developing the communication and teaching skills that now support my work as a writer and reporter.'}},
    {role:{pt:'Corretor de Redação',en:'Essay Evaluator'},years:'2019 — 2021',organization:'ENEM / ENCCEJA',description:{pt:'Avaliei redações de candidatos em exames nacionais, aplicando critérios técnicos de coesão, argumentação e norma culta.',en:'Evaluated candidate essays in national examinations, applying technical standards for cohesion, argumentation and formal language.'}},
    {role:{pt:'Professor de Inglês',en:'English Teacher'},years:'2014 — 2022',organization:'Escola LYVA',description:{pt:'Lecionei inglês para turmas do fundamental ao médio, aplicando o domínio do idioma que hoje utilizo no jornalismo internacional.',en:'Taught English from elementary through high-school levels, applying the language skills I now use in international journalism.'}},
    {role:{pt:'Professor de Inglês',en:'English Teacher'},years:'2017 — 2022',organization:'Escola EDUCARE',description:{pt:'Conduzi aulas de inglês para o ensino fundamental, reforçando fundamentos de leitura, escrita e conversação.',en:'Taught English in elementary school, reinforcing foundations of reading, writing and conversation.'}},
    {role:{pt:'Assistente de Laboratório de TI',en:'IT Lab Assistant'},years:'2011 — 2013',organization:'Prescon Informática Assessoria LTDA',description:{pt:'Prestei suporte técnico e apoio operacional em laboratórios de informática.',en:'Provided technical and operational support in computer labs.'}}
  ] as CareerItem[],
  education:[[{pt:'Bacharelado e Licenciatura em Letras (Português/Inglês)',en:'Bachelor’s and Teaching Degree in Languages (Portuguese/English)'},'UNESP — Araraquara · 2018/2019'],[{pt:'Técnico em Informática',en:'IT Technician'},'Centro Paula Souza — ETEC Ibitinga · 2010'],[{pt:'Certificação em SEO Best Practices',en:'SEO Best Practices Certification'},'Better Collective · 2024']] as Array<[LocalizedText,string]>,
  skills:[{pt:'Inglês B2',en:'English B2'},{pt:'Espanhol C2',en:'Spanish C2'},{pt:'SEO',en:'SEO'},{pt:'Cobertura ao vivo',en:'Live reporting'},{pt:'ChatGPT · Gemini · Claude',en:'ChatGPT · Gemini · Claude'},{pt:'Canva',en:'Canva'},{pt:'CapCut',en:'CapCut'},{pt:'Google Workspace',en:'Google Workspace'},{pt:'Microsoft Office',en:'Microsoft Office'},{pt:'CNH categoria AB',en:'Brazilian driver’s license — AB'}],
  galleryMeta:[
    {year:'2022',alt:{pt:'Gabriel Capellari na WSOP Las Vegas em 2022',en:'Gabriel Capellari at the 2022 WSOP in Las Vegas'}},
    {year:'2022',alt:{pt:'Gabriel Capellari trabalhando na cobertura da WSOP Las Vegas em 2022',en:'Gabriel Capellari reporting from the 2022 WSOP in Las Vegas'}},
    {year:'2023',alt:{pt:'Gabriel Capellari na equipe de cobertura da WSOP Las Vegas em 2023',en:'Gabriel Capellari with the reporting team at the 2023 WSOP in Las Vegas'}},
    {year:'2024',alt:{pt:'Gabriel Capellari durante a cobertura da WSOP Las Vegas em 2024',en:'Gabriel Capellari during coverage of the 2024 WSOP in Las Vegas'}},
    {year:'2025',alt:{pt:'Gabriel Capellari trabalhando com produção de vídeo na WSOP Las Vegas em 2025',en:'Gabriel Capellari working on video production at the 2025 WSOP in Las Vegas'}},
    {year:'2025',alt:{pt:'Gabriel Capellari realizando uma entrevista na WSOP Las Vegas em 2025',en:'Gabriel Capellari conducting an interview at the 2025 WSOP in Las Vegas'}},
    {year:'2025',alt:{pt:'Gabriel Capellari trabalhando no salão da WSOP Las Vegas em 2025',en:'Gabriel Capellari working on the tournament floor at the 2025 WSOP in Las Vegas'}}
  ],
  media:{hero:'/assets/media/hero-gabriel.jpg',about:'/assets/media/about-gabriel.jpg',profile:'/assets/media/portfolio-gabriel.jpg',instagram:'/assets/media/instagram-gabriel.jpg',contact:'/assets/media/contact-gabriel.jpg',wsop:['/assets/media/wsop-01.jpg','/assets/media/wsop-02.jpg','/assets/media/wsop-03.png','/assets/media/wsop-04.jpg','/assets/media/wsop-05.jpg','/assets/media/wsop-06.jpg','/assets/media/wsop-07.jpg']},
  contact:{email:'gcapellari@hotmail.com',emailAlt:'gcapellari1@gmail.com',whatsapp:'5516997168229',whatsappLabel:'+55 16 99716-8229',instagram:'gabrielcapellari',linkedin:'https://www.linkedin.com/in/gabriel-capellari-5347ba14b/',reel:'https://www.instagram.com/p/DZK3eH_uRzP/embed',cv:'/legacy-portfolio/CV-Gabriel-Capellari.pdf'}
};
