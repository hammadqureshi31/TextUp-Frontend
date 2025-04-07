class PeerService {
  constructor() {
    if (!this.peer) {
      this.peer = new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:global.stun.twilio.com:3478",
            ],
          },
        ],
      });
    }
    // console.log("this peer", this.peer)
  }

  async getAnswer(offer) {
    if (this.peer) {
      await this.peer.setRemoteDescription(offer);
      const ans = await this.peer.createAnswer();
      await this.peer.setLocalDescription(new RTCSessionDescription(ans));
      return ans;
    }
  }

  async setLocalDescription(ans) {
    if (this.peer) {
      await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
    }
  }

  async getOffer() {
    if (this.peer) {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(new RTCSessionDescription(offer));
      return offer;
    }
  }

  // Add a method to close the connection
  // 🛑 PROPERLY CLOSE THE PEER CONNECTION
  close() {
    if (this.peer) {
      console.log("🛑 Closing Peer Connection...");

      // Close all transceivers
      this.peer.getTransceivers().forEach((transceiver) => {
        if (transceiver.stop) transceiver.stop();
      });

      // Close all tracks
      this.peer.getSenders().forEach((sender) => {
        if (sender.track) sender.track.stop();
      });

      // Close all receivers
      this.peer.getReceivers().forEach((receiver) => {
        if (receiver.track) receiver.track.stop();
      });

      // Finally, close the connection
      this.peer.close();
      this.peer = null;

      console.log("✅ Peer Connection Fully Closed.");
    }
  }
}

export default new PeerService();
