/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/refs */
"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";

const banners = [
  "https://rokbucket.rokomari.io/banner/DESKTOPceb599bd-9932-4da0-ab50-b266d1040886.webp",
  "https://rokbucket.rokomari.io/banner/DESKTOPf960b78c-d644-48df-bd74-59e6a9ee26ab.webp",
  "https://rokbucket.rokomari.io/banner/DESKTOPaf98bf29-bebb-4e15-8f43-9e8cc1ae9709.webp",
  "https://rokbucket.rokomari.io/banner/DESKTOP9ee36a83-2e63-4e52-ae52-d32c9fecc82a.webp",
  "https://rokbucket.rokomari.io/banner/DESKTOP71460507-15a8-43b0-b114-6f81db1c6dca.webp",
  "https://rokbucket.rokomari.io/banner/DESKTOP8247e6d2-7630-4c09-9dd6-ce4efe30c187.webp",
  "https://rokbucket.rokomari.io/banner/DESKTOP8ce432e2-1f36-4d7e-b94c-90bb05c499d6.webp",
];

export default function BannerSlider() {
  const autoplay = useRef(
    Autoplay({
      delay: 4000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    }),
  );

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    autoplay.current,
  ]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    emblaApi.on("select", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative overflow-hidden rounded-3xl mt-3" ref={emblaRef}>
      <div className="flex">
        {banners.map((banner, index) => (
          <div key={index} className="relative min-w-0 flex-[0_0_100%]">
            <img
              src={banner}
              alt={`Banner ${index + 1}`}
              className="w-full object-cover"
              loading={index === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>

      {/* Navigation */}
      <button
        onClick={() => emblaApi?.scrollPrev()}
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg"
      >
        <ChevronLeft/>
      </button>

      <button
        onClick={() => emblaApi?.scrollNext()}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg"
      >
        <ChevronRight/>
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`h-2.5 rounded-full transition-all ${
              selectedIndex === index ? "w-8 bg-white" : "w-2.5 bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
