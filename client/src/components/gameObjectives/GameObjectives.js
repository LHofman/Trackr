import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Redirect from 'react-router-dom/Redirect';
import { Breadcrumb, Button, Checkbox, List } from 'semantic-ui-react';

import GameObjective from './GameObjective';

import fetch from '../../utils/fetch';
import getUser from '../../utils/getUser';
import isLoggedIn from '../../utils/isLoggedIn'

class GameObjectives extends Component {
  constructor(props) {
    super(props);
    this.state = {
      game: '',
      parent: '',
      following: false,
      gameObjectives: [],
      redirect: undefined,
      loading: true
    }

    this.onDelete = this.onDelete.bind(this);
    this.refresh = this.refresh.bind(this);
    this.selectAll = this.selectAll.bind(this);
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
      return fetch(`/api/userItems/${getUser().id}/${this.state.game._id}`).then(userItem => {
        if (userItem) this.setState({ following: true });
        else this.setState({ following: false });
      });
    });
  }

  getParent(objective_id) {
    return fetch(`/api/gameObjectives/objective_id/${this.state.game._id}/${objective_id}`).then(gameObjective => {
      if (!gameObjective) throw new Error('GameObjective not found');
      this.setState({ parent: gameObjective });
    }).catch(reason => {
      this.setState({redirect: '/'});
    });
  }

  getGameObjectives(apiUrl) {
    return fetch(apiUrl).then(gameObjectives => {
      if (!gameObjectives || gameObjectives === null) throw new Error('gameObjectives not found');
      this.setState({ gameObjectives });
    }).catch(reason => {
      this.setState({redirect: `/items/${this.state.game.title_id}`});
    }).then(() => this.setState({ loading: false }));
  }

  getUserGameObjectives() {
    const user = getUser();
    if (!user) return;
    return fetch(`/api/userGameObjectives/${user.id}/game/${this.state.game._id}`).then(userGameObjectives => {
      const gameObjectives = this.state.gameObjectives;
      userGameObjectives.forEach(userGameObjective => {
        for (let i = 0; i < gameObjectives.length; i++) {
          if (gameObjectives[i]._id === userGameObjective.gameObjective) {
            gameObjectives[i].userGameObjective = userGameObjective;
          }
        }
      })
      this.setState({gameObjectives});
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

  refresh() {
    this.forceUpdate();
  }

  selectAll(data) {
    const gameObjectives = this.state.gameObjectives;
    const promises = [];

    for (let i = 0; i < gameObjectives.length; i++) {
      if (data.checked && !gameObjectives.userGameObjective) {
        gameObjectives[i].userGameObjective = {
          gameObjective: gameObjectives[i]._id,
          user: getUser().id,
          completed: true
        }
        promises.push(fetch(`/api/userGameObjectives`, 'post', true, gameObjectives[i].userGameObjective));
      } else if (!data.checked && gameObjectives[i].userGameObjective) {
        let userGameObjectiveId = gameObjectives[i].userGameObjective._id;
        delete gameObjectives[i].userGameObjective;
        promises.push(fetch(`/api/userGameObjectives/${userGameObjectiveId}`, 'delete', true))
      }
    }
    Promise.all(promises).then(res => {
      this.setState({ gameObjectives });
    });
  }

  render() {
    const redirect = this.state.redirect;
    if (redirect) return <Redirect to={redirect} />

    let gameObjectives = this.state.gameObjectives;
    const all = gameObjectives.reduce((all, gameObjective) => all && typeof gameObjective.userGameObjective !== 'undefined', true);

    gameObjectives = gameObjectives.sort((o1, o2) => o1.index - o2.index).map(gameObjective => 
      <GameObjective 
        key={gameObjective._id} 
        gameObjective={gameObjective} 
        onDelete={this.onDelete} 
        following={this.state.following}
        count={this.state.gameObjectives.length}
        refreshParent={this.refresh}
      />
    );

    return (
      <div>
        <Button labelPosition='left' icon='left chevron' content='Back' as={Link} to={`/items/${this.state.game.title_id}`} />
        <h1>{this.state.game.title} objectives</h1>
        {this.getBreadCrumbs()}
        {
          isLoggedIn() && !this.state.loading &&
          <Button positive circular floated='right' icon='plus' as={Link} 
            to={this.getAddUrl()} 
          />
        }
        <br /><br />
        <Checkbox key='all' name='all' checked={all} onChange={(e, data) => this.selectAll(data)} label="(De)select all"/>
        <br/><br />
        <List>
          {gameObjectives}
        </List>
      </div>
    );
  }
}

export default GameObjectives;
