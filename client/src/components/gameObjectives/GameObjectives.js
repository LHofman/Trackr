import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Redirect from 'react-router-dom/Redirect';
import { Button, List } from 'semantic-ui-react';

import GameObjective from './GameObjective';

import fetch from '../../utils/fetch';

class GameObjectives extends Component {
  constructor(props) {
    super(props);
    this.state = {
      game: '',
      following: false,
      gameObjectives: [],
      redirect: undefined
    }
  }

  componentWillMount() {
    const title_id = this.props.match.params.titleId;
    this.getGame(title_id).then(() => {
      this.getGameObjectives();
    });
  }

  getGame(title_id) {
    return fetch(`/api/items/title_id/${title_id}`).then(item => {
      if (!item || item === null || item.type !== 'Video Game') throw new Error('Game not found');
      this.setState({ game: item });
    }).catch(reason => {
      this.setState({redirect: '/'});
    });
  }

  getGameObjectives() {
    const gameId = this.state.game._id;
    return fetch(`/api/gameObjectives/${gameId}`).then(gameObjectives => {
      if (!gameObjectives || gameObjectives === null) throw new Error('item not found');
      this.setState({ gameObjectives });
    }).catch(reason => {
      this.setState({redirect: `/items/${this.state.game.title_id}`});
    });
  }

  render() {
    const redirect = this.state.redirect;
    if (redirect) return <Redirect to={redirect} />


    const gameObjectives = this.state.gameObjectives.sort((o1, o2) => o1.index - o2.index).map(gameObjective => 
      <GameObjective key={gameObjective._id} gameObjective={gameObjective} game={this.state.game} />
    );

    return (
      <div>
        <Button labelPosition='left' icon='left chevron' content='Back' as={Link} to={`/items/${this.state.game.title_id}`} />
        <h1>{this.state.game.title} objectives</h1>
        <List>
          {gameObjectives}
        </List>
      </div>
    );
  }
}

export default GameObjectives;
