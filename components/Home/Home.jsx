import React, { useState,useEffect} from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList,Modal,Button,TextInput,Dimensions } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import Icon from "react-native-vector-icons/Ionicons"; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from "../../api";
import axios from "axios";
import { Plus, X, Share2, ChevronRight } from 'lucide-react-native';
import { useNavigation } from "@react-navigation/native";
const { width } = Dimensions.get('window');

const CARD_MARGIN = wp('1%');
const CARD_WIDTH = (width - (wp('2%') * 2) - (CARD_MARGIN * 8)) / 4; // Calculate width for 4 cards
export default function Home() {
  const navigation=useNavigation();
    const [selectedPolls, setSelectedPolls] = useState({}); 
    const [userId, setUserId] = useState(null);
    const [loadingUserId, setLoadingUserId] = useState(true); 
    const [polls1, setPolls1] = useState([]);
    const [friendList, setFriendList] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedPoll, setSelectedPoll] = useState(null);
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredFriendList, setFilteredFriendList] = useState(friendList);
    const [likedPolls, setLikedPolls] = useState({});
 useEffect(() => {
    const fetchUserId = async () => {
        try {
          const storedUserId = await AsyncStorage.getItem("userId");
          console.log(storedUserId);
          if (storedUserId) {
            setUserId(storedUserId);
          }
        } catch (error) {
          console.error("Error fetching userId from AsyncStorage:", error);
        } finally {
          setLoadingUserId(false);
        }
    };

    fetchUserId();
}, []);  
useEffect(() => {
    console.log("UserId:", userId);
    console.log("Loading UserId:", loadingUserId);
    
    if (!loadingUserId && userId) {
        console.log("Making API request...");
        axios
            .get(`${API_URL}/poll/getallPolls/${userId}`)
            .then((response) => {
              console.log("API Response:", JSON.stringify(response.data, null, 2));
              setPolls1(response.data);
            })
            .catch((error) => {
                console.error("API Error:", error);
            });
    }
}, [userId, loadingUserId]);

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
            optionIndex: index
        });

        if (response.status === 200) {
          setSelectedPolls((prev) => ({ ...prev, [pollId]: index }));
          const updatedPollResponse = await axios.get(`${API_URL}/poll/getPoll/${pollId}`, {
            params: { userId: userId }
        });
                  const updatedPoll = updatedPollResponse.data;
          setPolls1((prevPolls) => prevPolls.map(poll => 
            poll.id === pollId ? updatedPoll : poll
        ));
        }
    } catch (error) {
        console.error("Voting error:", error);
        alert(error.response?.data?.message || "Failed to submit vote. Please try again.");
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

const toggleFriendSelection = (id) => {
    setSelectedFriends(prev =>
        prev.includes(id)
            ? prev.filter(selectedId => selectedId !== id)
            : [...prev, id]
    );
};

const handleLike = async (pollId) => {
    try {
        const isLiked = likedPolls[pollId];
        
        const response = await axios.post(`${API_URL}/poll/likePoll`, {
            pollId,
            userId,
        });

        if (response.status === 200) {
            setLikedPolls(prev => ({
                ...prev,
                [pollId]: !isLiked
            }));
            
            // Update poll list with new like count
            setPolls1(prevPolls => prevPolls.map(poll => 
                poll.id === pollId 
                    ? { ...poll, likes: response.data.likes, isLikedByUser: response.data.isLikedByUser }
                    : poll
            ));
        }
    } catch (error) {
        console.error("Like error:", error);
        alert(error.response?.data?.message || "Failed to like poll.");
    }
};



const handleFriendRequest = (friendId) => {
    axios.post(`${API_URL}/friend/sendRequest`, { senderId: userId, receiverId: friendId })
        .then(response => {
            alert(response.data.message); 
            // setFriendList([...friendList, friendId]);
        })
        .catch(error => {
            if (error.response) {
                alert(error.response.data.message); // Show the backend error message
            } else {
                alert("Something went wrong. Please try again.");
            }
        });
};
const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days === 1) return `yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  if (days <= 3) return `${days} days ago`;
  
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View></View>
          <Image
            source={require("../../assets/download.png")}
            style={styles.logo}
          />
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => navigation.navigate("Messages")}
          >
            <Icon name="chatbubble-ellipses-outline" size={30} color="#888" />
          </TouchableOpacity>
        </View>
        <View style={styles.headerbelowline}></View>
        {loadingUserId ? (
          <Text>Loading...</Text>
        ) : polls1.length === 0 ? (
          <View style={styles.noPollsContainer}>
            <Icon name="chatbubble-ellipses-outline" size={50} color="#888" />
            <Text style={styles.noPollsText}>No polls available</Text>
            <Text style={styles.noPollsSubText}>
              Create or join a poll to get started!
            </Text>
          </View>
        ) : (
          <FlatList
            data={polls1}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.pollList}
            renderItem={({ item }) => {
              const isFriend = friendList.includes(item.userId);
              const totalVotes =
                item.options.reduce((acc, option) => acc + option.votes, 0) ||
                1; // Avoid division by zero

              return (
                <View style={styles.card}>
                  <View style={styles.profileRow}>
                    <Image
                      source={{ uri: item.profileImage }}
                      style={styles.profileImage}
                    />
                    <Text style={styles.userName}>{item.user}</Text>
                    <Text style={styles.createdAtText}>
                      {item.createdAt && !isNaN(new Date(item.createdAt))
                        ? formatTimeAgo(new Date(item.createdAt))
                        : ""}
                    </Text>
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
                        ? ((option.votes / totalVotes) * 100).toFixed(0)
                        : 0;

                    const hasVoted = item.userVotedOptionIndex !== -1;

                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.optionButton,
                          hasVoted && !isSelected && styles.unselectedVotedOption,
                          isSelected && styles.selectedOption,
                        ]}
                        onPress={() => handleVote(item.id, index)}
                        disabled={hasVoted}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            isSelected && styles.selectedOptionText,
                            hasVoted && !isSelected && styles.unselectedVotedText,
                          ]}
                        >
                          {option.text}
                        </Text>

                        {hasVoted && (
                          <Text
                            style={[
                              styles.votePercentage,
                              isSelected && styles.selectedOptionText,
                              !isSelected && styles.unselectedVotedText,
                            ]}
                          >
                            {votePercentage}%
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}

                  <View style={styles.pollActions}>
                    <TouchableOpacity
                      style={styles.likeButton}
                      onPress={() => handleLike(item.id)}
                    >
                      <Icon
                        name={likedPolls[item.id] || item.isLikedByUser ? "heart" : "heart-outline"}
                        size={20}
                        color={likedPolls[item.id] || item.isLikedByUser ? "#FF3B30" : "#8E8E93"}
                      />
                      <Text style={styles.likeCount}>{item.likes || 0}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleSharePress(item)}>
                      <Icon
                        name="share-social-outline"
                        size={20}
                        color="#8E8E93"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />
        )}
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
                      styles.friendItem,
                      selectedFriends.includes(item._id) &&
                        styles.selectedFriend,
                    ]}
                    onPress={() => toggleFriendSelection(item._id)}
                  >
                    <Image
                      source={{
                        uri:
                          item.profilePic ||
                          "https://cdn-icons-png.flaticon.com/512/149/149071.png",
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: hp("5%"),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: wp("5%"),
    marginBottom: hp("1%"),
  },
  headerbelowline:{
   height:hp("0.09%"),
   backgroundColor:"gray",
   marginBottom: hp("2%"),

  
  },
  logo: {
    width: wp("15%"),
    height: wp("10%"),
    resizeMode: "contain",
    marginLeft:wp("6%")
  },
  iconContainer: {
    
  },
  pollList: {
    paddingBottom: hp("10%"),
  },
  card: {
    width: wp("90%"),
    backgroundColor: "#fff",
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("3%"),
        borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: hp("1%"),
    alignSelf: "center",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("0.5%"),
  },
  profileImage: {
    width: wp("8%"),
    height: wp("8%"),
    borderRadius: wp("4%"),
    marginRight: wp("2%"),
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
    borderColor: "#E0E0E0",
    borderRadius: 8,
    marginVertical: hp("0.5%"),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  selectedOption: {
    backgroundColor: "#5A6C7D",
    borderColor: "#5A6C7D",
  },
  unselectedVotedOption: {
    backgroundColor: "#F5F5F5",
    borderColor: "#E0E0E0",
  },
  selectedOptionText: {
    color: "#fff",
  },
  unselectedVotedText: {
    color: "#666",
  },
  optionText: {
    color: "#333",
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

  pollActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp("2%"),
    justifyContent: "space-between",
    paddingTop: hp("1%"),
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  likeCount: {
    fontSize: wp("3.5%"),
    color: "#8E8E93",
    marginLeft: wp("1.5%"),
  },
 

  // modalContainer: {
  //   flex: 1,
  //   justifyContent: "center",
  //   alignItems: "center",
  //   backgroundColor: "rgba(0,0,0,0.6)",
  // },
  // modalContent: {
  //   backgroundColor: "#fff",
  //   padding: 25,
  //   borderRadius: 15,
  //   width: "85%",
  //   alignItems: "center",
  //   elevation: 10, // Android shadow
  //   shadowColor: "#000", // iOS shadow
  //   shadowOffset: { width: 0, height: 4 },
  //   shadowOpacity: 0.2,
  //   shadowRadius: 8,
  // },
  // modalTitle: {
  //   fontSize: 20,
  //   fontWeight: "bold",
  //   color: "#333",
  //   marginBottom: 15,
  // },
  // friendItem: {
  //   flexDirection: "row",
  //   alignItems: "center",
  //   padding: 12,
  //   marginVertical: 5,
  //   width: "100%",
  //   backgroundColor: "#f2f2f2",
  //   borderRadius: 10,
  //   height: 65,
  //   shadowColor: "#000",
  //   shadowOffset: { width: 0, height: 2 },
  //   shadowOpacity: 0.1,
  //   shadowRadius: 5,
  // },
  // selectedFriend: {
  //   backgroundColor: "#e6f9e6",
  //   borderColor: "#4CAF50",
  //   borderWidth: 1,
  // },
  // checkbox: {
  //   width: 24,
  //   height: 24,
  //   borderWidth: 2,
  //   borderColor: "#4CAF50",
  //   justifyContent: "center",
  //   alignItems: "center",
  //   marginRight: 12,
  //   borderRadius: 6,
  //   backgroundColor: "#fff",
  // },
  // checkmark: {
  //   fontSize: 16,
  //   color: "#4CAF50",
  //   fontWeight: "bold",
  // },
  // profileImage: {
  //   width: 45,
  //   height: 45,
  //   borderRadius: 25,
  //   marginRight: 12,
  // },
  // friendName: {
  //   fontSize: 16,
  //   fontWeight: "500",
  //   color: "#333",
  // },
  // buttonContainer: {
  //   flexDirection: "row",
  //   justifyContent: "space-between",
  //   marginTop: 20,
  //   width: "100%",
  // },
  // button: {
  //   flex: 1,
  //   padding: 12,
  //   alignItems: "center",
  //   borderRadius: 8,
  // },
  // shareButton: {
  //   backgroundColor: "#4CAF50",
  //   marginRight: 8,
  //   shadowColor: "#000",
  //   shadowOffset: { width: 0, height: 2 },
  //   shadowOpacity: 0.2,
  //   shadowRadius: 5,
  // },
  // cancelButton: {
  //   backgroundColor: "#FF3B30",
  //   marginLeft: 8,
  // },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  votePercentage: {
    fontSize: wp("3.5%"),
    marginLeft: 10,
    fontWeight: "500",
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
  noPollsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noPollsText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#555",
    marginTop: 10,
  },
  noPollsSubText: {
    fontSize: 14,
    color: "#777",
    marginTop: 5,
  },
  searchBar: {
    height: 40,
    margin: wp('4%'),
    borderRadius: wp('6%'),
    paddingHorizontal: wp('4%'),
    backgroundColor: "#F5F5F5",
    borderWidth: 1.5,
    borderColor: "#D0D0D0",
    fontSize: wp('4%'),
    color: "#333",
    elevation: 3, // Add subtle shadow for a floating effect (Android)
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  }
  ,createdAtText: {
    fontSize: wp("3%"),
    marginLeft:wp("4%"),
    color: "gray",
  },
  
  
});