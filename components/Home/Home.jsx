import React, { useState,useEffect} from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import Icon from "react-native-vector-icons/Ionicons"; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from "../../api";
import axios from "axios";


export default function Home() {
    const [selectedPolls, setSelectedPolls] = useState({}); // Store selected options
        const [userId, setUserId] = useState(null);
        const [loadingUserId, setLoadingUserId] = useState(true); 
        const [polls1, setPolls1] = useState([]);
        const [friendList, setFriendList] = useState([]);

 useEffect(() => {
    const fetchUserId = async () => {
        try {
            const storedUserId = await AsyncStorage.getItem('userId');
            console.log(storedUserId)
            if (storedUserId) {
                setUserId(storedUserId);  
            }
        } catch (error) {
            console.error('Error fetching userId from AsyncStorage:', error);
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
                console.log("API Response:", response.data);
                setPolls1(response.data);
            })
            .catch((error) => {
                console.error("API Error:", error);
            });
    }
}, [userId, loadingUserId]);


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
            setSelectedPolls(prev => ({ ...prev, [pollId]: index }));
        }
    } catch (error) {
        console.error("Voting error:", error);
        alert(error.response?.data?.message || "Failed to submit vote. Please try again.");
    }
};

  
const handleFriendRequest = (friendId) => {
    axios.post(`${API_URL}/friend/sendRequest`, { senderId: userId, receiverId: friendId })
        .then(response => {
            alert(response.data.message); // Show the success message
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

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={require("../../assets/download.png")}
            style={styles.logo}
          />
        </View>
        {loadingUserId ? (
          <Text>Loading...</Text> // Show this if still loading user data
        ) : polls1.length === 0 ? (
          <Text>No polls available</Text> // Show this if no polls are found
        ) : (
          <FlatList
            data={polls1}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.pollList}
            renderItem={({ item }) => {
                const isFriend = friendList.includes(item.userId);
                const totalVotes = item.options.reduce((acc, option) => acc + option.votes, 0) || 1; // Avoid division by zero
            
                return (
                    <View style={styles.card}>
                        <View style={styles.profileRow}>
                            <Image source={{ uri: item.profileImage }} style={styles.profileImage} />
                            <Text style={styles.userName}>{item.user}</Text>
                        </View>
                        <Text style={styles.question}>{item.question}</Text>
            
                        {item.options.map((option, index) => {
                            const isSelected = selectedPolls[item.id] === index || option.marked;
                            const votePercentage = totalVotes > 1 ? ((option.votes / totalVotes) * 100).toFixed(1) : null;
                            
                            return (
                              <TouchableOpacity
                                key={index}
                                style={[
                                  styles.optionButton,
                                  isSelected ? styles.selectedOption : null,
                                ]}
                                onPress={() => handleVote(item.id, index)}
                                disabled={option.marked} // Prevent re-voting if already marked
                              >
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
                              </TouchableOpacity>
                            );
                        })}
            
                        <View style={styles.actionIcons}>
                            <TouchableOpacity onPress={() => console.log(`Sharing poll: ${item.question}`)} style={styles.iconSpacing}>
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
        )}
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
        alignItems: "center",
        marginBottom: hp("2%"),
    },
    logo: {
        width: wp("15%"),
        height: wp("15%"),
        resizeMode: "contain",
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
        borderWidth: 1,
        borderColor: "#007bff",
        borderRadius: 10,
        marginVertical: hp("0.5%"),
        alignItems: "center",
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
    friendRequestButton: { backgroundColor: "#007bff", padding: 10, borderRadius: 5, alignItems: "center", marginTop: 10 },
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
        color: "rgba(0, 123, 255, 0.5)", // Light blue for unselected options
    },
    
    
});
