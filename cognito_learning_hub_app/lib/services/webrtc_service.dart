// lib/services/webrtc_service.dart
import 'dart:async';
import 'package:flutter_webrtc/flutter_webrtc.dart';

class WebRTCService {
  static final WebRTCService _instance = WebRTCService._internal();
  factory WebRTCService() => _instance;
  WebRTCService._internal();

  final Map<String, RTCPeerConnection> _peerConnections = {};
  MediaStream? _localStream;

  final StreamController<MediaStream> _localStreamController =
      StreamController<MediaStream>.broadcast();
  Stream<MediaStream> get localStreamStream => _localStreamController.stream;

  final StreamController<Map<String, dynamic>> _remoteStreamController =
      StreamController<Map<String, dynamic>>.broadcast();
  Stream<Map<String, dynamic>> get remoteStreamStream =>
      _remoteStreamController.stream;

  final StreamController<Map<String, dynamic>> _signalController =
      StreamController<Map<String, dynamic>>.broadcast();
  Stream<Map<String, dynamic>> get signalStream => _signalController.stream;

  final Map<String, dynamic> _iceServers = {
    'iceServers': [
      {'urls': 'stun:stun.l.google.com:19302'},
      {'urls': 'stun:stun1.l.google.com:19302'},
      {'urls': 'stun:stun2.l.google.com:19302'},
    ],
  };

  MediaStream? get localStream => _localStream;

  Future<void> initialize({bool video = true, bool audio = true}) async {
    final mediaConstraints = {
      'audio': audio,
      'video': video
          ? {
              'mandatory': {
                'minWidth': '640',
                'minHeight': '480',
                'minFrameRate': '30',
              },
              'facingMode': 'user',
              'optional': [],
            }
          : false,
    };

    try {
      _localStream = await navigator.mediaDevices.getUserMedia(
        mediaConstraints,
      );
      _localStreamController.add(_localStream!);
    } catch (e) {
      print('Error getting user media: $e');
      rethrow;
    }
  }

  Future<RTCPeerConnection> createPeerConnectionForPeer(String peerId) async {
    final pc = await createPeerConnection(_iceServers);
    _peerConnections[peerId] = pc;

    // Add local stream tracks to peer connection
    if (_localStream != null) {
      _localStream!.getTracks().forEach((track) {
        pc.addTrack(track, _localStream!);
      });
    }

    // Handle ICE candidates
    pc.onIceCandidate = (RTCIceCandidate candidate) {
      _signalController.add({
        'type': 'ice-candidate',
        'peerId': peerId,
        'candidate': {
          'sdpMLineIndex': candidate.sdpMLineIndex,
          'sdpMid': candidate.sdpMid,
          'candidate': candidate.candidate,
        },
      });
    };

    // Handle connection state changes
    pc.onConnectionState = (RTCPeerConnectionState state) {
      print('Connection state for $peerId: $state');
    };

    // Handle incoming remote stream
    pc.onTrack = (RTCTrackEvent event) {
      if (event.streams.isNotEmpty) {
        _remoteStreamController.add({
          'peerId': peerId,
          'stream': event.streams[0],
        });
      }
    };

    return pc;
  }

  Future<RTCSessionDescription> createOffer(String peerId) async {
    final pc = _peerConnections[peerId];
    if (pc == null) throw Exception('Peer connection not found');

    final offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    return offer;
  }

  Future<RTCSessionDescription> createAnswer(String peerId) async {
    final pc = _peerConnections[peerId];
    if (pc == null) throw Exception('Peer connection not found');

    final answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    return answer;
  }

  Future<void> setRemoteDescription(
    String peerId,
    RTCSessionDescription description,
  ) async {
    final pc = _peerConnections[peerId];
    if (pc == null) throw Exception('Peer connection not found');

    await pc.setRemoteDescription(description);
  }

  Future<void> addIceCandidate(String peerId, RTCIceCandidate candidate) async {
    final pc = _peerConnections[peerId];
    if (pc == null) throw Exception('Peer connection not found');

    await pc.addCandidate(candidate);
  }

  void toggleAudio(bool enabled) {
    if (_localStream != null) {
      _localStream!.getAudioTracks().forEach((track) {
        track.enabled = enabled;
      });
    }
  }

  void toggleVideo(bool enabled) {
    if (_localStream != null) {
      _localStream!.getVideoTracks().forEach((track) {
        track.enabled = enabled;
      });
    }
  }

  Future<void> switchCamera() async {
    if (_localStream != null) {
      final videoTracks = _localStream!.getVideoTracks();
      if (videoTracks.isNotEmpty) {
        await Helper.switchCamera(videoTracks[0]);
      }
    }
  }

  void closePeerConnection(String peerId) {
    final pc = _peerConnections[peerId];
    if (pc != null) {
      pc.close();
      _peerConnections.remove(peerId);
    }
  }

  void closeAllConnections() {
    _peerConnections.forEach((_, pc) {
      pc.close();
    });
    _peerConnections.clear();
  }

  Future<void> dispose() async {
    closeAllConnections();

    if (_localStream != null) {
      _localStream!.getTracks().forEach((track) {
        track.stop();
      });
      await _localStream!.dispose();
      _localStream = null;
    }

    _localStreamController.close();
    _remoteStreamController.close();
    _signalController.close();
  }
}
