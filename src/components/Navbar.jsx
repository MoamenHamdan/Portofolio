import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState("Home");

    const navItems = [
        { href: "#Home",       label: "Home"       },
        { href: "#About",      label: "About"      },
        { href: "#Portofolio", label: "Portofolio" },
        { href: "#Cyber",      label: "🛡 Cyber"   },
        { href: "#Blog",       label: "Blog"       },
        { href: "#Testimonials", label: "Reviews"  },
        { href: "#Contact",    label: "Contact"    },
    ];

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
            const sections = navItems.map(item => {
                const section = document.querySelector(item.href);
                if (section) {
                    return {
                        id: item.href.replace("#", ""),
                        offset: section.offsetTop - 550,
                        height: section.offsetHeight
                    };
                }
                return null;
            }).filter(Boolean);

            const currentPosition = window.scrollY;
            const active = sections.find(section =>
                currentPosition >= section.offset &&
                currentPosition < section.offset + section.height
            );

            if (active) {
                setActiveSection(active.id);
            }
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    const scrollToSection = (e, href) => {
        e.preventDefault();
        const section = document.querySelector(href);
        if (section) {
            const top = section.offsetTop - 100;
            window.scrollTo({
                top: top,
                behavior: "smooth"
            });
        }
        setIsOpen(false);
    };

    return (
        <nav
            className={`fixed w-full top-0 z-50 transition-all duration-500 ${isOpen
                ? "bg-[#050000] opacity-100 border-b border-red-500/50"
                : scrolled
                    ? "bg-[#050000]/80 backdrop-blur-xl border-b border-red-500/30"
                    : "bg-transparent border-b border-transparent"
                }`}
        >
            <div className="mx-auto px-4 sm:px-6 lg:px-[10%]">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <a
                            href="#Home"
                            onClick={(e) => scrollToSection(e, "#Home")}
                            className="text-xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent tracking-widest font-mono glitch-text"
                            data-text="[ MOAMEN_HAMDAN ]"
                            style={{ textShadow: "0 0 10px rgba(239, 68, 68, 0.6)" }}
                        >
                            [ MOAMEN_HAMDAN ]
                        </a>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:block">
                        <div className="ml-8 flex items-center space-x-8">
                            {navItems.map((item) => (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    onClick={(e) => scrollToSection(e, item.href)}
                                    className="group relative px-1 py-2 text-sm font-medium"
                                >
                                    <span
                                        className={`relative z-10 transition-colors duration-300 font-mono text-sm tracking-wider ${activeSection === item.href.substring(1)
                                            ? "text-red-400 font-bold"
                                            : "text-gray-400 group-hover:text-red-300"
                                            }`}
                                        style={{ textShadow: activeSection === item.href.substring(1) ? "0 0 8px rgba(239, 68, 68, 0.6)" : "none" }}
                                    >
                                        {activeSection === item.href.substring(1) ? "> " + item.label + " <" : item.label}
                                    </span>
                                    <span
                                        className={`absolute bottom-0 left-0 w-full h-[2px] bg-red-500 transform origin-left transition-transform duration-300 ${activeSection === item.href.substring(1)
                                            ? "scale-x-100"
                                            : "scale-x-0 group-hover:scale-x-100"
                                            }`}
                                        style={{ boxShadow: "0 0 8px rgba(239, 68, 68, 0.8)" }}
                                    />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className={`relative p-2 text-red-500 hover:text-red-400 transition-transform duration-300 ease-in-out transform ${isOpen ? "rotate-90 scale-125" : "rotate-0 scale-100"
                                }`}
                            style={{ filter: "drop-shadow(0 0 5px rgba(239,68,68,0.5))" }}
                        >
                            {isOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <div
                className={`md:hidden fixed inset-0 bg-[#050000]/95 backdrop-blur-md border-b border-red-500/30 transition-all duration-300 ease-in-out ${isOpen
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-[-100%] pointer-events-none"
                    }`}
                style={{ top: "64px", height: "fit-content", paddingBottom: "20px" }}
            >
                <div className="flex flex-col">
                    <div className="px-4 py-6 space-y-4">
                        {navItems.map((item, index) => (
                            <a
                                key={item.label}
                                href={item.href}
                                onClick={(e) => scrollToSection(e, item.href)}
                                className={`block px-4 py-3 text-lg font-mono tracking-widest transition-all duration-300 ease border-l-2 ${activeSection === item.href.substring(1)
                                    ? "border-red-500 text-red-400 bg-red-500/10"
                                    : "border-transparent text-gray-500 hover:text-red-300 hover:border-red-500/50 hover:bg-red-500/5"
                                    }`}
                                style={{
                                    transitionDelay: `${index * 50}ms`,
                                    transform: isOpen ? "translateX(0)" : "translateX(-50px)",
                                    opacity: isOpen ? 1 : 0,
                                    textShadow: activeSection === item.href.substring(1) ? "0 0 8px rgba(239, 68, 68, 0.6)" : "none"
                                }}
                            >
                                {activeSection === item.href.substring(1) ? "> " + item.label + " <" : item.label}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </nav>

    );
};

export default Navbar;