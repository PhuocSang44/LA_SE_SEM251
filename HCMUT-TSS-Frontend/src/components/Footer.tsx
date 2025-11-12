import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full border-t bg-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">About</h3>
            <p className="text-sm text-muted-foreground">
              Tutor Supporting System connects HCMUT students with qualified tutors,
              making academic support accessible and efficient.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/available-courses" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Available Courses
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>268 Ly Thuong Kiet, District 10, HCMC</span>
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
          © {new Date().getFullYear()} Ho Chi Minh City University of Technology. All rights reserved.
        </div>
    </footer>
  );
};

export default Footer;
