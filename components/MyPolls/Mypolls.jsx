import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { X, Plus } from "lucide-react-native";
import axios from "axios";
import API_URL from "../../api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Mypolls() {
  const [userId, setUserId] = useState(null);
  const [loadingUserId, setLoadingUserId] = useState(true);
  const [pollData, setPollData] = useState({
    question: "",
    options: [{ id: 1, text: "" }],
  });

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

  const addOption = () => {
    if (pollData.options.length < 3) {
      setPollData((prev) => ({
        ...prev,
        options: [...prev.options, { id: Date.now(), text: "" }],
      }));
    } else {
      alert("You can only add up to 3 options.");
    }
  };

  const removeOption = (id) => {
    if (pollData.options.length > 1) {
      setPollData((prev) => ({
        ...prev,
        options: prev.options.filter((option) => option.id !== id),
      }));
    }
  };

  const updateOption = (id, text) => {
    setPollData((prev) => ({
      ...prev,
      options: prev.options.map((option) =>
        option.id === id ? { ...option, text } : option
      ),
    }));
  };

  const handleCreatePoll = async () => {
    if (!pollData.question.trim()) {
      alert("Please enter a question");
      return;
    }

    const validOptions = pollData.options
      .map((opt) => opt.text.trim())
      .filter((text) => text);

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
      await axios.post(`${API_URL}/poll/create`, {
        question: pollData.question,
        options: validOptions,
        userId,
      });

      alert("Poll created successfully!");
      setPollData({
        question: "",
        options: [{ id: 1, text: "" }],
      });
    } catch (error) {
      console.error("Error creating poll:", error);
      alert("Failed to create poll. Please try again.");
    }
  };
  const getThoughtLabel = (index) => {
    const labels = ["First thought", "Second thought", "Third thought", "Fourth thought", "Fifth thought"];
    return labels[index] || `Thought ${index + 1}`;
  };
  
  if (loadingUserId) {
    return <ActivityIndicator size="large" color="#007bff" style={styles.loader} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Share your thoughts</Text>

      <TextInput
        style={styles.questionInput}
        placeholder="Tell us what you think"
        value={pollData.question}
        onChangeText={(text) =>
          setPollData((prev) => ({ ...prev, question: text }))
        }
        placeholderTextColor="#999"
        multiline
      />

      <Text style={styles.optionsLabel}>Add a thought</Text>

      {pollData.options.map((option, index) => (
        <View key={option.id} style={styles.optionContainer}>
          <TextInput
            style={styles.optionInput}
            placeholder={getThoughtLabel(index)}
            placeholderTextColor="#aaa"
            value={option.text}
            onChangeText={(text) => updateOption(option.id, text)}
          />

          {pollData.options.length > 1 && (
            <TouchableOpacity
              style={styles.removeOption}
              onPress={() => removeOption(option.id)}
            >
              <X size={20} color="#ff3b30" />
            </TouchableOpacity>
          )}
        </View>
      ))}

      {pollData.options.length < 3 && (
        <TouchableOpacity style={styles.addOptionButton} onPress={addOption}>
          <Plus size={18} color="#007AFF" />
          <Text style={styles.addOptionText}>Add Another thought</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.createButton}
        activeOpacity={0.8}
        onPress={handleCreatePoll}
      >
        <LinearGradient
          colors={["#0095f6", "#0095f6"]}
          style={styles.gradientButton}
        >
          <Text style={styles.createButtonText}>Post</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
  
}
const styles = StyleSheet.create({
  container: {
    padding: wp('5%'),
    backgroundColor: '#f2f4f8',
    flexGrow: 1,
    

  },

  title: {
    fontSize: wp('7%'),
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: hp('1%'),
    marginTop:hp("4%")
  },

  questionInput: {
    borderRadius: wp('3%'),
    paddingVertical: hp('2%'),
    // paddingHorizontal: wp('4%'),
    fontSize: wp('4.5%'),
    height: hp('20%'), // set a fixed height

    shadowRadius: 2,
    marginBottom: hp('10%'),
  },

  optionsLabel: {
    marginTop:hp("10"),
    fontSize: wp('4.3%'),
    fontWeight: '600',
    marginBottom: hp('1.5%'),
    color: '#1e293b',
  },

  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: wp('2.5%'),
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    marginBottom: hp('1.2%'),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  optionInput: {
    flex: 1,
    fontSize: wp('4%'),
    color: '#111827',
  },

  removeOption: {
    marginLeft: wp('3%'),
    backgroundColor: '#fee2e2',
    padding: wp('1.5%'),
    borderRadius: 100,
  },

  addOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('2%'),
    marginBottom: hp('3%'),
    alignSelf: 'flex-start',
  },

  addOptionText: {
    marginLeft: wp('2%'),
    fontSize: wp('4%'),
    color: '#2563eb',
    fontWeight: '600',
  },

  createButton: {
    marginTop: hp('2%'),
  },

  gradientButton: {
    borderRadius: wp('3%'),
    paddingVertical: hp('1.8%'),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },

  createButtonText: {
    color: '#ffffff',
    fontSize: wp('4.5%'),
    fontWeight: '700',
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
