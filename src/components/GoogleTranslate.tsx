import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

interface GoogleTranslateProps {
  className?: string;
}

const GoogleTranslate = ({ className = "" }: GoogleTranslateProps) => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.body.appendChild(script);

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { 
          pageLanguage: "en",
          includedLanguages: "ta,hi,en,te,ml,kn,bn,mr,gu,pa,ur,es,fr,de,zh,ja,ko"
        },
        "google_translate_element"
      );
    };

    // Inject styles
    const style = document.createElement("style");
    style.textContent = `
      .goog-te-banner-frame {
        display: none !important;
      }
      .skiptranslate {
        display: none !important;
      }
      body {
        top: 0 !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      const existingScript = document.querySelector(
        'script[src*="translate.google.com"]'
      );
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div id="google_translate_element"></div>
    </div>
  );
};

// Simple button version for better UI
export const GoogleTranslateButton = ({ className = "" }: GoogleTranslateProps) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.body.appendChild(script);

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { 
          pageLanguage: "en",
          includedLanguages: "ta,hi,en,te,ml,kn,bn,mr,gu,pa,ur,es,fr,de,zh,ja,ko"
        },
        "google_translate_element_hidden"
      );
    };

    // Inject styles
    const style = document.createElement("style");
    style.textContent = `
      .goog-te-banner-frame {
        display: none !important;
      }
      .skiptranslate {
        display: none !important;
      }
      body {
        top: 0 !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      const existingScript = document.querySelector(
        'script[src*="translate.google.com"]'
      );
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <Globe className="h-4 w-4" />
        Translate
      </Button>
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 z-50">
          <div id="google_translate_element_hidden"></div>
        </div>
      )}
    </div>
  );
};

export default GoogleTranslate;

