"use client";

import React, {
    useEffect,
    useRef,
    useState,
    useCallback,
    forwardRef,
    useImperativeHandle,
    useMemo,
    type ReactNode,
    type MouseEvent as ReactMouseEvent,
    type SVGProps,
} from 'react';
import {
    motion,
    AnimatePresence,
    useScroll,
    useMotionValueEvent,
    useAnimation,
    type Transition,
    type VariantLabels,
    type Target,
    type TargetAndTransition,
    type Variants,
} from 'framer-motion';

type AnimationControls = ReturnType<typeof useAnimation>;
import Image from 'next/image';
import { InteractiveButton } from './ui/interactive-button';

function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(" ");
}

interface RotatingTextRef {
  next: () => void;
  previous: () => void;
  jumpTo: (index: number) => void;
  reset: () => void;
}

interface RotatingTextProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof motion.span>,
    "children" | "transition" | "initial" | "animate" | "exit"
  > {
  texts: string[];
  transition?: Transition;
  initial?: boolean | Target | VariantLabels;
  animate?: boolean | VariantLabels | AnimationControls | TargetAndTransition;
  exit?: Target | VariantLabels;
  animatePresenceMode?: "sync" | "wait";
  animatePresenceInitial?: boolean;
  rotationInterval?: number;
  staggerDuration?: number;
  staggerFrom?: "first" | "last" | "center" | "random" | number;
  loop?: boolean;
  auto?: boolean;
  splitBy?: "characters" | "words" | "lines" | string;
  onNext?: (index: number) => void;
  mainClassName?: string;
  splitLevelClassName?: string;
  elementLevelClassName?: string;
}

const RotatingText = forwardRef<RotatingTextRef, RotatingTextProps>(
  (
    {
      texts,
      transition = { type: "spring", damping: 25, stiffness: 300 },
      initial = { y: "100%", opacity: 0 },
      animate = { y: 0, opacity: 1 },
      exit = { y: "-120%", opacity: 0 },
      animatePresenceMode = "wait",
      animatePresenceInitial = false,
      rotationInterval = 2200,
      staggerDuration = 0.01,
      staggerFrom = "last",
      loop = true,
      auto = true,
      splitBy = "characters",
      onNext,
      mainClassName,
      splitLevelClassName,
      elementLevelClassName,
      ...rest
    },
    ref
  ) => {
    const [currentTextIndex, setCurrentTextIndex] = useState<number>(0);

    const splitIntoCharacters = (text: string): string[] => {
      if (typeof Intl !== "undefined" && Intl.Segmenter) {
        try {
           const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
           return Array.from(segmenter.segment(text), (segment) => segment.segment);
        } catch (error) {
           console.error("Intl.Segmenter failed, falling back to simple split:", error);
           return text.split('');
        }
      }
      return text.split('');
    };

    const elements = useMemo(() => {
        const currentText: string = texts[currentTextIndex] ?? '';
        if (splitBy === "characters") {
            const words = currentText.split(/(\s+)/);
            let charCount = 0;
            return words.filter(part => part.length > 0).map((part) => {
                const isSpace = /^\s+$/.test(part);
                const chars = isSpace ? [part] : splitIntoCharacters(part);
                const startIndex = charCount;
                charCount += chars.length;
                return { characters: chars, isSpace: isSpace, startIndex: startIndex };
            });
        }
        if (splitBy === "words") {
            return currentText.split(/(\s+)/).filter(word => word.length > 0).map((word, i) => ({
                characters: [word], isSpace: /^\s+$/.test(word), startIndex: i
            }));
        }
        if (splitBy === "lines") {
            return currentText.split('\n').map((line, i) => ({
                characters: [line], isSpace: false, startIndex: i
            }));
        }
        return currentText.split(splitBy).map((part, i) => ({
            characters: [part], isSpace: false, startIndex: i
        }));
    }, [texts, currentTextIndex, splitBy]);

    const totalElements = useMemo(() => elements.reduce((sum, el) => sum + el.characters.length, 0), [elements]);

    const getStaggerDelay = useCallback(
      (index: number, total: number): number => {
        if (total <= 1 || !staggerDuration) return 0;
        const stagger = staggerDuration;
        switch (staggerFrom) {
          case "first": return index * stagger;
          case "last": return (total - 1 - index) * stagger;
          case "center":
            const center = (total - 1) / 2;
            return Math.abs(center - index) * stagger;
          case "random": return Math.random() * (total - 1) * stagger;
          default:
            if (typeof staggerFrom === 'number') {
              const fromIndex = Math.max(0, Math.min(staggerFrom, total - 1));
              return Math.abs(fromIndex - index) * stagger;
            }
            return index * stagger;
        }
      },
      [staggerFrom, staggerDuration]
    );

    const handleIndexChange = useCallback(
      (newIndex: number) => {
        setCurrentTextIndex(newIndex);
        onNext?.(newIndex);
      },
      [onNext]
    );

    const next = useCallback(() => {
      const nextIndex = currentTextIndex === texts.length - 1 ? (loop ? 0 : currentTextIndex) : currentTextIndex + 1;
      if (nextIndex !== currentTextIndex) handleIndexChange(nextIndex);
    }, [currentTextIndex, texts.length, loop, handleIndexChange]);

    const previous = useCallback(() => {
      const prevIndex = currentTextIndex === 0 ? (loop ? texts.length - 1 : currentTextIndex) : currentTextIndex - 1;
      if (prevIndex !== currentTextIndex) handleIndexChange(prevIndex);
    }, [currentTextIndex, texts.length, loop, handleIndexChange]);

    const jumpTo = useCallback(
      (index: number) => {
        const validIndex = Math.max(0, Math.min(index, texts.length - 1));
        if (validIndex !== currentTextIndex) handleIndexChange(validIndex);
      },
      [texts.length, currentTextIndex, handleIndexChange]
    );

     const reset = useCallback(() => {
        if (currentTextIndex !== 0) handleIndexChange(0);
     }, [currentTextIndex, handleIndexChange]);

    useImperativeHandle(ref, () => ({ next, previous, jumpTo, reset }), [next, previous, jumpTo, reset]);

    useEffect(() => {
      if (!auto || texts.length <= 1) return;
      const intervalId = setInterval(next, rotationInterval);
      return () => clearInterval(intervalId);
    }, [next, rotationInterval, auto, texts.length]);

    return (
      <motion.span
        className={cn("inline-flex flex-wrap whitespace-pre-wrap relative align-bottom pb-[10px]", mainClassName)}
        {...rest}
      >
        <span className="sr-only">{texts[currentTextIndex]}</span>
        <AnimatePresence mode={animatePresenceMode} initial={animatePresenceInitial}>
          <motion.div
            key={currentTextIndex}
            className={cn(
               "inline-flex flex-wrap relative",
               splitBy === "lines" ? "flex-col items-start w-full" : "flex-row items-baseline"
            )}
            layout
            aria-hidden="true"
            initial="initial"
            animate="animate"
            exit="exit"
          >
             {elements.map((elementObj, elementIndex) => (
                <span
                    key={elementIndex}
                    className={cn("inline-flex", splitBy === 'lines' ? 'w-full' : '', splitLevelClassName)}
                    style={{ whiteSpace: 'pre' }}
                >
                    {elementObj.characters.map((char, charIndex) => {
                        const globalIndex = elementObj.startIndex + charIndex;
                        return (
                            <motion.span
                                key={`${char}-${charIndex}`}
                                initial={initial}
                                animate={animate}
                                exit={exit}
                                transition={{
                                    ...transition,
                                    delay: getStaggerDelay(globalIndex, totalElements),
                                }}
                                className={cn("inline-block leading-none tracking-tight", elementLevelClassName)}
                            >
                                {char === ' ' ? '\u00A0' : char}
                            </motion.span>
                        );
                     })}
                </span>
             ))}
          </motion.div>
        </AnimatePresence>
      </motion.span>
    );
  }
);
RotatingText.displayName = "RotatingText";

const ShinyText: React.FC<{ text: string; className?: string }> = ({ text, className = "" }) => (
    <span className={cn("relative overflow-hidden inline-block", className)}>
        {text}
        <span style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            animation: 'shine 2s infinite linear',
            opacity: 0.5,
            pointerEvents: 'none'
        }}></span>
        <style>{`
            @keyframes shine {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
        `}</style>
    </span>
);

const MenuIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

const CloseIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

interface NavLinkProps {
    href?: string;
    children: ReactNode;
    className?: string;
    onClick?: (event: ReactMouseEvent<HTMLAnchorElement>) => void;
}

const NavLink: React.FC<NavLinkProps> = ({ href = "#", children, className = "", onClick }) => (
   <motion.a
     href={href}
     onClick={onClick}
     className={cn("relative group text-sm font-medium text-gray-600 hover:text-[#2A7F6F] transition-colors duration-200 flex items-center py-1", className)}
     whileHover="hover"
   >
     {children}
     <motion.div
        className="absolute bottom-[-2px] left-0 right-0 h-[1.5px] bg-[#2A7F6F]"
        variants={{ initial: { scaleX: 0, originX: 0.5 }, hover: { scaleX: 1, originX: 0.5 } }}
        initial="initial"
        transition={{ duration: 0.3, ease: "easeOut" }}
    />
   </motion.a>
 );

interface Dot {
    x: number;
    y: number;
    baseColor: string;
    targetOpacity: number;
    currentOpacity: number;
    opacitySpeed: number;
    baseRadius: number;
    currentRadius: number;
}

const HeroNexus: React.FC = () => {
   const canvasRef = useRef<HTMLCanvasElement>(null);
   const animationFrameId = useRef<number | null>(null);
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
   const [isScrolled, setIsScrolled] = useState<boolean>(false);

   const { scrollY } = useScroll();
   useMotionValueEvent(scrollY, "change", (latest) => {
       setIsScrolled(latest > 10);
   });

   const dotsRef = useRef<Dot[]>([]);
   const gridRef = useRef<Record<string, number[]>>({});
   const canvasSizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });
   const mousePositionRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });

   const DOT_SPACING = 25;
   const BASE_OPACITY_MIN = 0.40;
   const BASE_OPACITY_MAX = 0.50;
   const BASE_RADIUS = 1;
   const INTERACTION_RADIUS = 150;
   const INTERACTION_RADIUS_SQ = INTERACTION_RADIUS * INTERACTION_RADIUS;
   const OPACITY_BOOST = 0.6;
   const RADIUS_BOOST = 2.5;
   const GRID_CELL_SIZE = Math.max(50, Math.floor(INTERACTION_RADIUS / 1.5));

   const handleMouseMove = useCallback((event: globalThis.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) {
            mousePositionRef.current = { x: null, y: null };
            return;
        }
        const rect = canvas.getBoundingClientRect();
        const canvasX = event.clientX - rect.left;
        const canvasY = event.clientY - rect.top;
        mousePositionRef.current = { x: canvasX, y: canvasY };
   }, []);

   const createDots = useCallback(() => {
       const { width, height } = canvasSizeRef.current;
       if (width === 0 || height === 0) return;

       const newDots: Dot[] = [];
       const newGrid: Record<string, number[]> = {};
       const cols = Math.ceil(width / DOT_SPACING);
       const rows = Math.ceil(height / DOT_SPACING);

       for (let i = 0; i < cols; i++) {
           for (let j = 0; j < rows; j++) {
               const x = i * DOT_SPACING + DOT_SPACING / 2;
               const y = j * DOT_SPACING + DOT_SPACING / 2;
               const cellX = Math.floor(x / GRID_CELL_SIZE);
               const cellY = Math.floor(y / GRID_CELL_SIZE);
               const cellKey = `${cellX}_${cellY}`;

               if (!newGrid[cellKey]) {
                   newGrid[cellKey] = [];
               }

               const dotIndex = newDots.length;
               newGrid[cellKey] = newGrid[cellKey] || [];
               newGrid[cellKey].push(dotIndex);

               const baseOpacity = Math.random() * (BASE_OPACITY_MAX - BASE_OPACITY_MIN) + BASE_OPACITY_MIN;
               newDots.push({
                   x,
                   y,
                   baseColor: `rgba(42, 127, 111, ${BASE_OPACITY_MAX})`,
                   targetOpacity: baseOpacity,
                   currentOpacity: baseOpacity,
                   opacitySpeed: (Math.random() * 0.005) + 0.002,
                   baseRadius: BASE_RADIUS,
                   currentRadius: BASE_RADIUS,
               });
           }
       }
       dotsRef.current = newDots;
       gridRef.current = newGrid;
   }, [DOT_SPACING, GRID_CELL_SIZE, BASE_OPACITY_MIN, BASE_OPACITY_MAX, BASE_RADIUS]);

   const handleResize = useCallback(() => {
       const canvas = canvasRef.current;
       if (!canvas) return;
       const container = canvas.parentElement;
       const width = container ? container.clientWidth : window.innerWidth;
       const height = container ? container.clientHeight : window.innerHeight;

       if (canvas.width !== width || canvas.height !== height ||
           canvasSizeRef.current.width !== width || canvasSizeRef.current.height !== height)
       {
           canvas.width = width;
           canvas.height = height;
           canvasSizeRef.current = { width, height };
           createDots();
       }
   }, [createDots]);

   const animateDots = useCallback(() => {
       const canvas = canvasRef.current;
       const ctx = canvas?.getContext('2d');
       const dots = dotsRef.current;
       const grid = gridRef.current;
       const { width, height } = canvasSizeRef.current;
       const { x: mouseX, y: mouseY } = mousePositionRef.current;

       if (!ctx || !dots || !grid || width === 0 || height === 0) {
           animationFrameId.current = requestAnimationFrame(animateDots);
           return;
       }

       ctx.clearRect(0, 0, width, height);

       const activeDotIndices = new Set<number>();
       if (mouseX !== null && mouseY !== null) {
           const mouseCellX = Math.floor(mouseX / GRID_CELL_SIZE);
           const mouseCellY = Math.floor(mouseY / GRID_CELL_SIZE);
           const searchRadius = Math.ceil(INTERACTION_RADIUS / GRID_CELL_SIZE);
           for (let i = -searchRadius; i <= searchRadius; i++) {
               for (let j = -searchRadius; j <= searchRadius; j++) {
                   const checkCellX = mouseCellX + i;
                   const checkCellY = mouseCellY + j;
                   const cellKey = `${checkCellX}_${checkCellY}`;
                   if (grid[cellKey]) {
                       grid[cellKey].forEach(dotIndex => activeDotIndices.add(dotIndex));
                   }
               }
           }
       }

       dots.forEach((dot, index) => {
           dot.currentOpacity += dot.opacitySpeed;
           if (dot.currentOpacity >= dot.targetOpacity || dot.currentOpacity <= BASE_OPACITY_MIN) {
               dot.opacitySpeed = -dot.opacitySpeed;
               dot.currentOpacity = Math.max(BASE_OPACITY_MIN, Math.min(dot.currentOpacity, BASE_OPACITY_MAX));
               dot.targetOpacity = Math.random() * (BASE_OPACITY_MAX - BASE_OPACITY_MIN) + BASE_OPACITY_MIN;
           }

           let interactionFactor = 0;
           dot.currentRadius = dot.baseRadius;

           if (mouseX !== null && mouseY !== null && activeDotIndices.has(index)) {
               const dx = dot.x - mouseX;
               const dy = dot.y - mouseY;
               const distSq = dx * dx + dy * dy;

               if (distSq < INTERACTION_RADIUS_SQ) {
                   const distance = Math.sqrt(distSq);
                   interactionFactor = Math.max(0, 1 - distance / INTERACTION_RADIUS);
                   interactionFactor = interactionFactor * interactionFactor;
               }
           }

           const finalOpacity = Math.min(1, dot.currentOpacity + interactionFactor * OPACITY_BOOST);
           dot.currentRadius = dot.baseRadius + interactionFactor * RADIUS_BOOST;

           const r = '42';
           const g = '127';
           const b = '111';

           ctx.beginPath();
           ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${finalOpacity.toFixed(3)})`;
           ctx.arc(dot.x, dot.y, dot.currentRadius, 0, Math.PI * 2);
           ctx.fill();
       });

       animationFrameId.current = requestAnimationFrame(animateDots);
   }, [GRID_CELL_SIZE, INTERACTION_RADIUS, INTERACTION_RADIUS_SQ, OPACITY_BOOST, RADIUS_BOOST, BASE_OPACITY_MIN, BASE_OPACITY_MAX, BASE_RADIUS]);

   useEffect(() => {
       handleResize();
       const handleMouseLeave = () => {
            mousePositionRef.current = { x: null, y: null };
        };

       window.addEventListener('mousemove', handleMouseMove, { passive: true });
       window.addEventListener('resize', handleResize);
       document.documentElement.addEventListener('mouseleave', handleMouseLeave);


       animationFrameId.current = requestAnimationFrame(animateDots);

       return () => {
           window.removeEventListener('resize', handleResize);
           window.removeEventListener('mousemove', handleMouseMove);
           document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
           if (animationFrameId.current) {
               cancelAnimationFrame(animationFrameId.current);
           }
       };
   }, [handleResize, handleMouseMove, animateDots]);

   useEffect(() => {
       if (isMobileMenuOpen) {
           document.body.style.overflow = 'hidden';
       } else {
           document.body.style.overflow = 'unset';
       }
       return () => { document.body.style.overflow = 'unset'; };
   }, [isMobileMenuOpen]);

   const headerVariants: Variants = {
       top: {
           backgroundColor: "rgba(17, 17, 17, 0)",
           borderBottomColor: "rgba(55, 65, 81, 0)",
           position: 'absolute',
           boxShadow: 'none',
       },
       scrolled: {
           backgroundColor: "rgba(17, 17, 17, 0.95)",
           borderBottomColor: "rgba(75, 85, 99, 0.7)",
           boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
           position: 'fixed'
       }
   };

   const mobileMenuVariants: Variants = {
       hidden: { opacity: 0, y: -20 },
       visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
       exit: { opacity: 0, y: -20, transition: { duration: 0.15, ease: "easeIn" } }
   };

    const contentDelay = 0.3;
    const itemDelayIncrement = 0.1;

    const bannerVariants: Variants = {
        hidden: { opacity: 0, y: -10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: contentDelay } }
    };
   const headlineVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5, delay: contentDelay + itemDelayIncrement } }
    };
    const subHeadlineVariants: Variants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: contentDelay + itemDelayIncrement * 2 } }
    };
    const ctaVariants: Variants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: contentDelay + itemDelayIncrement * 3 } }
    };
    const infoVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5, delay: contentDelay + itemDelayIncrement * 4 } }
    };

  return (
    <div id="hero">

      {/* ═══════════════════════════════════════════
           LAYOUT MOBILE  — oculto em lg+
          ═══════════════════════════════════════════ */}
      <div className="lg:hidden relative" style={{ minHeight: '100vh' }}>

        {/* Imagem full-screen como fundo */}
        <div className="absolute inset-0">
          <Image
            src="/images/dra-com-paciente.png"
            alt="Dra. Rayanna Almeida"
            fill
            className="object-cover object-top"
            priority
          />
          {/* Gradiente sutil no rodapé */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.18) 0%, transparent 45%)' }} />
        </div>

        {/* Camada de conteúdo */}
        <div className="relative z-10" style={{ minHeight: '100vh' }}>

          {/* Header fixo */}
          <div className="bg-white"
            style={{ position: 'sticky', top: 0, zIndex: 50, height: '64px', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>

            <span style={{ fontSize: '13px', fontWeight: 700, color: '#2D3436' }}>
              Dra. Rayanna<span style={{ color: '#2A7F6F' }}> Almeida</span>
              <span style={{ color: '#9CA3AF', fontWeight: 400, marginLeft: '6px' }}>| Salvador</span>
            </span>
          </div>


          {/* Espaço entre header e card — foto visível aqui */}
          <div style={{ height: '160px' }} />

          {/* Card flutuante */}
          <div style={{ padding: '0 16px', paddingBottom: '20px' }}>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '22px 20px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '14px',
            }}>


              {/* Headline */}
              <h1 style={{ fontSize: '17px', fontWeight: 700, color: '#2D3436', lineHeight: 1.3, width: '100%', margin: 0 }}>
                Cirurgia com cuidado<br /> e segurança para o seu <span style={{ color: '#2A7F6F' }}>filho.</span>
              </h1>

              {/* Parágrafo */}
              <p style={{ fontSize: '11px', color: '#6B7280', lineHeight: 1.5, maxWidth: '92%', margin: '0 auto' }}>
                Atendo crianças com as condições cirúrgicas mais comuns da infância: fimose, hérnias, testículo não descido e muito mais. Em cada caso, a família sai da consulta sabendo exatamente o que está acontecendo e qual é o melhor caminho.
              </p>

              {/* Botão primário */}
              <a href="https://wa.me/557181551023?text=Olá!%20Vim%20do%20site%20e%20gostaria%20de%20saber%20mais" target="_blank"
                style={{ width: '100%', borderRadius: '999px', background: '#2A7F6F', color: 'white', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '9px 20px', textDecoration: 'none' }}>
                Agendar Consulta
              </a>

              {/* Botão secundário */}
              <a href="#manifesto"
                style={{ width: '100%', borderRadius: '999px', background: 'transparent', color: '#2A7F6F', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '9px 20px', border: '1.5px solid #2A7F6F', textDecoration: 'none' }}>
                Saiba mais
              </a>

              {/* Prova social */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <div style={{ display: 'flex' }}>
                  {[
                    'https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?w=80&h=80&fit=crop&crop=entropy&auto=format&q=80',
                    'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=80&h=80&fit=crop&crop=entropy&auto=format&q=80',
                    'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=80&h=80&fit=crop&crop=entropy&auto=format&q=80',
                    'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=80&h=80&fit=crop&crop=entropy&auto=format&q=80',
                  ].map((src, i) => (
                    <div key={i} style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid white', overflow: 'hidden', position: 'relative', flexShrink: 0, marginLeft: i > 0 ? '-6px' : '0' }}>
                      <Image src={src} alt="Família paciente" width={24} height={24} className="object-cover w-full h-full" />
                    </div>
                  ))}
                </div>
                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <p style={{ fontWeight: 700, color: '#2D3436', fontSize: '11px', margin: 0 }}>+20 anos de Experiência</p>
                  <p style={{ color: '#9CA3AF', fontSize: '9px', margin: 0 }}>Centenas de Crianças atendidas</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* ═══════════════════════════════════════════
           LAYOUT DESKTOP  — oculto em mobile
          ═══════════════════════════════════════════ */}
      <div className="hidden lg:block">
        <div className="relative bg-[#FFFFFF] text-gray-800 min-h-screen flex flex-col overflow-x-hidden">
          <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-40" />
          <div className="absolute inset-0 z-1 pointer-events-none" style={{
            background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, #FFFFFF 90%), radial-gradient(ellipse at center, rgba(255,255,255,0) 40%, rgba(255,255,255,0.5) 95%)'
          }}></div>

          <motion.header
            variants={headerVariants}
            initial="top"
            animate="top"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full lg:w-1/2 px-4 sm:px-6 lg:px-10 z-30 backdrop-blur-md"
          >
            <nav className="flex justify-between items-center h-[54px] sm:h-[80px]">
              <div className="flex items-center flex-shrink-0">
                <span className="text-[13px] sm:text-xl font-bold text-[#2D3436]">
                  Dra. Rayanna<span className="text-[#2A7F6F]"> Almeida</span>
                  <span className="text-gray-400 font-normal ml-2 text-[12px] sm:text-base">| Salvador</span>
                </span>
              </div>
            </nav>
          </motion.header>

          <main className="flex-grow flex flex-col lg:flex-row relative z-10">
            <div className="flex flex-grow flex-col items-center justify-center text-center lg:flex-grow-0 lg:items-start lg:text-left lg:w-1/2 px-4 lg:pl-16 xl:pl-24 lg:pr-12 py-[54px] sm:py-[80px] lg:pt-[80px] lg:pb-0">


              <motion.h1
                variants={headlineVariants}
                initial="hidden"
                animate="visible"
                className="font-bold text-[#2D3436] mb-6"
                style={{ fontSize: 'clamp(22px, 2.4vw, 44px)', lineHeight: 1.3 }}
              >
                Cirurgia com cuidado<br /> e segurança para o seu <span className="text-[#2A7F6F]">filho.</span>
              </motion.h1>

              <motion.p
                variants={subHeadlineVariants}
                initial="hidden"
                animate="visible"
                className="text-[11px] sm:text-base lg:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 mb-6 sm:mb-10 leading-relaxed"
              >
                Atendo crianças com as condições cirúrgicas mais comuns da infância: fimose, hérnias, testículo não descido e muito mais. Em cada caso, a família sai da consulta sabendo exatamente o que está acontecendo e qual é o melhor caminho.
              </motion.p>

              <motion.div
                variants={ctaVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 w-full max-w-md lg:max-w-none mx-auto lg:mx-0 mb-10 lg:mb-12"
              >
                <InteractiveButton text="Agendar Consulta" href="https://wa.me/557181551023?text=Olá!%20Vim%20do%20site%20e%20gostaria%20de%20saber%20mais" target="_blank" className="w-full sm:w-auto" />
                <InteractiveButton text="Saiba mais" href="#manifesto" variant="secondary" className="w-full sm:w-auto" />
              </motion.div>

              <motion.div variants={infoVariants} initial="hidden" animate="visible" className="flex items-center justify-center lg:justify-start gap-2 sm:gap-4">
                <div className="flex -space-x-2 sm:-space-x-3">
                  {[
                    'https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?w=80&h=80&fit=crop&crop=entropy&auto=format&q=80',
                    'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=80&h=80&fit=crop&crop=entropy&auto=format&q=80',
                    'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=80&h=80&fit=crop&crop=entropy&auto=format&q=80',
                    'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=80&h=80&fit=crop&crop=entropy&auto=format&q=80',
                  ].map((src, i) => (
                    <div key={i} className="w-7 h-7 sm:w-10 sm:h-10 rounded-full border-2 border-white flex-shrink-0 overflow-hidden relative">
                      <Image src={src} alt="Família paciente" width={40} height={40} className="object-cover w-full h-full" />
                    </div>
                  ))}
                </div>
                <div className="text-left">
                  <p className="font-bold text-[#2D3436] text-[11px] sm:text-sm">+20 anos de Experiência</p>
                  <p className="text-[10px] sm:text-xs text-gray-500">Centenas de Crianças atendidas</p>
                </div>
              </motion.div>

            </div>

            <div className="hidden lg:block lg:w-1/2 relative">
              <div className="absolute inset-0 overflow-hidden">
                <Image
                  src="/images/dra-com-paciente.png"
                  alt="Dra. Rayanna Almeida com paciente"
                  fill
                  className="object-cover object-center"
                  priority
                />
              </div>
              <motion.div
                initial={{ opacity: 0, y: 30, x: 20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ delay: 0.9, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                className="absolute bottom-10 left-[-28px] w-[200px] h-[158px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white z-10"
              >
                <Image src="/images/dra-escrevendo.png" alt="Dra. Rayanna no consultório" fill className="object-cover object-top" />
              </motion.div>
            </div>
          </main>
        </div>
      </div>

    </div>
  );
};

export default HeroNexus;
