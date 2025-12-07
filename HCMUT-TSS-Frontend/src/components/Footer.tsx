import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";

const Footer = () => {
  const { language } = useLanguage();
  
  return (
    <footer className="w-full border-t bg-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">{t(language, 'footer.about')}</h3>
            <p className="text-sm text-muted-foreground">
              {t(language, 'footer.aboutDesc')}
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">{t(language, 'footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t(language, 'footer.dashboard')}
                </Link>
              </li>
              <li>
                <Link to="/available-courses" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t(language, 'footer.availableCourses')}
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t(language, 'footer.support')}
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">{t(language, 'footer.contact')}</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{t(language, 'footer.address')}</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>(028) 3865 4280</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>support@hcmut.edu.vn</span>
              </li>
            </ul>
          </div>
        </div>
        
      </div>
        <div className="mt-8 border-t text-sm flex items-center justify-center py-4" style={{ backgroundColor: "#032B91", color: "white" }}>
          © {new Date().getFullYear()} {t(language, 'footer.copyright')}
        </div>
    </footer>
  );
};

export default Footer;
