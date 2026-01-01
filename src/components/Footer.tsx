import { useLanguage } from "@/hooks/useLanguage";
import { Heart, Github, Mail } from "lucide-react";

export function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 mt-12 border-t border-border/50 bg-muted/30">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-lg">Amiibo Tracker</h3>
            <p className="text-sm text-muted-foreground">
              {t('footer.description')}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{t('footer.madeWith')}</span>
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Bandeira_de_Minas_Gerais.svg/45px-Bandeira_de_Minas_Gerais.svg.png" 
                alt="Bandeira de Minas Gerais" 
                className="h-4 w-auto rounded-sm"
              />
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-lg">{t('footer.links')}</h3>
            <div className="flex flex-col gap-2 text-sm">
              <a 
                href="https://www.nintendo.com/amiibo/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Nintendo Amiibo
              </a>
              <a 
                href="https://www.amiiboapi.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Amiibo API
              </a>
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-lg">{t('footer.contact')}</h3>
            <div className="flex gap-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="mailto:contato@exemplo.com" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {currentYear} Amiibo Tracker. {t('footer.rights')}</p>
          <p className="flex items-center gap-1">
            {t('footer.builtWith')} <Heart className="w-4 h-4 text-red-500 fill-red-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
