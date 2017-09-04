import React, { Component } from "react";
import "./App.css";
import Idea from "./Idea";

let API_URL = "http://ideaapi.neverodd.co.uk";
//let API_URL = "http://localhost:4000";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ideas: [],
      notificationMessage: "",
      notificationVisible: false,
      notificationError: false
    };
    this.fetchIdeas = this.fetchIdeas.bind(this);
    this.sortIdeas = this.sortIdeas.bind(this);
    this.createIdea = this.createIdea.bind(this);
    this.deleteIdea = this.deleteIdea.bind(this);
    this.updateIdea = this.updateIdea.bind(this);
    this.showNotification = this.showNotification.bind(this);
  }

  componentWillMount() {
    // Check for ideas in localStorage
    let saved_ideas = JSON.parse(localStorage.getItem("ideas"));
    if (saved_ideas) {
      this.setState({
        ideas: saved_ideas
      });
    }
    // Fetch latest ideas from API
    this.fetchIdeas();
  }

  fetchIdeas() {
    fetch(API_URL + "/ideas", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(response => {
        if (response.ok) {
          response.json().then(json => {
            this.setState(
              {
                ideas: json
              },
              function() {
                localStorage.setItem("ideas", JSON.stringify(json));
              }
            );
          });
        } else {
          this.showNotification("Unable to fetch ideas from API.", true);
        }
      })
      .catch(
        function(error) {
          this.showNotification(
            "Unable to fetch ideas from API. Please check network.",
            true
          );
        }.bind(this)
      );
  }

  sortIdeas(event) {
    // Sort ideas based on sort_parameter from dropdown
    let sort_parameter = event.target.value;
    let sorted_ideas = this.state.ideas.sort(
      (a, b) =>
        (a[sort_parameter]
          ? a[sort_parameter].localeCompare(b[sort_parameter])
          : 0)
    );
    this.setState({
      ideas: sorted_ideas
    });
  }

  createIdea() {
    // Fetch new idea from the API
    fetch(API_URL + "/ideas/new", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(response => {
        if (response.ok) {
          response.json().then(json => {
            // Add newly created idea to ideas array
            let newIdea = Object.assign({}, json, {
              title: null,
              body: null
            });
            this.setState(
              {
                ideas: [...this.state.ideas, newIdea]
              },
              function() {
                localStorage.setItem("ideas", JSON.stringify(this.state.ideas));
              }
            );
          });
        } else {
          this.showNotification("Unable to create idea.", true);
        }
      })
      .catch(
        function(error) {
          this.showNotification(
            "Unable to create idea. Please check network.",
            true
          );
        }.bind(this)
      );
  }

  updateIdea(idea, key, value) {
    if (value !== idea[key]) {
      let index = this.state.ideas
        .map(function(i) {
          return i.id;
        })
        .indexOf(idea.id);
      fetch(API_URL + "/idea/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: idea.id,
          title: key === "title" ? value : idea.title,
          body: key === "body" ? value : idea.body
        })
      })
        .then(response => {
          if (response.ok) {
            // Update idea with newly saved value
            let updatedIdea = Object.assign({}, this.state.ideas[index], {
              [key]: value
            });
            // Replace updated idea in ideas array
            this.setState(
              {
                ideas: [
                  ...this.state.ideas.slice(0, index),
                  updatedIdea,
                  ...this.state.ideas.slice(index + 1)
                ]
              },
              function() {
                localStorage.setItem("ideas", JSON.stringify(this.state.ideas));
                this.showNotification("Idea successfully updated.");
              }
            );
          } else {
            this.showNotification("Unable to update idea.", true);
          }
        })
        .catch(
          function(error) {
            this.showNotification(
              "Unable to update idea. Please check network.",
              true
            );
          }.bind(this)
        );
    }
  }

  deleteIdea(idea) {
    fetch(API_URL + "/idea/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: idea.id
      })
    })
      .then(response => {
        if (response.ok) {
          // Remove idea from ideas array
          this.setState(
            {
              ideas: this.state.ideas.filter(function(i) {
                return i.id !== idea.id;
              })
            },
            function() {
              localStorage.setItem("ideas", JSON.stringify(this.state.ideas));
              this.showNotification("Idea successfully deleted.");
            }
          );
        } else {
          this.showNotification("Unable to delete idea.", true);
        }
      })
      .catch(
        function(error) {
          this.showNotification(
            "Unable to delete idea. Please check network.",
            true
          );
        }.bind(this)
      );
  }

  showNotification(message, isError) {
    this.setState(
      {
        notificationVisible: true,
        notificationMessage: message,
        notificationError: isError || false
      },
      function() {
        if (this._timer != null) {
          clearTimeout(this._timer);
        }
        this._timer = setTimeout(
          function() {
            this.setState({ notificationVisible: false });
          }.bind(this),
          3000
        );
      }
    );
  }

  render() {
    return (
      <div>
        <div className="headerContainer">
          <h3>Welcome to the Idea Board</h3>
          <label htmlFor="sorter">Sort ideas by: </label>
          <select id="sorter" onChange={this.sortIdeas}>
            <option value="created_at">Created At</option>
            <option value="title">Title</option>
          </select> | <button onClick={this.createIdea}>
            Add Idea
          </button>
          {this.state.notificationVisible &&
            <div
              className={
                "alertContainer" +
                  (this.state.notificationError ? " error" : "")
              }
            >
              {this.state.notificationMessage}
            </div>}
        </div>
        <div className="ideasContainer">
          {this.state.ideas.map(function(idea) {
            return (
              <Idea
                key={idea.id}
                idea={idea}
                delete={this.deleteIdea}
                update={this.updateIdea}
              />
            );
          }, this)}
        </div>
      </div>
    );
  }
}

export default App;
