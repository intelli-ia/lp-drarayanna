"use client";
import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import Image from "next/image";

export function HeroScrollDemo() {
  return (
    <section className="flex flex-col overflow-hidden bg-[#2A7F6F] p-0">
      <ContainerScroll
        titleComponent={
          <div className="flex flex-col items-center">
            <span className="text-2xl md:text-4xl font-bold text-white/60 mb-0">Dra.</span>
            <h1 className="text-5xl md:text-[7rem] font-bold text-white leading-tight md:leading-[0.9] mt-0">
              Rayanna Almeida
            </h1>
          </div>
        }
      >
        <Image
          src="/images/hero-scroll-v3.png"
          alt="Dra. Rayanna Almeida - Especialidades"
          height={720}
          width={1400}
          className="mx-auto rounded-2xl h-full object-cover object-left-top hidden sm:block"
          draggable={false}
        />
        <Image
          src="/images/hero-scroll-mobile.png"
          alt="Dra. Rayanna Almeida - Especialidades"
          height={1000}
          width={480}
          className="mx-auto rounded-2xl h-full w-full object-cover object-top sm:hidden"
          draggable={false}
        />
      </ContainerScroll>
    </section>
  );
}
