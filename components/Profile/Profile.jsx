import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal, TextInput, Button } from "react-native";
import axios from "axios";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import API_URL from "../../api";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MessageCircle, ArrowLeft, Send, Plus, Settings, LogOut, Pen,Share2,Trash2,X,ChevronRight,FileWarning } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

export default function Profile({route}) {
  const { useridofdifferentuser } = route?.params || {};
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
  const [suggestedfriends, setsuggestedfriends] = useState([]);
  const [totalpolls, settototalpolls] = useState();
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [polls, setPolls] = useState([]);
  const [pollCount, setPollCount] = useState(0);
  const [isdifferentusersprofile, setdifferentusersprofile] = useState(false);
  const [sharemodalVisible, setshareModalVisible] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [friendList, setFriendList] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const[isfriendalready,setisfriend]=useState(false);
  const [isrequested, setisrequested] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFriendList, setFilteredFriendList] = useState(friendList);
  const[email,setemail]=useState()
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
       const emailfromstorage=await AsyncStorage.getItem("email");
       setemail(emailfromstorage);
        if (useridofdifferentuser) {
          try {
            setUserId(useridofdifferentuser);
        
            const response = await axios.post(
              `${API_URL}/friend/isinfriendlist`,
              {
                useridofdifferentuser,
                myid: storedUserId,
              }
            );
        
            setisfriend(response.data.isfriend);
            setisrequested(response.data.isrequested);
        
            // Only set 'differentusersprofile' to true if it's a different user
            setdifferentusersprofile(storedUserId !== useridofdifferentuser);
          } catch (error) {
            console.error("Error checking friend status:", error.response?.data || error.message);
          }
        } else if (storedUserId) {
          setUserId(storedUserId);
        }
        
      } catch (error) {
        console.error("Error fetching userId:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserId();
  }, [useridofdifferentuser]);

  useEffect(() => {
    if (userId) {
      axios
        .get(`${API_URL}/friend/list/${userId}`)
        .then((response) => {
          setFriendList(
            Array.isArray(response.data.friends) ? response.data.friends : []
          );
        })
        .catch((error) => {
          console.error("Error fetching friends:", error);
          setFriendList([]);
        });
    }
  }, [userId]);
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access media library is required!');
      }
    })();
  }, []);
  
  useEffect(() => {
    if (userId) {
      const fetchData = async () => {
        await fetchFriends();
        await fetchsuggestedFriends();
        await fetchPolls();
      };
      fetchData();
    }
  }, [userId]);
useEffect(()=>{
  if(searchQuery){
    setFilteredFriendList(
      friendList.filter((friend)=>friend.username.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }
  else {
    setFilteredFriendList(friendList);
  }
},[searchQuery, friendList]);
  const fetchPolls = async () => {
    try {
      const response = await axios.get(`${API_URL}/poll/getPolls/${userId}`);
      setPolls(response.data);
      setPollCount(response.data.length);
    } catch (error) {
      console.error("Error fetching polls:", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchFriends = async () => {
    try {
      const response = await axios.get(`${API_URL}/friend/list/${userId}`);
      if (response.status === 200) {
        setFriends(response.data.friends || []);
        setuserdata(response.data.user);
        setchats(response.data.friendsWithSharedPolls);
        settototalpolls(response.data.totalPolls);
      }
    } catch (err) {
      console.error("Fetch error:", err.message);
      setError("Failed to fetch data. Please try again.");
      Alert.alert("Error", "Unable to fetch data from server");
    } finally {
      setLoading(false);
    }
  };
  const fetchsuggestedFriends = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/friend/suggestedfriendlist/${userId}`
      );
      if (response.status === 200) {
        setsuggestedfriends(response.data.suggestedFriends || []);
      }
    } catch (err) {
      console.error("Fetch error:", err.message);
      setError("Failed to fetch data. Please try again.");
      Alert.alert("Error", "Unable to fetch data from server");
    } finally {
      setLoading(false);
    }
  };
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Allow all image types
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      
      if (!fileInfo.exists) {
        Alert.alert("Error", "File not found");
        return;
      }
      setIsLoading(true)
      const fileType = imageUri.split('.').pop();
      const mimeType = `image/${fileType}`;
    
      const formData = new FormData();
      formData.append('profilePic', {
        uri: imageUri,
        name: `profile.${fileType}`,
        type: mimeType,
      });
      formData.append('userId', userId);
    
      try {
        const response = await axios.post(`${API_URL}/auth/upload-profile-pic`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
    
        console.log("Upload success:", response.data);
        setuserdata((prev) => ({
          ...prev,
          profilePic: response.data.profilePic,
        }));
        Alert.alert("Success", "Profile picture updated successfully!");
      } catch (error) {
        console.error("Upload failed:", error.response?.data || error.message);
        Alert.alert("Error", "Image upload failed. Try again later.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleunfollow = (id) => {
    Alert.alert(
      "Unfollow User",
      "Are you sure you want to unfollow this user?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Unfollow",
          onPress: () => {
            console.log(`Unfollowing user with ID: ${id}`);

            axios
              .post(`${API_URL}/friend/unfollow`, {
                senderId: userId,
                receiverId: id,
              })
              .then((response) => {
                alert(response.data.message);

                // Update state: Remove the unfollowed user from the list
                setFriends((prevFriends) =>
                  prevFriends.filter((friend) => friend._id !== id)
                );
              })
              .catch((error) => {
                alert(
                  error.response?.data?.message ||
                    "Something went wrong. Please try again."
                );
              });
          },
        },
      ]
    );
  };
  const handleSave = async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/edit`, {
        username: editedUsername,
        bio: editedbio,
        userId: userId,
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
      const errMsg = error.response?.data?.error || error.message;
  
      if (errMsg.includes("Username already exists")) {
        alert("This username is already taken. Please choose another.");
      } else {
        console.error("Error updating details:", errMsg);
        alert("Failed to update profile. Please try again.");
      }
    }
  };
  
  const navigatetodetailspage = async (item) => {
    console.log("😍😍😍😍😍", JSON.stringify(item, null, 2));
    navigation.navigate("ChatDetails", { chat: item });
  };
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");

      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });

      console.log("User logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  const handleRemoveAccount = async () => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await axios.post(
                `${API_URL}/auth/deleteaccount`,
                {
                  userId: userId,
                }
              );

              if (response.status === 200) {
                await AsyncStorage.removeItem("token");
                alert("Your account has been deleted successfully.");
                navigation.reset({
                  index: 0,
                  routes: [{ name: "Login" }],
                });
              } else {
                alert(
                  response.data.error ||
                    "Failed to delete account. Please try again."
                );
              }
            } catch (err) {
              console.error("Error deleting account:", err);
              alert(
                "An error occurred. Please check your connection and try again."
              );
            }
          },
        },
      ]
    );
  };
  const handleChangePassword = async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/change-password`, {
        userId,
        oldPassword,
        newPassword,
      });

      if (response.data.success) {
        alert(response.data.message);
        setPasswordModalVisible(false);
      }
    } catch (error) {
      console.error("Change Password Error:", error);

      if (error.response) {
        alert(error.response.data.error || "Failed to change password.");
      } else {
        alert("An error occurred. Please check your internet connection.");
      }
    }
  };
  const handleButtonClick = (id, isrequested) => {
    if (isrequested) {
      // Show confirmation alert before canceling the request
      Alert.alert(
        "Cancel Request?",
        "Are you sure you want to cancel the friend request?",
        [
          { text: "No", style: "cancel" },
          {
            text: "Yes",
            onPress: () => cancelFriendRequest(id),
          },
        ]
      );
    } else {
      handleFriendRequest(id);
    }
  };

  const cancelFriendRequest = (id) => {
    axios
      .post(`${API_URL}/friend/cancel-request`, {
        senderId: userId,
        receiverId: id,
      })
      .then((response) => {
        alert(response.data.message);
        setsuggestedfriends((prevFriends) =>
          prevFriends.map((friend) =>
            friend._id === id ? { ...friend, requested: false } : friend
          )
        );
        // setRefresh((prev) => !prev);
      })
      .catch((error) => {
        alert(error.response?.data?.message || "Something went wrong.");
      });
  };
 
const cancelFriendRequest1 = async () => {
  const userId1 = await AsyncStorage.getItem("userId");

  // Show confirmation alert
  Alert.alert(
    "Confirm Cancelation",
    "Are you sure you want to cancel the friend request?",
    [
      {
        text: "Cancel",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel"
      },
      {
        text: "OK",
        onPress: async () => {
          // Proceed with canceling the friend request
          try {
            const response = await axios.post(`${API_URL}/friend/cancel-request`, {
              senderId: userId1,
              receiverId: userId,
            });

            alert(response.data.message);
            setsuggestedfriends((prevFriends) =>
              prevFriends.map((friend) =>
                friend._id === userId ? { ...friend, requested: false } : friend
              )
            );
          } catch (error) {
            alert(error.response?.data?.message || "Something went wrong.");
          }
        }
      }
    ]
  );
};

  const handleFriendRequest = (friendId) => {
    console.log(friendId);
    console.log(userId);
    axios
      .post(`${API_URL}/friend/sendRequest`, {
        senderId: userId,
        receiverId: friendId,
      })
      .then((response) => {
        alert(response.data.message);
        setsuggestedfriends((prevFriends) =>
          prevFriends.map((friend) =>
            friend._id === friendId ? { ...friend, requested: true } : friend
          )
        );
      })
      .catch((error) => {
        if (error.response) {
          alert(error.response.data.message); // Show the backend error message
        } else {
          alert("Something went wrong. Please try again.");
        }
      });
  };
  const handleEditProfile = () => {
    setModalVisible(true); // Open edit profile modal
  };

  const handleSendMessage = (name) => {
    console.log("Open chat screen");
    navigation.navigate("Messages", { neededuser: name, userid: userId });
    // Navigate to chat screen or perform your message action here
  };

  const handleSharePress = (poll) => {
    setSelectedPoll(poll);
    setshareModalVisible(true);
  };
  const toggleFriendSelection = (id) => {
    setSelectedFriends(prev =>
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  };
  const handleShare = async () => {
    if (!selectedPoll || selectedFriends.length === 0) {
      alert("Please select at least one friend to share with.");
      return;
    }

    try {
      const storedUserId = await AsyncStorage.getItem("userId");

      const response = await axios.post(`${API_URL}/poll/sharepoll`, {
        pollId: selectedPoll._id,
        userId:storedUserId,
        friends: selectedFriends,
      });
      alert(response.data.message);
      setshareModalVisible(false);
      setSelectedFriends([]);
    } catch (error) {
      console.error("Share Error:", error);
      alert(
        error.response?.data?.message ||
          "Failed to share poll. Please try again."
      );
    }
  };
  const handleFollow = async() => {
    let id=await AsyncStorage.getItem("userId")
    console.log(`Followed user with ID: ${id}`);
    axios
      .post(`${API_URL}/friend/sendRequest`, {
        senderId: id,
        receiverId: userId,
      })
      .then((response) => {
        alert(response.data.message);
        setisrequested(true)
        setFriends((prev) =>
          prev.map((data) =>
            data._id === id ? { ...data, requested: true } : data
          )
        );
      })
      .catch((error) => {
        alert(
          error.response?.data?.message ||
            "Something went wrong. Please try again."
        );
      });
  };
   
  const handleDeletePoll = (pollId) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this poll?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => deletePollFromServer(pollId), style: "destructive" },
      ]
    );
  };
  
const deletePollFromServer = async (pollId) => {
  try {
    const response = await axios.delete(`${API_URL}/poll/deletepoll/${pollId}`);
    
    if (response.status === 200) {
      setPolls((prevPolls) => prevPolls.filter((poll) => poll._id !== pollId));
    } else {
      Alert.alert("Error", "Failed to delete poll. Please try again.");
    }
  } catch (error) {
    console.error("Error deleting poll:", error);
    Alert.alert("Error", "Something went wrong while deleting the poll.");
  }
};
  if (loading) {
    return (
      <ActivityIndicator size="large" color="#0095f6" style={styles.loader} />
    );
  }

  const renderfriends = () => (
    <View style={styles.suggestedSection}>
      <View style={styles.suggestedHeader}>
        <Text style={styles.suggestedTitle}>Friends</Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("FriendList", {
              data: friends,
              title: "Friends",
              userId,
              isdifferentusersprofile,
            })
          }
        >
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.suggestedScroll}
      >
        {friends.length === 0 ? (
          <Text style={styles.noFriendsText}>No friends found</Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.suggestedScroll}
          >
            {friends.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={styles.suggestedCard}
                onPress={() =>
                  navigation.navigate("Profile", {
                    useridofdifferentuser: user._id,
                  })
                }
              >
                <Image
                  source={{
                    uri:
                      user.profilePic ||
                      "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                  }}
                  style={styles.suggestedAvatar}
                />
                <Text style={styles.suggestedUsername}>{user.username}</Text>
                {!isdifferentusersprofile ? (
                  <TouchableOpacity
                    style={styles.unfollowButton}
                    onPress={() => handleunfollow(user._id)}
                  >
                    <Text style={styles.followButtonText}>UnFollow</Text>
                  </TouchableOpacity>
                ) : (
                  <></>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </ScrollView>
    </View>
  );
  const renderSuggestedUsers = () => (
    <View style={styles.suggestedSection}>
      <View style={styles.suggestedHeader}>
        <Text style={styles.suggestedTitle}>Suggested for you</Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("FriendList", {
              data: suggestedfriends,
              title: "Suggested Friends",
              userId,
              suggested: true,
            })
          }
        >
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.suggestedScroll}
      >
        {suggestedfriends.map((user) => (
          <TouchableOpacity
            key={user.id}
            style={styles.suggestedCard}
            onPress={() =>
              navigation.navigate("Profile", {
                useridofdifferentuser: user._id,
              })
            }
          >
            <Image
              source={{
                uri:
                  user.profilePic ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png",
              }}
              style={styles.suggestedAvatar}
            />
            <Text style={styles.suggestedUsername}>{user.username}</Text>
            <TouchableOpacity
              style={[
                styles.followButton, // Base styles
                user.requested && { paddingHorizontal: 18 }, // Dynamically adjust padding
              ]}
              onPress={() => handleButtonClick(user._id, user.requested)}
            >
              <Text style={styles.followButtonText}>
                {user.requested ? "Requested" : "Follow"}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
  const renderpolls = () => (
    <View style={styles.suggestedSection}>
      <View style={styles.suggestedHeader}>
        <Text style={styles.suggestedTitle}>My Polls</Text>
        {/* {!isdifferentusersprofile ? (
          <TouchableOpacity onPress={() => navigation.navigate("Mypolls")}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        ) : (
          <></>
        )} */}
      </View>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.pollList}>
        {polls.map((item) => (
          <View key={item._id} style={styles.pollCard}>
            <Text style={styles.pollQuestion}>{item.question}</Text>
            <View style={styles.pollOptions}>
              {item.options?.map((option) => (
                <View key={option._id} style={styles.optionBar}>
                  <View
                    style={[
                      styles.optionProgress,
                      {
                        width: `${
                          (option.votes /
                            Math.max(...item.options.map((o) => o.votes), 1)) *
                          100
                        }%`,
                      },
                    ]}
                  />
                  <View style={styles.optionContent}>
                    <Text style={styles.optionText}>{option.text}</Text>
                    <Text style={styles.voteCount}>{option.votes}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              {/* Share Button */}
              <TouchableOpacity
                style={styles.shareButton}
                onPress={() => handleSharePress(item)}
              >
                <Share2 size={20} color="#007AFF" />
                <Text style={styles.shareText}>Share Poll</Text>
              </TouchableOpacity>

              {!isdifferentusersprofile ? (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeletePoll(item._id)}
                >
                  <Trash2 size={20} color="red" />
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              ) : (
                <></>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.username}>{userdata?.username || "Noname"}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setShowDropdown(!showDropdown)}
          >
            <Settings size={24} color="#262626" />
          </TouchableOpacity>

          {showDropdown && (
            <View style={styles.dropdown}>
              {/* <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setShowDropdown(false);
                    setShowMessages(true);
                  }}
                >
                  <MessageCircle size={20} color="#262626" />
                  <Text style={styles.dropdownText}>Messages</Text>
                </TouchableOpacity> */}

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
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                 navigation.navigate("Report")
                }}
              >
                <FileWarning size={20} color="#262626" />
                <Text style={styles.dropdownText}>Report</Text>
              </TouchableOpacity>
              {!isdifferentusersprofile ? (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setShowDropdown(false);
                    setPasswordModalVisible(true);
                  }}
                >
                  <Settings size={20} color="#262626" />
                  <Text style={styles.dropdownText}>Change Password</Text>
                </TouchableOpacity>
              ) : (
                <></>
              )}

              {/* <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setShowDropdown(false);
                    handleRemoveAccount();
                  }}
                >
                  <LogOut size={20} color="#262626" />
                  <Text style={styles.dropdownText}>Remove Account</Text>
                </TouchableOpacity> */}
            </View>
          )}
        </View>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.profilePicContainer}>
          <Image
            source={{
              uri:
                userdata?.profilePic ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            }}
            style={styles.profilePic}
          />

          {isLoading ? (
            // Show Loader While Uploading
            <ActivityIndicator
              style={styles.loader}
              size="large"
              color="#fff"
            />
          ) : (
            !isdifferentusersprofile && (
              <TouchableOpacity
                style={styles.editProfilePicButton}
                onPress={pickImage}
              >
                <Pen size={16} color="#fff" />
              </TouchableOpacity>
            )
          )}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalpolls}</Text>
            <Text style={styles.statLabel}>Polls</Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("FriendList", {
                data: friends,
                title: "Friends",
                userId,
                isdifferentusersprofile,
              })
            }
          >
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{friends.length}</Text>

              <Text style={styles.statLabel}>Friends</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("FriendList", {
                data: friends,
                title: "Friends",
                userId,
              })
            }
          >
            {/* <View style={styles.statItem}>
              <Text style={styles.statNumber}>{friends.length}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View> */}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bioSection}>
        <Text style={styles.bioText}>{userdata?.bio || "No bio"}</Text>
        <TouchableOpacity
          style={styles.editProfileButton}
          onPress={() => {
            if (!isdifferentusersprofile) {
              handleEditProfile(); // Call function for editing profile
            } else {
              if(isfriendalready){
              handleSendMessage(userdata?.username);  
              }
              else{
                if (!isrequested) {
                  handleFollow();
                } else {
                  cancelFriendRequest1();
                }
              }
            }
          }}
        >
          <Text style={styles.editProfileText}>
            {!isdifferentusersprofile ? "Edit profile" :(isfriendalready?"Message":(!isrequested?"Follow":"Requested"))}
          </Text>
        </TouchableOpacity>
      </View>

      {/* {renderfriends()} */}
      {!isdifferentusersprofile ? renderSuggestedUsers() : null}

      {renderpolls()}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <Text style={styles.email}>{email}</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter new username"
              value={editedUsername}
              onChangeText={setEditedUsername}
            />
            <TextInput
              style={styles.bioinput}
              placeholder="Enter Bio"
              value={editedbio}
              onChangeText={seteditedbio}
            />
            <View style={styles.buttonRow}>
  <View style={styles.buttonWrapper}>
    <Button
      title="Cancel"
      onPress={() => setModalVisible(false)}
      color="#262626"
    />
  </View>
  <View style={styles.buttonWrapper}>
    <Button title="Save" onPress={handleSave} color="#0095f6" />
  </View>
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
      <Modal
        animationType="slide"
        transparent={true}
        visible={passwordModalVisible}
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>

            <TextInput
              style={styles.input}
              placeholder="Old Password"
              secureTextEntry
              value={oldPassword}
              onChangeText={setOldPassword}
            />

            <TextInput
              style={styles.input}
              placeholder="New Password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <View style={styles.buttonRow}>
              <Button
                title="Cancel"
                onPress={() => setPasswordModalVisible(false)}
                color="#262626"
              />
              <Button
                title="Change"
                onPress={handleChangePassword}
                color="#0095f6"
              />
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={sharemodalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalWrapper}>
          <View style={styles.sharePopup}>
            <View style={styles.popupHeader}>
              <Text style={styles.popupTitle}>Share with Friends</Text>
              <TouchableOpacity onPress={() => setshareModalVisible(false)}>
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>
<TextInput
        style={styles.searchBar}
        placeholder="Search by username..."
        placeholderTextColor="#A9A9A9"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
            <FlatList
              data={filteredFriendList}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.friendOption,
                    selectedFriends.includes(item._id) && styles.activeFriend,
                  ]}
                  onPress={() => toggleFriendSelection(item._id)}
                >
                  <Image
                    source={{
                      uri: item.profilePic ||                     "https://cdn-icons-png.flaticon.com/512/149/149071.png"
,
                    }}
                    style={styles.friendImage}
                  />
                  <Text style={styles.friendLabel}>{item.username}</Text>
                  <View
                    style={[
                      styles.selectionIndicator,
                      selectedFriends.includes(item._id) &&
                        styles.selectedIndicator,
                    ]}
                  >
                    {selectedFriends.includes(item._id) && (
                      <ChevronRight size={16} color="#FFF" />
                    )}
                  </View>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={[
                styles.confirmButton,
                { opacity: selectedFriends.length === 0 ? 0.5 : 1 },
              ]}
              onPress={handleShare}
              disabled={selectedFriends.length === 0}
            >
              <Text style={styles.confirmButtonText}>
                Share with {selectedFriends.length} friend
                {selectedFriends.length !== 1 ? "s" : ""}
              </Text>
            </TouchableOpacity>
          </View>
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
    backgroundColor: "#0D6EFD",
    borderRadius: 4,
    paddingVertical: 6,
    minWidth: 100, // Ensures enough space for both texts
    alignItems: "center",
    justifyContent: "center",
  },

  unfollowButton: {
    backgroundColor: "#ff0a0a",
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
  bioinput: {
    borderWidth: 1,
    borderColor: "#dbdbdb",
    borderRadius: 4,
    padding: 16,  
    marginBottom: 12,
    height: 100,   // Increased height
    width: '100%', // Full width, adjust as necessary
    textAlignVertical: 'top', 
  },
  
  email: {
    marginBottom: hp("2%"),
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 20, // Optional: add spacing between buttons (React Native 0.71+)
  },

  buttonWrapper: {
    flex: 1,
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
  profilePicContainer: {
    position: "relative",
    marginRight: 28,
  },
  profilePic: {
    width: 86,
    height: 86,
    borderRadius: 43,
    resizeMode: "cover",
  },
  editProfilePicButton: {
    position: "absolute",
    right: -4,
    bottom: -4,
    backgroundColor: "#0D6EFD",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  loader: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -15 }, { translateY: -15 }],
  },
  pollList: {
    padding: wp("4%"),
    paddingBottom: hp("10%"),
  },
  pollCard: {
    backgroundColor: "#FFF",
    borderRadius: wp("4%"),
    padding: wp("4%"),
    marginBottom: hp("2%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: wp("2%"),
    elevation: 3,
  },
  pollQuestion: {
    fontSize: wp("4.5%"),
    fontWeight: "600",
    color: "#000",
    marginBottom: hp("2%"),
  },
  optionBar: {
    height: hp("6%"),
    backgroundColor: "#F2F2F7",
    borderRadius: wp("2%"),
    marginBottom: hp("1%"),
    overflow: "hidden",
    position: "relative",
  },
  optionProgress: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
  },
  optionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: wp("3%"),
    zIndex: 1,
  },
  optionText: {
    fontSize: wp("4%"),
    color: "#000",
  },
  voteCount: {
    fontSize: wp("4%"),
    fontWeight: "600",
    color: "#007AFF",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: hp("2%"),
    padding: wp("3%"),
    backgroundColor: "#F2F2F7",
    borderRadius: wp("2%"),
  },
  shareText: {
    marginLeft: wp("2%"),
    fontSize: wp("4%"),
    color: "#007AFF",
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: hp("2%"),
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFE5E5",
    padding: wp("2%"),
    borderRadius: wp("2%"),
    marginTop: hp("1%"),
  },
  deleteText: {
    color: "red",
    fontSize: wp("4%"),
    fontWeight: "600",
    marginLeft: wp("1%"),
  },
  modalWrapper: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
  },
  sharePopup: {
    backgroundColor: "#FFF",
    borderRadius: wp("4%"),
    margin: wp("4%"),
    maxHeight: hp("80%"),
  },
  popupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: wp("4%"),
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  popupTitle: {
    fontSize: wp("5%"),
    fontWeight: "600",
    color: "#000",
  },
  friendOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: wp("4%"),
  },
  activeFriend: {
    backgroundColor: "#F2F2F7",
  },
  friendImage: {
    width: wp("10%"),
    height: wp("10%"),
    borderRadius: wp("5%"),
    marginRight: wp("3%"),
  },
  friendLabel: {
    flex: 1,
    fontSize: wp("4%"),
    color: "#000",
  },
  selectionIndicator: {
    width: wp("6%"),
    height: wp("6%"),
    borderRadius: wp("3%"),
    borderWidth: 2,
    borderColor: "#E5E5EA",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedIndicator: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  confirmButton: {
    margin: wp("4%"),
    padding: wp("4%"),
    backgroundColor: "#007AFF",
    borderRadius: wp("2%"),
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#FFF",
    fontSize: wp("4%"),
    fontWeight: "600",
  },
  searchBar: {
    height: 40,
    margin: wp("4%"),
    borderRadius: wp("6%"),
    paddingHorizontal: wp("4%"),
    backgroundColor: "#F5F5F5",
    borderWidth: 1.5,
    borderColor: "#D0D0D0",
    fontSize: wp("4%"),
    color: "#333",
    elevation: 3, // Add subtle shadow for a floating effect (Android)
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
});