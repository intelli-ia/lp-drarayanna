'use client';

import { useScroll, useTransform, motion, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import { InteractiveButton } from './ui/interactive-button';

interface ManifestoZoomProps {
    images: string[];
}

export function ManifestoZoom({ images }: ManifestoZoomProps) {
    const container = useRef(null);
    const { scrollYProgress } = useScroll({
        target: container,
        offset: ['start start', 'end end'],
    });

    const scale4 = useTransform(scrollYProgress, [0, 1], [1, 4]);
    const scale5 = useTransform(scrollYProgress, [0, 1], [1, 5]);
    const scale6 = useTransform(scrollYProgress, [0, 1], [1, 6]);
    const scale8 = useTransform(scrollYProgress, [0, 1], [1, 8]);
    const scale9 = useTransform(scrollYProgress, [0, 1], [1, 9]);

    const opacity = useTransform(scrollYProgress, [0.5, 0.8], [0, 1]);
    const cardScale = useTransform(scrollYProgress, [0.5, 0.8], [0.9, 1]);
    const cardY = useTransform(scrollYProgress, [0.5, 0.8], [50, 0]);

    const scales = [scale4, scale5, scale6, scale5, scale6, scale8, scale9];

    return (
        <section id="manifesto" ref={container} className="relative h-[300vh] bg-white z-0">
            <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
                <div className="relative w-full h-full flex items-center justify-center">
                    {images.map((src, index) => {
                        const scale = scales[index % scales.length];

                        return (
                            <motion.div
                                key={index}
                                style={{ scale }}
                                className={`absolute flex items-center justify-center
                                    ${index === 0 ? 'z-10' : 'z-0'}
                                    ${index === 1 ? '-top-[25%] left-[5%] w-[30%] h-[40%]' : ''} 
                                    ${index === 2 ? '-top-[10%] -left-[20%] w-[25%] h-[45%]' : ''} 
                                    ${index === 3 ? 'left-[25%] w-[25%] h-[30%]' : ''} 
                                    ${index === 4 ? 'top-[30%] left-[10%] w-[25%] h-[35%]' : ''} 
                                    ${index === 5 ? 'top-[20%] -left-[25%] w-[30%] h-[30%]' : ''} `}
                            >
                                <div className={`relative ${index === 0 ? 'h-[100vh] w-screen' : 'h-full w-full'}`}>
                                    <Image
                                        src={src}
                                        alt={`Manifesto background ${index + 1}`}
                                        fill
                                        className="object-cover rounded-xl shadow-2xl"
                                        priority={index === 0}
                                    />
                                    {index === 0 && <div className="absolute inset-0 bg-black/30" />}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* The Manifesto Card */}
                <motion.div 
                    style={{ opacity, scale: cardScale, y: cardY }}
                    className="absolute inset-0 z-30 flex items-center justify-center p-6"
                >
                    <div className="manifestoContentSingle max-w-[850px] !bg-white/95 backdrop-blur-md shadow-2xl border-none">
                        <h2 className="text-4xl md:text-5xl font-bold mb-8">Medo não se resolve com remédio, se resolve com <span className="manifestoHighlight">confiança.</span></h2>
                        <div className="manifestoText text-lg md:text-xl opacity-90">
                            <p>Em 21 anos de experiência como cirurgiã pediátrica, aprendi que o maior medo dos pais não é tanto a doença em si. É não entender o que está acontecendo com o filho e não saber em quem confiar.</p>
                            <p>Isso não precisa ser assim. Uma família bem informada passa por esse processo com tranquilidade. E a decisão certa só é possível quando há informação, escuta e confiança.</p>
                            <p>No meu consultório, estarei ao seu lado em cada etapa.</p>
                        </div>
                        <div className="heroButtons flex justify-center mt-10">
                            <InteractiveButton 
                                text="Agende uma consulta" 
                                href="https://wa.me/5571999999999" 
                                target="_blank"
                            />
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
