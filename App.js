import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Footer from "./components/Footer";
import Login from "./components/Login/Login";
import Signup from "./components/Signup/Signup";
import Home from "./components/Home/Home";  
import Mypolls from "./components/MyPolls/Mypolls";
import Notifications from "./components/Notification/Notification";
import Profile from "./components/Profile/Profile";
import { View } from "react-native";

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

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Home" component={HomeWithFooter} />
        <Stack.Screen name="Mypolls" component={Mypollswithfooter} />
        <Stack.Screen name="Notifications" component={Notificationswithfooter} />
        <Stack.Screen name="Profile" component={Profilewithfooter} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
