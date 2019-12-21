import React, { Component } from "react";
import { NavLink, BrowserRouter as Router, Route } from "react-router-dom";
import "./App.css";
import Home from "./Home";
import MyBin from "./MyBin";
import MyPost from "./MyPost";
import NewPost from "./NewPost";

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <header className="App-header">
            <h1 className="App-title">
              GraphQL With Apollo Client/Server Demo
            </h1>
            <nav>
              <NavLink className="navlink" to="/">
                Home
              </NavLink>
              <NavLink className="navlink" to="/my-bin">
                My Bin
              </NavLink>
              <NavLink className="navlink" to="/my-posts">
                My Posts
              </NavLink>
              <NavLink className="navlink" to="/new-post">
                New Post
              </NavLink>
            </nav>
          </header>
          <Route exact path="/" component={Home} />
          <Route path="/my-bin/" component={MyBin} />
          <Route path="/my-posts/" component={MyPost} />
          <Route path="/new-post/" component={NewPost} />
        </div>
      </Router>
    );
  }
}

export default App;
