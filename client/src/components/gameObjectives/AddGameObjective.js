import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Button, Form, Message, TextArea } from 'semantic-ui-react';

import fetch from '../../utils/fetch';
import getUser from '../../utils/getUser';

class AddObjective extends Component {
  constructor() {
    super();
    this.state = {
      backUrl: '',
      game: undefined,
      parent: undefined,
      hint: undefined,
      index: 0,
      indexError: '',
      objective: '',
      objectiveError: '',
      redirect: undefined
    }
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  componentWillReceiveProps(newProps) {
    this.init(newProps);
  }

  componentWillMount() {
    this.init(this.props);
  }

  init(props) {
    const params = props.match.params;
    const title_id = params.titleId;
    const parent_id = params.parentId;

    let backUrl = `/objectives/${title_id}`;
    if (parent_id) backUrl += `/subObjectives/${parent_id}`;
    
    this.setState({ backUrl });
    this.getGame(title_id).then(() => { 
      if (parent_id) this.getParent(parent_id); 
    });
  }

  getGame(title_id) {
    return fetch(`/api/items/title_id/${title_id}`).then(item => {
      if (!item || item === null || item.type !== 'Video Game') throw new Error('Game not found');
      this.setState({game: item})
    }).catch(reason => {
      this.setState({redirect: '/'});
    });
  }

  getParent(objective_id) {
    return fetch(`/api/gameObjectives/objective_id/${this.state.game._id}/${objective_id}`).then(gameObjective => {
      if (!gameObjective) throw new Error('Parent not found');
      this.setState({ parent: gameObjective });
    }).catch(reason => {
      this.setState({redirect: '/'});
    });
  }

  addObjective(newObjective) {
    return fetch('/api/gameObjectives', 'post', true, newObjective).then(objective => {
      this.setState({redirect: this.state.backUrl});
    }).catch(console.log);
  }

  checkForErrors() {
    let isError = false;
    const errors = {};

    if (!this.state.index) {
      isError = true;
      errors.indexError = 'Index is required (enter 0 or a negative number if you want it to show up at the top)';
    } else {
      errors.indexError = '';
    }

    if (!this.state.objective) {
      isError = true;
      errors.objectiveError = 'Objective is required';
    } else {
      errors.objectiveError = '';
    }

    if (isError) {
      this.setState({
        ...this.state,
        ...errors
      });
    }

    return isError;
  }

  handleSubmit(e) {
    e.preventDefault();
    const err = this.checkForErrors();
    if (err) return;

    const { game, parent, hint, index, objective } = this.state;
    const newObjective = {
      game,
      createdBy: getUser().id,
      hint,
      index,
      objective,
    }
    if (parent) newObjective.parent = parent._id;

    this.addObjective(newObjective);
  }

  handleInputChange(e) {
    const target = e.target;
    this.setState({[target.name]: target.value});
  }

  render() {
    const redirect = this.state.redirect;
    if (redirect) return <Redirect to={redirect} />


    return (
      <div>
        <h1>Add Objective</h1>
        <Form error onSubmit={this.handleSubmit.bind(this)}>
          <Form.Field required>
            <label>Index</label>
            <input type='number' name='index' value={this.state.index} onChange={this.handleInputChange} />
            {
              this.state.indexError &&
              <Message error header={this.state.indexError} />
            }
          </Form.Field>
          <Form.Field required>
            <label>Objective</label>
            <input placeholder='Objective' name='objective' onChange={this.handleInputChange} />
            {
              this.state.objectiveError &&
              <Message error header={this.state.objectiveError} />
            }
          </Form.Field>
          <Form.Field>
            <label>Hint</label>
            <TextArea autoHeight placeholder='Hint' name='Hint' onChange={this.handleInputChange} />
          </Form.Field>
          <Button positive floated='left' type='submit'>Submit</Button>
          <Button negative floated='right' as={Link} to={this.state.backUrl}>Cancel</Button>
        </Form>
      </div>
    );
  }
}

export default AddObjective;
