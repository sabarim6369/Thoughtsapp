import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Modal, Image, ScrollView,Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { Plus, X, Share2, ChevronRight,Trash2 } from 'lucide-react-native';
import axios from "axios";
import API_URL from "../../api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Mypolls() {
  const [polls, setPolls] = useState([]);
  const [pollCount, setPollCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingUserId, setLoadingUserId] = useState(true);
  const [userId, setUserId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [friendList, setFriendList] = useState([]);
  const [createPollVisible, setCreatePollVisible] = useState(false);
 const [searchQuery, setSearchQuery] = useState("");
    const [filteredFriendList, setFilteredFriendList] = useState(friendList);
  // Move poll creation state into the CreatePollModal component
  const CreatePollModal = () => {
    const [pollData, setPollData] = useState({
      question: "",
      options: [{ id: 1, text: "" }]
    });

    const addOption = () => {
      if (pollData.options.length < 3) {
        setPollData(prev => ({
          ...prev,
          options: [...prev.options, { id: Date.now(), text: "" }]
        }));
      } else {
        alert("You can only add up to 3 options.");
      }
    };
    

    const removeOption = (id) => {
      if (pollData.options.length > 1) {
        setPollData(prev => ({
          ...prev,
          options: prev.options.filter(option => option.id !== id)
        }));
      }
    };

    const updateOption = (id, text) => {
      
      setPollData(prev => ({
        ...prev,
        options: prev.options.map(option => 
          option.id === id ? { ...option, text } : option
        )
      }));
    };

    const handleCreatePoll = async () => {
      if (!pollData.question.trim()) {
        alert("Please enter a question");
        return;
      }
    
      const validOptions = pollData.options
        .map(opt => opt.text.trim())
        .filter(text => text);
    
      if (validOptions.length < 1) {
        alert("Please add at least one option");
        return;
      }
    
      const uniqueOptions = new Set(validOptions);
      if (uniqueOptions.size !== validOptions.length) {
        alert("All options must be unique.");
        return;
      }
    
      try {
        const response = await axios.post(`${API_URL}/poll/create`, {
          question: pollData.question,
          options: validOptions,
          userId
        });
    
        setPolls(prevPolls => [...prevPolls, response.data]);
        setPollCount(prev => prev + 1);
        setPollData({
          question: "",
          options: [{ id: 1, text: "" }]
        });
        setCreatePollVisible(false);
        fetchPolls();
      } catch (error) {
        console.error("Error creating poll:", error);
        alert("Failed to create poll. Please try again.");
      }
    };
    

    return (
      <Modal
        visible={createPollVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreatePollVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.createPollModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Poll</Text>
              <TouchableOpacity onPress={() => setCreatePollVisible(false)}>
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <TextInput
                style={styles.questionInput}
                placeholder="Ask a question..."
                value={pollData.question}
                onChangeText={(text) => setPollData(prev => ({ ...prev, question: text }))}
                multiline
              />

              <Text style={styles.optionsLabel}>Options</Text>
              {pollData.options.map((option, index) => (
                <View key={option.id} style={styles.optionContainer}>
                  <TextInput
                    style={styles.optionInput}
                    placeholder={`Option ${index + 1}`}
                    value={option.text}
                    onChangeText={(text) => updateOption(option.id, text)}
                  />
                  {pollData.options.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeOption}
                      onPress={() => removeOption(option.id)}
                    >
                      <X size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              {pollData.options.length < 10 && (
                <TouchableOpacity style={styles.addOptionButton} onPress={addOption}>
                  <Plus size={20} color="#007AFF" />
                  <Text style={styles.addOptionText}>Add Option</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.createButton} onPress={handleCreatePoll}>
                <LinearGradient
                  colors={["#007AFF", "#0056b3"]}
                  style={styles.gradientButton}
                >
                  <Text style={styles.createButtonText}>Create Poll</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

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
        setLoadingUserId(false);
      }
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId && !loadingUserId) {
      fetchPolls();
    }
  }, [userId, loadingUserId]);

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
  useEffect(() => {
    if (userId) {
      axios.get(`${API_URL}/friend/list/${userId}`)
        .then((response) => {
          setFriendList(Array.isArray(response.data.friends) ? response.data.friends : []);
        })
        .catch((error) => {
          console.error("Error fetching friends:", error);
          setFriendList([]);
        });
    }
  }, [userId]);

  const handleSharePress = (poll) => {
    setSelectedPoll(poll);
    setModalVisible(true);
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
      const response = await axios.post(`${API_URL}/poll/sharepoll`, {
        pollId: selectedPoll._id,
        userId,
        friends: selectedFriends,
      });
      alert(response.data.message);
      setModalVisible(false);
      setSelectedFriends([]);
    } catch (error) {
      console.error("Share Error:", error);
      alert(error.response?.data?.message || "Failed to share poll. Please try again.");
    }
  };

  if (loading || loadingUserId) {
    return <ActivityIndicator size="large" color="#007bff" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Polls</Text>
        <TouchableOpacity
          style={styles.newPollButton}
          onPress={() => setCreatePollVisible(true)}
        >
          <Plus size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={polls}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.pollList}
        renderItem={({ item }) => (
          <View style={styles.pollCard}>
            <Text style={styles.pollQuestion}>{item.question}</Text>
            <View style={styles.pollOptions}>
              {item.options?.map((option) => (
                <View key={option._id} style={styles.optionBar}>
                  <View style={[styles.optionProgress, { width: `${(option.votes / Math.max(...item.options.map(o => o.votes), 1)) * 100}%` }]} />
                  <View style={styles.optionContent}>
                    <Text style={styles.optionText}>{option.text}</Text>
                    <Text style={styles.voteCount}>{option.votes}</Text>
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.actionButtons}>
        {/* Share Button */}
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => handleSharePress(item)}
        >
          <Share2 size={20} color="#007AFF" />
          <Text style={styles.shareText}>Share Poll</Text>
        </TouchableOpacity>

        {/* Delete Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeletePoll(item._id)}
        >
          <Trash2 size={20} color="red" />
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
          </View>
        )}
      />

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
                    selectedFriends.includes(item._id) && styles.selectedFriend
                  ]}
                  onPress={() => toggleFriendSelection(item._id)}
                >
                  <Image
                    source={{ uri: item.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png" }}
                    style={styles.friendAvatar}
                  />
                  <Text style={styles.friendName}>{item.username}</Text>
                  <View style={[
                    styles.checkbox,
                    selectedFriends.includes(item._id) && styles.checkedBox
                  ]}>
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
                { opacity: selectedFriends.length === 0 ? 0.5 : 1 }
              ]}
              onPress={handleShare}
              disabled={selectedFriends.length === 0}
            >
              <Text style={styles.shareConfirmText}>
                Share with {selectedFriends.length} friend{selectedFriends.length !== 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <CreatePollModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: wp('4%'),
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  title: {
    fontSize: wp('6%'),
    fontWeight: "bold",
    color: "#000",
    marginTop:hp("3%")
  },
  newPollButton: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
    marginTop:hp("3%")

  },
  pollList: {
    padding: wp('4%'),
    paddingBottom: hp('10%')
  },
  pollCard: {
    backgroundColor: "#FFF",
    borderRadius: wp('4%'),
    padding: wp('4%'),
    marginBottom: hp('2%'),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: wp('2%'),
    elevation: 3,
  },
  pollQuestion: {
    fontSize: wp('4.5%'),
    fontWeight: "600",
    color: "#000",
    marginBottom: hp('2%'),
  },
  optionBar: {
    height: hp('6%'),
    backgroundColor: "#F2F2F7",
    borderRadius: wp('2%'),
    marginBottom: hp('1%'),
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
    padding: wp('3%'),
    zIndex: 1,
  },
  optionText: {
    fontSize: wp('4%'),
    color: "#000",
  },
  voteCount: {
    fontSize: wp('4%'),
    fontWeight: "600",
    color: "#007AFF",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: hp('2%'),
    padding: wp('3%'),
    backgroundColor: "#F2F2F7",
    borderRadius: wp('2%'),
  },
  shareText: {
    marginLeft: wp('2%'),
    fontSize: wp('4%'),
    color: "#007AFF",
    fontWeight: "600",
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
  selectedFriend: {
    backgroundColor: "#F2F2F7",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between", // Places Share and Delete buttons at opposite ends
    alignItems: "center",
    marginTop: hp("2%"),
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFE5E5", // Light red background for better visibility
    padding: wp("2%"),
    borderRadius: wp("2%"),
    marginTop:hp("1%")

  },
  deleteText: {
    color: "red",
    fontSize: wp("4%"),
    fontWeight: "600",
    marginLeft: wp("1%"),
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
  
});