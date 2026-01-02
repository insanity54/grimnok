import { Client, Session, type Socket } from '@heroiclabs/nakama-js';
import { v4 as uuidv4 } from 'uuid';

class Nakama {
  private client: Client | null = null;
  private session: Session | null = null;
  private socket: Socket | null = null;
  private matchID: string | null = null;

  async authenticate(): Promise<void> {
    this.client = new Client('defaultkey', 'localhost', '7350');
    

    let deviceId: string | null = localStorage.getItem('deviceId');

    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem('deviceId', deviceId);
    }

    if (this.client) {
      this.session = await this.client.authenticateDevice(
        deviceId,
        true,
        `Player_${deviceId.substring(0, 4)}`
      );
      if (!this.session) throw new Error('session missing or whatever');
      localStorage.setItem('user_id', this.session.user_id);

      const trace = false;
      this.socket = this.client.createSocket(false, trace);

      await this.socket.connect(this.session, true);
    }
  }

  async findMatch(): Promise<void> {
    if (!this.session || !this.client) {
      throw new Error('Client or session not initialized');
    }

    const matches = await this.client.rpc(this.session, 'find_match', '{}');
    
    if (matches.payload.matchIds.length > 0) {
      this.matchID = matches.payload.matchIds[0];
      await this.socket?.joinMatch(this.matchID);
    } else {
      throw new Error('No matches found');
    }
  }

  async makeMove(index: number): Promise<void> {
    if (!this.matchID || !this.socket) {
      throw new Error('Unable to make move; not in a match or socket disconnected');
    }

    const data = { position: index };
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(JSON.stringify(data));

    await this.socket.sendMatchState(this.matchID, 1, encodedData);
  }

  async leaveMatch(): Promise<void> {
    if (!this.matchID || !this.socket) return;

    await this.socket.leaveMatch(this.matchID);
    this.matchID = null;
  }
}

export default new Nakama();
