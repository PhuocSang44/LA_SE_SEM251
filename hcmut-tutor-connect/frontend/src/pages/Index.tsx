import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, BookOpen, Award } from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: Calendar,
      title: "Easy Scheduling",
      titleVi: "Lên lịch dễ dàng",
      description: "View and manage your tutoring sessions in an intuitive calendar interface",
      descriptionVi: "Xem và quản lý các buổi học trong giao diện lịch trực quan"
    },
    {
      icon: Users,
      title: "Qualified Tutors",
      titleVi: "Gia sư có trình độ",
      description: "Connect with experienced tutors specialized in your subjects",
      descriptionVi: "Kết nối với gia sư có kinh nghiệm chuyên về môn học của bạn"
    },
    {
      icon: BookOpen,
      title: "Multiple Subjects",
      titleVi: "Nhiều môn học",
      description: "Get support across all your HCMUT courses and subjects",
      descriptionVi: "Nhận hỗ trợ cho tất cả các môn học tại HCMUT"
    },
    {
      icon: Award,
      title: "Track Progress",
      titleVi: "Theo dõi tiến độ",
      description: "Monitor your learning progress and session attendance",
      descriptionVi: "Theo dõi tiến độ học tập và tham gia các buổi học"
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
                Why Choose HCMUT Tutor?
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
