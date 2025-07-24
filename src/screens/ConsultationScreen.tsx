import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Text,
  Card,
  Button,
  Chip,
  Searchbar,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomTheme } from "../theme/theme";

const ConsultationScreen = ({ navigation }: any) => {
  const theme = useTheme<CustomTheme>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");

  const specialties = [
    { id: "all", label: "All Specialties" },
    { id: "nutrition", label: "Nutrition" },
    { id: "fitness", label: "Fitness" },
    { id: "mental", label: "Mental Health" },
    { id: "prevention", label: "Preventive Care" },
    { id: "workplace", label: "Workplace Health" },
  ];

  const experts = [
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      specialty: "nutrition",
      specialtyLabel: "Nutrition Specialist",
      rating: 4.8,
      experience: 8,
      description:
        "Certified nutritionist with expertise in workplace wellness and healthy eating habits.",
      availability: ["Mon 9:00 AM", "Wed 2:00 PM", "Fri 10:00 AM"],
      consultationFee: 50,
      imageUrl: "👩‍⚕️",
    },
    {
      id: "2",
      name: "Mike Chen",
      specialty: "fitness",
      specialtyLabel: "Fitness Coach",
      rating: 4.9,
      experience: 12,
      description:
        "Personal trainer specializing in office-friendly workouts and stress management.",
      availability: ["Tue 7:00 AM", "Thu 6:00 PM", "Sat 9:00 AM"],
      consultationFee: 40,
      imageUrl: "🏃‍♂️",
    },
    {
      id: "3",
      name: "Dr. Emma Wilson",
      specialty: "mental",
      specialtyLabel: "Mental Health Counselor",
      rating: 4.7,
      experience: 15,
      description:
        "Licensed psychologist focusing on workplace stress and work-life balance.",
      availability: ["Mon 3:00 PM", "Wed 11:00 AM", "Fri 4:00 PM"],
      consultationFee: 75,
      imageUrl: "🧠",
    },
    {
      id: "4",
      name: "Dr. Lisa Rodriguez",
      specialty: "prevention",
      specialtyLabel: "Preventive Medicine",
      rating: 4.6,
      experience: 10,
      description:
        "Preventive care specialist helping employees maintain optimal health.",
      availability: ["Tue 10:00 AM", "Thu 1:00 PM", "Sat 11:00 AM"],
      consultationFee: 60,
      imageUrl: "🩺",
    },
    {
      id: "5",
      name: "David Kim",
      specialty: "workplace",
      specialtyLabel: "Workplace Wellness",
      rating: 4.8,
      experience: 6,
      description:
        "Wellness consultant specializing in creating healthy work environments.",
      availability: ["Mon 1:00 PM", "Wed 9:00 AM", "Fri 2:00 PM"],
      consultationFee: 45,
      imageUrl: "🏢",
    },
  ];

  const filteredExperts = experts.filter((expert) => {
    const matchesSearch =
      expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty =
      selectedSpecialty === "all" || expert.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const getSpecialtyColor = (specialty: string) => {
    switch (specialty) {
      case "nutrition":
        return theme.customColors.lightGreen;
      case "fitness":
        return theme.customColors.lightRed;
      case "mental":
        return theme.customColors.lightGreen;
      case "prevention":
        return theme.customColors.lightRed;
      case "workplace":
        return theme.customColors.lightGreen;
      default:
        return theme.customColors.lightGreen;
    }
  };

  const getSpecialtyTextColor = (specialty: string) => {
    switch (specialty) {
      case "nutrition":
        return theme.customColors.darkGreen;
      case "fitness":
        return theme.customColors.darkRed;
      case "mental":
        return theme.customColors.darkGreen;
      case "prevention":
        return theme.customColors.darkRed;
      case "workplace":
        return theme.customColors.darkGreen;
      default:
        return theme.customColors.darkGreen;
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search health experts..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={theme.colors.primary}
          />
        </View>

        {/* Specialties */}
        <View style={styles.specialtiesContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Specialties
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipContainer}>
              {specialties.map((specialty) => (
                <Chip
                  key={specialty.id}
                  selected={selectedSpecialty === specialty.id}
                  onPress={() => setSelectedSpecialty(specialty.id)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor:
                        selectedSpecialty === specialty.id
                          ? theme.colors.primary
                          : theme.customColors.lightGreen,
                    },
                  ]}
                  textStyle={[
                    styles.chipText,
                    {
                      color:
                        selectedSpecialty === specialty.id
                          ? theme.colors.onPrimary
                          : theme.customColors.darkGreen,
                    },
                  ]}
                >
                  {specialty.label}
                </Chip>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Experts */}
        <View style={styles.expertsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Health Experts
          </Text>
          {filteredExperts.map((expert) => (
            <Card key={expert.id} style={styles.expertCard}>
              <Card.Content>
                <View style={styles.expertHeader}>
                  <Text style={styles.expertImage}>{expert.imageUrl}</Text>
                  <View style={styles.expertInfo}>
                    <Text
                      style={[
                        styles.expertName,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      {expert.name}
                    </Text>
                    <Text
                      style={[
                        styles.expertSpecialty,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      {expert.specialtyLabel}
                    </Text>
                    <View style={styles.expertRating}>
                      <Text
                        style={[
                          styles.ratingText,
                          { color: theme.colors.primary },
                        ]}
                      >
                        ⭐ {expert.rating}
                      </Text>
                      <Text
                        style={[
                          styles.experienceText,
                          { color: theme.colors.onBackground },
                        ]}
                      >
                        {expert.experience} years experience
                      </Text>
                    </View>
                  </View>
                  <View style={styles.consultationFee}>
                    <Text
                      style={[styles.feeText, { color: theme.colors.primary }]}
                    >
                      ${expert.consultationFee}
                    </Text>
                    <Text
                      style={[
                        styles.feeLabel,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      per session
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    styles.expertDescription,
                    { color: theme.colors.onBackground },
                  ]}
                >
                  {expert.description}
                </Text>

                <View style={styles.availabilityContainer}>
                  <Text
                    style={[
                      styles.availabilityTitle,
                      { color: theme.colors.onBackground },
                    ]}
                  >
                    Available Times:
                  </Text>
                  <View style={styles.availabilitySlots}>
                    {expert.availability.map((slot, index) => (
                      <Chip
                        key={index}
                        compact
                        style={[
                          styles.timeSlot,
                          { backgroundColor: theme.customColors.lightRed },
                        ]}
                        textStyle={[
                          styles.timeSlotText,
                          { color: theme.customColors.darkRed },
                        ]}
                      >
                        {slot}
                      </Chip>
                    ))}
                  </View>
                </View>

                <View style={styles.expertFooter}>
                  <Chip
                    compact
                    style={[
                      styles.specialtyChip,
                      { backgroundColor: getSpecialtyColor(expert.specialty) },
                    ]}
                    textStyle={[
                      styles.specialtyText,
                      { color: getSpecialtyTextColor(expert.specialty) },
                    ]}
                  >
                    {
                      specialties.find((spec) => spec.id === expert.specialty)
                        ?.label
                    }
                  </Chip>

                  <Button
                    mode="contained"
                    onPress={() => {
                      /* Book consultation */
                    }}
                    style={[
                      styles.bookButton,
                      { backgroundColor: theme.colors.primary },
                    ]}
                    labelStyle={styles.bookButtonLabel}
                  >
                    Book Consultation
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* Consultation Benefits */}
        <View style={styles.benefitsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Why Choose Expert Consultation?
          </Text>
          <Card
            style={[
              styles.benefitsCard,
              { backgroundColor: theme.customColors.lightGreen },
            ]}
          >
            <Card.Content>
              <View style={styles.benefitItem}>
                <Text
                  style={[
                    styles.benefitIcon,
                    { color: theme.customColors.darkGreen },
                  ]}
                >
                  🎯
                </Text>
                <Text
                  style={[
                    styles.benefitText,
                    { color: theme.colors.onBackground },
                  ]}
                >
                  Personalized health advice tailored to your needs
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Text
                  style={[
                    styles.benefitIcon,
                    { color: theme.customColors.darkGreen },
                  ]}
                >
                  📋
                </Text>
                <Text
                  style={[
                    styles.benefitText,
                    { color: theme.colors.onBackground },
                  ]}
                >
                  Professional assessment and recommendations
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Text
                  style={[
                    styles.benefitIcon,
                    { color: theme.customColors.darkGreen },
                  ]}
                >
                  🔒
                </Text>
                <Text
                  style={[
                    styles.benefitText,
                    { color: theme.colors.onBackground },
                  ]}
                >
                  Confidential and secure consultations
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Text
                  style={[
                    styles.benefitIcon,
                    { color: theme.customColors.darkGreen },
                  ]}
                >
                  📱
                </Text>
                <Text
                  style={[
                    styles.benefitText,
                    { color: theme.colors.onBackground },
                  ]}
                >
                  Convenient online or in-person sessions
                </Text>
              </View>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchBar: {
    elevation: 2,
  },
  specialtiesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  chipContainer: {
    flexDirection: "row",
    paddingRight: 20,
  },
  chip: {
    marginRight: 10,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  expertsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  expertCard: {
    marginBottom: 15,
    elevation: 2,
  },
  expertHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  expertImage: {
    fontSize: 40,
    marginRight: 15,
  },
  expertInfo: {
    flex: 1,
  },
  expertName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  expertSpecialty: {
    fontSize: 14,
    marginBottom: 8,
  },
  expertRating: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 10,
  },
  experienceText: {
    fontSize: 12,
    opacity: 0.7,
  },
  consultationFee: {
    alignItems: "center",
  },
  feeText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  feeLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  expertDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  availabilityContainer: {
    marginBottom: 15,
  },
  availabilityTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  availabilitySlots: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  timeSlot: {
    marginRight: 8,
    marginBottom: 5,
  },
  timeSlotText: {
    fontSize: 10,
  },
  expertFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  specialtyChip: {
    height: 24,
  },
  specialtyText: {
    fontSize: 10,
  },
  bookButton: {
    borderRadius: 20,
  },
  bookButtonLabel: {
    fontSize: 14,
    fontWeight: "bold",
  },
  benefitsContainer: {
    paddingHorizontal: 20,
  },
  benefitsCard: {
    elevation: 2,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  benefitText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
});

export default ConsultationScreen;
