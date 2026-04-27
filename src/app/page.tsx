'use client';

import React from 'react';
import Image from 'next/image';
import HeroNexus from '@/components/HeroNexus';
import { HeroScrollDemo } from '@/components/HeroScroll';
import { InteractiveButton } from '@/components/ui/interactive-button';
import { Accordion } from '@/components/ui/accordion';
import Lenis from 'lenis';
import './styles/Home.css';
import {
  useScroll,
  useTransform,
  motion,
  AnimatePresence,
  useMotionValueEvent,
  useInView,
} from 'framer-motion';

const steps = [
  {
    number: "01",
    label: "Primeiro passo",
    title: "Agendamento simples",
    description: "Contato direto pelo WhatsApp para escolher o melhor horário.",
  },
  {
    number: "02",
    label: "Segundo passo",
    title: "Atendimento acolhedor",
    description: "Tempo reservado para ouvir a família e explicar com calma.",
  },
  {
    number: "03",
    label: "Terceiro passo",
    title: "Plano de cuidado claro",
    description: "Se houver indicação cirúrgica, a família entende cada passo do processo.",
  },
  {
    number: "04",
    label: "Quarto passo",
    title: "Acompanhamento próximo",
    description: "Seguimento antes, durante e após o procedimento, para garantir segurança.",
  }
];

import { ZoomParallax } from '@/components/ui/zoom-parallax';

function CountUp({ to, prefix = '', duration = 1.8 }: { to: number; prefix?: string; duration?: number }) {
  const [count, setCount] = React.useState(0);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  React.useEffect(() => {
    if (!isInView) return;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - startTime) / (duration * 1000);
      const eased = 1 - Math.pow(1 - Math.min(elapsed, 1), 3);
      setCount(Math.floor(eased * to));
      if (elapsed < 1) requestAnimationFrame(tick);
      else setCount(to);
    };
    requestAnimationFrame(tick);
  }, [isInView, to, duration]);

  return <span ref={ref}>{prefix}{count}</span>;
}

export default function Home() {
  const roadmapContainerRef = React.useRef(null);
  const [activeStep, setActiveStep] = React.useState(0);
  
  const { scrollYProgress } = useScroll({
    target: roadmapContainerRef,
    offset: ["start start", "end end"]
  });

  const manifestoImages = [
    { src: '/images/dra-com-paciente.png', alt: 'Dra. Rayanna com paciente', objectPosition: 'top center' },
    { src: '/images/dra-exame.png', alt: 'Dra. Rayanna analisando exame', objectPosition: 'top center' },
    { src: '/images/dra-escrevendo.png', alt: 'Dra. Rayanna no consultório', objectPosition: 'top center' },
    { src: '/images/dra-consultorio.png', alt: 'Dra. Rayanna', objectPosition: 'top center' },
    { src: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=900&h=900&fit=crop&crop=center&auto=format&q=80', alt: 'Criança feliz' },
    { src: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=1280&h=720&fit=crop&crop=center&auto=format&q=80', alt: 'Crianças brincando' },
    { src: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1280&h=720&fit=crop&crop=center&auto=format&q=80', alt: 'Criança na sala de aula' },
  ];

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // latest goes from 0 to 1
    if (latest < 0.2) setActiveStep(0);
    else if (latest < 0.45) setActiveStep(1);
    else if (latest < 0.7) setActiveStep(2);
    else setActiveStep(3);
  });

  React.useEffect(() => {
    const lenis = new Lenis();
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  return (
    <main>
      <HeroNexus />

      <HeroScrollDemo />

      {/* Seção Manifesto com Zoom Parallax */}
      <section id="manifesto" className="bg-white" style={{ padding: 0, display: 'block' }}>
        <div className="py-10 sm:py-20 text-center">
          <h2 className="text-2xl sm:text-4xl md:text-6xl font-bold max-w-4xl mx-auto leading-tight px-4">
            Medo não se resolve com remédio, se resolve com <span className="manifestoHighlight">confiança.</span>
          </h2>
        </div>

        <ZoomParallax
          images={manifestoImages}
          overlayContent={
            <div className="max-w-[700px] text-center px-5 py-8 sm:px-10 sm:py-14 rounded-2xl sm:rounded-3xl" style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(8px)' }}>
              <div className="text-gray-600 text-sm sm:text-base md:text-xl leading-relaxed space-y-3 sm:space-y-6">
                <p>Em 21 anos de experiência como cirurgiã pediátrica, aprendi que o maior medo dos pais não é tanto a doença em si. É não entender o que está acontecendo com o filho e não saber em quem confiar.</p>
                <p>Isso não precisa ser assim. Uma família bem informada passa por esse processo com tranquilidade. E a decisão certa só é possível quando há informação, escuta e confiança.</p>
                <p className="font-semibold text-gray-800">No meu consultório, estarei ao seu lado em cada etapa.</p>
              </div>
              <div className="mt-10">
                <InteractiveButton
                  text="Agende uma consulta"
                  href="https://wa.me/557181551023?text=Olá!%20Vim%20do%20site%20e%20gostaria%20de%20saber%20mais"
                  target="_blank"
                />
              </div>
            </div>
          }
        />
      </section>

      {/* Dobra 3: Roadmap (Sticky Editorial Style) */}
      <section id="metodo" className="roadmap" ref={roadmapContainerRef}>
        <div className="roadmapHeader">
          <div className="container">
            <span className="badge">O Caminho</span>
            <h2>Acompanhamento completo do início ao fim</h2>
          </div>
        </div>
        
        <div className="stickyContainer">
          <div className="stickyWrapper">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeStep}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="editorialStep"
              >
                <div className="stepBgNumber">{steps[activeStep].number}</div>
                <div className="stepContent">
                  <div className="stepLine"></div>
                  <span className="stepLabel">{steps[activeStep].label}</span>
                  <h3>{steps[activeStep].title}</h3>
                  <p>{steps[activeStep].description}</p>
                  
                  {activeStep === 3 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="stepButtons"
                    >
                      <InteractiveButton 
                        text="Agende uma consulta" 
                        href="https://wa.me/557181551023?text=Olá!%20Vim%20do%20site%20e%20gostaria%20de%20saber%20mais" 
                        target="_blank"
                      />
                      <InteractiveButton 
                        text="Saiba mais" 
                        variant="secondary"
                        href="#quem-sou"
                      />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>



      {/* Dobra 4: Bio */}
      <section id="quem-sou" className="!py-16 !px-5 sm:!py-[120px] overflow-hidden" style={{ background: 'var(--color-warm-ivory)' }}>
        <div className="container" style={{ maxWidth: 'var(--max-width)', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }} className="bioResponsive">

            {/* Foto */}
            <motion.div
              style={{ position: 'relative' }}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
            >
              {/* Bloco decorativo atrás da foto */}
              <div style={{
                position: 'absolute', top: '24px', left: '24px',
                width: '100%', height: '100%',
                borderRadius: '28px',
                background: 'var(--color-forest-teal)',
                opacity: 0.12,
              }} />

              {/* Container da foto */}
              <div style={{ position: 'relative', borderRadius: '28px', overflow: 'hidden', aspectRatio: '4/5' }}>
                <Image
                  src="/images/bio-doctor.png"
                  alt="Dra. Rayanna Almeida"
                  fill
                  style={{ objectFit: 'cover', objectPosition: 'top center' }}
                />
                {/* Gradiente sutil na base */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(42,127,111,0.18) 0%, transparent 50%)',
                }} />
              </div>

              {/* Card flutuante de credenciais */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
                style={{
                  position: 'absolute', bottom: '20px', right: '12px',
                  background: 'white',
                  borderRadius: '18px',
                  padding: '18px 26px',
                  boxShadow: '0 24px 60px rgba(0,0,0,0.10)',
                  display: 'flex', flexDirection: 'column', gap: '4px',
                }}
              >
                <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-forest-teal)' }}>Registro Médico</p>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-main)' }}>CRM-BA 13105</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-main)', opacity: 0.5 }}>RQE 6558 · 6458</p>
              </motion.div>
            </motion.div>

            {/* Conteúdo */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              {/* Label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
                <div style={{ width: '36px', height: '2px', background: 'var(--color-forest-teal)', borderRadius: '2px' }} />
                <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-forest-teal)' }}>Quem sou eu</span>
              </div>

              {/* Nome */}
              <h2 style={{
                fontFamily: 'var(--font-accent)',
                fontSize: 'clamp(2.8rem, 4vw, 3.8rem)',
                fontWeight: 700,
                color: 'var(--color-text-main)',
                lineHeight: 1.05,
                marginBottom: '32px',
                letterSpacing: '-0.02em',
              }}>
                Dra. Rayanna<br />Almeida
              </h2>

              {/* Divisor */}
              <div style={{ width: '56px', height: '3px', background: 'linear-gradient(to right, var(--color-forest-teal), transparent)', borderRadius: '2px', marginBottom: '32px' }} />

              {/* Texto */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '48px' }}>
                <p style={{ color: 'var(--color-text-main)', opacity: 0.72, lineHeight: 1.85, fontSize: '1rem' }}>
                  Sou médica há 27 anos e cirurgiã pediátrica há quase 21. Nesse tempo, operei, acompanhei e orientei centenas de famílias em Salvador no Hospital da Irmã Dulce e na Maternidade de Referência.
                </p>
                <p style={{ color: 'var(--color-text-main)', opacity: 0.72, lineHeight: 1.85, fontSize: '1rem' }}>
                  Hoje atendo em Salvador, nas clínicas Geort e Vita Salute, levando para o consultório particular a mesma seriedade e cuidado que aprendi nos anos de hospital.
                </p>
              </div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.7 }}
                style={{
                  display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '2px',
                  marginBottom: '48px',
                  background: 'rgba(42,127,111,0.08)',
                  borderRadius: '20px',
                  overflow: 'hidden',
                }}
              >
                {[
                  { to: 27, prefix: '',  label: 'anos de medicina' },
                  { to: 21, prefix: '+', label: 'anos em cirurgia pediátrica' },
                  { to: 100, prefix: '', label: 'famílias atendidas' },
                ].map((stat, i) => (
                  <div key={i} style={{
                    background: 'white',
                    padding: '24px 16px',
                    textAlign: 'center',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '2.2rem',
                      fontWeight: 700,
                      color: 'var(--color-forest-teal)',
                      lineHeight: 1,
                    }}>
                      <CountUp to={stat.to} prefix={stat.prefix} />
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--color-text-main)', opacity: 0.55, lineHeight: 1.4, textAlign: 'center' }}>{stat.label}</span>
                  </div>
                ))}
              </motion.div>

              <InteractiveButton
                text="Conhecer Clínica"
                href="https://wa.me/557181551023?text=Olá!%20Vim%20do%20site%20e%20gostaria%20de%20saber%20mais"
                target="_blank"
              />
            </motion.div>

          </div>
        </div>
      </section>

      {/* Dobra 5: FAQ */}
      <section id="faq" className="faq">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span className="badge">FAQ</span>
            <h2>Perguntas Frequentes</h2>
            <p className="max-w-2xl mx-auto opacity-70">
              Caso ainda tenha dúvidas sobre o atendimento ou procedimentos, <a href="https://wa.me/557181551023?text=Olá!%20Vim%20do%20site%20e%20gostaria%20de%20saber%20mais" style={{ color: 'var(--color-forest-teal)', fontWeight: '600', textDecoration: 'underline' }}>entre em contato</a>.
            </p>
          </div>
          
          <Accordion 
            items={[
              {
                question: "Como faço para agendar uma consulta?",
                answer: "O agendamento é feito de forma direta e humanizada através do nosso WhatsApp. Não é necessário encaminhamento médico para a primeira avaliação."
              },
              {
                question: "A consulta atende por convênio?",
                answer: "O atendimento no consultório é focado na exclusividade e tempo de qualidade, sendo realizado de forma particular. Entre em contato para saber sobre valores e como funciona o sistema de reembolso do seu convênio."
              },
              {
                question: "Quais procedimentos a Dra. Rayanna realiza?",
                answer: "Especialista em cirurgia pediátrica geral e urologia pediátrica. Casos comuns incluem fimose, hérnias (inguinal e umbilical), testículo não descido (criptorquidia) e outras malformações congênitas."
              },
              {
                question: "Onde são realizadas as cirurgias?",
                answer: "As cirurgias são realizadas nos principais hospitais de Salvador, garantindo toda a infraestrutura e segurança necessária para o seu filho."
              }
            ]}
          />
        </div>
      </section>

      {/* Dobra 6: Onde atende? */}
      <section id="locais" className="locations">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span className="badge">Unidades</span>
            <h2>Onde encontrar a Dra. Rayanna</h2>
            <p className="max-w-2xl mx-auto opacity-70">Consultórios preparados para receber sua família com conforto e segurança.</p>
          </div>
          
          <div className="locationGrid" style={{ gridTemplateColumns: '1fr', maxWidth: '520px', margin: '0 auto' }}>
            <div className="locationCard">
              <div className="locationHeader">
                <span className="cityBadge">Salvador</span>
                <h3>Clínica Geort / Vita Salute</h3>
              </div>
              <p>Atendimento especializado no Memorial e na Clínica Vita Salute, com foco em acolhimento e diagnóstico preciso.</p>
              <div className="locationActions" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <a href="https://maps.app.goo.gl/iPaU3YSQBfE3cdSY6" target="_blank" rel="noopener noreferrer" className="locationLink">Ver no Mapa →</a>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-main)', opacity: 0.55, marginTop: '4px', marginBottom: 0 }}>Clínica Vita - Medicina Inteligente</p>
                </div>
                <div>
                  <a href="https://share.google/W14ZMfUM9K8zzfw0v" target="_blank" rel="noopener noreferrer" className="locationLink">Ver no Mapa →</a>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-main)', opacity: 0.55, marginTop: '4px', marginBottom: 0 }}>Geort Clínica Especialidades Médicas</p>
                </div>
              </div>
            </div>

          </div>

          <div style={{ textAlign: 'center', marginTop: '80px' }}>
             <InteractiveButton
               text="Agendar meu horário"
               href="https://wa.me/557181551023?text=Olá!%20Vim%20do%20site%20e%20gostaria%20de%20saber%20mais"
               target="_blank"
             />
          </div>
        </div>
      </section>

      <footer className="bg-white py-10 text-center border-t border-gray-100 text-gray-500 text-sm">
        <p>© 2026 Dra. Rayanna Almeida. Todos os direitos reservados.</p>
      </footer>
    </main>
  );
}
