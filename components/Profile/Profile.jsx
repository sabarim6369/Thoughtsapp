import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal, TextInput, Button } from "react-native";
import axios from "axios";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import API_URL from "../../api";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MessageCircle, ArrowLeft, Send, Plus, Settings, LogOut } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function Profile() {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("Posts");
    const [userId, setUserId] = useState(null);
    const [userdata, setuserdata] = useState();
    const [modalVisible, setModalVisible] = useState(false);
    const [editedUsername, setEditedUsername] = useState("");
    const [editedbio, seteditedbio] = useState("");
    const [showMessages, setShowMessages] = useState(false);
    const navigation = useNavigation();
    const [chats, setchats] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const suggestedUsers = [
        {
            id: '1',
            username: 'Prakash',
            avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        },
        {
            id: '2',
            username: 'Yogendra',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        },
        {
            id: '3',
            username: 'Lohith',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        },
    ];

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
            const response = await axios.get(`${API_URL}/friend/list/${userId}`);
            if (response.status === 200) {
                setFriends(response.data.friends || []);
                setuserdata(response.data.user);
                setchats(response.data.friendsWithSharedPolls);
            }
        } catch (err) {
            console.error("Fetch error:", err.message);
            setError("Failed to fetch data. Please try again.");
            Alert.alert("Error", "Unable to fetch data from server");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const response = await axios.post(`${API_URL}/auth/edit`, {
                username: editedUsername,
                bio: editedbio,
                userId: userId
            });

            if (response.status === 200) {
                setuserdata((prev) => ({
                    ...prev,
                    username: editedUsername || prev.username,
                    bio: editedbio || prev.bio || "No bio",
                }));
                setModalVisible(false);
            }
        } catch (error) {
            console.error("Error updating details:", error.response?.data || error.message);
        }
    };
    const navigatetodetailspage=async(item)=>{
        console.log("😍😍😍😍😍", JSON.stringify(item, null, 2));
        navigation.navigate("ChatDetails", { chat: item });
      }
    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem("userId");
            navigation.replace("Login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#0095f6" style={styles.loader} />;
    }

  
     const renderfriends = () => (
            <View style={styles.suggestedSection}>
                <View style={styles.suggestedHeader}>
                    <Text style={styles.suggestedTitle}>Friends</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAllText}>See all</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestedScroll}>
                    {friends.map((user) => (
                        <View key={user.id} style={styles.suggestedCard}>
                            <Image source={{ uri: user.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"  }} style={styles.suggestedAvatar} />
                            <Text style={styles.suggestedUsername}>{user.username}</Text>
                           
                        </View>
                    ))}
                </ScrollView>
            </View>
        );
    const renderSuggestedUsers = () => (
        <View style={styles.suggestedSection}>
            <View style={styles.suggestedHeader}>
                <Text style={styles.suggestedTitle}>Suggested for you</Text>
                <TouchableOpacity>
                    <Text style={styles.seeAllText}>See all</Text>
                </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestedScroll}>
                {suggestedUsers.map((user) => (
                    <View key={user.id} style={styles.suggestedCard}>
                        <Image source={{ uri: user.avatar }} style={styles.suggestedAvatar} />
                        <Text style={styles.suggestedUsername}>{user.username}</Text>
                        <TouchableOpacity style={styles.followButton}>
                            <Text style={styles.followButtonText}>Follow</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        </View>
    );

    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.username}>
            {userdata?.username || "Noname"}
          </Text>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => setShowDropdown(!showDropdown)}
            >
              <Settings size={24} color="#262626" />
            </TouchableOpacity>

            {showDropdown && (
              <View style={styles.dropdown}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setShowDropdown(false);
                    setShowMessages(true);
                  }}
                >
                  <MessageCircle size={20} color="#262626" />
                  <Text style={styles.dropdownText}>Messages</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setShowDropdown(false);
                    handleLogout();
                  }}
                >
                  <LogOut size={20} color="#262626" />
                  <Text style={styles.dropdownText}>Logout</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View style={styles.profileSection}>
          <Image
            source={{
              uri:
                userdata?.profilePic ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            }}
            style={styles.profilePic}
          />
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{friends.length}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{friends.length}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>
        </View>

        <View style={styles.bioSection}>
          <Text style={styles.bioText}>{userdata?.bio || "Add bio"}</Text>
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.editProfileText}>Edit profile</Text>
          </TouchableOpacity>
        </View>

        {renderfriends()}
        {renderSuggestedUsers()}

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter new username"
                value={editedUsername}
                onChangeText={setEditedUsername}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter Bio"
                value={editedbio}
                onChangeText={seteditedbio}
              />
              <View style={styles.buttonRow}>
                <Button
                  title="Cancel"
                  onPress={() => setModalVisible(false)}
                  color="#262626"
                />
                <Button title="Save" onPress={handleSave} color="#0095f6" />
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          animationType="slide"
          visible={showMessages}
          onRequestClose={() => setShowMessages(false)}
        >
          <View style={styles.messagesContainer}>
            <View style={styles.messagesHeader}>
              <TouchableOpacity onPress={() => setShowMessages(false)}>
                <ArrowLeft size={24} color="#262626" />
              </TouchableOpacity>
              <Text style={styles.messagesTitle}>Messages</Text>
            </View>
            <FlatList
              data={chats}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.messageItem}
                  onPress={() => navigatetodetailspage(item)}
                >
                  <Image
                    source={{
                      uri:
                        item.avatar ||
                        "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                    }}
                    style={styles.messageAvatar}
                  />
                  <View style={styles.messageContent}>
                    <Text style={styles.messageUsername}>{item.username}</Text>
                    <Text style={styles.messagePreview}>
                      Tap to view full chat
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </Modal>
      </ScrollView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#dbdbdb",
    marginTop: 10,
    zIndex: 1,
  },
  username: {
    fontSize: 20,
    fontWeight: "700",
    color: "#262626",
  },
  profileSection: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  profilePic: {
    width: 86,
    height: 86,
    borderRadius: 43,
    marginRight: 28,
  },
  statsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "600",
    color: "#262626",
  },
  statLabel: {
    fontSize: 14,
    color: "#262626",
  },
  bioSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  bioText: {
    fontSize: 14,
    color: "#262626",
    marginBottom: 12,
  },
  editProfileButton: {
    backgroundColor: "#fafafa",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#dbdbdb",
    paddingVertical: 6,
    alignItems: "center",
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#262626",
  },
  storyHighlights: {
    paddingVertical: 16,
    borderTopWidth: 0.5,
    borderTopColor: "#dbdbdb",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#262626",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  highlightsScroll: {
    paddingLeft: 16,
  },
  newHighlight: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "#dbdbdb",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  newHighlightText: {
    fontSize: 12,
    color: "#262626",
    marginTop: 4,
  },
  highlightPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fafafa",
    marginRight: 12,
  },
  suggestedSection: {
    paddingVertical: 16,
    borderTopWidth: 0.5,
    borderTopColor: "#dbdbdb",
  },
  suggestedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  suggestedTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#262626",
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0095f6",
  },
  suggestedScroll: {
    paddingLeft: 16,
  },
  suggestedCard: {
    width: 150,
    backgroundColor: "#fafafa",
    borderRadius: 4,
    padding: 16,
    marginRight: 12,
    alignItems: "center",
  },
  suggestedAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 8,
  },
  suggestedUsername: {
    fontSize: 14,
    fontWeight: "600",
    color: "#262626",
    marginBottom: 12,
  },
  followButton: {
    backgroundColor: "#0095f6",
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 24,
  },
  followButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  messagesHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#dbdbdb",
  },
  messagesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#262626",
    marginLeft: 16,
  },
  messageItem: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderBottomColor: "#dbdbdb",
  },
  messageAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
  },
  messageUsername: {
    fontSize: 14,
    fontWeight: "600",
    color: "#262626",
    marginBottom: 4,
  },
  messagePreview: {
    fontSize: 14,
    color: "#8e8e8e",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#262626",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#dbdbdb",
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  headerRight: {
    position: "relative",
  },
  settingsButton: {
    padding: 8,
  },
  dropdown: {
    position: "absolute",
    top: 40,
    right: 0,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 8,
    width: 160,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#262626",
  },
});