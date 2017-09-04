import React, { Component } from "react";
import "./Idea.css";

class Idea extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: this.props.idea.title || "",
      body: this.props.idea.body || "",
      wordCountVisible: false
    };
    this.updateIdeaValue = this.updateIdeaValue.bind(this);
    this.deleteIdea = this.deleteIdea.bind(this);
    this.bodyFocus = this.bodyFocus.bind(this);
    this.bodyWordCount = this.bodyWordCount.bind(this);
  }

  updateIdeaValue(event) {
    // Check if entered value has not changed from default value
    if (
      event.target.value === "" &&
      this.props.idea[event.target.name] == null
    ) {
      return;
    }
    // Update idea based on updated field value
    this.props.update(this.props.idea, event.target.name, event.target.value);
  }

  deleteIdea() {
    this.props.delete(this.props.idea);
  }

  bodyFocus() {
    // Display character count on focus if < 15 remaining
    this.setState({
      wordCountVisible: this.state.body.length > 126 ? true : false
    });
  }

  bodyWordCount(event) {
    // Hide when remaining character count >15, display when <15
    this.setState({
      body: event.target.value,
      wordCountVisible: this.state.body.length > 125 ? true : false
    });
  }

  render() {
    return (
      <div className="idea">
        <input
          autoFocus={this.state.title ? false : true}
          className="ideaTitle"
          name="title"
          onBlur={this.updateIdeaValue}
          onChange={e => this.setState({ title: e.target.value })}
          placeholder="Enter title..."
          value={this.state.title}
        />
        <textarea
          className="ideaBody"
          maxLength="140"
          name="body"
          onBlur={this.updateIdeaValue}
          onChange={this.bodyWordCount}
          onFocus={this.bodyFocus}
          placeholder="Enter content..."
          value={this.state.body}
        />
        {this.state.wordCountVisible
          ? <span className="ideaBodyCharacterCount">
              Characters: {this.state.body.length}
            </span>
          : null}
        <button
          className="ideaDelete"
          onClick={this.deleteIdea}
          title="Delete Idea"
        >
          ✖
        </button>
      </div>
    );
  }
}

export default Idea;
