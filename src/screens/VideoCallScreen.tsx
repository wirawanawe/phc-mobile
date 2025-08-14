import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { safeGoBack } from "../utils/safeNavigation";

interface VideoCallScreenProps {
  navigation: any;
  route: {
    params: {
      consultationId: number;
      doctorName: string;
      roomId: string;
    };
  };
}

const { width, height } = Dimensions.get('window');

const VideoCallScreen: React.FC<VideoCallScreenProps> = ({
  navigation,
  route,
}) => {
  const { consultationId, doctorName, roomId } = route.params;
  const [callStarted, setCallStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  
  const callTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (roomId) {
      initializeVideoCall();
    }
  }, [roomId]);

  useEffect(() => {
    if (callStarted && callTimer.current === null) {
      callTimer.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (callTimer.current) {
        clearInterval(callTimer.current);
        callTimer.current = null;
      }
    };
  }, [callStarted]);

  const initializeVideoCall = () => {
    // Initialize video call logic here
    // This would typically involve setting up WebRTC or a video calling service
  };

  const endCall = async () => {
    try {
      setCallStarted(false);
      setIsConnected(false);
      
      if (callTimer.current) {
        clearInterval(callTimer.current);
        callTimer.current = null;
      }

      // TODO: Clean up WebRTC connection
      // This would typically involve:
      // 1. Close peer connection
      // 2. Stop local media streams
      // 3. Disconnect from signaling server
      // 4. Update consultation status to completed
      
      Alert.alert(
        'Call Ended',
        'The video call has been ended.',
        [
          {
            text: 'OK',
            onPress: () => safeGoBack(navigation, 'Main'),
          },
        ]
      );
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // TODO: Mute/unmute local audio stream
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    // TODO: Enable/disable local video stream
  };

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderConnectionStatus = () => (
    <View style={styles.connectionStatus}>
      <View style={[
        styles.connectionIndicator,
        { backgroundColor: isConnected ? '#10B981' : '#F59E0B' }
      ]} />
      <Text style={styles.connectionText}>
        {isConnected ? 'Connected' : 'Connecting...'}
      </Text>
    </View>
  );

  const renderVideoView = () => (
    <View style={styles.videoContainer}>
      {/* TODO: Replace with actual WebRTC video views */}
      
      {/* Remote video (doctor) */}
      <View style={styles.remoteVideo}>
        {isConnected ? (
          <View style={styles.videoPlaceholder}>
            <Icon name="doctor" size={80} color="#FFFFFF" />
            <Text style={styles.participantName}>{doctorName}</Text>
          </View>
        ) : (
          <View style={styles.videoPlaceholder}>
            <Icon name="loading" size={40} color="#FFFFFF" />
            <Text style={styles.participantName}>Connecting...</Text>
          </View>
        )}
      </View>

      {/* Local video (user) */}
      <View style={styles.localVideo}>
        {isVideoOff ? (
          <View style={styles.videoOff}>
            <Icon name="video-off" size={32} color="#FFFFFF" />
          </View>
        ) : (
          <View style={styles.videoPlaceholder}>
            <Icon name="account" size={32} color="#FFFFFF" />
          </View>
        )}
      </View>
    </View>
  );

  const renderControls = () => (
    <View style={styles.controlsContainer}>
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, isMuted && styles.controlButtonActive]}
          onPress={toggleMute}
        >
          <Icon
            name={isMuted ? "microphone-off" : "microphone"}
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.endCallButton}
          onPress={endCall}
        >
          <Icon name="phone-hangup" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, isVideoOff && styles.controlButtonActive]}
          onPress={toggleVideo}
        >
          <Icon
            name={isVideoOff ? "video-off" : "video"}
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#000000" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        {renderConnectionStatus()}
        <View style={styles.callInfo}>
          <Text style={styles.doctorName}>Dr. {doctorName}</Text>
          <Text style={styles.callDuration}>
            {callStarted ? formatCallDuration(callDuration) : '00:00'}
          </Text>
        </View>
      </View>

      {/* Video Views */}
      {renderVideoView()}

      {/* Controls */}
      {renderControls()}

      {/* WebRTC Integration Note */}
      <View style={styles.integrationNote}>
        <Text style={styles.noteText}>
          📝 WebRTC integration required for actual video calling
        </Text>
        <Text style={styles.noteSubText}>
          Consider using: React Native WebRTC, Agora, or Jitsi Meet SDK
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: 'center',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  connectionIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  connectionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  callInfo: {
    alignItems: 'center',
  },
  doctorName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  callDuration: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '400',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  localVideo: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 120,
    height: 160,
    backgroundColor: '#374151',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E22345',
  },
  videoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  participantName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
  videoOff: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6B7280',
    borderRadius: 8,
    padding: 16,
  },
  controlsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 16,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonActive: {
    backgroundColor: '#EF4444',
  },
  endCallButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  integrationNote: {
    position: 'absolute',
    bottom: 120,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    padding: 12,
  },
  noteText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  noteSubText: {
    color: '#D1D5DB',
    fontSize: 10,
    textAlign: 'center',
  },
});

export default VideoCallScreen; 