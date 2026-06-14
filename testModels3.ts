import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import dotenv from "dotenv";

dotenv.config();

const region = process.env.AWS_REGION || "us-east-1";
const bedrock = new BedrockRuntimeClient({ region });

async function testModelLlama(modelId: string) {
  try {
    const prompt = "Can you return ONLY a JSON object with keys: grade, score? No other text.";
    const command = new InvokeModelCommand({
      modelId,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        prompt: `<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n\n${prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`,
        max_gen_len: 300,
        temperature: 0.1
      })
    });
    const response = await bedrock.send(command);
    const completion = JSON.parse(new TextDecoder().decode(response.body));
    console.log(`Success with: ${modelId}`);
    console.log(completion);
    return true;
  } catch (error: any) {
    console.error(`Failed ${modelId}:`, error.message);
    return false;
  }
}

async function run() {
  await testModelLlama("meta.llama3-8b-instruct-v1:0");
}

run();
