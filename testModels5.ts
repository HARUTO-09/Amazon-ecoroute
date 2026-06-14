import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import dotenv from "dotenv";

dotenv.config();

const region = process.env.AWS_REGION || "us-east-1";
const bedrock = new BedrockRuntimeClient({ region });

async function testModelNova(modelId: string) {
  try {
    const prompt = "Can you return ONLY a JSON object with keys: grade, score? No other text.";
    const command = new InvokeModelCommand({
      modelId,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        messages: [{ role: "user", content: [{ text: prompt }] }],
      })
    });
    const response = await bedrock.send(command);
    const completion = JSON.parse(new TextDecoder().decode(response.body));
    console.log(`Success with: ${modelId}`);
    console.log(JSON.stringify(completion.output.message.content, null, 2));
    return true;
  } catch (error: any) {
    console.error(`Failed ${modelId}:`, error.message);
    return false;
  }
}

async function run() {
  await testModelNova("amazon.nova-lite-v1:0");
}

run();
