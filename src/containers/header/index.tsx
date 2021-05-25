import * as React from 'react';
import HeaderMenu from './HeaderMenu';
import './style.scss';

const Header: React.FC = () => {
  return (
    <div className='headerContainer'>
      <HeaderMenu />
    </div>
  );
};

export default Header;