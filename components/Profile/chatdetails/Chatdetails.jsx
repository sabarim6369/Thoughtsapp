import React, { useState, useRef,useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import Icon from "react-native-vector-icons/Ionicons"; 
import axios from "axios";
import API_URL from "../../../api";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Plus, X, Share2, ChevronRight } from 'lucide-react-native';

const ChatDetails = ({ route }) => {
  const { friendid,userid,chat } = route.params;
      const navigation = useNavigation();
      const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'polls'

  const [message, setMessage] = useState("");
  const flatListRef = useRef(null);
  const [friendList, setFriendList] = useState([]);
  const [selectedPolls, setSelectedPolls] = useState({});
  const [Polls, setPolls] = useState([]);
  const [userId, setUserId] = useState(null);
 const [modalVisible, setModalVisible] = useState(false);
    const [selectedPoll, setSelectedPoll] = useState(null);
        const [selectedFriends, setSelectedFriends] = useState([]);
        const [messages, setMessages] = useState([
          {
            id: '1',
            text: 'Hey there! How are you?',
            sentByUser: false,
            timestamp: '09:30 AM'
          },
          {
            id: '2',
            text: 'I\'m good, thanks! How about you?',
            sentByUser: true,
            timestamp: '09:31 AM'
          },
          {
            id: '3',
            text: 'Great! Just working on some new features.',
            sentByUser: false,
            timestamp: '09:32 AM'
          },
          {
            id: '4',
            text: 'That sounds interesting! Can\'t wait to see them.',
            sentByUser: true,
            timestamp: '09:33 AM'
          }
        ]);
      useEffect(()=>{
        const fetchMessages = async () => {
          try {
            console.log("👏👏👏👏👏👏",friendid,userid)
            const response = await axios.post(`${API_URL}/friend/getchat`, {
              userId: userid,
              friendId: friendid,
            });
        
            if (response.status === 200) {
              console.log("😎😎😎😎😎😎😎😎😎😶‍🌫️👏👏",response.data.messages)
              setMessages(response.data.messages);
            }
          } catch (error) {
            console.error("Error fetching messages:", error);
          }
        };
        fetchMessages();
      },[userId])
  useEffect(() => {
    const fetchPolls = async () => {
      try {
        setUserId(userid);
        // console.log("😐😐😐😐😐",chat)
        // console.log(chat._id)
        // const pollIds = chat.map((poll) => poll.pollId._id);
        const response = await axios.post(`${API_URL}/Poll/getPollswithids`, {
          friendId:friendid,userId:userid
        });
        console.log(JSON.stringify(response.data.polls, null, 2));
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
              setFriendList(Array.isArray(response.data.friends) ? response.data.friends : []);
          })
          .catch(error => {
              console.error("Error fetching friends:", error);
              setFriendList([]);
          });
  }
}, [userId]);
const sendMessage = async () => {
  if (message.trim().length === 0) return;

  const newMessage = {
    id: Date.now().toString(),
    text: message,
    sentBy: userid,
    createdAt: new Date().toISOString(), // Standardized timestamp
    messageType: "sent", // 🔹 Mark as sent
  };

  try {
    const response = await axios.post(`${API_URL}/friend/chat`, {
      userId: userid,
      chatWith: friendid,
      message: message, // 🔹 Ensure the message is sent to the backend
    });

    if (response.status === 200) {
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setMessage("");

      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  } catch (error) {
    console.error("Error sending message:", error);
  }
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
                alert(error.response.data.message); 
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
                 const updatedPollResponse = await axios.get(`${API_URL}/poll/getPoll/${pollId}`, {
                   params: { userId: userId }
               });
                         const updatedPoll = updatedPollResponse.data;
                 setPolls((prevPolls) => prevPolls.map(poll => 
                   poll.id === pollId ? updatedPoll : poll
               ));
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
      pollId: selectedPoll.id, 
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
const renderMessage = ({ item }) => (
  <View
    style={[
      styles.messageContainer,
      item.messageType === "sent" ? styles.sentMessage : styles.receivedMessage,
    ]}
  >
    <Text style={[
      styles.messageText,
      { color: item.messageType === "sent" ? "#fff" : "#000" }
    ]}>
      {item.text}
    </Text>
    <Text style={[
      styles.timestamp,
      { color: item.messageType === "sent" ? "#fff" : "#666" }
    ]}>
      {new Date(item.createdAt).toLocaleTimeString()} {/* Format timestamp */}
    </Text>
  </View>
);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.username}>{chat.sharedPersonId?.username}</Text>
        <Image
          source={{ uri: chat.profilePic || "https://via.placeholder.com/50" }}
          style={styles.profilePic}
        />
      </View>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "chat" && styles.activeTab]}
          onPress={() => setActiveTab("chat")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "chat" && styles.activeTabText,
            ]}
          >
            Chat
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "polls" && styles.activeTab]}
          onPress={() => setActiveTab("polls")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "polls" && styles.activeTabText,
            ]}
          >
            Polls
          </Text>
        </TouchableOpacity>
      </View>
      {activeTab === 'chat' ? (
        // Chat Tab Content
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.chatContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
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
                  option.marked || selectedPolls[item.id] === index;
                const totalVotes = item.options.reduce(
                  (sum, opt) => sum + opt.votes,
                  0
                );
                const votePercentage =
                  totalVotes > 0
                    ? ((option.votes / totalVotes) * 100).toFixed(1)
                    : 0;

                const hasVoted = item.userVotedOptionIndex !== -1; // Check if the user has voted

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      isSelected ? styles.selectedOption : null,
                    ]}
                    onPress={() => handleVote(item.id, index)}
                    disabled={hasVoted} // Disable voting if user has already voted
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
                        {option.text} {isSelected && " ✔"}
                      </Text>

                      {hasVoted && (
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
                  <TouchableOpacity
                    onPress={() => handleFriendRequest(item.userid)}
                  >
                    <Icon name="person-add-outline" size={24} color="#007bff" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
      />
    )}
      {/* Message Input */}
      {activeTab==="chat"?(
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
      ):
      <></>}
     
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.shareModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Share with Friends</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={friendList}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.friendItem,
                    selectedFriends.includes(item._id) && styles.selectedFriend,
                  ]}
                  onPress={() => toggleFriendSelection(item._id)}
                >
                  <Image
                    source={{
                      uri: item.profilePic || "https://via.placeholder.com/50",
                    }}
                    style={styles.friendAvatar}
                  />
                  <Text style={styles.friendName}>{item.username}</Text>
                  <View
                    style={[
                      styles.checkbox,
                      selectedFriends.includes(item._id) && styles.checkedBox,
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
                styles.shareConfirmButton,
                { opacity: selectedFriends.length === 0 ? 0.5 : 1 },
              ]}
              onPress={handleShare}
              disabled={selectedFriends.length === 0}
            >
              <Text style={styles.shareConfirmText}>
                Share with {selectedFriends.length} friend
                {selectedFriends.length !== 1 ? "s" : ""}
              </Text>
            </TouchableOpacity>
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
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
    },
    createPollModal: {
      backgroundColor: "#FFF",
      borderRadius: wp('4%'),
      margin: wp('4%'),
      maxHeight: hp('80%'),
    },
    shareModal: {
      backgroundColor: "#FFF",
      borderRadius: wp('4%'),
      margin: wp('4%'),
      maxHeight: hp('80%'),
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: wp('4%'),
      borderBottomWidth: 1,
      borderBottomColor: "#E5E5EA",
    },
    modalTitle: {
      fontSize: wp('5%'),
      fontWeight: "600",
      color: "#000",
    },
    modalScroll: {
      padding: wp('4%'),
    },
    questionInput: {
      fontSize: wp('4.5%'),
      padding: wp('4%'),
      backgroundColor: "#F2F2F7",
      borderRadius: wp('2%'),
      marginBottom: hp('2%'),
    },
    optionsLabel: {
      fontSize: wp('4%'),
      fontWeight: "600",
      color: "#000",
      marginBottom: hp('1.5%'),
    },
    optionContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: hp('1.5%'),
    },
    optionInput: {
      flex: 1,
      fontSize: wp('4%'),
      padding: wp('3%'),
      backgroundColor: "#F2F2F7",
      borderRadius: wp('2%'),
    },
    removeOption: {
      marginLeft: wp('3%'),
    },
    addOptionButton: {
      flexDirection: "row",
      alignItems: "center",
      padding: wp('3%'),
      marginBottom: hp('3%'),
    },
    addOptionText: {
      marginLeft: wp('2%'),
      fontSize: wp('4%'),
      color: "#007AFF",
      fontWeight: "600",
    },
    createButton: {
      marginBottom: hp('2%'),
    },
    gradientButton: {
      padding: wp('4%'),
      borderRadius: wp('2%'),
      alignItems: "center",
    },
    createButtonText: {
      color: "#FFF",
      fontSize: wp('4%'),
      fontWeight: "600",
    },
    friendItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: wp('3%'),
      borderBottomWidth: 1,
      borderBottomColor: "#E5E5EA",
    },
    friendAvatar: {
      width: wp('10%'),
      height: wp('10%'),
      borderRadius: wp('5%'),
      marginRight: wp('3%'),
    },
    friendName: {
      flex: 1,
      fontSize: wp('4%'),
      color: "#000",
    },
    checkbox: {
      width: wp('6%'),
      height: wp('6%'),
      borderRadius: wp('3%'),
      borderWidth: 2,
      borderColor: "#E5E5EA",
      justifyContent: "center",
      alignItems: "center",
    },
    checkedBox: {
      backgroundColor: "#007AFF",
      borderColor: "#007AFF",
    },
    shareConfirmButton: {
      margin: wp('4%'),
      padding: wp('4%'),
      backgroundColor: "#007AFF",
      borderRadius: wp('2%'),
      alignItems: "center",
    },
    shareConfirmText: {
      color: "#FFF",
      fontSize: wp('4%'),
      fontWeight: "600",
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

    tabContainer: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
    },
    tab: {
      flex: 1,
      paddingVertical: 15,
      alignItems: 'center',
    },
    activeTab: {
      borderBottomWidth: 2,
      borderBottomColor: '#007AFF',
    },
    tabText: {
      fontSize: 16,
      color: '#666',
    },
    activeTabText: {
      color: '#007AFF',
      fontWeight: '600',
    },
    chatContainer: {
      padding: 10,
    },
    messageContainer: {
      padding: 12,
      borderRadius: 20,
      marginVertical: 4,
      maxWidth: '75%',
    },
    sentMessage: {
      alignSelf: 'flex-end',
      backgroundColor: '#007AFF',
    },
    receivedMessage: {
      alignSelf: 'flex-start',
      backgroundColor: '#f0f0f0',
    },
    messageText: {
      fontSize: 16,
    },
    timestamp: {
      fontSize: 12,
      marginTop: 4,
    },
    
});

export default ChatDetails;
