'use client';

import Link from 'next/link';
import { useState } from 'react';

export interface NavItem {
  _id: string;
  name: string;
  href?: string;
  children?: NavItem[];
  onClick?: () => void;
}

interface MobileNavItemProps {
  item: NavItem;
  level: number;
  delay: number;
  isSidebarOpen: boolean;
  closeDrawer: () => void;
}

const MobileNavItem = ({ item, level, delay, isSidebarOpen, closeDrawer }: MobileNavItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const hasChildren = item.children && item.children.length > 0;

  const handleItemClick = () => {
    if (item.href) {
      closeDrawer();
    }
    if (item.onClick) {
      item.onClick();
      closeDrawer();
    }
  };

  return (
    <li
      className={`mobile-nav__item transform transition-all duration-300 ease-out ${
        isSidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
      data-level={level}
    >
      {hasChildren ? (
        <>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`mobile-nav__link heading h6 w-full text-left flex items-center justify-between`}
            aria-expanded={isOpen}
          >
            {item.name}
            <span className={`animated-plus transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}>+</span>
          </button>
          {isOpen && (
            <div className="collapsible">
              <ul className="mobile-nav list--unstyled" role="list">
                {item.children?.map((child) => (
                  <MobileNavItem
                    key={child._id}
                    item={child}
                    level={level + 1}
                    delay={0} // No stagger for sub-items
                    isSidebarOpen={isSidebarOpen}
                    closeDrawer={closeDrawer}
                  />
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <Link href={item.href || '#'} onClick={handleItemClick} className="mobile-nav__link heading h6">
          {item.name}
        </Link>
      )}
    </li>
  );
};

export default MobileNavItem;