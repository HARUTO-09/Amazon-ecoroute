import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import dotenv from "dotenv";

dotenv.config();

const region = process.env.AWS_REGION || "us-east-1";
const bedrock = new BedrockRuntimeClient({ region });

async function testModelTitan(modelId: string) {
  try {
    const prompt = "Say hi";
    const command = new InvokeModelCommand({
      modelId,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        inputText: prompt,
        textGenerationConfig: {
          maxTokenCount: 50,
          temperature: 0.7,
        }
      })
    });
    await bedrock.send(command);
    console.log(`Success with: ${modelId}`);
    return true;
  } catch (error: any) {
    console.error(`Failed ${modelId}:`, error.message);
    return false;
  }
}

async function testModelLlama(modelId: string) {
  try {
    const prompt = "Say hi";
    const command = new InvokeModelCommand({
      modelId,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        prompt: prompt,
        max_gen_len: 50,
      })
    });
    await bedrock.send(command);
    console.log(`Success with: ${modelId}`);
    return true;
  } catch (error: any) {
    console.error(`Failed ${modelId}:`, error.message);
    return false;
  }
}

async function run() {
  await testModelTitan("amazon.titan-text-lite-v1");
  await testModelTitan("amazon.titan-text-express-v1");
  await testModelLlama("meta.llama3-8b-instruct-v1:0");
  await testModelLlama("meta.llama3-70b-instruct-v1:0");
}

run();
