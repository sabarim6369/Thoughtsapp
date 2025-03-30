import React, { useState } from "react";
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ArrowLeft } from "lucide-react-native";
import axios from 'axios';
import API_URL from "../../../api";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

export default function FriendList() {
  const navigation = useNavigation();
  const route = useRoute();
  const { data = [], title = "Friends", userId } = route.params || {};
  
  const [friends, setFriends] = useState(data);

  
  const handleFollow = (id) => {
    console.log(`Followed user with ID: ${id}`);
    axios
      .post(`${API_URL}/friend/sendRequest`, {
        senderId: userId,
        receiverId: id,
      })
      .then((response) => {
        alert(response.data.message);
      })
      .catch((error) => {
        alert(
          error.response?.data?.message ||
            "Something went wrong. Please try again."
        );
      });
  };

  const handleUnfollow = (id) => {
    console.log(`Unfollowing user with ID: ${id}`);
  
    axios
      .post(`${API_URL}/friend/unfollow`, { senderId: userId, receiverId: id })
      .then((response) => {
        alert(response.data.message);
  
        // Update state: Remove the unfollowed user from the list
        setFriends((prevFriends) => prevFriends.filter((friend) => friend._id !== id));
      })
      .catch((error) => {
        alert(error.response?.data?.message || "Something went wrong. Please try again.");
      });
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={wp(6)} color="#1e0c0c" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      {/* No Data Message */}
      {friends.length === 0 ? (
        <Text style={styles.noDataText}>No {title.toLowerCase()} available</Text>
      ) : (
        <FlatList
        data={friends}
        keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
        contentContainerStyle={{ paddingBottom: hp(5) }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image
              source={{
                uri: item.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
              }}
              style={styles.avatar}
            />
            <Text style={styles.username}>{item.username}</Text>

            {/* Follow / Unfollow Button */}
            {title === "Friends" ? (
              <TouchableOpacity
                style={[styles.followButton, styles.unfollowButton]}
                onPress={() => handleUnfollow(item._id)}
              >
                <Text style={styles.buttonText}>Unfollow</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.followButton} onPress={() => handleFollow(item._id)}>
                <Text style={styles.buttonText}>Follow</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
      )}
    </View>
  );
}

// Responsive Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F9", padding: wp(4) },

  header: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: hp(2),
  },
  backButton: {
    padding: wp(2),
  },
  headerTitle: {
    fontSize: wp(5.5),
    fontWeight: "bold",
    color: "#0d0303",
    marginLeft: wp(4),
  },

  noDataText: {
    textAlign: "center",
    marginTop: hp(2),
    fontSize: wp(4),
    color: "gray",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: wp(3),
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: hp(1.5),
  },
  
  avatar: {
    width: wp(14),
    height: wp(14),
    borderRadius: wp(7),
    marginRight: wp(3),
  },

  username: {
    fontSize: wp(4.5),
    fontWeight: "600",
    flex: 1,
    color: "#333",
  },

  followButton: {
    backgroundColor: "#007bff",
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    borderRadius: 20,
  },
  unfollowButton: {
    backgroundColor: "#ff4757",
  },
  buttonText: {
    color: "#fff",
    fontSize: wp(3.5),
    fontWeight: "bold",
  },
});
