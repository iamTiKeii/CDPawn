import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { MoreHorizontal } from "lucide-react";

export interface ActionMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  danger?: boolean;
  disabled?: boolean;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  trigger?: React.ReactNode;
  align?: "left" | "right";
}

export const ActionMenu: React.FC<ActionMenuProps> = ({ items, trigger, align = "right" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [placement, setPlacement] = useState<"down" | "up">("down");
  const triggerRef = useRef<HTMLButtonElement | HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const calculatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 180; // approximate width
    const menuHeight = items.length * 36 + 12; // approximate height: items + padding

    // Placement detection (Auto placement)
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const placeUp = spaceBelow < menuHeight && spaceAbove > spaceBelow;

    const top = placeUp 
      ? rect.top - menuHeight + window.scrollY 
      : rect.bottom + window.scrollY;

    let left = align === "right"
      ? rect.right - menuWidth + window.scrollX
      : rect.left + window.scrollX;

    // Boundary check
    if (left < 8) {
      left = 8;
    } else if (left + menuWidth > window.innerWidth - 8) {
      left = window.innerWidth - menuWidth - 8;
    }

    setPlacement(placeUp ? "up" : "down");
    setCoords({ top, left });
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isOpen) {
      setIsOpen(false);
    } else {
      calculatePosition();
      setIsOpen(true);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      calculatePosition();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        (triggerRef.current as any)?.focus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    document.addEventListener("keydown", handleKeyDown);

    // Initial position adjust when DOM renders
    const timer = setTimeout(calculatePosition, 0);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
      document.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen]);

  const handleItemClick = (e: React.MouseEvent<HTMLButtonElement>, onClick: (e: React.MouseEvent<HTMLButtonElement>) => void) => {
    setIsOpen(false);
    onClick(e);
  };

  // Keyboard navigation inside dropdown menu
  const handleMenuKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, onClick: (e: React.MouseEvent<HTMLButtonElement>) => void) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      // Cast the keydown event to target type for click confirmation trigger
      const clickEvent = e as unknown as React.MouseEvent<HTMLButtonElement>;
      handleItemClick(clickEvent, onClick);
    }
  };

  return (
    <>
      <div 
        ref={triggerRef as any}
        onClick={handleToggle}
        className="inline-block cursor-pointer"
      >
        {trigger ? trigger : (
          <button 
            type="button" 
            className="btn btn-ghost btn-circle btn-xs text-slate-400 hover:bg-slate-100 flex items-center justify-center focus:outline-none"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && ReactDOM.createPortal(
        <div
          ref={menuRef}
          style={{
            position: "absolute",
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            width: "180px",
            zIndex: 9999
          }}
          className={`bg-white border border-slate-200 rounded-xl shadow-2xl p-1.5 focus:outline-none animate-in fade-in slide-in-from-top-1 duration-100 origin-${placement === "up" ? "bottom" : "top"}`}
        >
          <ul role="menu" className="menu p-0 text-slate-700 text-xs font-semibold gap-0.5 bg-white">
            {items.map((item, index) => {
              if (item.disabled) return null;
              return (
                <li key={index} role="menuitem">
                  <button
                    type="button"
                    onClick={(e) => handleItemClick(e, item.onClick)}
                    onKeyDown={(e) => handleMenuKeyDown(e, item.onClick)}
                    className={`flex items-center gap-2 px-3 py-2 w-full text-left rounded-lg transition-colors duration-100 ${
                      item.danger
                        ? "text-red-500 hover:bg-red-50 hover:text-red-600"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {item.icon && <span className="shrink-0">{item.icon}</span>}
                    <span className="truncate">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>,
        document.body
      )}
    </>
  );
};
