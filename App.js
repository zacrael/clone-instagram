import React, { Component } from "react";
import { StyleSheet, Text, View } from "react-native";
import { createBottomTabNavigator } from "react-navigation-tabs";
import { createStackNavigator } from "react-navigation-stack";
import { createAppContainer } from "react-navigation";
import { f, auth, database, store } from "./config/config";
import feed from "./app/screens/feed.js";

import profile from "./app/screens/profile";
import upload from "./app/screens/upload.js";
import userProfile from "./app/screens/userProfile";
import comments from "./app/screens/comments.js";
const tabScreen = createBottomTabNavigator({
  Feed: { screen: feed },
  Upload: { screen: upload },
  Profile: { screen: profile }
});
const mainScreen = createStackNavigator(
  {
    Home: { screen: tabScreen },
    User: { screen: userProfile },
    Comments: { screen: comments }
  },
  {
    initialRouteName: "Home",
    mode: "modal",
    headerMode: "none"
  }
);
const Container = createAppContainer(mainScreen);
class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <Container />;
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  }
});
export default App;
