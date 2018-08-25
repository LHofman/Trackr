import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'semantic-ui-react';

import isLoggedIn from '../utils/isLoggedIn';

export default class Navbar extends Component {
  render() {
    return (
      <Menu>
        <Menu.Item as={Link} to='/'>
          Home
        </Menu.Item>

        {
          isLoggedIn() ? (
            <Menu.Menu position='right'>
              <Menu.Item name='logout' as={Link} to='/logout' />
            </Menu.Menu>
          ) : (
            <Menu.Menu position='right'>
              <Menu.Item name='login' as={Link} to='/login' />
            </Menu.Menu>
          )
        }
      </Menu>
    )
  }
}
