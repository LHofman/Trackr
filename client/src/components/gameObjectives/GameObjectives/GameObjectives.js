import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Redirect from 'react-router-dom/Redirect';
import { Breadcrumb, Button, Checkbox, List } from 'semantic-ui-react';

import GameObjective from './GameObjective';

import fetch from '../../../utils/fetch';
import getUser from '../../../utils/getUser';
import isLoggedIn from '../../../utils/isLoggedIn'

class GameObjectives extends Component {
  constructor(props) {
    super(props);
    this.state = {
      game: '',
      parent: '',
      following: false,
      gameObjectives: [],
      redirect: undefined,
      loading: true,
      blindPlaythrough: null,
      highestObjectiveCompleted: 0
    }

    this.onDelete = this.onDelete.bind(this);
    this.selectAll = this.selectAll.bind(this);
    this.toggleBlindPlaythrough = this.toggleBlindPlaythrough.bind(this);
    this.updateGameObjective = this.updateGameObjective.bind(this);
  }

  componentWillReceiveProps(newProps) {
    this.init(newProps);
  }

  componentWillMount() {
    this.init(this.props);
  }

  init(props) {
    const params = props.match.params;
    const parentId = params.parentId;

    this.getGame(params.titleId).then(() => {
      if (!parentId)
        this.getGameObjectives(`/api/gameObjectives/byGame/${this.state.game._id}`).then(() => {
          this.getUserGameObjectives();
        });
      else {
        this.getParent(parentId).then(() => {
          this.getGameObjectives(`/api/gameObjectives/byParent/${this.state.parent._id}`).then(() => {
            this.getUserGameObjectives();
          });
        });
      }
    });
  }

  getGame(title_id) {
    return fetch(`/api/items/title_id/${title_id}`).then(item => {
      if (!item || item === null || item.type !== 'Video Game') throw new Error('Game not found');
      this.setState({ game: item });
    }).catch(reason => {
      this.setState({redirect: '/'});
    }).then(() => {
      if (!isLoggedIn()) return;
      return fetch(`/api/users/${getUser().id}/userItems/${this.state.game._id}`).then(userItem => {
        if (userItem) this.setState({ following: true });
        else this.setState({ following: false });
      });
    });
  }

  getParent(objective_id) {
    return fetch(`/api/gameObjectives/objective_id/${this.state.game._id}/${objective_id}`).then(gameObjective => {
      if (!gameObjective) throw new Error('GameObjective not found');
      this.setState({
        parent: gameObjective,
        blindPlaythrough: true
      });
    }).catch(reason => {
      this.setState({redirect: '/'});
    });
  }

  getGameObjectives(apiUrl) {
    return fetch(apiUrl).then(gameObjectives => {
      if (!gameObjectives || gameObjectives === null) throw new Error('gameObjectives not found');
      this.setState({ gameObjectives });
    }).catch(reason => {
      this.setState({ redirect: `/items/${this.state.game.title_id}` });
    }).then(() => this.setState({ loading: false }));
  }

  getUserGameObjectives() {
    const user = getUser();
    if (!user) return;
    return fetch(`/api/userGameObjectives/${user.id}/game/${this.state.game._id}`).then(userGameObjectives => {
      const gameObjectives = this.state.gameObjectives;
      let highestObjectiveCompleted = 0;
      userGameObjectives.forEach(userGameObjective => {
        for (let i = 0; i < gameObjectives.length; i++) {
          if (gameObjectives[i]._id === userGameObjective.gameObjective) {
            if (userGameObjective.completed) {
              highestObjectiveCompleted = Math.max(highestObjectiveCompleted, gameObjectives[i].index);
            }
            gameObjectives[i].userGameObjective = userGameObjective;
          }
        }
      })
      this.setState({ gameObjectives, highestObjectiveCompleted });
    }).catch(console.log);
  }

  onDelete(gameObjective) {
    return fetch(`/api/gameObjectives/${gameObjective._id}`, 'delete', true).then(res => {
      const gameObjectives = this.state.gameObjectives;
      gameObjectives.splice(gameObjectives.indexOf(gameObjective), 1);
      this.setState({ gameObjectives });
    }).catch(console.log);
  }

  getBreadCrumbs() {
    const sections = []
    let parent = this.state.parent;
    if (!parent) return;
    let active = false;
    while (parent) {
      active = parent === this.state.parent;
      sections.unshift({
        key: parent._id,
        content: active ? 
          parent.objective : 
          <a href={`/objectives/${this.state.game.title_id}/subObjectives/${parent.objective_id}`}>{parent.objective}</a>,
        active
      });
      parent = parent.parent;
    }
    sections.unshift({
      key: 'Home',
      content: <a href={`/objectives/${this.state.game.title_id}`}>Home</a>,
    });

    return <Breadcrumb icon='right chevron' sections={sections} />
  }

  getAddUrl() {
    const { game, parent } = this.state;
    let addUrl = `/objectives/${game.title_id}`;
    if (parent) addUrl += `/subObjectives/${parent.objective_id}`;
    return addUrl.concat('/add');
  }

  updateGameObjective(gameObjective) {
    let highestObjectiveCompleted = this.state.highestObjectiveCompleted;
    if (gameObjective.userGameObjective.completed) {
      highestObjectiveCompleted = Math.max(highestObjectiveCompleted, gameObjective.index);
    }
    this.setState({ highestObjectiveCompleted });
  }

  selectAll(data) {
    const gameObjectives = this.state.gameObjectives;
    const promises = [];
    let highestObjectiveCompleted = this.state.highestObjectiveCompleted;

    for (let i = 0; i < gameObjectives.length; i++) {
      let userGameObjective = gameObjectives[i].userGameObjective;
      let promise = Promise.resolve({});

      if (userGameObjective) {
        if (data.checked) {
          if (userGameObjective.completed) continue;

          userGameObjective.completed = true;
          userGameObjective.amount = gameObjectives[i].amount;
          highestObjectiveCompleted = Math.max(highestObjectiveCompleted, gameObjectives[i].index);
        } else {
          if (!userGameObjective.completed) continue;

          userGameObjective.completed = false;
          userGameObjective.amount = 0;
        }

        promise = fetch(`/api/userGameObjectives/${userGameObjective._id}`, 'put', true, userGameObjective);
      } else {
        if (!data.checked) continue;

        userGameObjective = {
          gameObjective: gameObjectives[i]._id,
          user: getUser().id,
          amount: gameObjectives[i].amount,
          completed: true
        };
        highestObjectiveCompleted = Math.max(highestObjectiveCompleted, gameObjectives[i].index);

        promise = fetch(`/api/userGameObjectives`, 'post', true, userGameObjective);
      }

      gameObjectives[i].userGameObjective = userGameObjective;
      promises.push(promise);
    }

    Promise.all(promises).then(res => {
      this.setState({ gameObjectives, highestObjectiveCompleted });
    });
  }

  toggleBlindPlaythrough() {
    this.setState({ blindPlaythrough: !this.state.blindPlaythrough });
  }

  render() {
    const redirect = this.state.redirect;
    if (redirect) return <Redirect to={redirect} />

    let {
      all,
      blindPlaythrough,
      following,
      game,
      gameObjectives,
      highestObjectiveCompleted,
      loading
    } = this.state;

    all = gameObjectives.reduce((all, gameObjective) => {
      return all && (gameObjective.userGameObjective || {}).completed
    }, true);

    if (blindPlaythrough) {
      gameObjectives = gameObjectives.filter((gameObjective) => gameObjective.index <= highestObjectiveCompleted + 1);
    }

    gameObjectives = gameObjectives.sort((o1, o2) => o1.index - o2.index).map(gameObjective => 
      <GameObjective 
        key={gameObjective._id} 
        gameObjective={gameObjective} 
        onDelete={this.onDelete} 
        following={following}
        count={gameObjectives.length}
        updateGameObjective={this.updateGameObjective}
      />
    );

    const hasHiddenObjectives = this.state.gameObjectives.length > gameObjectives.length;

    return (
      <div>
        <Button labelPosition='left' icon='left chevron' content='Back' as={Link} to={`/items/${game.title_id}`} />
        <h1>{game.title} objectives</h1>
        {this.getBreadCrumbs()}
        {
          isLoggedIn() && !loading &&
          <Button positive circular floated='right' icon='plus' as={Link} 
            to={this.getAddUrl()} 
          />
        }
        <br />
        {
          blindPlaythrough !== null &&
          <div>
            <br />
            <Checkbox key='blind' name='blind' checked={blindPlaythrough} onChange={(e, data) => this.toggleBlindPlaythrough()} label="Blind Playthrough"/>
            <br />
          </div>
        }
        <Checkbox key='all' name='all' checked={all} onChange={(e, data) => this.selectAll(data)} label="(De)select all"/>
        <br/><br />
        <List>
          {gameObjectives}
        </List>
        { hasHiddenObjectives && '...' }
      </div>
    );
  }
}

export default GameObjectives;
