import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {jwtDecode} from "jwt-decode";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";

import Footer from "./components/Footer";
import Login from "./components/Login/Login";
import Signup from "./components/Signup/Signup";
import Home from "./components/Home/Home";  
import Mypolls from "./components/MyPolls/Mypolls";
import Notifications from "./components/Notification/Notification";
import Profile from "./components/Profile/Profile";
import ChatDetails from "./components/Profile/chatdetails/Chatdetails";

const Stack = createStackNavigator();

function HomeWithFooter() {
  return (
    <View style={{ flex: 1 }}>
      <Home />
      <Footer />
    </View>
  );
}

function Mypollswithfooter() {
  return (
    <View style={{ flex: 1 }}>
      <Mypolls />
      <Footer />
    </View>
  );
}

function Notificationswithfooter() {
  return (
    <View style={{ flex: 1 }}>
      <Notifications />
      <Footer />
    </View>
  );
}

function Profilewithfooter() {
  return (
    <View style={{ flex: 1 }}>
      <Profile />
      <Footer />
    </View>
  );
}
function Chatdetailswithfooter({route}) {
  return (
    <View style={{ flex: 1 }}>
      <ChatDetails route={route} />  
      <Footer />
    </View>
  );
}

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        if (token) {
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000; 

          if (decodedToken.exp > currentTime) {
            setInitialRoute("Home");
          } else {
            await AsyncStorage.removeItem("token")
            setInitialRoute("Login");
          }
        } else {
          setInitialRoute("Login");
        }
      } catch (error) {
        console.error("Error checking token:", error);
        setInitialRoute("Login");
      }
    };

    checkAuth();
  }, []);

  if (initialRoute === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Home" component={HomeWithFooter} />
        <Stack.Screen name="Mypolls" component={Mypollswithfooter} />
        <Stack.Screen name="Notifications" component={Notificationswithfooter} />
        <Stack.Screen name="Profile" component={Profilewithfooter} />
        <Stack.Screen name="ChatDetails" component={Chatdetailswithfooter} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
