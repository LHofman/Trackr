import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Checkbox, Confirm, Icon, List } from 'semantic-ui-react';

import canEdit from '../../utils/canEdit';
import fetch from '../../utils/fetch';
import getUser from '../../utils/getUser';
import isLoggedIn from '../../utils/isLoggedIn';

class GameObjective extends Component {
  constructor(props) {
    super(props);
    this.state = {
      amount: 0,
      completed: false,
      confirmationAlert: false,
      following: props.following,
      gameObjective: props.gameObjective,
      hasSubObjectives: false,
      showHint: false,
      viewTitle: false,
    }
  }

  componentWillReceiveProps(props) {
    const userGameObjective = props.gameObjective.userGameObjective;
    if (userGameObjective) {
      this.setState({
        amount: userGameObjective.amount,
        completed: userGameObjective.completed
      })
    }
  }

  componentWillMount() {
    this.hasSubObjectives();
  }

  getEditUrl() {
    const { game, parent } = this.state.gameObjective;
    let editUrl = `/objectives/${game.title_id}`;
    if (parent) editUrl += `/subObjectives/${parent.objective_id}`;
    return editUrl.concat(`/${this.state.gameObjective.objective_id}/edit`);
  }

  hasSubObjectives() {
    fetch(`/api/hasSubObjectives/${this.state.gameObjective._id}`).then(result => {
      this.setState({ hasSubObjectives: result });
    });
  }

  hideConfirmationAlert() {
    this.setState({ confirmationAlert: false });
  }

  hideHint() {
    this.setState({showHint: false});
  }

  onDelete() {
    this.hideConfirmationAlert();
    this.props.onDelete(this.state.gameObjective);
  }

  saveUpdatedAmount() {
    const userGameObjective = this.state.gameObjective.userGameObjective || {};

    if (this.state.amount === userGameObjective.amount) return;

    this.updateUserObjective();
  }

  showConfirmationAlert() {
    this.setState({ confirmationAlert: true });
  }

  showHint() {
    this.setState({showHint: true});
  }

  viewTitle() {
    this.setState({viewTitle: true})
  }

  toggleCompleted() {
    this.setState({ completed: !this.state.completed }, () => this.updateUserObjective());
  }

  updateAmount(e) {
    this.setState({ amount: parseInt(e.target.value, 10) });
  }

  updateUserObjective() {
    let { amount, completed, gameObjective } = this.state;

    if (amount < 0) {
      amount = 0;
    }

    if (gameObjective.amount > 1) {
      completed = amount >= gameObjective.amount;
    }

    let userGameObjective = gameObjective.userGameObjective;
    if (userGameObjective) {
      userGameObjective.amount = amount;
      userGameObjective.completed = completed;
    } else {
      userGameObjective = {
        gameObjective: this.state.gameObjective._id,
        user: getUser().id,
        amount,
        completed
      };
    }

    let promise = Promise.resolve({});
    if (gameObjective.userGameObjective) {
      promise = fetch(`/api/userGameObjectives/${userGameObjective._id}`, 'put', true, userGameObjective);
    } else {
      promise = fetch(`/api/userGameObjectives`, 'post', true, userGameObjective);
    }
    
    promise.then((newUserGameObjective) => {
      const gameObjective = this.state.gameObjective;
      gameObjective.userGameObjective = newUserGameObjective;
      this.setState({ gameObjective });
      this.props.refreshParent();
    }).catch(console.log);
  }

  render() {
    const { gameObjective, amount, completed } = this.state;
    const spoiler = gameObjective.spoiler && !this.state.viewTitle;
    const name = spoiler ? 'spoilers' : gameObjective.objective;

    return (
      <List.Item>
        <List.Content>
          <List.Header style={{ float: 'left' }} >
            {`${gameObjective.index}. `}
            {
              this.state.hasSubObjectives ?
                <a href={`/objectives/${gameObjective.game.title_id}/subObjectives/${gameObjective.objective_id}`}>
                  { name }
                </a> : name
            }
            {
              this.state.following &&
              <div style={{ float: 'left', marginRight:'1em'}}>
                {
                  gameObjective.amount && gameObjective.amount > 1
                    ? (
                      <div>
                        <input
                          name='amount'
                          type='number'
                          min='0'
                          value={ amount }
                          style={{ width: '50px' }}
                          onChange={ this.updateAmount.bind(this) }
                          onBlur={ this.saveUpdatedAmount.bind(this) } />
                        &nbsp; / { gameObjective.amount }
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
            }
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
                {
                  this.state.showHint &&
                  <div><br/>{ gameObjective.hint }</div>
                }
              </div>
            }
            {
              isLoggedIn() && !this.state.hasSubObjectives &&
              <Link to={`/objectives/${gameObjective.game.title_id}/subObjectives/${gameObjective.objective_id}/add`}>
                <Icon name='angle double down' color='green' />
              </Link>
            }
            {
              canEdit(gameObjective) &&
              <div style={{ display: 'inline' }}>
                <Link to={this.getEditUrl()}>
                  <Icon name='edit' color='orange' />
                </Link>
                <Icon name='trash' color='red' onClick={this.showConfirmationAlert.bind(this)} />
              </div>
            }
            <Confirm
              open={this.state.confirmationAlert}
              header={`confirm deletion`}
              content={`Are you sure you want to delete ${gameObjective.objective}?`}
              onCancel={this.hideConfirmationAlert.bind(this)}
              onConfirm={this.onDelete.bind(this)}
            />
          </List.Header>
        </List.Content>
        {
          this.props.count <= 15 &&
          <div><br/><br/></div>
        }
      </List.Item>
    );
  }
}

export default GameObjective;
