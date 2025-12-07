import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroBackground from "@/assets/bk-bg.jpg";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";

const Hero = () => {
  const { language } = useLanguage();
  
  return (
    <section className="relative w-full h-[600px] overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 to-primary/80" />
      </div>
      
      <div className="relative container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight whitespace-nowrap">
            {t(language, 'hero.title')} <br /> {t(language, 'hero.subtitle')}
            </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            {t(language, 'hero.description')}
          </p>
          <Link to="/dashboard">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 shadow-lg rounded-lg px-8 py-6 text-lg font-semibold group"
            >
              {t(language, 'hero.myDashboard')}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
