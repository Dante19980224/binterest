import gql from "graphql-tag";


const GET_API_IMAGES = gql`
    query($pageNum: Int){
      unsplashImages(pageNum: $pageNum){
        id
        url
        poster_name
        description
        user_posted
        binned
      }
    }
`;

const GET_BINNED_IMAGES = gql`
    query{
      binnedImages{
        id
        url
        poster_name
        description
        user_posted
        binned
      }
    }
`;

const GET_USER_POSTED_IMAGES = gql`
    query{
      userPostedImages{
        id
        url
        poster_name
        description
        user_posted
        binned
      }
    }
`;

const UPLOAD_IMAGE = gql`
    mutation (
      $url: String!
      $poster_name: String!
      $description: String
      $user_posted: Boolean!
      $binned: Boolean!
    ){
      uploadImage(
        url: $url
        poster_name: $poster_name
        description: $description
        user_posted: $user_posted
        binned: $binned
      ){
        id
        url
        poster_name
        description
        user_posted
        binned
      }
    }
`;

const UPDATE_IMAGE = gql`
    mutation (
      $id: ID!
      $url: String
      $poster_name: String
      $description: String
      $user_posted: Boolean
      $binned: Boolean
    ){
      updateImage(
        id: $id
        url: $url
        poster_name: $poster_name
        description: $description
        user_posted: $user_posted
        binned: $binned
      ){
        id
        url
        poster_name
        description
        user_posted
        binned
      }
    }
`;

const DELETE_IMAGE = gql`
    mutation (
      $id: ID!
    ){
      deleteImage(
        id: $id
      ){
        id
        url
        poster_name
        description
        user_posted
        binned
      }
    }
`;



export default {
  GET_API_IMAGES,
  GET_BINNED_IMAGES,
  GET_USER_POSTED_IMAGES,
  UPLOAD_IMAGE,
  UPDATE_IMAGE,
  DELETE_IMAGE
};
