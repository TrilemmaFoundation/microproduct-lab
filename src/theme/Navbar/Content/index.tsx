/**
 * Swizzled from @docusaurus/theme-classic for the Trilemma Foundation navbar
 * layout (logo left, search right).
 */

import React, {type ReactNode} from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {useNavbarMobileSidebar} from '@docusaurus/theme-common/internal';
import SearchBar from '@theme/SearchBar';
import NavbarMobileSidebarToggle from '@theme/Navbar/MobileSidebar/Toggle';
import NavbarLogo from '@theme/Navbar/Logo';
import NavbarSearch from '@theme/Navbar/Search';

function NavbarContentLayout({
  brandSide,
  right,
}: {
  brandSide: ReactNode;
  right: ReactNode;
}) {
  return (
    <div className="navbar__inner">
      <div
        className={clsx(
          ThemeClassNames.layout.navbar.containerLeft,
          'navbar__items',
          'navbar__items--brand-side',
        )}>
        {brandSide}
      </div>
      <div
        className={clsx(
          ThemeClassNames.layout.navbar.containerRight,
          'navbar__items',
          'navbar__items--right',
        )}>
        {right}
      </div>
    </div>
  );
}

export default function NavbarContent(): ReactNode {
  const mobileSidebar = useNavbarMobileSidebar();

  return (
    <NavbarContentLayout
      brandSide={
        <>
          {!mobileSidebar.disabled && <NavbarMobileSidebarToggle />}
          <NavbarLogo />
        </>
      }
      right={
        <NavbarSearch>
          <SearchBar />
        </NavbarSearch>
      }
    />
  );
}
