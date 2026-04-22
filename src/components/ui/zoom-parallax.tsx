'use client';

import { useScroll, useTransform, useMotionValueEvent, motion } from 'framer-motion';
import { useRef, useState, type ReactNode } from 'react';

interface Image {
	src: string;
	alt?: string;
	objectPosition?: string;
}

interface ZoomParallaxProps {
	images: Image[];
	overlayContent?: ReactNode;
}

export function ZoomParallax({ images, overlayContent }: ZoomParallaxProps) {
	const container = useRef(null);
	const [showText, setShowText] = useState(false);

	const { scrollYProgress } = useScroll({
		target: container,
		offset: ['start start', 'end end'],
	});

	// Zoom completa em 45% do scroll
	const scale4 = useTransform(scrollYProgress, [0, 0.45], [1, 4], { clamp: true });
	const scale5 = useTransform(scrollYProgress, [0, 0.45], [1, 5], { clamp: true });
	const scale6 = useTransform(scrollYProgress, [0, 0.45], [1, 6], { clamp: true });
	const scale8 = useTransform(scrollYProgress, [0, 0.45], [1, 8], { clamp: true });
	const scale9 = useTransform(scrollYProgress, [0, 0.45], [1, 9], { clamp: true });

	// Escurece levemente a imagem junto com o zoom
	const dimOpacity = useTransform(scrollYProgress, [0.35, 0.50], [0, 0.35], { clamp: true });

	// Texto aparece ao passar de 48% e some apenas se voltar para antes disso
	useMotionValueEvent(scrollYProgress, 'change', (latest) => {
		setShowText(latest >= 0.48);
	});

	const scales = [scale4, scale5, scale6, scale5, scale6, scale8, scale9];

	return (
		<div ref={container} className="relative h-[250vh]">
			<div className="sticky top-0 h-screen overflow-hidden">
				{images.map(({ src, alt, objectPosition }, index) => {
					const scale = scales[index % scales.length];
					return (
						<motion.div
							key={index}
							style={{ scale }}
							className={`absolute top-0 flex h-full w-full items-center justify-center ${index === 1 ? '[&>div]:!-top-[30vh] [&>div]:!left-[5vw] [&>div]:!h-[30vh] [&>div]:!w-[35vw]' : ''} ${index === 2 ? '[&>div]:!-top-[10vh] [&>div]:!-left-[25vw] [&>div]:!h-[45vh] [&>div]:!w-[20vw]' : ''} ${index === 3 ? '[&>div]:!left-[27.5vw] [&>div]:!h-[25vh] [&>div]:!w-[25vw]' : ''} ${index === 4 ? '[&>div]:!top-[27.5vh] [&>div]:!left-[5vw] [&>div]:!h-[25vh] [&>div]:!w-[20vw]' : ''} ${index === 5 ? '[&>div]:!top-[27.5vh] [&>div]:!-left-[22.5vw] [&>div]:!h-[25vh] [&>div]:!w-[30vw]' : ''} ${index === 6 ? '[&>div]:!top-[22.5vh] [&>div]:!left-[25vw] [&>div]:!h-[15vh] [&>div]:!w-[15vw]' : ''}`}
						>
							<div className="relative h-[25vh] w-[25vw]">
								<img
									src={src}
									alt={alt || `Parallax image ${index + 1}`}
									className="h-full w-full object-cover"
									style={{ objectPosition: objectPosition || 'center' }}
								/>
							</div>
						</motion.div>
					);
				})}

				{overlayContent && (
					<>
						<motion.div
							style={{ opacity: dimOpacity }}
							className="absolute inset-0 z-40 bg-black pointer-events-none"
						/>
						<div
							className="absolute inset-0 z-50 flex items-center justify-center px-4 transition-all duration-700"
							style={{
								opacity: showText ? 1 : 0,
								transform: showText ? 'translateY(0)' : 'translateY(30px)',
								pointerEvents: showText ? 'auto' : 'none',
							}}
						>
							{overlayContent}
						</div>
					</>
				)}
			</div>
		</div>
	);
}
