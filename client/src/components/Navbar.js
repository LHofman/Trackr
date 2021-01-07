import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Dropdown, Menu } from 'semantic-ui-react';

import isLoggedIn from '../utils/isLoggedIn';
import getUser from '../utils/getUser';

export default class Navbar extends Component {
  render() {
    const user = getUser();

    return (
      <Menu>
        {
          (user || {}).isAdmin &&
          <Menu.Item as={Link} to='/'>
            Dashboard
          </Menu.Item>
        }
        <Menu.Item as={Link} to='/items'>
          Items
        </Menu.Item>
        <Dropdown item>
          <Dropdown.Menu>
            <Dropdown.Item as={Link} to='/items/filters/upcoming'>Upcoming</Dropdown.Item>
            <Dropdown.Item as={Link} to='/items/filters/upcomingDvd'>Upcoming DVD's</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Menu.Item as={Link} to='/franchises'>
          Franchises
        </Menu.Item>
        <Menu.Item as={Link} to='/myItems'>
          My Items
        </Menu.Item>
        <Dropdown item>
          <Dropdown.Menu>
            <Dropdown.Item as={Link} to='/myItems/filters/upcoming'>Upcoming</Dropdown.Item>
            <Dropdown.Item as={Link} to='/myItems/filters/upcomingDvd'>Upcoming DVD's</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Menu.Item as={Link} to='/lists'>
          My Lists
        </Menu.Item>
        {
          (user || {}).isAdmin &&
          <Menu.Item as={ Link } to='/adminUsers'>
            Manage Users
          </Menu.Item>
        }

        {
          isLoggedIn() ? (
            <Menu.Menu position='right'>
              <Dropdown item text={ getUser().username }>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to='/profile/edit'>Edit Profile</Dropdown.Item>
                  <Dropdown.Item as={Link} to='/logout'>Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Menu.Menu>
          ) : (
            <Menu.Menu position='right'>
              <Menu.Item name='register' as={Link} to='/register' />
              <Menu.Item name='login' as={Link} to='/login' />
            </Menu.Menu>
          )
        }
      </Menu>
    )
  }
}
