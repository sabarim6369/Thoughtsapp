import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ArrowLeft } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import API_URL from "../../api";

export default function Messages() {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState([]);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error("Error fetching userId:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchFriends();
    }
  }, [userId]);

  const fetchFriends = async () => {
    try {
      const response = await axios.get(`${API_URL}/poll/shared-polls/${userId}`);
      if (response.status === 200) {
        console.log("API Response:", JSON.stringify(response.data, null, 2));
        // console.log(response.data.sharedPolls[0].sharedPersonId.username)
        setChats(response.data.sharedPolls);
      }
    } catch (err) {
      console.error("Fetch error:", err.message);
      setError("Failed to fetch data. Please try again.");
      Alert.alert("Error", "Unable to fetch data from server");
    } finally {
      setLoading(false);
    }
  };
const handlenavigate=(item,chat)=>{
    console.log("🤮🤮🤮🤮🤮🤮🤮🤮🤮",item);
    navigation.navigate("ChatDetails", { friendid: item,userid:userId,chat:chat })
}
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.arrow}>
          <ArrowLeft size={24} color="#262626" />
        </TouchableOpacity>
        <Text style={styles.title}>Messages</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      ) : !chats ||chats.length === 0 ? (
        <Text style={styles.emptyMessage}>No messages yet.</Text>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.messageItem}
              onPress={() => handlenavigate(item.sharedPersonId._id,item)}
              activeOpacity={0.7}
            >
              <Image
                source={{
                  uri:
                  item.sharedPersonId?.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                }}
                style={styles.avatar}
              />
              <View style={styles.messageContent}>
                <Text style={styles.username}>{item.sharedPersonId?.username}</Text>
                <Text style={styles.previewText}>Tap to view full chat</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#262626",
    marginLeft: 16,
    marginTop:10
  },
  arrow:{
    marginTop:10

  },
  messageItem: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
    backgroundColor: "#fff",
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: "#262626",
    marginBottom: 4,
  },
  previewText: {
    fontSize: 14,
    color: "#8e8e8e",
  },
  emptyMessage: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#8e8e8e",
  },
});
