import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Text, Button, useTheme } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import LogoPutih from "./LogoPutih";

const { width, height } = Dimensions.get("window");

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: string;
  gradient: string[];
}

interface OnboardingSliderProps {
  onComplete: () => void;
}

const OnboardingSlider: React.FC<OnboardingSliderProps> = ({ onComplete }) => {
  const theme = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const slides: OnboardingSlide[] = [
    {
      id: "1",
      title: "Monitoring Pola Asupan Makanan dan Minuman",
      description:
        "Lacak dan pantau pola makan dan minuman Anda sehari-hari. Dapatkan insight nutrisi yang tepat untuk kesehatan optimal.",
      icon: "🍽️",
      gradient: ((theme as any).customColors?.primaryGradient as string[]) || ["#E22345", "#C53030"],
    },
    {
      id: "2",
      title: "Monitoring Pola Aktifitas Kesehatan",
      description:
        "Pantau aktivitas fisik dan kesehatan Anda secara real-time. Dapatkan motivasi untuk mencapai target kebugaran harian.",
      icon: "🏃‍♂️",
      gradient: ((theme as any).customColors?.primaryGradient as string[]) || ["#E22345", "#C53030"],
    },
    {
      id: "3",
      title: "Misi Program Kesehatan",
      description:
        "Ikuti misi dan tantangan kesehatan yang menarik. Raih poin dan hadiah sambil membangun kebiasaan hidup sehat.",
      icon: "🎯",
      gradient: ((theme as any).customColors?.primaryGradient as string[]) || ["#E22345", "#C53030"],
    },
    {
      id: "4",
      title: "Siap Memulai?",
      description:
        "Bergabunglah dengan ribuan pengguna yang telah merasakan manfaat platform kesehatan PHC. Mari mulai perjalanan sehat Anda!",
      icon: "🚀",
      gradient: ((theme as any).customColors?.primaryGradient as string[]) || ["#E22345", "#C53030"],
    },
  ];

  const renderSlide = ({
    item,
    index,
  }: {
    item: OnboardingSlide;
    index: number;
  }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const logoScale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: "clamp",
    });

    const titleOpacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.5, 1, 0.5],
      extrapolate: "clamp",
    });

    const descriptionOpacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.3, 1, 0.3],
      extrapolate: "clamp",
    });

    return (
      <View style={styles.slide}>
        <LinearGradient
          colors={item.gradient as any}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.slideContent}>
            <Animated.View
              style={[
                styles.logoContainer,
                { transform: [{ scale: logoScale }] },
              ]}
            >
              <LogoPutih size={500} />
            </Animated.View>

            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>{item.icon}</Text>
            </View>

            <Animated.View
              style={[styles.textContainer, { opacity: titleOpacity }]}
            >
              <Text style={styles.title}>{item.title}</Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.descriptionContainer,
                { opacity: descriptionOpacity },
              ]}
            >
              <Text style={styles.description}>{item.description}</Text>
            </Animated.View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const renderPaginationDots = () => {
    return (
      <View style={styles.paginationContainer}>
        {slides.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: "clamp",
          });

          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.paginationDot,
                {
                  width: dotWidth,
                  opacity: dotOpacity,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(
            event.nativeEvent.contentOffset.x / width
          );
          setCurrentIndex(newIndex);
        }}
        scrollEventThrottle={16}
      />

      <View style={styles.bottomContainer}>
        {renderPaginationDots()}

        <View style={styles.buttonContainer}>
          {currentIndex < slides.length - 1 ? (
            <>
              <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                <Text style={styles.skipText}>Lewati</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
                <Text style={styles.nextText}>Selanjutnya</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Button
              mode="contained"
              onPress={onComplete}
              style={styles.getStartedButton}
              labelStyle={styles.getStartedButtonText}
            >
              Mulai Sekarang
            </Button>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    width,
    height,
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  slideContent: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingTop: 60,
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: "center",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 35,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  iconText: {
    fontSize: 55,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 25,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 12,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  descriptionContainer: {
    alignItems: "center",
    maxWidth: 320,
    paddingHorizontal: 10,
  },
  description: {
    fontSize: 15,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 22,
    opacity: 0.95,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 35,
    paddingHorizontal: 25,
    backgroundColor: "rgba(0, 0, 0, 0.08)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },
  paginationDot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  skipText: {
    color: "#FFFFFF",
    fontSize: 16,
    opacity: 0.8,
  },
  nextButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  nextText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  getStartedButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    flex: 1,
  },
  getStartedButtonText: {
    color: "#D32F2F",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default OnboardingSlider;
