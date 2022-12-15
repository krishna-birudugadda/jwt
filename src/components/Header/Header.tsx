import React, { ReactFragment, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import styles from './Header.module.scss';

import AccountCircle from '#src/icons/AccountCircle';
import SearchBar, { Props as SearchBarProps } from '#components/SearchBar/SearchBar';
import Logo from '#components/Logo/Logo';
import Menu from '#src/icons/Menu';
import SearchIcon from '#src/icons/Search';
import CloseIcon from '#src/icons/Close';
import Button from '#components/Button/Button';
import Popover from '#components/Popover/Popover';
import UserMenu from '#components/UserMenu/UserMenu';
import { getPublicUrl } from '#src/utils/domHelpers';
import useBreakpoint, { Breakpoint } from '#src/hooks/useBreakpoint';
import IconButton from '#components/IconButton/IconButton';
import Dropdown from '../Dropdown/Dropdown';
import { logDev } from '#src/utils/common';
import { useEffect } from 'react';

type TypeHeader = 'static' | 'fixed';

type Props = {
  headerType?: TypeHeader;
  onMenuButtonClick: () => void;
  logoSrc?: string | null;
  searchBarProps: SearchBarProps;
  searchEnabled: boolean;
  searchActive: boolean;
  onSearchButtonClick?: () => void;
  onCloseSearchButtonClick?: () => void;
  onLoginButtonClick?: () => void;
  onSignUpButtonClick?: () => void;
  toggleUserMenu: (value: boolean) => void;
  children?: ReactFragment;
  isLoggedIn: boolean;
  userMenuOpen: boolean;
  canLogin: boolean;
  showPaymentsMenuItem: boolean;
};

export const languages = [{ value: 'en-US', label: 'English' }, { value: 'tr-TR', label: 'Turkish' }];

const Header: React.FC<Props> = ({
  children,
  headerType = 'static',
  onMenuButtonClick,
  logoSrc,
  searchBarProps,
  searchActive,
  onSearchButtonClick,
  searchEnabled,
  onCloseSearchButtonClick,
  onLoginButtonClick,
  onSignUpButtonClick,
  isLoggedIn,
  userMenuOpen,
  toggleUserMenu,
  canLogin = false,
  showPaymentsMenuItem,
}) => {
  const { t, i18n } = useTranslation('menu');
  const [logoLoaded, setLogoLoaded] = useState(false);
  const breakpoint = useBreakpoint();
  const headerClassName = classNames(styles.header, styles[headerType], {
    [styles.brandCentered]: breakpoint <= Breakpoint.sm,
    [styles.mobileSearchActive]: searchActive && breakpoint <= Breakpoint.sm,
  });
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const currentLanguage = i18n.language;
useEffect(()=>{
  setSelectedLanguage(currentLanguage);
},[currentLanguage])

  const search =
    breakpoint <= Breakpoint.sm ? (
      searchActive ? (
        <div className={styles.mobileSearch}>
          <SearchBar {...searchBarProps} />
          <IconButton
            className={styles.iconButton}
            aria-label="Close search"
            onClick={() => {
              if (onCloseSearchButtonClick) {
                onCloseSearchButtonClick();
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </div>
      ) : (
        <IconButton
          className={styles.iconButton}
          aria-label="Open search"
          onClick={() => {
            if (onSearchButtonClick) {
              onSearchButtonClick();
            }
          }}
        >
          <SearchIcon />
        </IconButton>
      )
    ) : (
      <SearchBar {...searchBarProps} />
    );

  const handleChange = (event) => {
    const selectedLanguage = event.target.value;

    if (selectedLanguage) {
      i18n.changeLanguage(selectedLanguage);
    }

  }
  const renderUserActions = () => {
    // if (!canLogin || breakpoint <= Breakpoint.sm) return null;
    if (1) return null;

    return isLoggedIn ? (
      <React.Fragment>
        <IconButton
          className={classNames(styles.iconButton, styles.userMenuButton)}
          aria-label={t('open_user_menu')}
          onClick={() => toggleUserMenu(!userMenuOpen)}
        >
          <AccountCircle />
        </IconButton>
        <Popover isOpen={userMenuOpen} onClose={() => toggleUserMenu(false)}>
          <UserMenu onClick={() => toggleUserMenu(false)} showPaymentsItem={showPaymentsMenuItem} inPopover />
        </Popover>
      </React.Fragment>
    ) : (
      <div className={styles.buttonContainer}>
        <Button onClick={onLoginButtonClick} label={t('sign_in')} />
        <Button variant="contained" color="primary" onClick={onSignUpButtonClick} label={t('sign_up')} />
      </div>
    );
  };

  return (
    <header className={headerClassName}>
      <div className={styles.container}>
        <div className={styles.menu}>
          <IconButton className={styles.iconButton} aria-label={t('open_menu')} onClick={onMenuButtonClick}>
            <Menu />
          </IconButton>
        </div>
        {logoSrc && (
          <div className={styles.brand}>
            <Logo src={getPublicUrl(logoSrc)} onLoad={() => setLogoLoaded(true)} />
          </div>
        )}
        <nav className={styles.nav} aria-label="menu">
          {logoLoaded || !logoSrc ? children : null}
        </nav>
        <div><Dropdown
          required
          className={styles.dropDown}
          size="small"
          options={languages}
          defaultLabel={t('select_language')}
          // valuePrefix={valuePrefix}
          // name={name}
          value={selectedLanguage}
          onChange={handleChange}
        // aria-label={t('filter_videos_by', { name })}
        />
        </div>
        <div className={styles.search}>{searchEnabled ? search : null}</div>
        {renderUserActions()}
      </div>
    </header>
  );
};
export default Header;
