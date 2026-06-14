import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const region = process.env.AWS_REGION || "us-east-1";
const bedrock = new BedrockRuntimeClient({ region });

async function testModelNova(modelId: string) {
  try {
    const prompt = "What is in this image?";
    const imageBytes = fs.readFileSync("package.json"); // Invalid image just to see error, or wait I'll get an image
    
    const command = new InvokeModelCommand({
      modelId,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        messages: [{
          role: "user",
          content: [
            {
              image: {
                format: "jpeg",
                source: {
                  bytes: Buffer.from([255, 216, 255, 224, 0, 16, 74, 70, 73, 70, 0, 1, 1, 1, 0, 96, 0, 96, 0, 0, 255, 219, 0, 67, 0, 8, 6, 6, 7, 6, 5, 8, 7, 7, 7, 9, 9, 8, 10, 12, 20, 13, 12, 11, 11, 12, 25, 18, 19, 15, 20, 29, 26, 31, 30, 29, 26, 28, 28, 32, 36, 46, 39, 32, 34, 44, 35, 28, 28, 40, 55, 41, 44, 48, 49, 52, 52, 52, 31, 39, 57, 61, 56, 50, 60, 46, 51, 52, 50, 255, 219, 0, 67, 1, 9, 9, 9, 12, 11, 12, 24, 13, 13, 24, 50, 33, 28, 33, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 255, 192, 0, 17, 8, 0, 16, 0, 16, 3, 1, 34, 0, 2, 17, 1, 3, 17, 1, 255, 196, 0, 21, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 255, 196, 0, 20, 16, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 196, 0, 21, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 255, 196, 0, 20, 17, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 218, 0, 12, 3, 1, 0, 2, 17, 3, 17, 0, 63, 0, 154, 46, 218, 127, 255, 217]).toString("base64")
                }
              }
            },
            { text: prompt }
          ]
        }],
      })
    });
    const response = await bedrock.send(command);
    const completion = JSON.parse(new TextDecoder().decode(response.body));
    console.log(`Success with: ${modelId}`);
    return true;
  } catch (error: any) {
    console.error(`Failed ${modelId}:`, error.message);
    return false;
  }
}

testModelNova("amazon.nova-lite-v1:0");
