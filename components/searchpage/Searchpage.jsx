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
  TextInput,Modal
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ArrowLeft } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import API_URL from "../../api";
import Icon from "react-native-vector-icons/Ionicons"; 
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { Plus, X, Share2, ChevronRight } from 'lucide-react-native';
import { Feather } from "@expo/vector-icons"; // or your preferred icon lib

export default function Searchpage({route}) {
  const { neededuser, userid } = route.params ?? {};
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); 
  const [searchQuery1, setSearchQuery1] = useState(""); 
  const [error, setError] = useState(null);
      const [polls1, setPolls1] = useState([]);
      const [selectedPolls, setSelectedPolls] = useState({}); 
      const [selectedPoll, setSelectedPoll] = useState(null);
      const [modalVisible, setModalVisible] = useState(false);
      const [selectedFriends, setSelectedFriends] = useState([]);
  
      const [friendList, setFriendList] = useState([]);
    const [filteredFriendList, setFilteredFriendList] = useState(friendList);

  const navigation = useNavigation();
  useEffect(() => {
    if (neededuser) {
      setSearchQuery1(neededuser.toLowerCase()); 
    }
  }, [neededuser]);
  useEffect(()=>{
    if(searchQuery){
      setFilteredFriendList(
        friendList.filter((friend)=>friend.username.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }
    else if (searchQuery1) {
      setFilteredFriendList(
        friendList.filter((friend) => 
          friend.username.toLowerCase().includes(searchQuery1.toLowerCase())
        )
      )
    }
    else {
      setFilteredFriendList(friendList);
    }
  }, [searchQuery, searchQuery1, friendList]);
  useEffect(() => {
  
    
    console.log("UserId:", userId);
    
    if (userId) {
        console.log("Making API request...");
        axios
          .get(`${API_URL}/poll/top10/${userId}`)
          .then((response) => {
            console.log(
              "API Response:",
              JSON.stringify(response.data, null, 2)
            );
            setPolls1(response.data);
          })
          .catch((error) => {
            console.error("API Error:", error);
          });
    }
}, [userId]);

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
      const response = await axios.get(`${API_URL}/poll/getallusers/${userId}`);
      if (response.status === 200) {
        console.log("API Response:", JSON.stringify(response.data, null, 2));
        setChats(response.data.users);
      }
    } catch (err) {
      console.error("Fetch error:", err.message);
      setError("Failed to fetch data. Please try again.");
      Alert.alert("Error", "Unable to fetch data from server");
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (item, chat) => {
    console.log("Navigating to chat:", item);
    navigation.navigate("ChatDetails", { friendid: item, userid: userId, chat: chat });
  };

  // Filter chats based on search input
  const filteredChats = chats.filter((chat) =>
    chat?.username.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const handleSharePress = (poll) => {
    setSelectedPoll(poll);
    setModalVisible(true);
};

const toggleFriendSelection = (id) => {
  setSelectedFriends(prev =>
      prev.includes(id)
          ? prev.filter(selectedId => selectedId !== id)
          : [...prev, id]
  );
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
  <TouchableOpacity onPress={() => navigation.goBack()} style={styles.arrow}>
    <ArrowLeft size={24} color="#262626" />
  </TouchableOpacity>

  <TextInput
    style={styles.searchBartop}
    placeholder="Search by username..."
    placeholderTextColor="#8e8e8e"
    value={searchQuery}
    onChangeText={setSearchQuery}
  />
</View>


      {loading ? (
        <ActivityIndicator
          size="large"
          color="#007AFF"
          style={{ marginTop: 20 }}
        />
      ) : searchQuery.length > 0 ? (
        filteredChats.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="user-x" size={60} color="#ccc" style={styles.emptyIcon} />
            <Text style={styles.emptyMessage}>No users found.</Text>
          </View>
        )  : (
        
          <FlatList
            data={filteredChats}
            keyExtractor={(item, index) =>
              item.id ? item.id.toString() : index.toString()
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.messageItem}
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate("Profile", {
                    useridofdifferentuser: item._id,
                  })
                }
              >
                <Image
                  source={{
                    uri:
                      item?.profilePic ||
                      "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                  }}
                  style={styles.avatar}
                />
                <View style={styles.messageContent}>
                  <Text style={styles.username}>{item?.username}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )
      ) : (

        <FlatList
          data={polls1.slice(0,10)}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.pollList}
          ListHeaderComponent={
            <Text style={styles.heading}>Top 10 Polls</Text>
          }
          renderItem={({ item }) => {
            const isFriend = friendList.includes(item.userId);
            const totalVotes =
              item.options.reduce((acc, option) => acc + option.votes, 0) || 1; // Avoid division by zero

            return (
              <View style={styles.card}>
                <View style={styles.profileRow}>
                  <Image
                    source={{ uri: item.profileImage }}
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
{option.votes} {option.votes === 1 || option.votes === 0 ? "vote" : "votes"} • {votePercentage}%
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
                    <Icon
                      name="share-social-outline"
                      size={24}
                      color="#007bff"
                    />
                  </TouchableOpacity>

                  {/* {!isFriend && (
                       <TouchableOpacity
                         onPress={() => handleFriendRequest(item.userid)}
                       >
                         <Icon
                           name="person-add-outline"
                           size={24}
                           color="#007bff"
                         />
                       </TouchableOpacity>
                     )} */}
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
              value={searchQuery1}
              onChangeText={setSearchQuery1}
            />

            <FlatList
              data={filteredFriendList}
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
    backgroundColor: "#F9FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    marginTop:hp("3")
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
marginLeft:wp("5%"), 
marginBottom:hp("2")
  
  }
,  
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#262626",
    marginLeft: 16,
    marginTop: 10,
  },
  arrow: {
    marginTop: -4, // shifts arrow slightly upward
    marginRight: 10,
  },
  searchBar: {
    height: 40,
    margin: 10,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    fontSize: 16,
    color: "#262626",
  },
  searchBartop: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#F0F0F0",
    fontSize: 15,
    color: "#262626",
  },
  messageItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
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
    flex: 1, // Takes available space
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: "#262626",
  },
  followButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#007bff",
    borderRadius: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
   iconContainer: {
      
    },
    pollList: {
      paddingBottom: hp("10%"),
      paddingTop: hp("2%"),
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
      color: "#007bff",
      fontSize: wp("4%"),
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
    optionContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    unselectedOptionText: {
      color: "rgba(0, 123, 255, 0.8)",
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
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 50,
    },
    
    emptyIcon: {
      marginBottom: 10,
    },
    
    emptyMessage: {
      fontSize: 16,
      color: "#888",
    },
    
});

