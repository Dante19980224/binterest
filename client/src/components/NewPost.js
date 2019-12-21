import React, { Component } from "react";
import "./App.css";
import { Mutation } from "react-apollo";
import queries from "../queries";

class NewPost extends Component {
  constructor(props){
    super(props);
    this.state= {
    //   pageNumber: 0
    }
  }
// img url of a burger  https://www.seriouseats.com/recipes/images/2015/07/20150728-homemade-whopper-food-lab-35-1500x1125.jpg
  render() {
    let url;
    let poster_name;
    let description;
    let body = (
      <Mutation mutation={queries.UPLOAD_IMAGE}>
          {(uploadImage, { data, loading, error }) => {
            if(loading){
                return (
                    <p>loading....</p>
                )
            }
            if(error){
                console.log(error);
                return (
                    <p>error</p>
                )
            }
            return (
            <form
              className="form"
              id="user-upload"
              onSubmit={e => {
                e.preventDefault();
                uploadImage({
                  variables: {
                    url: url.value,
                    poster_name: poster_name.value,
                    description: description.value,
                    user_posted: true,
                    binned: false
                  }
                });
                url.value = "";
                poster_name.value = "";
                description.value = "";
                // this.setState({ showAddModal: false });
                alert("User Added Image");
                // this.props.handleClose();
              }}
            >
              <div className="form-group">
                <label>
                  URL:
                  <br />
                  <input
                    type="text"
                    ref={node => {
                      url = node;
                    }}
                    required
                    autoFocus={true}
                  />
                </label>
              </div>
              <br />
              <div className="form-group">
                <label>
                  Poster Name:
                  <br />
                  <input
                    type="text"
                    ref={node => {
                      poster_name = node;
                    }}
                    required
                  />
                </label>
              </div>
              <div className="form-group">
                <label>
                  Description:
                  <br />
                  <input
                    type="text"
                    ref={node => {
                      description = node;
                    }}
                  />
                </label>
              </div>
              <br />
              <br />
              <button className="button add-button" type="submit">
                Upload Image
              </button>
            </form>
          )}}
        </Mutation>
    );
    return body;
  }
}

export default NewPost;
