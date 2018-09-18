import React, { Component } from 'react';
import { List } from 'semantic-ui-react';

class GameObjective extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gameObjective: props.gameObjective
    }
  }

  render() {
    const gameObjective = this.state.gameObjective;
    return (
      <List.Item>
        <List.Content>
          <List.Header style={{ float: 'left' }} >
            {`${gameObjective.index}. ${gameObjective.objective}`}
          </List.Header>
        </List.Content>
      </List.Item>
    );
  }
}

export default GameObjective;
