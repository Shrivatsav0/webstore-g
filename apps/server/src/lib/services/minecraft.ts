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
  queuedCommands: string[];
}

export class MinecraftService {
  private static readonly ENDPOINT = process.env.MINECRAFT_IP_PORT
    ? `http://${process.env.MINECRAFT_IP_PORT}/deliver`
    : null;
  private static readonly SECRET_KEY = process.env.MINECRAFT_SECRET_KEY;

  static async executeCommands(
    orderId: number,
    minecraftUsername: string,
    commands: string[]
  ): Promise<MinecraftCommandResponse> {
    if (!this.ENDPOINT || !this.SECRET_KEY) {
      console.error("Minecraft server configuration missing");
      throw new Error("Minecraft server not configured");
    }

    // Replace {user} placeholder with actual username
    const processedCommands = commands.map((cmd) =>
      cmd.replace(/{user}/g, minecraftUsername)
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
