import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, BookOpen, Award } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";

const Index = () => {
  const { language } = useLanguage();
  
  const features = [
    {
      icon: Calendar,
      title: t(language, 'home.easyScheduling'),
      description: t(language, 'home.easySchedulingDesc')
    },
    {
      icon: Users,
      title: t(language, 'home.qualifiedTutors'),
      description: t(language, 'home.qualifiedTutorsDesc')
    },
    {
      icon: BookOpen,
      title: t(language, 'home.multipleSubjects'),
      description: t(language, 'home.multipleSubjectsDesc')
    },
    {
      icon: Award,
      title: t(language, 'home.trackProgress'),
      description: t(language, 'home.trackProgressDesc')
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                {t(language, 'home.whyChoose')}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our platform makes it simple to find and connect with the best tutors for your academic needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow rounded-xl border-2">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
