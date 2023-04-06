import React, { Component } from 'react';
import { Checkbox, Icon, List } from 'semantic-ui-react';

import fetch from '../../../utils/fetch';

class GameObjectiveBookmark extends Component {
  constructor(props) {
    super(props);
    this.state = {
      amount: props.gameObjective.userGameObjective.amount,
      completed: props.gameObjective.userGameObjective.completed,
      editingAmount: false,
      gameObjective: props.gameObjective,
      isBookmarked: true,
      showHint: false,
      viewTitle: false,
    }
  }

  hideHint() {
    this.setState({showHint: false});
  }

  saveUpdatedAmount() {
    const userGameObjective = this.state.gameObjective.userGameObjective;

    if (this.state.amount === userGameObjective.amount) return;

    this.updateUserObjective();
  }

  showHint() {
    this.setState({showHint: true});
  }

  toggleBookmark() {
    const userGameObjective = this.state.gameObjective.userGameObjective;

    const isBookmarked = !this.state.isBookmarked;
    this.setState({ isBookmarked });
    
    fetch(
      `/api/userGameObjectives/${userGameObjective._id}`,
      'put',
      true,
      { ...userGameObjective, isBookmarked }
    );
  }

  toggleCompleted() {
    this.setState({ completed: !this.state.completed }, () => this.updateUserObjective());
  }

  toggleEditAmount() {
    this.setState({ editingAmount: !this.state.editingAmount });
  }

  updateAmount(e) {
    this.setState({ amount: parseInt(e.target.value, 10) });
  }

  updateUserObjective() {
    let { amount, completed, gameObjective, isBookmarked } = this.state;

    if (amount < 0) {
      amount = 0;
    }

    if (gameObjective.amount > 1) {
      completed = amount >= gameObjective.amount;
    }

    let userGameObjective = gameObjective.userGameObjective;
    userGameObjective.amount = amount;
    userGameObjective.completed = completed;
    userGameObjective.isBookmarked = isBookmarked;

    fetch(
      `/api/userGameObjectives/${userGameObjective._id}`,
      'put',
      true,
      userGameObjective
    ).then((newUserGameObjective) => {
      const gameObjective = this.state.gameObjective;
      gameObjective.userGameObjective = newUserGameObjective;
      this.setState({ gameObjective });
    }).catch(console.log);
  }

  viewTitle() {
    this.setState({viewTitle: true})
  }

  render() {
    const {
      amount,
      completed,
      editingAmount,
      gameObjective,
      isBookmarked,
      showHint,
      viewTitle
    } = this.state;
    const spoiler = gameObjective.spoiler && !viewTitle;
    const name = spoiler ? 'spoilers' : gameObjective.objective;

    let url = `/objectives/${gameObjective.game.title_id}`;
    if (gameObjective.parent) {
      url += `/subObjectives/${gameObjective.parent.objective_id}`;
    }

    return (
      <List.Item>
        <List.Content>
          <List.Header style={{ float: 'left' }} >
            <div style={{ float: 'left', marginRight:'1em'}}>
              {
                gameObjective.amount && gameObjective.amount > 1
                  ? (
                    <div>
                      {
                        editingAmount
                        ? (
                          <input
                            name='amount'
                            type='number'
                            min='0'
                            value={ amount }
                            style={{ width: '50px' }}
                            onChange={ this.updateAmount.bind(this) }
                            onBlur={ this.saveUpdatedAmount.bind(this) } />
                        ) : amount
                      }
                      <Icon name='pencil' onClick={this.toggleEditAmount.bind(this)} />
                      / { gameObjective.amount }
                    </div>
                  ) : ( 
                    <Checkbox
                      key='completed'
                      name='completed'
                      checked={ completed } 
                      onChange={ this.toggleCompleted.bind(this) } />
                  )
              }
            </div>
            <Icon name={ `bookmark${ isBookmarked ? '' : ` outline` }` } onClick={this.toggleBookmark.bind(this)} />
            {`${gameObjective.index}. `}
            <a href={ url }>
              { name }
            </a>
            {
              spoiler &&
              <Icon name='eye' onClick={this.viewTitle.bind(this)} />
            }
            {
              gameObjective.hint &&
              <div style={{ display: 'inline' }}
                onMouseEnter={this.showHint.bind(this)}
                onMouseLeave={this.hideHint.bind(this)}>
                <Icon name='help' />
                { showHint && <div><br/>{ gameObjective.hint }</div> }
              </div>
            }
          </List.Header>
        </List.Content>
      </List.Item>
    );
  }
}

export default GameObjectiveBookmark;
