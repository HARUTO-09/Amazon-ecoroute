import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import dotenv from "dotenv";

dotenv.config();

const region = process.env.AWS_REGION || "us-east-1";
const bedrock = new BedrockRuntimeClient({ region });

async function testModel(modelId: string) {
  try {
    const prompt = "Say hi";
    const command = new InvokeModelCommand({
      modelId,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 10,
        messages: [{ role: "user", content: prompt }]
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
  await testModel("anthropic.claude-3-haiku-20240307-v1:0");
  await testModel("us.anthropic.claude-3-5-haiku-20241022-v1:0");
  await testModel("anthropic.claude-3-5-sonnet-20240620-v1:0");
  await testModel("us.anthropic.claude-3-5-sonnet-20241022-v2:0");
  await testModel("anthropic.claude-v2");
  await testModel("anthropic.claude-3-sonnet-20240229-v1:0");
}

run();
