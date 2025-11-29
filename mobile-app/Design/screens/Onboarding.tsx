import React from 'react';
import { Shield, Wallet, Radio } from 'lucide-react';
import { Button } from '../components/Button';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface OnboardingProps {
  currentSlide: number;
  onNext: () => void;
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ 
  currentSlide, 
  onNext, 
  onComplete 
}) => {
  const slides = [
    {
      title: "A wallet that never gets blocked.",
      description: "Built on XRPL. Your money, your control. No middleman, no freezing.",
      icon: <Shield size={80} className="text-[#2F80ED]" />,
      image: "https://images.unsplash.com/photo-1599350686877-382a54114d2f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBwaG9uZSUyMHNoaWVsZCUyMHNlY3VyaXR5fGVufDF8fHx8MTc2NDQyMTg2Nnww&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
      title: "Pay in USDC, think in Naira.",
      description: "Live currency conversion. See prices in NGN, pay with stablecoins.",
      icon: <Wallet size={80} className="text-[#27AE60]" />,
      image: "https://images.unsplash.com/photo-1742836531239-1fe146bf7e3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHBob25lJTIwd2lyZWxlc3MlMjBwYXltZW50fGVufDF8fHx8MTc2NDQyMTg2N3ww&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
      title: "Works even without Internet.",
      description: "SMS mode keeps you connected. Pay offline, sync later.",
      icon: <Radio size={80} className="text-[#2F80ED]" />,
      image: "https://images.unsplash.com/photo-1612911012211-d14e442e4739?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwcGF0dGVybiUyMGdlb21ldHJpY3xlbnwxfHx8fDE3NjQ0MjE4Njd8MA&ixlib=rb-4.1.0&q=80&w=1080"
    }
  ];

  const currentSlideData = slides[currentSlide];

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark-mode:bg-[#121212] flex flex-col">
      {/* Progress indicators */}
      <div className="flex gap-2 justify-center pt-12 pb-6">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`h-1 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'w-8 bg-[#2F80ED]'
                : 'w-1 bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        {/* Illustration */}
        <div className="w-full max-w-sm mb-12 relative">
          <div className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-[#2F80ED]/10 to-[#27AE60]/10 flex items-center justify-center">
            {currentSlideData.icon}
          </div>
          {/* Decorative pattern overlay */}
          <div 
            className="absolute inset-0 opacity-10 rounded-3xl bg-cover bg-center"
            style={{ 
              backgroundImage: `url('https://images.unsplash.com/photo-1612911012211-d14e442e4739?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwcGF0dGVybiUyMGdlb21ldHJpY3xlbnwxfHx8fDE3NjQ0MjE4Njd8MA&ixlib=rb-4.1.0&q=80&w=1080')` 
            }}
          />
        </div>

        {/* Text */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-[#1A1A1A] dark-mode:text-white px-4">
            {currentSlideData.title}
          </h1>
          <p className="text-[#6B6B6B] px-8">
            {currentSlideData.description}
          </p>
        </div>
      </div>

      {/* Button */}
      <div className="px-6 pb-8">
        {currentSlide < 2 ? (
          <Button onClick={onNext}>
            Next
          </Button>
        ) : (
          <Button onClick={onComplete} variant="secondary">
            Create my Wallet
          </Button>
        )}
      </div>
    </div>
  );
};
