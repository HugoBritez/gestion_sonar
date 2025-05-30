/* eslint-disable prettier/prettier */
import React from 'react';
import Logo from '../../../../../resources/logosonnarconfondodark.png'
export default function LogoComponent(): React.ReactElement {
  return <img src={Logo} alt="Logo" style={{ width: '30px', height: '30px' , borderRadius: '5px'}} />
}
