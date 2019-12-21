import React, { Component } from "react";
import "./App.css";
import { Query, Mutation } from "react-apollo";
import queries from "../queries";

class Home extends Component {
  constructor(props){
    super(props);
    this.state= {
      pageNumber: 0
    }
  }

  buttClick (){
    this.setState({
      pageNumber: this.state.pageNumber+1
    })
  }

  getButtText(binned){
    if(binned){
      return "Remove from Bin!";
    } else {
      return "Add to Bin!";
    }
  }
  getAlertMsg(binned){
    if(binned){
      return "Removed";
    } else {
      return "Added";
    }
  }

  render() {
    return (
      <div className="card">
        <Query query={queries.GET_API_IMAGES}
              variables={{pageNum: this.state.pageNumber}}>
          {({ data, loading, error }) => {
            // console.log("data is: ", data);
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
            if(!data){
              return null;
            }
            console.log(data.unsplashImages);
            return (data.unsplashImages.map(apiImg => {
              return (
                <div className="card-body" key={apiImg.id} >
                  <img src={apiImg.url} alt="asdf" height="100%" width="100%" />
                  <p>{apiImg.description}</p>
                  <p>Posted by: {apiImg.poster_name}</p>
                  <Mutation mutation={queries.UPDATE_IMAGE}>
                    {(editImage, { data }) => (
                      <button onClick={e => {
                        editImage({
                          variables: {
                            id: apiImg.id,
                            binned: apiImg.binned
                          }
                        });
                        alert(`Image ${this.getAlertMsg(apiImg.binned)}`);
                        // window.location.reload();
                      }}>
                        {this.getButtText(apiImg.binned)}
                      </button>
                    )}
                  </Mutation>
                </div>
              );
            }));
          }
          }
        </Query>
        <button onClick={this.buttClick.bind(this)}>Load More!</button>
      </div>
    );
  }
}

export default Home;
