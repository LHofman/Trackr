import React from 'react';
import { Container } from 'semantic-ui-react';

import Main from './components/Main';
import Navbar from './components/Navbar';

export default () => (
  <Container>
    <Navbar />
    <Main />
  </Container>
);