import React, { useState, useRef,useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import Icon from "react-native-vector-icons/Ionicons"; 
import axios from "axios";
import API_URL from "../../../api";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const ChatDetails = ({ route }) => {
  const { chat } = route.params;
      const navigation = useNavigation();
  
  const [message, setMessage] = useState("");
  const flatListRef = useRef(null);
  const [friendList, setFriendList] = useState([]);
  const [selectedPolls, setSelectedPolls] = useState({});
  const [Polls, setPolls] = useState([]);
  const [userId, setUserId] = useState(null);
 const [modalVisible, setModalVisible] = useState(false);
    const [selectedPoll, setSelectedPoll] = useState(null);
        const [selectedFriends, setSelectedFriends] = useState([]);
    
  useEffect(() => {
    const fetchPolls = async () => {
      try {
        setUserId(chat._id);
        console.log(chat._id)
        const pollIds = chat.sharedPolls.map((poll) => poll.pollId._id);
        const response = await axios.post(`${API_URL}/Poll/getPollswithids`, {
          pollIds,userId:chat._id
        });

        setPolls(response.data.polls);
      } catch (error) {
        console.error("Error fetching polls:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, [chat.sharedPolls,selectedPolls]);
  
useEffect(() => {
  if (userId) {
      axios.get(`${API_URL}/friend/list/${userId}`)
          .then(response => {
              console.log("\n\nFriend List:", response.data);
              // Ensure `friends` exists and is an array before setting state
              setFriendList(Array.isArray(response.data.friends) ? response.data.friends : []);
          })
          .catch(error => {
              console.error("Error fetching friends:", error);
              setFriendList([]); // Prevent undefined issues
          });
  }
}, [userId]);
  const sendMessage = () => {
    if (message.trim().length === 0) return;

    chat.messages.push({
      id: Date.now().toString(),
      text: message,
      sentByUser: true,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
    setMessage("");

    setTimeout(() => flatListRef.current.scrollToEnd({ animated: true }), 100);
  };


  const toggleFriendSelection = (id) => {
    setSelectedFriends((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
};

  const handleFriendRequest = (friendId) => {
    console.log(userId,friendId)
    axios.post(`${API_URL}/friend/sendRequest`, { senderId: userId, receiverId: friendId })
        .then(response => {
            alert(response.data.message); 
            setFriendList([...friendList, friendId]);
        })
        .catch(error => {
            if (error.response) {
                alert(error.response.data.message); // Show the backend error message
            } else {
                alert("Something went wrong. Please try again.");
            }
        });
};
  const handleVote = async (pollId, index) => {
    if (!userId) {
      alert("User ID not found!");
      return;
    }

    if (selectedPolls[pollId] !== undefined) {
      alert("You have already voted on this poll.");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/poll/vote`, {
        pollId,
        userId,
        optionIndex: index,
      });

      if (response.status === 200) {
        setSelectedPolls((prev) => ({ ...prev, [pollId]: index }));
        const updatedPollsResponse = await axios.post(`${API_URL}/Poll/getPollswithids`, {
          pollIds: Polls.map(p => p.id), // Fetch updated poll list
          userId
        });
  
        setPolls(updatedPollsResponse.data.polls);
      }
    } catch (error) {
      console.error("Voting error:", error);
      alert(
        error.response?.data?.message ||
          "Failed to submit vote. Please try again."
      );
    }
  };
  const handleSharePress = (poll) => {
    setSelectedPoll(poll);
    setModalVisible(true);
};
const handleShare = () => {
  if (!selectedPoll || selectedFriends.length === 0) {
      alert("Select at least one friend to share.");
      return;
  }
console.log("😍😍😍😍😍😂😂😂😂",selectedPoll.id)
  axios.post(`${API_URL}/poll/sharepoll`, {
      pollId: selectedPoll.id, // Ensure _id is used
      userId,
      friends: selectedFriends
  })
  .then(response => {
      alert(response.data.message);
      setModalVisible(false);
      setSelectedFriends([]);
  })
  .catch(error => {
      console.error("Share Error:", error);
      alert(error.response?.data?.message || "Failed to share poll. Please try again.");
  });
};
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.username}>{chat.username}</Text>
        <Image source={{ uri: chat.profilePic }} style={styles.profilePic} />
      </View>

      <FlatList
  data={Polls}
  keyExtractor={(item) => item.id}
  showsVerticalScrollIndicator={false}
  contentContainerStyle={styles.pollList}
  renderItem={({ item }) => {
    const isFriend = friendList.includes(item.userId);
    const totalVotes =
      item.options.reduce((acc, option) => acc + option.votes, 0) || 1; // Avoid division by zero

    return (
      <View style={styles.card}>
        <View style={styles.profileRow}>
          <Image
            source={{
              uri:
                item.profileImage ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            }}
            style={styles.profileImage}
          />
          <Text style={styles.userName}>{item.user}</Text>
        </View>
        <Text style={styles.question}>{item.question}</Text>

           {item.options.map((option, index) => {
                                  const isSelected =
                                    selectedPolls[item.id] === index || option.marked;
                                  const totalVotes = item.options.reduce(
                                    (sum, opt) => sum + opt.votes,
                                    0
                                  ); // Calculate total votes
                                  const votePercentage =
                                    totalVotes > 0
                                      ? ((option.votes / totalVotes) * 100).toFixed(1)
                                      : 0;
       
                                  const hasVotes = totalVotes > 0;
       
                                  return (
                                    <TouchableOpacity
                                      key={index}
                                      style={[
                                        styles.optionButton,
                                        isSelected ? styles.selectedOption : null,
                                      ]}
                                      onPress={() => handleVote(item.id, index)}
                                      disabled={option.marked}
                                    >
                                      <View style={styles.optionContent}>
                                        <Text
                                          style={[
                                            styles.optionText,
                                            isSelected
                                              ? styles.selectedOptionText
                                              : styles.unselectedOptionText,
                                          ]}
                                        >
                                          {option.text} {option.marked && " ✔"}
                                        </Text>
       
                                        {hasVotes && (
                                          <Text
                                            style={[
                                              styles.votePercentage,
                                              isSelected
                                                ? styles.selectedOptionText
                                                : styles.unselectedOptionText,
                                            ]}
                                          >
                                            {option.votes} votes • {votePercentage}%
                                          </Text>
                                        )}
                                      </View>
                                    </TouchableOpacity>
                                  );
                                })}




        <View style={styles.actionIcons}>
          <TouchableOpacity
            onPress={() => handleSharePress(item)}
            style={styles.iconSpacing}
          >
            <Icon name="share-social-outline" size={24} color="#007bff" />
          </TouchableOpacity>

          {!isFriend && (
            <TouchableOpacity onPress={() => handleFriendRequest(item.userid)}>
              <Icon name="person-add-outline" size={24} color="#007bff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }}
/>


      {/* Message Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Message..."
          placeholderTextColor="#888"
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Friends to Share</Text>
            <FlatList
              data={friendList}
              keyExtractor={(item, index) =>
                item?._id?.toString() || index.toString()
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.friendItem,
                    selectedFriends.includes(item._id) && styles.selectedFriend, // Fixed ID reference
                  ]}
                  onPress={() => toggleFriendSelection(item._id)}
                >
                  <View style={styles.checkbox}>
                    {selectedFriends.includes(item._id) && (
                      <Text style={styles.checkmark}>✔</Text>
                    )}
                  </View>
                  <Image
                    source={{
                      uri:
                        item.profileImage || "https://via.placeholder.com/50",
                    }} // Default profile image
                    style={styles.profileImage}
                  />
                  <Text style={styles.friendName}>{item.username}</Text>
                </TouchableOpacity>
              )}
              style={{ maxHeight: 300 }} // Limits height for scrolling if items exceed 5
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.shareButton]}
                onPress={() => handleShare(selectedFriends)}
              >
                <Text style={styles.buttonText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  username: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
   
  },
  profilePic: {
    width: 35,
    height: 35,
    borderRadius: 50,
  },
  messageContainer: {
    padding: 12,
    borderRadius: 20,
    marginVertical: 4,
    maxWidth: "75%",
  },
  sentMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
  },
  receivedMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#f0f0f0",
  },
  messageText: {
    fontSize: 16,
    color: "#333",
  },
  timestamp: {
    fontSize: 12,
    color: "#888",
    alignSelf: "flex-end",
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    color: "#000",
    padding: 10,
    borderRadius: 25,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 20,
  },
   pollList: {
      paddingBottom: hp("10%"),
    },
    card: {
      width: wp("90%"),
      backgroundColor: "#fff",
      padding: wp("5%"),
      borderRadius: 10,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 3,
      marginBottom: hp("2%"),
      alignSelf: "center",
    },
    profileRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: hp("1%"),
    },
    profileImage: {
      width: wp("10%"),
      height: wp("10%"),
      borderRadius: 50,
      marginRight: wp("3%"),
    },
    userName: {
      fontSize: wp("4%"),
      fontWeight: "bold",
    },
    question: {
      fontSize: wp("4%"),
      marginVertical: hp("1%"),
    },
    optionButton: {
      width: "100%",
      paddingVertical: hp("1.5%"),
      paddingHorizontal: hp("2%"),
      borderWidth: 1,
      borderColor: "#007bff",
      borderRadius: 10,
      marginVertical: hp("0.5%"),
    },
    selectedOption: {
      backgroundColor: "#007bff",
    },
    selectedOptionText: {
      color: "#fff",
    },
    optionText: {
      fontSize: wp("4%"),
      flex: 1,
    },
    shareContainer: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: hp("1%"),
    },
    friendRequestButton: {
      backgroundColor: "#007bff",
      padding: 10,
      borderRadius: 5,
      alignItems: "center",
      marginTop: 10,
    },
    friendRequestText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
    friendRequestIcon: {
      position: "absolute",
      top: 10,
      right: 10,
    },
  
    actionIcons: {
      flexDirection: "row",
      position: "absolute",
      top: 10,
      right: 10,
      alignItems: "center",
    },
  
    iconSpacing: {
      marginRight: 10,
    },
    unselectedOptionText: {
      color: "rgba(0, 123, 255, 0.5)",
    },
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
      backgroundColor: "#fff",
      padding: 20,
      borderRadius: 10,
      width: "80%",
      alignItems: "center",
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 15,
    },
    friendItem: {
      flexDirection: "row",  // Align items horizontally
      alignItems: "center",
      padding: 10,
      marginVertical: 5,
      width: "100%",
      backgroundColor: "#f9f9f9",
      borderRadius: 8,
      height: 60,  // Ensures uniform height for each row
    },
    selectedFriend: {
      backgroundColor: "#d4edda",
    },
    checkbox: {
      width: 20,
      height: 20,
      borderWidth: 1,
      borderColor: "#333",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
      borderRadius: 5,
    },
    checkmark: {
      fontSize: 16,
      color: "green",
    },
    profileImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 10,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 15,
      width: "100%",
    },
    button: {
      flex: 1,
      padding: 10,
      alignItems: "center",
      borderRadius: 5,
    },
    shareButton: {
      backgroundColor: "#4CAF50",
      marginRight: 5,
    },
    cancelButton: {
      backgroundColor: "#FF3B30",
      marginLeft: 5,
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
    optionContainer: {
      alignItems: "center", // Center align the text and votes
      marginBottom: 5,
    },
    voteCountText: {
      fontSize: 14,
      fontWeight: "bold",
      color: "#555",
      marginTop: 4,
    },
    optionContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    votePercentage: {
      fontSize: wp("3.5%"),
      marginLeft: 10,
    },
    selectedOption: {
      backgroundColor: "#007bff",
    },
    selectedOptionText: {
      color: "#fff",
    },
    unselectedOptionText: {
      color: "rgba(0, 123, 255, 0.8)",
    },
    
});

export default ChatDetails;
