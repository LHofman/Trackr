import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Button, Form, Message } from 'semantic-ui-react';

import fetch from '../../utils/fetch';
import getUser from '../../utils/getUser';

class AddObjective extends Component {
  constructor() {
    super();
    this.state = {
      backUrl: '',
      game: undefined,
      index: 0,
      objective: '',
      objectiveError: '',
      redirect: undefined
    }
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  componentWillMount() {
    const title_id = this.props.match.params.titleId;
    this.setState({backUrl: `/items/${title_id}/objectives`});
    this.getGame(title_id);
  }

  getGame(title_id) {
    return fetch(`/api/items/title_id/${title_id}`).then(item => {
      if (!item || item === null || item.type !== 'Video Game') throw new Error('Game not found');
      this.setState({game: item})
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

    const newObjective = {
      index: this.state.index,
      objective: this.state.objective,
      game: this.state.game._id,
      createdBy: getUser().id
    }

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
          <Form.Field>
            <label>Index</label>
            <input type='number' name='index' value={this.state.index} onChange={this.handleInputChange} />
          </Form.Field>
          <Form.Field>
            <label>Objective</label>
            <input placeholder='Objective' name='objective' onChange={this.handleInputChange} />
            {
              this.state.objectiveError &&
              <Message error header={this.state.objectiveError} />
            }
          </Form.Field>
          <Button positive floated='left' type='submit'>Submit</Button>
          <Button negative floated='right' as={Link} to={this.state.backUrl}>Cancel</Button>
        </Form>
      </div>
    );
  }
}

export default AddObjective;
