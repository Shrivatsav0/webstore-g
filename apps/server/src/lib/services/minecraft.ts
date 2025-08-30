interface MinecraftCommandRequest {
  orderId: number;
  minecraftUsername: string;
  commands: string[];
}

interface MinecraftCommandResponse {
  orderId: number;
  minecraftUsername: string;
  success: boolean;
  executedCommands: string[];
  failedCommands: string[];
  error?: string;
}

// Interface for Mojang API response
interface MojangUserProfile {
  id: string;
  name: string;
}

export class MinecraftService {
  private static readonly ENDPOINT = process.env.MINECRAFT_IP_PORT
    ? `http://${process.env.MINECRAFT_IP_PORT}/deliver`
    : null;
  private static readonly SECRET_KEY = process.env.MINECRAFT_SECRET_KEY;

  /**
   * Fetch Minecraft user ID from Mojang API
   */
  private static async getMinecraftUserId(
    username: string
  ): Promise<string | null> {
    try {
      const response = await fetch(
        `https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(
          username
        )}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`Minecraft user not found: ${username}`);
          return null;
        }
        throw new Error(
          `Mojang API error: ${response.status} ${response.statusText}`
        );
      }

      const profile: MojangUserProfile = await response.json();
      return profile.id;
    } catch (error) {
      console.error(
        `Failed to fetch Minecraft user ID for ${username}:`,
        error
      );
      return null;
    }
  }

  static async executeCommands(
    orderId: number,
    minecraftUsername: string,
    commands: string[]
  ): Promise<MinecraftCommandResponse> {
    if (!this.ENDPOINT || !this.SECRET_KEY) {
      console.error("Minecraft server configuration missing");
      throw new Error("Minecraft server not configured");
    }

    // First, get the Minecraft user ID
    const minecraftUserId = await this.getMinecraftUserId(minecraftUsername);

    if (!minecraftUserId) {
      console.error(
        `Could not fetch Minecraft user ID for username: ${minecraftUsername}`
      );
      throw new Error(
        `Minecraft user ID not found for username: ${minecraftUsername}`
      );
    }

    // Replace {user} placeholder with Minecraft user ID instead of username
    const processedCommands = commands.map((cmd) =>
      cmd.replace(/{user}/g, minecraftUserId)
    );

    const payload: MinecraftCommandRequest = {
      orderId,
      minecraftUsername,
      commands: processedCommands,
    };

    try {
      console.log(
        `Sending commands to Minecraft server for order ${orderId}:`,
        payload
      );
      console.log(
        `Using Minecraft user ID: ${minecraftUserId} for username: ${minecraftUsername}`
      );

      const response = await fetch(this.ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.SECRET_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `Minecraft server error (${response.status}):`,
          errorText
        );
        throw new Error(
          `Minecraft server responded with ${response.status}: ${errorText}`
        );
      }

      const result: MinecraftCommandResponse = await response.json();
      console.log(`Minecraft server response for order ${orderId}:`, result);

      return result;
    } catch (error) {
      console.error(
        `Failed to execute Minecraft commands for order ${orderId}:`,
        error
      );
      throw error;
    }
  }
}
